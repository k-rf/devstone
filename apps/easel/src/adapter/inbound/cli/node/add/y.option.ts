import { Options } from "@effect/cli";

export const yOption = Options.integer("y").pipe(
  Options.withDescription("Y coordinate of the node"),
);
