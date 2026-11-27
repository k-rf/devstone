import { Command } from "@effect/cli";
import { BunContext } from "@effect/platform-bun";
import { ConfigProvider, Effect } from "effect";
import { expect, it } from "vitest";

import { runCommand } from "./run.command.js";

const cli = Command.run(runCommand, { name: "modggl", version: "1.0.0" });

const validProvider = ConfigProvider.fromMap(
  new Map([
    ["TOGGL_API_TOKEN", "test-token"],
    ["TOGGL_ORGANIZATION_ID", "1001"],
    ["TOGGL_WORKSPACE_ID", "2002"],
  ]),
);

it("--help でオプション一覧が出力され正常終了すること", async () => {
  await expect(
    Effect.runPromise(
      cli(["bun", "modggl", "--help"]).pipe(
        Effect.provide(BunContext.layer),
        Effect.withConfigProvider(validProvider),
      ),
    ),
  ).resolves.toBeUndefined();
});

it.each([
  { label: "--days が 0", args: ["--days", "0"] },
  { label: "--days が負数", args: ["--days", "-3"] },
  { label: "--since が不正文字列", args: ["--since", "not-a-date"] },
  { label: "--until が数値文字列", args: ["--until", "12345"] },
  { label: "--notify と --no-notify の同時指定", args: ["--notify", "--no-notify"] },
])("不正な CLI 引数（$label）はコマンド検証で失敗すること", async ({ args }) => {
  const error = await Effect.runPromise(
    Effect.flip(
      cli(["bun", "modggl", ...args]).pipe(
        Effect.provide(BunContext.layer),
        Effect.withConfigProvider(validProvider),
      ),
    ),
  );

  expect(error).toBeDefined();
});
