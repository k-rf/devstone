import { Command } from "@effect/cli";
import { Console, Effect } from "effect";

import { listCanvasItemsWorkflow } from "../../../core/application/list-canvas-items.workflow.js";
import { CanvasFileRepository } from "../../repository/canvas.file.repository.js";

import { fileOption } from "./options/file.option.js";

/**
 * 指定された .canvas ファイルに含まれるすべてのノードIDとエッジIDの一覧を表示します。
 */
export const listCommand = Command.make("list", {
  file: fileOption,
}).pipe(
  Command.withDescription("List all node IDs and edge IDs in the canvas"),
  Command.withHandler(({ file }) =>
    listCanvasItemsWorkflow().pipe(
      Effect.flatMap((output) => Console.log(output)),
      Effect.provide(CanvasFileRepository(file)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
