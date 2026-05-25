import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { readCanvas } from "../../utils/read-canvas.js";
import { writeCanvas } from "../../utils/write-canvas.js";
import { fileOption } from "../options/file-option.js";

const edgeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the edge to remove"),
);

/**
 * ID で指定されたエッジをキャンバスから削除します。
 * @returns 削除処理を実行する Effect。
 */
export const rmEdgeCommand = Command.make("rm", {
  file: fileOption,
  id: edgeIdOption,
}).pipe(
  Command.withDescription("Remove an edge by ID"),
  Command.withHandler(({ file, id }) =>
    readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
        const edges = canvas.edges ? [...canvas.edges] : [];
        const filteredEdges = edges.filter((e) => e.id !== id);

        if (edges.length === filteredEdges.length) {
          return Effect.fail(new Error(`ID '${id}' のエッジが見つかりませんでした`));
        }

        const updatedCanvas = {
          ...canvas,
          edges: filteredEdges,
        };

        return writeCanvas(file, updatedCanvas);
      }),
      Effect.tap(() => Console.log(`Successfully removed edge: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
