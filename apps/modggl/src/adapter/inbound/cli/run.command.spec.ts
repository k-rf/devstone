import { Command, ValidationError } from "@effect/cli";
import { BunContext } from "@effect/platform-bun";
import { ConfigProvider, Effect } from "effect";
import { expect, it, vi } from "vitest";

import { runCommand } from "./run.command.js";

const cli = Command.run(runCommand, { name: "modggl", version: "1.0.0" });

const validProvider = ConfigProvider.fromMap(
  new Map([
    ["TOGGL_API_TOKEN", "test-token"],
    ["TOGGL_ORGANIZATION_ID", "1001"],
    ["TOGGL_WORKSPACE_ID", "2002"],
    ["DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/123456789/test-token"],
  ]),
);

it("--help で全オプション一覧が出力され正常終了すること", async () => {
  const logSpy = vi.fn<(...values: readonly unknown[]) => void>();

  await Effect.runPromise(
    Effect.consoleWith((baseConsole) =>
      cli(["bun", "modggl", "--help"]).pipe(
        Effect.withConsole({
          ...baseConsole,
          log: (...values: readonly unknown[]) =>
            Effect.sync(() => {
              logSpy(...values);
            }),
        }),
        Effect.provide(BunContext.layer),
        Effect.withConfigProvider(validProvider),
      ),
    ),
  );

  const helpOutput = logSpy.mock.calls.flat().map(String).join("\n");
  expect(helpOutput).toContain("--since");
  expect(helpOutput).toContain("--until");
  expect(helpOutput).toContain("--days");
  expect(helpOutput).toContain("--dry-run");
  expect(helpOutput).toContain("--notify");
  expect(helpOutput).toContain("--no-notify");
});

it.each([
  { label: "--days が 0", args: ["--days", "0"] },
  { label: "--days が負数", args: ["--days", "-3"] },
  { label: "--days が上限超過", args: ["--days", "1000000000"] },
  { label: "--since が不正文字列", args: ["--since", "not-a-date"] },
  { label: "--since が存在しない暦日", args: ["--since", "2026-02-30T00:00:00Z"] },
  { label: "--until が数値文字列", args: ["--until", "12345"] },
  { label: "--notify と --no-notify の同時指定", args: ["--notify", "--no-notify"] },
])("不正な CLI 引数（$label）は ValidationError で失敗すること", async ({ args }) => {
  const error = await Effect.runPromise(
    Effect.flip(
      cli(["bun", "modggl", ...args]).pipe(
        Effect.provide(BunContext.layer),
        Effect.withConfigProvider(validProvider),
      ),
    ),
  );

  expect(ValidationError.isValidationError(error)).toBe(true);
});
