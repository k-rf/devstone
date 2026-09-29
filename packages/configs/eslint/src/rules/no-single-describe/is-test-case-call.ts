import { type TSESTree } from "@typescript-eslint/utils";

import { getCalleeRootIdentifier } from "./get-callee-root-identifier.js";
import { isCalleeOfParentCall } from "./is-callee-of-parent-call.js";

const testCaseNames = new Set(["it", "test"]);

/**
 * 指定されたノードがテストケース（it, test）の呼び出し式であるかを判定する。
 */
export const isTestCaseCall = (node: TSESTree.CallExpression): boolean => {
  if (isCalleeOfParentCall(node)) {
    return false;
  }

  const root = getCalleeRootIdentifier(node.callee);
  return root !== undefined && testCaseNames.has(root.name);
};
