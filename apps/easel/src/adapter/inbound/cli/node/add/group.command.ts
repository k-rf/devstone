import { Command } from "@effect/cli";
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

    return addNodeWorkflow(nodeData).pipe(
      Effect.provide(CanvasFileRepository(file)),
      Effect.tap(() => Console.log(`Successfully added or updated group node: ${nodeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
