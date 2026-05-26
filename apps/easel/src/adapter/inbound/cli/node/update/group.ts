import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { updateNode } from "../../../../../core/application/canvas.service.js";
import { fileOption, provideCanvasRepository } from "../../options/file-option.js";

const nodeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the group node to update"),
);
const xOption = Options.integer("x").pipe(
  Options.optional,
  Options.withDescription("New X coordinate of the node"),
);
const yOption = Options.integer("y").pipe(
  Options.optional,
  Options.withDescription("New Y coordinate of the node"),
);
const widthOption = Options.integer("width").pipe(
  Options.optional,
  Options.withDescription("New width of the node"),
);
const heightOption = Options.integer("height").pipe(
  Options.optional,
  Options.withDescription("New height of the node"),
);
const colorOption = Options.text("color").pipe(
  Options.optional,
  Options.withDescription("New color preset (1 to 6) or hex color code"),
);
const labelOption = Options.text("label").pipe(
  Options.optional,
  Options.withDescription("New optional text label displayed on top of the node"),
);

/**
 * Group タイプのノードを更新するコマンド。
 */
export const updateGroupNodeCommand = Command.make("group", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  label: labelOption,
}).pipe(
  Command.withDescription("Update a group node"),
  Command.withHandler(({ file, id, x, y, width, height, color, label }) =>
    updateNode({
      id: id,
      type: "group",
      x: x,
      y: y,
      width: width,
      height: height,
      color: color,
      label: label,
    }).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully updated group node: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
