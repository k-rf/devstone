import { Options } from "@effect/cli";

import { colorOptionBase } from "../options.js";

export const colorOption = colorOptionBase.pipe(
  Options.optional,
  Options.withDescription("Color preset (1 to 6) or hex color code"),
);
