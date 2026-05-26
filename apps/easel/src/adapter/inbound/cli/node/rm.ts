import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { removeNodeWorkflow } from "../../../../core/application/remove-node.workflow.js";
import { fileOption, provideCanvasRepository } from "../options/file-option.js";

const rmNodeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the node to remove"),
);

/**
 * ID で指定されたノード、およびそれに接続するエッジをすべてキャンバスから削除します。
 */
export const rmNodeCommand = Command.make("rm", {
  file: fileOption,
  id: rmNodeIdOption,
}).pipe(
  Command.withDescription("Remove a node and all of its connected edges by ID"),
  Command.withHandler(({ file, id }) =>
    removeNodeWorkflow(id).pipe(
      provideCanvasRepository(file),
      Effect.tap(() =>
        Console.log(`Successfully removed node: ${id} (and cleaned up its connections)`),
      ),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
