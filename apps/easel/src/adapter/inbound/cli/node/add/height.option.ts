import { Options } from "@effect/cli";

import { heightOptionBase } from "../options.js";

export const heightOption = heightOptionBase.pipe(Options.withDescription("Height of the node"));
