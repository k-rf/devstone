import { Schema } from "effect";

import { ColorType } from "../shared/color-type.js";

import { NodeId } from "./node-id.js";

export const NodeStruct = <
  Tag extends "text" | "file" | "link" | "group",
  Fields extends Schema.Struct.Fields,
>(
  tag: Tag,
  fields: Fields,
) =>
  Schema.Struct({
    id: NodeId,
    type: Schema.tag(tag),
    x: Schema.Number,
    y: Schema.Number,
    width: Schema.Number,
    height: Schema.Number,
    color: Schema.optional(ColorType),
    ...fields,
  });
