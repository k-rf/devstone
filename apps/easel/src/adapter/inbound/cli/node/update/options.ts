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
  Options.withDescription("Unique identifier of the node to update"),
);

export const xOption = xOptionBase.pipe(
  Options.optional,
  Options.withDescription("New X coordinate of the node"),
);

export const yOption = yOptionBase.pipe(
  Options.optional,
  Options.withDescription("New Y coordinate of the node"),
);

export const widthOption = widthOptionBase.pipe(
  Options.optional,
  Options.withDescription("New width of the node"),
);

export const heightOption = heightOptionBase.pipe(
  Options.optional,
  Options.withDescription("New height of the node"),
);

export const colorOption = colorOptionBase.pipe(
  Options.optional,
  Options.withDescription("New color preset (1 to 6) or hex color code"),
);

export const labelOption = labelOptionBase.pipe(
  Options.optional,
  Options.withDescription("New optional text label displayed on top of the node"),
);
