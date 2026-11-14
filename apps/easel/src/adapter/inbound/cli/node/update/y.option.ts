import { Options } from "@effect/cli";

export const yOption = Options.integer("y").pipe(
  Options.optional,
  Options.withDescription("New Y coordinate of the node"),
);
