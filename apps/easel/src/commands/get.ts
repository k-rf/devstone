import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { readCanvas } from "../utils/read-canvas.js";

import { fileOption } from "./options/file-option.js";

const getTargetIdOption = Options.text("id").pipe(
  Options.withDescription("ID of the node or edge to retrieve"),
);

/**
 * 指定された ID を持つノードまたはエッジの情報を取得して表示します。
 * @returns 取得処理を実行する Effect。
 */
export const getCommand = Command.make("get", {
  file: fileOption,
  id: getTargetIdOption,
}).pipe(
  Command.withDescription("Retrieve a specific node or edge by ID"),
  Command.withHandler(({ file, id }) =>
    readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
        const foundNode = (canvas.nodes ?? []).find((n) => n.id === id);
        if (foundNode !== undefined) {
          return Console.log(JSON.stringify({ type: "node", data: foundNode }, undefined, 2));
        }

        const foundEdge = (canvas.edges ?? []).find((e) => e.id === id);
        if (foundEdge !== undefined) {
          return Console.log(JSON.stringify({ type: "edge", data: foundEdge }, undefined, 2));
        }

        return Effect.fail(new Error(`ID '${id}' を持つノードまたはエッジが見つかりませんでした`));
      }),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
