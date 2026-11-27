import { Command } from "@effect/cli";

import { statuslineCommand } from "./adapter/inbound/cli/statusline.command.js";

/**
 * agent-analytics のルートコマンド定義。
 */
const rootCommand = Command.make("agent-analytics").pipe(
  Command.withDescription("CLI tool to analyze agent session transcripts and skill usage"),
  Command.withSubcommands([statuslineCommand]),
);

/**
 * 実行用の CLI ハンドラー。
 */
export const runCli = Command.run(rootCommand, {
  name: "Agent Analytics CLI",
  version: "1.0.0",
});
