import { Command } from "@effect/cli";

import { edgeCommand } from "./commands/edge/command.js";
import { getCommand } from "./commands/get.js";
import { listCommand } from "./commands/list.js";
import { nodeCommand } from "./commands/node/command.js";
import { serveCommand } from "./commands/serve.js";
import { showCommand } from "./commands/show.js";

/**
 * easel のルートコマンド定義。
 * サブコマンドとして serve, node, edge, show, list, get を持ちます。
 */
const rootCommand = Command.make("easel").pipe(
  Command.withDescription("CLI tool to create, modify, and serve JSON-Canvas files"),
  Command.withSubcommands([
    serveCommand,
    nodeCommand,
    edgeCommand,
    showCommand,
    listCommand,
    getCommand,
  ]),
);

/**
 * 実行用の CLI ハンドラー。
 */
export const runCli = Command.run(rootCommand, {
  name: "JSON-Canvas CLI",
  version: "1.0.0",
});
