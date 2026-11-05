import { Options } from "@effect/cli";

import { labelOptionBase } from "../options.js";

export const labelOption = labelOptionBase.pipe(
  Options.optional,
  Options.withDescription("Optional text label displayed on top of the node"),
);
