export type MessageIds = "invalidSuffixBoundary";

export type Options = readonly [];

export type BoundarySuffix = "Payload" | "Input" | "Output" | "Record";

export interface SuffixBoundary {
  readonly suffix: BoundarySuffix;
  readonly allowedPath: string;
  readonly allowedPathPattern: RegExp;
}
