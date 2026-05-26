import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";

import { addNodeWorkflow } from "../../../../../core/application/add-node.workflow.js";
import { generateId } from "../../../../../utils/generate-id.js";
import { fileOption, provideCanvasRepository } from "../../options/file-option.js";

import {
  colorOption,
  heightOption,
  nodeIdOption,
  widthOption,
  xOption,
  yOption,
} from "./options.js";

const textOption = Options.text("text").pipe(Options.withDescription("Text content for the node"));

/**
 * Text タイプのノードをキャンバスに追加または更新するコマンド。
 */
export const addTextNodeCommand = Command.make("text", {
  file: fileOption,
  id: nodeIdOption,
  x: xOption,
  y: yOption,
  width: widthOption,
  height: heightOption,
  color: colorOption,
  text: textOption,
}).pipe(
  Command.withDescription("Add or update a text node"),
  Command.withHandler(({ file, id, x, y, width, height, color, text }) => {
    const nodeId = Option.getOrElse(id, () => generateId());
    const colorValue = Option.getOrUndefined(color);
    const nodeData = {
      id: nodeId,
      type: "text",
      x: x,
      y: y,
      width: width,
      height: height,
      color: colorValue,
      text: text,
    };

    return addNodeWorkflow(nodeData).pipe(
      provideCanvasRepository(file),
      Effect.tap(() => Console.log(`Successfully added or updated text node: ${nodeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
