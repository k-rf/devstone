import { Toggl2OrganizationId, Toggl2WorkspaceId } from "@devstone/libs-toggl-2-sdk";
import { ConfigProvider, Effect, Option } from "effect";
import { expect, it } from "vitest";

import { loadEnv } from "./load-env.js";

it("必須環境変数がすべて正しい形式で DISCORD_WEBHOOK_URL が未設定のとき Option.none() を返すこと", async () => {
  const provider = ConfigProvider.fromMap(
    new Map([
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ]),
  );

  const result = await Effect.runPromise(loadEnv().pipe(Effect.withConfigProvider(provider)));

  expect(result).toStrictEqual({
    togglApiToken: "toggl_sk_secret",
    togglOrganizationId: Toggl2OrganizationId.make(1001),
    togglWorkspaceId: Toggl2WorkspaceId.make(2002),
    discordWebhookUrl: Option.none(),
  });
});

it.each([
  "https://discord.com/api/webhooks/123456789/token-abc_XYZ",
  "https://discordapp.com/api/webhooks/123456789/token-abc",
  "https://ptb.discord.com/api/webhooks/123456789/token-abc",
  "https://canary.discord.com/api/webhooks/123456789/token-abc",
])("有効な DISCORD_WEBHOOK_URL (%s) を設定したとき Option.some(url) を返すこと", async (url) => {
  const provider = ConfigProvider.fromMap(
    new Map([
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", url],
    ]),
  );

  const result = await Effect.runPromise(loadEnv().pipe(Effect.withConfigProvider(provider)));

  expect(result).toStrictEqual({
    togglApiToken: "toggl_sk_secret",
    togglOrganizationId: Toggl2OrganizationId.make(1001),
    togglWorkspaceId: Toggl2WorkspaceId.make(2002),
    discordWebhookUrl: Option.some(url),
  });
});

it.each([
  {
    label: "TOGGL_API_TOKEN 未設定",
    entries: [
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_API_TOKEN が空文字",
    entries: [
      ["TOGGL_API_TOKEN", ""],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_API_TOKEN が空白のみ",
    entries: [
      ["TOGGL_API_TOKEN", "   "],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_API_TOKEN に前後空白が含まれる",
    entries: [
      ["TOGGL_API_TOKEN", " token "],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_API_TOKEN に中間空白が含まれる",
    entries: [
      ["TOGGL_API_TOKEN", "tok en"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_API_TOKEN に改行が含まれる",
    entries: [
      ["TOGGL_API_TOKEN", "tok\nfoo"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_API_TOKEN にタブが含まれる",
    entries: [
      ["TOGGL_API_TOKEN", "tok\tfoo"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_ORGANIZATION_ID が非数値",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "abc"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_ORGANIZATION_ID が 0",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "0"],
      ["TOGGL_WORKSPACE_ID", "2002"],
    ] as const,
  },
  {
    label: "TOGGL_WORKSPACE_ID が負数",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "-5"],
    ] as const,
  },
  {
    label: "TOGGL_WORKSPACE_ID が小数",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "12.5"],
    ] as const,
  },
  {
    label: "DISCORD_WEBHOOK_URL が空文字",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", ""],
    ] as const,
  },
  {
    label: "DISCORD_WEBHOOK_URL が http スキーム",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", ["http", "://discord.com/api/webhooks/123/token"].join("")],
    ] as const,
  },
  {
    label: "DISCORD_WEBHOOK_URL が Discord 以外のドメイン",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", "https://example.com/api/webhooks/123/token"],
    ] as const,
  },
  {
    label: "DISCORD_WEBHOOK_URL が不完全なパス",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/123"],
    ] as const,
  },
  {
    label: "DISCORD_WEBHOOK_URL が相対パスを含む",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/../.."],
    ] as const,
  },
  {
    label: "DISCORD_WEBHOOK_URL の ID 部が非数字",
    entries: [
      ["TOGGL_API_TOKEN", "toggl_sk_secret"],
      ["TOGGL_ORGANIZATION_ID", "1001"],
      ["TOGGL_WORKSPACE_ID", "2002"],
      ["DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/abc/token"],
    ] as const,
  },
])("環境変数が不正（$label）なとき EnvValidationError を返すこと", async ({ entries }) => {
  const provider = ConfigProvider.fromMap(new Map(entries));

  const error = await Effect.runPromise(
    Effect.flip(loadEnv().pipe(Effect.withConfigProvider(provider))),
  );

  expect(error._tag).toBe("EnvValidationError");
  expect(error.message).toContain("環境変数の検証に失敗しました");
});
