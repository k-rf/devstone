import { Command } from "@effect/cli";

import { addFileNodeCommand } from "./file.js";
import { addGroupNodeCommand } from "./group.js";
import { addLinkNodeCommand } from "./link.js";
import { addTextNodeCommand } from "./text.js";

/**
 * ノードを追加するための add 親コマンド。
 * サブコマンドとして text, file, link, group を持ちます。
 */
export const addNodeCommand = Command.make("add").pipe(
  Command.withDescription("Add or update a node (text, file, link, group)"),
  Command.withSubcommands([
    addTextNodeCommand,
    addFileNodeCommand,
    addLinkNodeCommand,
    addGroupNodeCommand,
  ]),
);
