import { ConfigProvider, Effect } from "effect";
import { expect, it } from "vitest";

import { loadEnv } from "./env.middleware.js";

it("必須環境変数がすべて正しい形式のとき検証済み設定オブジェクトを返すこと", async () => {
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
    togglOrganizationId: 1001,
    togglWorkspaceId: 2002,
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
])("環境変数が不正（$label）なとき EnvValidationError を返すこと", async ({ entries }) => {
  const provider = ConfigProvider.fromMap(new Map(entries));

  const error = await Effect.runPromise(
    Effect.flip(loadEnv().pipe(Effect.withConfigProvider(provider))),
  );

  expect(error._tag).toBe("EnvValidationError");
  expect(error.message).toContain("環境変数の検証に失敗しました");
});
