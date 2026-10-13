import { type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";

import { type MessageIds, type Options } from "./types.js";

/**
 * 識別子が役割サフィックスで終わらない場合に、ルール違反を報告する。
 */
export const reportMissingRoleSuffix = (
  context: RuleContext<MessageIds, Options>,
  node: TSESTree.Node,
  name: string,
  roleSuffix: string,
): void => {
  if (name.endsWith(roleSuffix)) return;

  context.report({
    node: node,
    messageId: "missingRoleSuffix",
    data: {
      name: name,
      roleSuffix: roleSuffix,
    },
  });
};
