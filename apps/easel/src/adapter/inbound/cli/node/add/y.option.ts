import { Options } from "@effect/cli";

import { yOptionBase } from "../options.js";

export const yOption = yOptionBase.pipe(Options.withDescription("Y coordinate of the node"));
