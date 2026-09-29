import { type TSESTree } from "@typescript-eslint/utils";

import { getRootIdentifierName } from "./get-root-identifier-name.js";
import { isTestGeneratorCall } from "./is-test-generator-call.js";

/**
 * CallExpression がテストケース定義（it または test）の呼び出しであるかを判定する。
 */
export const isTestCaseCall = (node: TSESTree.CallExpression): boolean => {
  if (isTestGeneratorCall(node)) {
    return false;
  }

  const rootName = getRootIdentifierName(node.callee);

  return rootName === "it" || rootName === "test";
};
