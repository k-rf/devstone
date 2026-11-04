import { Options } from "@effect/cli";

import { widthOptionBase } from "../options.js";

export const widthOption = widthOptionBase.pipe(Options.withDescription("Width of the node"));
