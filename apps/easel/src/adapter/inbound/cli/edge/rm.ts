import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { removeEdgeWorkflow } from "../../../../core/application/remove-edge.workflow.js";
import { fileOption, provideCanvasRepository } from "../options/file-option.js";

const edgeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the edge to remove"),
);

/**
 * ID で指定されたエッジをキャンバスから削除します。
 */
export const rmEdgeCommand = Command.make("rm", {
  file: fileOption,
  id: edgeIdOption,
}).pipe(
  Command.withDescription("Remove an edge by ID"),
  Command.withHandler(({ file, id }) =>
    removeEdgeWorkflow(id).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully removed edge: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
