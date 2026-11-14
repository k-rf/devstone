import { Options } from "@effect/cli";

export const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("Optional text label displayed on top of the node"),
);
