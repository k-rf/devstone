import { Command } from "@effect/cli";

import { edgeCommand } from "./adapter/inbound/cli/edge/commands.js";
import { getCommand } from "./adapter/inbound/cli/get.command.js";
import { listCommand } from "./adapter/inbound/cli/list.command.js";
import { nodeCommand } from "./adapter/inbound/cli/node/commands.js";
import { serveCommand } from "./adapter/inbound/cli/serve.command.js";
import { showCommand } from "./adapter/inbound/cli/show.command.js";

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
