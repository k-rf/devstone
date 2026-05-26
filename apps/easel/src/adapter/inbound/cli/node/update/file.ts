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

const fileRefOption = Options.text("file-ref").pipe(
  Options.optional,
  Options.withDescription("New file path for the file node"),
);

/**
 * File タイプのノードを更新するコマンド。
 */
export const updateFileNodeCommand = Command.make("file", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  fileRef: fileRefOption,
}).pipe(
  Command.withDescription("Update a file node"),
  Command.withHandler(({ file, id, x, y, width, height, color, fileRef }) =>
    updateNodeWorkflow({
      id: id,
      type: "file",
      x: x,
      y: y,
      width: width,
      height: height,
      color: color,
      fileRef: fileRef,
    }).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully updated file node: ${id}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
