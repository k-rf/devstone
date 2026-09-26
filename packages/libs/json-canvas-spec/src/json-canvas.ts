import { Schema } from "effect";

import { Edge } from "./edge/edge.js";
import { Node } from "./node/node.js";

export const JsonCanvas = Schema.Struct({
  nodes: Schema.optional(Schema.Array(Node)),
  edges: Schema.optional(Schema.Array(Edge)),
});

export type JsonCanvas = typeof JsonCanvas.Type;
