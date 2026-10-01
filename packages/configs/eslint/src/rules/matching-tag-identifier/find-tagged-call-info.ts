import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

import { type TaggedCallInfo } from "./types.js";
import { unwrapExpression } from "./unwrap-expression.js";

const { CallExpression, MemberExpression, Identifier } = AST_NODE_TYPES;

/**
 * クラスの superClass から、Context.Tag または Data.TaggedError の CallExpression を再帰的に探索する。
 */
export const findTaggedCallInfo = (
  superClass: TSESTree.Node | null | undefined,
): TaggedCallInfo | undefined => {
  if (!superClass) return undefined;

  const unwrapped = unwrapExpression(superClass);
  if (unwrapped.type !== CallExpression) return undefined;

  const callee = unwrapExpression(unwrapped.callee);

  return match(callee)
    .with(
      {
        type: MemberExpression,
        computed: false,
        object: { type: Identifier, name: "Context" },
        property: { type: Identifier, name: "Tag" },
      },
      (): TaggedCallInfo => ({
        kind: "Context.Tag",
        callExpression: unwrapped,
      }),
    )
    .with(
      {
        type: MemberExpression,
        computed: false,
        object: { type: Identifier, name: "Data" },
        property: { type: Identifier, name: "TaggedError" },
      },
      (): TaggedCallInfo => ({
        kind: "Data.TaggedError",
        callExpression: unwrapped,
      }),
    )
    .otherwise(() => findTaggedCallInfo(unwrapped.callee));
};
