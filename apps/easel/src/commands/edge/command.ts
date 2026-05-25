import { Command } from "@effect/cli";

import { addEdgeCommand } from "./add.js";
import { rmEdgeCommand } from "./rm.js";

/**
 * キャンバス内のエッジを管理するための edge コマンド。
 * サブコマンドとして add と rm を持ちます。
 */
export const edgeCommand = Command.make("edge").pipe(
  Command.withDescription("Manage edges within the canvas"),
  Command.withSubcommands([addEdgeCommand, rmEdgeCommand]),
);
