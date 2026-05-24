import { Schema } from "effect";

export const NodeIdBrand: unique symbol = Symbol.for("NodeIdBrand");
export const NodeId = Schema.String.pipe(Schema.brand(NodeIdBrand));
export type NodeId = typeof NodeId.Type;
