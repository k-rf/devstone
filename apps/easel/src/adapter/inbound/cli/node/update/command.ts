import { Command } from "@effect/cli";

import { updateFileNodeCommand } from "./file.js";
import { updateGroupNodeCommand } from "./group.js";
import { updateLinkNodeCommand } from "./link.js";
import { updateTextNodeCommand } from "./text.js";

/**
 * node update コマンド定義。
 * 各ノードタイプ用のサブコマンドを持ちます。
 */
export const updateNodeCommand = Command.make("update").pipe(
  Command.withDescription("Update an existing node in the canvas"),
  Command.withSubcommands([
    updateTextNodeCommand,
    updateFileNodeCommand,
    updateLinkNodeCommand,
    updateGroupNodeCommand,
  ]),
);
