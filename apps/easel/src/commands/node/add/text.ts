import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";

import { generateId } from "../../../utils/generate-id.js";
import { readCanvas } from "../../../utils/read-canvas.js";
import { upsertNode } from "../../../utils/upsert-node.js";
import { fileOption } from "../../options/file-option.js";
import {
  colorOption,
  heightOption,
  nodeIdOption,
  widthOption,
  xOption,
  yOption,
} from "../options.js";

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
    return readCanvas(file).pipe(
      Effect.flatMap((canvas) => {
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

        return upsertNode(file, canvas, nodeData);
      }),
      Effect.tap(() => Console.log(`Successfully added or updated text node: ${nodeId}`)),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    );
  }),
);
