import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const LinkNode = NodeStruct("link", {
  url: Schema.String,
});
export type LinkNode = typeof LinkNode.Type;
