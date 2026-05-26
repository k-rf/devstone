import { Command } from "@effect/cli";
import { Console } from "effect";

import { fileOption } from "./options/file-option.js";

/**
 * サーバー起動コマンド（実装予定）。
 */
export const serveCommand = Command.make("serve", {
  file: fileOption,
}).pipe(
  Command.withDescription("サーバーを起動してキャンバスをリアルタイムに表示します（実装予定）"),
  Command.withHandler(() =>
    Console.log(
      "serveコマンドは現在実装予定です。将来のアップデートでローカル可視化サーバーが起動可能になります。",
    ),
  ),
);
