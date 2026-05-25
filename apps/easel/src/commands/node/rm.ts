import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { readCanvas } from "../../utils/read-canvas.js";
import { writeCanvas } from "../../utils/write-canvas.js";
import { fileOption } from "../options/file-option.js";

const rmNodeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the node to remove"),
);

/**
 * ID で指定されたノード、およびそれに接続するエッジをすべてキャンバスから削除します。
 * @returns 削除処理を実行する Effect。
 */
export const rmNodeCommand = Command.make("rm", {
  file: fileOption,
  id: rmNodeIdOption,
}).pipe(
  Command.withDescription("Remove a node and all of its connected edges by ID"),
  Command.withHandler(({ file, id }) =>
    readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
        const nodes = canvas.nodes ? [...canvas.nodes] : [];
        const filteredNodes = nodes.filter((n) => n.id !== id);

        if (nodes.length === filteredNodes.length) {
          return Effect.fail(new Error(`ID '${id}' のノードが見つかりませんでした`));
        }

        const edges = canvas.edges ? [...canvas.edges] : [];
        const filteredEdges = edges.filter((e) => e.fromNode !== id && e.toNode !== id);

        const updatedCanvas = {
          ...canvas,
          nodes: filteredNodes,
          edges: filteredEdges,
        };

        return writeCanvas(file, updatedCanvas);
      }),
      Effect.tap(() =>
        Console.log(`Successfully removed node: ${id} (and cleaned up its connections)`),
      ),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
