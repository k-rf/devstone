import { Command } from "@effect/cli";
import { Console, Effect } from "effect";

import { readCanvas } from "../utils/read-canvas.js";

import { fileOption } from "./options/file-option.js";

/**
 * 指定された .canvas ファイルに含まれるすべてのノードIDとエッジIDの一覧を表示します。
 * @returns 一覧表示を実行する Effect。
 */
export const listCommand = Command.make("list", {
  file: fileOption,
}).pipe(
  Command.withDescription("List all node IDs and edge IDs in the canvas"),
  Command.withHandler(({ file }) =>
    readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
        const nodes = canvas.nodes ?? [];
        const edges = canvas.edges ?? [];

        const nodesOutput =
          nodes.length === 0
            ? "(No nodes)\n"
            : nodes.map((n) => `- ${n.id} [${n.type}]`).join("\n") + "\n";

        const edgesOutput =
          edges.length === 0
            ? "(No edges)\n"
            : edges
                .map((e) => {
                  const sideInfo =
                    e.fromSide !== undefined || e.toSide !== undefined
                      ? ` (${e.fromSide ?? "any"} -> ${e.toSide ?? "any"})`
                      : "";
                  return `- ${e.id} [${e.fromNode} -> ${e.toNode}]${sideInfo}`;
                })
                .join("\n") + "\n";

        const output = `=== Nodes ===\n${nodesOutput}\n=== Edges ===\n${edgesOutput}`;
        return Console.log(output);
      }),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
