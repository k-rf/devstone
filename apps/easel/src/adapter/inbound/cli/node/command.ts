import { Command } from "@effect/cli";

import { addNodeCommand } from "./add/command.js";
import { rmNodeCommand } from "./rm.js";

/**
 * easel の node コマンド定義。
 * サブコマンドとして add, rm を持ちます。
 */
export const nodeCommand = Command.make("node").pipe(
  Command.withDescription("Manage nodes in the canvas"),
  Command.withSubcommands([addNodeCommand, rmNodeCommand]),
);
