import { ESLintUtils } from "@typescript-eslint/utils";
import { P, match } from "ts-pattern";

import { checkExportDeclarations } from "./check/export-declarations.js";
import { checkExportSpecifiers } from "./check/export-specifiers.js";
import { getRoleSuffixFromFilename } from "./get-role-suffix-from-filename.js";
import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/k-rf/devstone/blob/main/docs/rules/${name}.md`,
);

/**
 * 役割サフィックス付きファイルの named export が、役割名で終わることを強制する。
 */
export const exportRoleSuffixesRule = createRule<Options, MessageIds>({
  name: "export-role-suffixes",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require exported variable/function names in role-suffixed files to end with the matching role suffix.",
    },
    schema: [],
    messages: {
      missingRoleSuffix:
        "'{{name}}' は '{{roleSuffix}}' で終わる必要があります（ファイル役割: {{roleSuffix}}）。",
    },
  },
  create: (context) => {
    const roleSuffix = getRoleSuffixFromFilename(context.filename);

    if (roleSuffix === undefined) return {};

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- 型定義に従う
      ExportNamedDeclaration: (node) => {
        if (node.exportKind === "type") return;

        match(node)
          .with({ declaration: P.nonNullable }, ({ declaration }) => {
            checkExportDeclarations(context, declaration, roleSuffix);
          })
          .otherwise(() => {
            checkExportSpecifiers(context, node.specifiers, roleSuffix);
          });
      },
    };
  },
});
