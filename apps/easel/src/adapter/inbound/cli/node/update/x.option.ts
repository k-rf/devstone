import { Options } from "@effect/cli";

import { xOptionBase } from "../options.js";

export const xOption = xOptionBase.pipe(
  Options.optional,
  Options.withDescription("New X coordinate of the node"),
);
