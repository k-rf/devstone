import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { updateNode } from "../../../../../core/application/canvas.service.js";
import { fileOption, provideCanvasRepository } from "../../options/file-option.js";

const nodeIdOption = Options.text("id").pipe(
  Options.withDescription("Unique identifier of the link node to update"),
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
const urlOption = Options.text("url").pipe(
  Options.optional,
  Options.withDescription("New URL for the link node"),
);

/**
 * Link タイプのノードを更新するコマンド。
 */
export const updateLinkNodeCommand = Command.make("link", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  url: urlOption,
}).pipe(
  Command.withDescription("Update a link node"),
  Command.withHandler(({ file, id, x, y, width, height, color, url }) =>
    updateNode({
      id: id,
      type: "link",
      x: x,
      y: y,
      width: width,
      height: height,
      color: color,
      url: url,
    }).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully updated link node: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
