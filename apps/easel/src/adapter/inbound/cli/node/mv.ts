import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { moveNodeWorkflow } from "../../../../core/application/move-node.workflow.js";
import { fileOption, provideCanvasRepository } from "../options/file-option.js";

const nodeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the node to move"),
);
const xOption = Options.integer("x").pipe(
  Options.optional,
  Options.withDescription("Target absolute X coordinate"),
);
const yOption = Options.integer("y").pipe(
  Options.optional,
  Options.withDescription("Target absolute Y coordinate"),
);
const dxOption = Options.integer("dx").pipe(
  Options.optional,
  Options.withDescription("Relative movement on the X axis"),
);
const dyOption = Options.integer("dy").pipe(
  Options.optional,
  Options.withDescription("Relative movement on the Y axis"),
);

/**
 * ノードの位置を移動するコマンド。
 */
export const mvNodeCommand = Command.make("mv", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  dx: dxOption,
  dy: dyOption,
}).pipe(
  Command.withDescription("Move a node in the canvas"),
  Command.withHandler(({ file, id, x, y, dx, dy }) =>
    moveNodeWorkflow(id, { x: x, y: y, dx: dx, dy: dy }).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully moved node: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
