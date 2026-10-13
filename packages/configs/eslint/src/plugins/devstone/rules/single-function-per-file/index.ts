import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

import { collectDefaultExportEntry } from "./collect-default-export-entry.js";
import { collectNamedExportEntries } from "./collect-named-export-entries.js";
import { isIgnoredFile } from "./is-ignored-file.js";
import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

/**
 * 1つのファイルに複数の主要な関数が定義されるのを防ぎ、単一責任の原則（1ファイル1関数）を強制する。
 */
export const singleFunctionPerFileRule = createRule<Options, MessageIds>({
  name: "single-function-per-file",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce a single primary function or class export per file to maintain the single responsibility principle.",
    },
    schema: [],
    messages: {
      singleFunctionPerFile:
        "1つのファイルに複数の主要な関数を定義することはできません（'{{name}}'）。単一責任の原則に従い、ファイルを分割してください。",
    },
  },
  create: (context) => {
    if (isIgnoredFile(context.filename)) return {};

    return {
      "Program:exit": (program) => {
        const { ExportNamedDeclaration, ExportDefaultDeclaration } = AST_NODE_TYPES;

        const exportedEntries = program.body.flatMap((statement) =>
          match(statement)
            .with({ type: ExportNamedDeclaration }, (node) =>
              collectNamedExportEntries(context, node),
            )
            .with({ type: ExportDefaultDeclaration }, (node) => collectDefaultExportEntry(node))
            .otherwise(() => []),
        );

        if (exportedEntries.length <= 1) return;

        exportedEntries.slice(1).forEach(({ node, name }) => {
          context.report({
            node: node,
            messageId: "singleFunctionPerFile",
            data: { name: name },
          });
        });
      },
    };
  },
});
