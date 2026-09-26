import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const GroupNode = NodeStruct("group", {
  label: Schema.optional(Schema.String),
  background: Schema.optional(Schema.String).annotations({
    description: "path to the background image.",
  }),
  backgroundStyle: Schema.optional(Schema.Literal("cover", "ratio", "repeat")),
  nodes: Schema.optional(Schema.Array(Schema.String)),
});
export type GroupNode = typeof GroupNode.Type;
