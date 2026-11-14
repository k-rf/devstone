import { Options } from "@effect/cli";

export const xOption = Options.integer("x").pipe(
  Options.optional,
  Options.withDescription("New X coordinate of the node"),
);
