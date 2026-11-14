import { Options } from "@effect/cli";

export const heightOption = Options.integer("height").pipe(
  Options.withDescription("Height of the node"),
);
