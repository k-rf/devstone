import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";

import { addEdgeWorkflow } from "../../../../core/application/add-edge.workflow.js";
import { generateId } from "../../../../utils/generate-id.js";
import { fileOption, provideCanvasRepository } from "../options/file-option.js";

const fromNodeOption = Options.text("from-node").pipe(Options.withDescription("Source Node ID"));
const toNodeOption = Options.text("to-node").pipe(Options.withDescription("Target Node ID"));
const fromSideOption = Options.choice("from-side", [
  "top",
  "right",
  "bottom",
  "left",
] as const).pipe(Options.optional, Options.withDescription("Connection side of the source node"));
const toSideOption = Options.choice("to-side", ["top", "right", "bottom", "left"] as const).pipe(
  Options.optional,
  Options.withDescription("Connection side of the target node"),
);
const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("Color of the connection line"),
);
const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("Optional label for the edge"),
);

/**
 * 2つのノードを接続する新しいエッジを追加するコマンド。
 */
export const addEdgeCommand = Command.make("add", {
  file: fileOption,
  fromNode: fromNodeOption,
  toNode: toNodeOption,
  fromSide: fromSideOption,
  toSide: toSideOption,
  color: colorOption,
  label: labelOption,
}).pipe(
  Command.withDescription("Add a new edge with auto-assigned ID"),
  Command.withHandler(({ file, fromNode, toNode, fromSide, toSide, color, label }) => {
    const fromSideValue = Option.getOrUndefined(fromSide);
    const toSideValue = Option.getOrUndefined(toSide);
    const colorValue = Option.getOrUndefined(color);
    const labelValue = Option.getOrUndefined(label);

    const edgeId = generateId();
    const edgeData = {
      id: edgeId,
      fromNode: fromNode,
      toNode: toNode,
      fromSide: fromSideValue,
      toSide: toSideValue,
      color: colorValue ?? "1",
      label: labelValue,
    };

    return addEdgeWorkflow(edgeData).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully added edge: ${edgeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
