import { Options } from "@effect/cli";

import { nodeIdOptionBase } from "../options.js";

export const nodeIdOption = nodeIdOptionBase.pipe(
  Options.optional,
  Options.withDescription("Unique identifier for the node (generated if omitted)"),
);
