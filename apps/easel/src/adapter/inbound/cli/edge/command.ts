import { Command } from "@effect/cli";

import { addEdgeCommand } from "./add.js";
import { rmEdgeCommand } from "./rm.js";

/**
 * easel の edge コマンド定義。
 * サブコマンドとして add, rm を持ちます。
 */
export const edgeCommand = Command.make("edge").pipe(
  Command.withDescription("Manage edges in the canvas"),
  Command.withSubcommands([addEdgeCommand, rmEdgeCommand]),
);
