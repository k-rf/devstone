import { type TSESTree } from "@typescript-eslint/utils";

export type MessageIds = "singleFunctionPerFile";

export type Options = readonly [];

export interface ExportedEntry {
  readonly node: TSESTree.Node;
  readonly name: string;
}
