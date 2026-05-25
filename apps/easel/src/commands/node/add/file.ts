import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";

import { generateId } from "../../../utils/generate-id.js";
import { readCanvas } from "../../../utils/read-canvas.js";
import { upsertNode } from "../../../utils/upsert-node.js";
import { fileOption } from "../../options/file-option.js";
import {
  colorOption,
  heightOption,
  labelOption,
  nodeIdOption,
  widthOption,
  xOption,
  yOption,
} from "../options.js";

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
    return readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
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

        return upsertNode(file, canvas, nodeData);
      }),
      Effect.tap(() => Console.log(`Successfully added or updated file node: ${nodeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
