import { Options } from "@effect/cli";

export const heightOption = Options.integer("height").pipe(
  Options.optional,
  Options.withDescription("New height of the node"),
);
