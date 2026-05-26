import { Options } from "@effect/cli";

export const nodeIdOption = Options.text("id").pipe(
  Options.optional,
  Options.withDescription("Unique identifier for the node (generated if omitted)"),
);

export const xOption = Options.integer("x").pipe(
  Options.withDescription("X coordinate of the node"),
);

export const yOption = Options.integer("y").pipe(
  Options.withDescription("Y coordinate of the node"),
);

export const widthOption = Options.integer("width").pipe(
  Options.withDescription("Width of the node"),
);

export const heightOption = Options.integer("height").pipe(
  Options.withDescription("Height of the node"),
);

export const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("Color preset (1 to 6) or hex color code"),
);

export const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("Optional text label displayed on top of the node"),
);
