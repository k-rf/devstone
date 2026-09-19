import { Command } from "@effect/cli";

import { addEdgeCommand } from "./add.command.js";
import { rmEdgeCommand } from "./rm.command.js";
import { updateEdgeCommand } from "./update.command.js";

/**
 * easel の edge コマンド定義。
 * サブコマンドとして add, rm, update を持ちます。
 */
export const edgeCommand = Command.make("edge").pipe(
  Command.withDescription("Manage edges in the canvas"),
  Command.withSubcommands([addEdgeCommand, rmEdgeCommand, updateEdgeCommand]),
);
