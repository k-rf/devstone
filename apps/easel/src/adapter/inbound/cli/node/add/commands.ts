import { Command } from "@effect/cli";

import { addFileNodeCommand } from "./file.command.js";
import { addGroupNodeCommand } from "./group.command.js";
import { addLinkNodeCommand } from "./link.command.js";
import { addTextNodeCommand } from "./text.command.js";

/**
 * node add コマンド定義。
 * 各ノードタイプ用のサブコマンドを持ちます。
 */
export const addNodeCommand = Command.make("add").pipe(
  Command.withDescription("Add a new node to the canvas"),
  Command.withSubcommands([
    addTextNodeCommand,
    addFileNodeCommand,
    addLinkNodeCommand,
    addGroupNodeCommand,
  ]),
);
