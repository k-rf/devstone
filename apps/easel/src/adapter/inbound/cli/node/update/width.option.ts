import { Options } from "@effect/cli";

import { widthOptionBase } from "../options.js";

export const widthOption = widthOptionBase.pipe(
  Options.optional,
  Options.withDescription("New width of the node"),
);
