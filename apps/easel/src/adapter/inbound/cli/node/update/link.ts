import { Command, Options } from "@effect/cli";
import { Console, Effect } from "effect";

import { updateNodeWorkflow } from "../../../../../core/application/update-node.workflow.js";
import { fileOption, provideCanvasRepository } from "../../options/file-option.js";

import {
  colorOption,
  heightOption,
  nodeIdOption,
  widthOption,
  xOption,
  yOption,
} from "./options.js";

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
    updateNodeWorkflow({
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
