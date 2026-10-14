import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import { checkIdentifierBoundary } from "./check-identifier-boundary.js";
import { hasIdentifier } from "./has-identifier.js";
import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

const ignoredPathPattern = /(?:^|\/)packages\/design-system\//u;

/**
 * ポート＆アダプターアーキテクチャの型構造を示すサフィックス（Payload, Input, Output, Record）を持つ識別子が、
 * それぞれ対応するディレクトリ内にのみ配置されることを強制する。
 */
export const portAndAdapterSuffixBoundariesRule = createRule<Options, MessageIds>({
  name: "port-and-adapter-suffix-boundaries",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce that identifiers with Port & Adapter architectural suffixes (Payload, Input, Output, Record) are placed only in their corresponding directories.",
    },
    schema: [],
    messages: {
      invalidSuffixBoundary:
        "'{{name}}'（サフィックス '{{suffix}}'）は '{{allowedPath}}' 配下にのみ配置できます。",
    },
  },
  create: (context) => {
    const normalizedFilename = context.filename.replaceAll("\\", "/");

    if (ignoredPathPattern.test(normalizedFilename)) return {};

    return {
      TSTypeAliasDeclaration: (node) => {
        if (node.id.name.endsWith("Props")) return;

        checkIdentifierBoundary(context, node.id, normalizedFilename);
      },
      TSInterfaceDeclaration: (node) => {
        checkIdentifierBoundary(context, node.id, normalizedFilename);
      },
      ClassDeclaration: (node) => {
        if (node.id === null) return;
        if (node.id.name.endsWith("Input") || node.id.name.endsWith("Output")) return;

        checkIdentifierBoundary(context, node.id, normalizedFilename);
      },
      VariableDeclarator: (node) => {
        if (node.id.type !== AST_NODE_TYPES.Identifier) return;
        if (!hasIdentifier(node, "Schema")) return;

        checkIdentifierBoundary(context, node.id, normalizedFilename);
      },
    };
  },
});
