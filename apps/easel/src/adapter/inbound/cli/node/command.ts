import { Command } from "@effect/cli";

import { addNodeCommand } from "./add/command.js";
import { mvNodeCommand } from "./mv.js";
import { rearrangeNodeCommand } from "./rearrange.js";
import { rmNodeCommand } from "./rm.js";
import { updateNodeCommand } from "./update/command.js";

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
