import { type TSESTree } from "@typescript-eslint/utils";

import { getCalleeRootIdentifier } from "./get-callee-root-identifier.js";
import { isCalleeOfParentCall } from "./is-callee-of-parent-call.js";

/**
 * 指定されたノードが describe の呼び出し式であるかを判定する。
 */
export const isDescribeCall = (node: TSESTree.CallExpression): boolean => {
  if (isCalleeOfParentCall(node)) {
    return false;
  }

  const root = getCalleeRootIdentifier(node.callee);
  return root?.name === "describe";
};
