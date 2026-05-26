import { Command } from "@effect/cli";
import { Console, Effect } from "effect";

import { listCanvasItemsWorkflow } from "../../../core/application/list-canvas-items.workflow.js";

import { fileOption, provideCanvasRepository } from "./options/file-option.js";

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
      provideCanvasRepository(file),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
