import { Schema } from "effect";

import { NodeId } from "../node/node-id.js";
import { ColorType } from "../shared/color-type.js";

const SideTypeSchema = Schema.Literal("top", "right", "bottom", "left");
const EndTypeSchema = Schema.Literal("none", "arrow");

export const Edge = Schema.Struct({
  id: Schema.String,
  fromNode: NodeId,
  fromSide: Schema.optional(SideTypeSchema),
  fromEnd: Schema.optional(EndTypeSchema),
  toNode: NodeId,
  toSide: Schema.optional(SideTypeSchema),
  toEnd: Schema.optional(EndTypeSchema),
  color: ColorType,
  label: Schema.optional(Schema.String),
});
export type Edge = typeof Edge.Type;
