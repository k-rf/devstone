import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { type TaggedCallInfo } from "./types.js";
import { unwrapExpression } from "./unwrap-expression.js";

/**
 * クラスの superClass から、Context.Tag または Data.TaggedError の CallExpression を再帰的に探索する。
 */
export const findTaggedCallInfo = (
  superClass: TSESTree.Node | null | undefined,
): TaggedCallInfo | undefined => {
  if (!superClass) return undefined;

  const unwrapped = unwrapExpression(superClass);

  if (unwrapped.type !== AST_NODE_TYPES.CallExpression) {
    return undefined;
  }

  const callee = unwrapExpression(unwrapped.callee);

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.object.type === AST_NODE_TYPES.Identifier &&
    callee.property.type === AST_NODE_TYPES.Identifier
  ) {
    if (callee.object.name === "Context" && callee.property.name === "Tag") {
      return {
        kind: "Context.Tag",
        callExpression: unwrapped,
      };
    }
    if (callee.object.name === "Data" && callee.property.name === "TaggedError") {
      return {
        kind: "Data.TaggedError",
        callExpression: unwrapped,
      };
    }
  }

  return findTaggedCallInfo(unwrapped.callee);
};
