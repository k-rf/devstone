import { Options } from "@effect/cli";

import {
  colorOptionBase,
  heightOptionBase,
  labelOptionBase,
  nodeIdOptionBase,
  widthOptionBase,
  xOptionBase,
  yOptionBase,
} from "../options.js";

export const nodeIdOption = nodeIdOptionBase.pipe(
  Options.optional,
  Options.withDescription("Unique identifier for the node (generated if omitted)"),
);

export const xOption = xOptionBase.pipe(Options.withDescription("X coordinate of the node"));

export const yOption = yOptionBase.pipe(Options.withDescription("Y coordinate of the node"));

export const widthOption = widthOptionBase.pipe(Options.withDescription("Width of the node"));

export const heightOption = heightOptionBase.pipe(Options.withDescription("Height of the node"));

export const colorOption = colorOptionBase.pipe(
  Options.optional,
  Options.withDescription("Color preset (1 to 6) or hex color code"),
);

export const labelOption = labelOptionBase.pipe(
  Options.optional,
  Options.withDescription("Optional text label displayed on top of the node"),
);
