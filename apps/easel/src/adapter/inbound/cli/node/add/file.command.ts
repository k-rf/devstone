import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";

import { addNodeWorkflow } from "../../../../../core/application/add-node.workflow.js";
import { generateId } from "../../../../../utils/generate-id.js";
import { CanvasFileRepository } from "../../../../repository/canvas.file.repository.js";
import { fileOption } from "../../options/file.option.js";

import { colorOption } from "./color.option.js";
import { heightOption } from "./height.option.js";
import { labelOption } from "./label.option.js";
import { nodeIdOption } from "./node-id.option.js";
import { widthOption } from "./width.option.js";
import { xOption } from "./x.option.js";
import { yOption } from "./y.option.js";

const fileRefOption = Options.text("file-ref").pipe(
  Options.withDescription("File path for the file node"),
);

/**
 * File タイプのノードをキャンバスに追加または更新するコマンド。
 */
export const addFileNodeCommand = Command.make("file", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  fileRef: fileRefOption,
  label: labelOption,
}).pipe(
  Command.withDescription("Add or update a file node"),
  Command.withHandler(({ file, id, x, y, width, height, color, fileRef, label }) => {
    const nodeId = Option.getOrElse(id, () => generateId());
    const colorValue = Option.getOrUndefined(color);
    const labelValue = Option.getOrUndefined(label);
    const nodeData = {
      id: nodeId,
      type: "file",
      x: x,
      y: y,
      width: width,
      height: height,
      color: colorValue,
      file: fileRef,
      label: labelValue,
    };

    return addNodeWorkflow(nodeData).pipe(
      Effect.provide(CanvasFileRepository(file)),
      Effect.tap(() => Console.log(`Successfully added or updated file node: ${nodeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
