import { Options } from "@effect/cli";

import { nodeIdOptionBase } from "../options.js";

export const nodeIdOption = nodeIdOptionBase.pipe(
  Options.withDescription("Unique identifier of the node to update"),
);
