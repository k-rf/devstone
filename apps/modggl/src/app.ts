import { Command } from "@effect/cli";

import { runCommand } from "./adapter/inbound/cli/run.command.js";

/**
 * 実行用の CLI ハンドラー。
 */
export const runCli = Command.run(runCommand, {
  name: "modggl",
  version: "1.0.0",
});
