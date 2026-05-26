import { Command } from "@effect/cli";

import { addFileNodeCommand } from "./file.js";
import { addGroupNodeCommand } from "./group.js";
import { addLinkNodeCommand } from "./link.js";
import { addTextNodeCommand } from "./text.js";

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
