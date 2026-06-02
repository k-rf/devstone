import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { rearrangeNodesWorkflow } from "../../../../core/application/rearrange-nodes.workflow.js";
import { fileOption, provideCanvasRepository } from "../options/file-option.js";

const paddingOption = Options.integer("padding").pipe(
  Options.optional,
  Options.withAlias("p"),
  Options.withDescription("Minimum padding between nodes (default: 20)"),
);

const maxIterationsOption = Options.integer("maxIterations").pipe(
  Options.optional,
  Options.withAlias("m"),
  Options.withDescription("Maximum number of iterations to resolve overlaps (default: 50)"),
);

const dampingOption = Options.float("damping").pipe(
  Options.optional,
  Options.withAlias("d"),
  Options.withDescription("Damping factor for node movement (default: 0.5)"),
);

/**
 * キャンバス内のノードの重なりを解消（再配置）するコマンド。
 */
export const rearrangeNodeCommand = Command.make("rearrange", {
  file: fileOption,
  padding: paddingOption,
  maxIterations: maxIterationsOption,
  damping: dampingOption,
}).pipe(
  Command.withDescription("Automatically resolve overlapping nodes in the canvas"),
  Command.withHandler(({ file, padding, maxIterations, damping }) =>
    rearrangeNodesWorkflow({
      padding: padding,
      maxIterations: maxIterations,
      damping: damping,
    }).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log("Successfully rearranged nodes in canvas.")),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
