import { Options } from "@effect/cli";

import { yOptionBase } from "../options.js";

export const yOption = yOptionBase.pipe(
  Options.optional,
  Options.withDescription("New Y coordinate of the node"),
);
