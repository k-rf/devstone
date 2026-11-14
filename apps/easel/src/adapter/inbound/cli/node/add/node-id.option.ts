import { Options } from "@effect/cli";

export const nodeIdOption = Options.text("id").pipe(
  Options.optional,
  Options.withDescription("Unique identifier for the node (generated if omitted)"),
);
