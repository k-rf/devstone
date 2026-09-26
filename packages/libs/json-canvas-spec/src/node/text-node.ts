import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const TextNode = NodeStruct("text", {
  text: Schema.String,
});
export type TextNode = typeof TextNode.Type;
