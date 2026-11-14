import { Options } from "@effect/cli";

export const widthOption = Options.integer("width").pipe(
  Options.withDescription("Width of the node"),
);
