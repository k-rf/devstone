import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const FileNode = NodeStruct("file", {
  file: Schema.String,
  subpath: Schema.optional(Schema.TemplateLiteral("#", Schema.String)),
});
export type FileNode = typeof FileNode.Type;
