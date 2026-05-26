import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { updateEdge } from "../../../../core/application/canvas.service.js";
import { fileOption, provideCanvasRepository } from "../options/file-option.js";

const edgeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the edge to update"),
);
const fromNodeOption = Options.text("from-node").pipe(
  Options.optional,
  Options.withDescription("New source Node ID"),
);
const toNodeOption = Options.text("to-node").pipe(
  Options.optional,
  Options.withDescription("New target Node ID"),
);
const fromSideOption = Options.choice("from-side", [
  "top",
  "right",
  "bottom",
  "left",
] as const).pipe(
  Options.optional,
  Options.withDescription("New connection side of the source node"),
);
const toSideOption = Options.choice("to-side", ["top", "right", "bottom", "left"] as const).pipe(
  Options.optional,
  Options.withDescription("New connection side of the target node"),
);
const fromEndOption = Options.choice("from-end", ["none", "arrow"] as const).pipe(
  Options.optional,
  Options.withDescription("New source end type"),
);
const toEndOption = Options.choice("to-end", ["none", "arrow"] as const).pipe(
  Options.optional,
  Options.withDescription("New target end type"),
);
const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("New color of the connection line"),
);
const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("New optional label for the edge"),
);

/**
 * キャンバスのエッジを更新するコマンド。
 */
export const updateEdgeCommand = Command.make("update", {
  file: fileOption,
  id: edgeIdOption,
  fromNode: fromNodeOption,
  toNode: toNodeOption,
  fromSide: fromSideOption,
  toSide: toSideOption,
  fromEnd: fromEndOption,
  toEnd: toEndOption,
  color: colorOption,
  label: labelOption,
}).pipe(
  Command.withDescription("Update an existing edge"),
  Command.withHandler(
    ({ file, id, fromNode, toNode, fromSide, toSide, fromEnd, toEnd, color, label }) =>
      updateEdge({
        id: id,
        fromNode: fromNode,
        toNode: toNode,
        fromSide: fromSide,
        toSide: toSide,
        fromEnd: fromEnd,
        toEnd: toEnd,
        color: color,
        label: label,
      }).pipe(
        provideCanvasRepository(file),
        Effect.tap(() => Console.log(`Successfully updated edge: ${id}`)),
        Effect.catchAll((error) =>
          Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
        ),
      ),
  ),
);
