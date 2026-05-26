import { Command } from "@effect/cli";

import { edgeCommand } from "./adapter/inbound/cli/edge/command.js";
import { getCommand } from "./adapter/inbound/cli/get.js";
import { listCommand } from "./adapter/inbound/cli/list.js";
import { nodeCommand } from "./adapter/inbound/cli/node/command.js";
import { serveCommand } from "./adapter/inbound/cli/serve.js";
import { showCommand } from "./adapter/inbound/cli/show.js";

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
