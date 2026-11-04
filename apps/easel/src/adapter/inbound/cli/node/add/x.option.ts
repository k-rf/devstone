import { Options } from "@effect/cli";

import { xOptionBase } from "../options.js";

export const xOption = xOptionBase.pipe(Options.withDescription("X coordinate of the node"));
