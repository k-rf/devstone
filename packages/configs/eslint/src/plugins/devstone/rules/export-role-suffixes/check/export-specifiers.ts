import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { match } from "ts-pattern";

import { noop } from "../../libs/noop.js";
import { reportMissingRoleSuffix } from "../report-missing-role-suffix.js";
import { type MessageIds, type Options } from "../types.js";

/**
 * `export { ... }` の exported 識別子が役割サフィックスで終わることを検証する。
 * type-only export は対象外。
 */
export const checkExportSpecifiers = (
  context: RuleContext<MessageIds, Options>,
  specifiers: readonly TSESTree.ExportSpecifier[],
  roleSuffix: string,
): void => {
  specifiers.forEach((specifier) => {
    match(specifier)
      .with({ exportKind: "type" }, noop)
      .with({ exported: { type: AST_NODE_TYPES.Identifier } }, ({ exported }) => {
        reportMissingRoleSuffix(context, exported, exported.name, roleSuffix);
      })
      .otherwise(noop);
  });
};
