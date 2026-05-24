import { Schema } from "effect";

import { FileNode } from "./file-node.js";
import { GroupNode } from "./group-node.js";
import { LinkNode } from "./link-node.js";
import { TextNode } from "./text-node.js";

export const Node = Schema.Union(TextNode, FileNode, LinkNode, GroupNode);
export type Node = typeof Node.Type;
