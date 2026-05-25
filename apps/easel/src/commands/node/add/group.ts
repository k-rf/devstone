import { Command } from "@effect/cli";
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

/**
 * Group タイプのノードをキャンバスに追加または更新するコマンド。
 */
export const addGroupNodeCommand = Command.make("group", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  label: labelOption,
}).pipe(
  Command.withDescription("Add or update a group node"),
  Command.withHandler(({ file, id, x, y, width, height, color, label }) => {
    const nodeId = Option.getOrElse(id, () => generateId());
    return readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
        const colorValue = Option.getOrUndefined(color);
        const labelValue = Option.getOrUndefined(label);
        const nodeData = {
          id: nodeId,
          type: "group",
          x: x,
          y: y,
          width: width,
          height: height,
          color: colorValue,
          label: labelValue,
        };

        return upsertNode(file, canvas, nodeData);
      }),
      Effect.tap(() => Console.log(`Successfully added or updated group node: ${nodeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
