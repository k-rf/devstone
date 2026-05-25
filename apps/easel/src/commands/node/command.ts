import { Command } from "@effect/cli";

import { addNodeCommand } from "./add/command.js";
import { rmNodeCommand } from "./rm.js";

/**
 * キャンバス内のノードを管理するための node コマンド。
 * サブコマンドとして add と rm を持ちます。
 */
export const nodeCommand = Command.make("node").pipe(
  Command.withDescription("Manage nodes within the canvas"),
  Command.withSubcommands([addNodeCommand, rmNodeCommand]),
);
