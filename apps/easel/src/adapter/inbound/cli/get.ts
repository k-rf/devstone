import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { getCanvasItemWorkflow } from "../../../core/application/get-canvas-item.workflow.js";

import { fileOption, provideCanvasRepository } from "./options/file-option.js";

const getTargetIdOption = Options.text("id").pipe(
  Options.withDescription("ID of the node or edge to retrieve"),
);

/**
 * 指定された ID を持つノードまたはエッジの情報を取得して表示します。
 */
export const getCommand = Command.make("get", {
  file: fileOption,
  id: getTargetIdOption,
}).pipe(
  Command.withDescription("Retrieve a specific node or edge by ID"),
  Command.withHandler(({ file, id }) =>
    getCanvasItemWorkflow(id).pipe(
      Effect.flatMap((item) =>
        Console.log(JSON.stringify({ type: item.type, data: item.data }, undefined, 2)),
      ),
      provideCanvasRepository(file),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
