export type MessageIds = "invalidSuffixBoundary";

export type Options = readonly [];

export interface SuffixBoundary {
  readonly suffix: "Payload" | "Input" | "Output" | "Record";
  readonly allowedPath: string;
  readonly allowedPathPattern: RegExp;
}
