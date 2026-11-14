import { Options } from "@effect/cli";

export const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("Color preset (1 to 6) or hex color code"),
);
