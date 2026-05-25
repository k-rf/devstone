import { Command } from "@effect/cli";
import { Console, Effect } from "effect";

import { readCanvas } from "../utils/read-canvas.js";

import { fileOption } from "./options/file-option.js";

/**
 * 指定された .canvas ファイルの全データを標準出力にJSON形式でダンプします。
 * @returns ダンプ処理を実行する Effect。
 */
export const showCommand = Command.make("show", {
  file: fileOption,
}).pipe(
  Command.withDescription("Dump the entire canvas JSON data to standard output"),
  Command.withHandler(({ file }) =>
    readCanvas(file).pipe(
      Effect.flatMap((canvas) => Console.log(JSON.stringify(canvas, undefined, 2))),
      Effect.catchAll((error) =>
        Console.error(`Error: ${error.message}`).pipe(Effect.flatMap(() => Effect.fail(error))),
      ),
    ),
  ),
);
