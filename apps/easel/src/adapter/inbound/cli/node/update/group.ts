import { Command } from "@effect/cli";
import { Console, Effect } from "effect";

import { updateNode } from "../../../../../core/application/canvas.service.js";
import { fileOption, provideCanvasRepository } from "../../options/file-option.js";

import {
  colorOption,
  heightOption,
  labelOption,
  nodeIdOption,
  widthOption,
  xOption,
  yOption,
} from "./options.js";

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
