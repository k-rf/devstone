import { type TSESTree } from "@typescript-eslint/utils";

export type MessageIds = "anonymousClass" | "invalidIdentifier" | "mismatchedIdentifier";

export type Options = readonly [];

type TaggedCallKind = "Context.Tag" | "Data.TaggedError";

export interface TaggedCallInfo {
  readonly kind: TaggedCallKind;
  readonly callExpression: TSESTree.CallExpression;
}
