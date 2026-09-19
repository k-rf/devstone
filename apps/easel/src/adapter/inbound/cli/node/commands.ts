import { Command } from "@effect/cli";

import { addNodeCommand } from "./add/commands.js";
import { mvNodeCommand } from "./mv.command.js";
import { rearrangeNodeCommand } from "./rearrange.command.js";
import { rmNodeCommand } from "./rm.command.js";
import { updateNodeCommand } from "./update/commands.js";

/**
 * easel の node コマンド定義。
 */
export const nodeCommand = Command.make("node").pipe(
  Command.withDescription("Manage nodes in the canvas"),
  Command.withSubcommands([
    addNodeCommand,
    rmNodeCommand,
    mvNodeCommand,
    updateNodeCommand,
    rearrangeNodeCommand,
  ]),
);
