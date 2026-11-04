import { Options } from "@effect/cli";

import { heightOptionBase } from "../options.js";

export const heightOption = heightOptionBase.pipe(
  Options.optional,
  Options.withDescription("New height of the node"),
);
