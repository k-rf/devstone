import { type TSESTree } from "@typescript-eslint/utils";

import { getCalleeRootIdentifier } from "./get-callee-root-identifier.js";
import { isCalleeOfParentCall } from "./is-callee-of-parent-call.js";

const hookNames = new Set(["beforeEach", "afterEach", "beforeAll", "afterAll"]);

/**
 * 指定されたノードがテストフック（beforeEach, afterEach 等）の呼び出し式であるかを判定する。
 */
export const isHookCall = (node: TSESTree.CallExpression): boolean => {
  if (isCalleeOfParentCall(node)) return false;

  const root = getCalleeRootIdentifier(node.callee);
  return root !== undefined && hookNames.has(root.name);
};
