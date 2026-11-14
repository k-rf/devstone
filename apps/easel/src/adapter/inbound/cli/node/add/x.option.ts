import { Options } from "@effect/cli";

export const xOption = Options.integer("x").pipe(
  Options.withDescription("X coordinate of the node"),
);
