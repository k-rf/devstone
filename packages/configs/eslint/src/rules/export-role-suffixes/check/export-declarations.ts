import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { P, match } from "ts-pattern";

import { noop } from "../../libs/noop.js";
import { reportMissingRoleSuffix } from "../report-missing-role-suffix.js";
import { type MessageIds, type Options } from "../types.js";

/**
 * `export const` / `export function` / `export class` の識別子が
 * 役割サフィックスで終わることを検証する。
 */
export const checkExportDeclarations = (
  context: RuleContext<MessageIds, Options>,
  declaration: TSESTree.NamedExportDeclarations,
  roleSuffix: string,
): void => {
  match(declaration)
    .with({ type: AST_NODE_TYPES.VariableDeclaration }, ({ declarations }) => {
      for (const { id } of declarations) {
        if (id.type === AST_NODE_TYPES.Identifier) {
          reportMissingRoleSuffix(context, id, id.name, roleSuffix);
        }
      }
    })
    .with(
      { type: AST_NODE_TYPES.FunctionDeclaration, id: P.nonNullable },
      { type: AST_NODE_TYPES.ClassDeclaration, id: P.nonNullable },
      ({ id }) => {
        reportMissingRoleSuffix(context, id, id.name, roleSuffix);
      },
    )
    .otherwise(noop);
};
