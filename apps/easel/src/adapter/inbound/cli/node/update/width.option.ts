import { Options } from "@effect/cli";

export const widthOption = Options.integer("width").pipe(
  Options.optional,
  Options.withDescription("New width of the node"),
);
