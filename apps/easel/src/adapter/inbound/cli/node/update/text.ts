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

const textOption = Options.text("text").pipe(
  Options.optional,
  Options.withDescription("New text content for the node"),
);

/**
 * Text タイプのノードを更新するコマンド。
 */
export const updateTextNodeCommand = Command.make("text", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  text: textOption,
}).pipe(
  Command.withDescription("Update a text node"),
  Command.withHandler(({ file, id, x, y, width, height, color, text }) =>
    updateNodeWorkflow({
      id: id,
      type: "text",
      x: x,
      y: y,
      width: width,
      height: height,
      color: color,
      text: text,
    }).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully updated text node: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
