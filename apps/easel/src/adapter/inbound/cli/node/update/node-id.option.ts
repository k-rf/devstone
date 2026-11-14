import { Options } from "@effect/cli";

export const nodeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the node to update"),
);
