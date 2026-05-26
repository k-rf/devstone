import { Command } from "@effect/cli";
import { Console, Effect } from "effect";

import { showCanvas } from "../../../core/application/canvas.service.js";

import { fileOption, provideCanvasRepository } from "./options/file-option.js";

/**
 * 指定された .canvas ファイルの全データを標準出力にJSON形式でダンプします。
 */
export const showCommand = Command.make("show", {
  file: fileOption,
}).pipe(
  Command.withDescription("Dump the entire canvas JSON data to standard output"),
  Command.withHandler(({ file }) =>
    showCanvas().pipe(
      Effect.flatMap((canvas) => Console.log(JSON.stringify(canvas, undefined, 2))),
      provideCanvasRepository(file),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
