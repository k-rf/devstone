import { BunContext } from "@effect/platform-bun";
import { ConfigProvider, Effect } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { runCli } from "./app.js";

const server = setupServer();

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => {
  server.close();
});

const organizationId = 1001;
const workspaceId = 2002;
const baseUrl = `https://focus.toggl.com/api/organizations/${String(organizationId)}/workspaces/${String(workspaceId)}`;
const discordWebhookUrl = "https://discord.com/api/webhooks/123456789/test-token";

const validEnvProvider = ConfigProvider.fromMap(
  new Map([
    ["TOGGL_API_TOKEN", "toggl_sk_e2e"],
    ["TOGGL_ORGANIZATION_ID", String(organizationId)],
    ["TOGGL_WORKSPACE_ID", String(workspaceId)],
    ["DISCORD_WEBHOOK_URL", discordWebhookUrl],
  ]),
);

const envWithoutDiscordProvider = ConfigProvider.fromMap(
  new Map([
    ["TOGGL_API_TOKEN", "toggl_sk_e2e"],
    ["TOGGL_ORGANIZATION_ID", String(organizationId)],
    ["TOGGL_WORKSPACE_ID", String(workspaceId)],
  ]),
);

const runWithCapture = (
  args: readonly string[],
  provider: ConfigProvider.ConfigProvider = validEnvProvider,
) => {
  const stdoutSpy = vi.fn<(...values: readonly unknown[]) => void>();
  const stderrSpy = vi.fn<(...values: readonly unknown[]) => void>();

  const effect = Effect.consoleWith((baseConsole) =>
    runCli(["bun", "modggl", ...args]).pipe(
      Effect.withConsole({
        ...baseConsole,
        log: (...values: readonly unknown[]) =>
          Effect.sync(() => {
            stdoutSpy(...values);
          }),
        error: (...values: readonly unknown[]) =>
          Effect.sync(() => {
            stderrSpy(...values);
          }),
      }),
      Effect.withConfigProvider(provider),
      Effect.provide(BunContext.layer),
    ),
  );

  return { effect: effect, stdoutSpy: stdoutSpy, stderrSpy: stderrSpy };
};

describe("正常系（E2E）", () => {
  it("連鎖マージ・隙間補完・重複切り詰めを全レイヤー結合で実行し構造化 JSON 出力と Discord 通知を行うこと", async () => {
    const patchSpy = vi.fn<(body: unknown) => void>();
    const deleteSpy = vi.fn<(url: string) => void>();
    const discordSpy = vi.fn<(body: unknown) => void>();

    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () =>
        HttpResponse.json(
          [
            { id: 1, start: "2026-11-27T09:00:00Z", duration: 1800, description: "開発" },
            { id: 2, start: "2026-11-27T09:30:00Z", duration: 1800, description: "開発" },
            {
              id: 3,
              start: "2026-11-27T10:00:00Z",
              duration: 1800,
              description: "開発",
              planned_start: "2026-11-27T10:00:00Z",
            },
            { id: 4, start: "2026-11-27T11:00:00Z", duration: 3600, description: "会議" },
            { id: 5, start: "2026-11-27T11:30:00Z", duration: 1800, description: "レビュー" },
            { id: 6, start: "2026-11-27T12:00:00Z", duration: undefined, description: "計測中" },
          ],
          { headers: { "X-Toggl-Quota-Remaining": "29", "X-Toggl-Quota-Resets-In": "3600" } },
        ),
      ),
      http.patch(`${baseUrl}/time-entries/bulk`, async ({ request }) => {
        patchSpy(await request.json());
        return new HttpResponse(undefined, {
          status: 204,
          headers: { "X-Toggl-Quota-Remaining": "28", "X-Toggl-Quota-Resets-In": "3590" },
        });
      }),
      http.delete(`${baseUrl}/time-entries/bulk`, ({ request }) => {
        deleteSpy(request.url);
        return new HttpResponse(undefined, {
          status: 204,
          headers: { "X-Toggl-Quota-Remaining": "27", "X-Toggl-Quota-Resets-In": "3580" },
        });
      }),
      http.post(discordWebhookUrl, async ({ request }) => {
        discordSpy(await request.json());
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    const { effect, stdoutSpy, stderrSpy } = runWithCapture([
      "--since",
      "2026-11-27T00:00:00Z",
      "--until",
      "2026-11-28T00:00:00Z",
    ]);

    await Effect.runPromise(effect);

    expect(stderrSpy).not.toHaveBeenCalled();
    expect(patchSpy).toHaveBeenCalledWith([
      { id: 3, start: "2026-11-27T09:00:00.000Z", duration: 7200 },
      { id: 4, duration: 1800 },
    ]);
    expect(deleteSpy).toHaveBeenCalledWith(`${baseUrl}/time-entries/bulk?ids=2,1`);
    expect(discordSpy).toHaveBeenCalledTimes(1);
    expect(discordSpy.mock.calls[0]?.[0]).toMatchObject({
      embeds: [
        {
          title: "modggl: タイムエントリーを補正しました",
          color: 0x2E_CC_71,
        },
      ],
    });

    const stdoutJson: unknown = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    expect(stdoutJson).toStrictEqual({
      status: "completed",
      since: "2026-11-27T00:00:00.000Z",
      until: "2026-11-28T00:00:00.000Z",
      stats: {
        fetchedCount: 6,
        excludedCount: 1,
        processedCount: 5,
        modifiedCount: 2,
        deletedCount: 2,
      },
      modifications: [
        {
          id: 3,
          start: "2026-11-27T09:00:00.000Z",
          end: "2026-11-27T11:00:00.000Z",
          durationSeconds: 7200,
        },
        {
          id: 4,
          start: "2026-11-27T11:00:00.000Z",
          end: "2026-11-27T11:30:00.000Z",
          durationSeconds: 1800,
        },
      ],
      deletedIds: [2, 1],
      quota: {
        remaining: 27,
        resetsInSeconds: 3580,
      },
    });
  });

  it("変更対象がない場合（no_changes）でも死活監視用のグレー Embed を Discord へ送信すること", async () => {
    const discordSpy = vi.fn<(body: unknown) => void>();

    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => HttpResponse.json([])),
      http.post(discordWebhookUrl, async ({ request }) => {
        discordSpy(await request.json());
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    const { effect, stdoutSpy } = runWithCapture([]);
    await Effect.runPromise(effect);

    expect(discordSpy).toHaveBeenCalledTimes(1);
    expect(discordSpy.mock.calls[0]?.[0]).toMatchObject({
      embeds: [
        {
          title: "modggl: 変更対象のエントリーはありませんでした",
          color: 0x95_A5_A6,
        },
      ],
    });

    const stdoutJson: unknown = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    expect(stdoutJson).toMatchObject({
      status: "no_changes",
      stats: { fetchedCount: 0, modifiedCount: 0, deletedCount: 0 },
    });
  });

  it("--dry-run 時は DISCORD_WEBHOOK_URL 未設定でも書き込み・通知を行わず dry_run サマリーを出力すること", async () => {
    const patchSpy = vi.fn();
    const deleteSpy = vi.fn();

    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () =>
        HttpResponse.json([
          { id: 1, start: "2026-11-27T09:00:00Z", duration: 1800, description: "A" },
          { id: 2, start: "2026-11-27T10:00:00Z", duration: 1800, description: "B" },
        ]),
      ),
      http.patch(`${baseUrl}/time-entries/bulk`, () => {
        patchSpy();
        return new HttpResponse(undefined, { status: 204 });
      }),
      http.delete(`${baseUrl}/time-entries/bulk`, () => {
        deleteSpy();
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    const { effect, stdoutSpy } = runWithCapture(
      ["--days", "3", "--dry-run"],
      envWithoutDiscordProvider,
    );

    await Effect.runPromise(effect);

    expect(patchSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    const stdoutJson: unknown = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    expect(stdoutJson).toMatchObject({
      status: "dry_run",
      stats: { modifiedCount: 1, deletedCount: 0 },
    });
  });

  it("--no-notify 時は DISCORD_WEBHOOK_URL 未設定でも通知なしで正常完了すること", async () => {
    server.use(http.get(`${baseUrl}/time-entries/stream`, () => HttpResponse.json([])));

    const { effect, stdoutSpy } = runWithCapture(["--no-notify"], envWithoutDiscordProvider);
    await Effect.runPromise(effect);

    const stdoutJson: unknown = JSON.parse(String(stdoutSpy.mock.calls[0]?.[0]));
    expect(stdoutJson).toMatchObject({
      status: "no_changes",
    });
  });
});

describe("異常系（E2E・終了コード1相当の失敗）", () => {
  it("判定不能重複を検出したとき書き込みを一切行わず stderr 出力と Discord 停止通知を行って失敗すること", async () => {
    const patchSpy = vi.fn();
    const deleteSpy = vi.fn();
    const discordSpy = vi.fn<(body: unknown) => void>();

    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () =>
        HttpResponse.json([
          { id: 10, start: "2026-11-27T09:00:00Z", duration: 1800, description: "A" },
          { id: 11, start: "2026-11-27T09:00:00Z", duration: 1800, description: "B" },
        ]),
      ),
      http.patch(`${baseUrl}/time-entries/bulk`, () => {
        patchSpy();
        return new HttpResponse(undefined, { status: 204 });
      }),
      http.delete(`${baseUrl}/time-entries/bulk`, () => {
        deleteSpy();
        return new HttpResponse(undefined, { status: 204 });
      }),
      http.post(discordWebhookUrl, async ({ request }) => {
        discordSpy(await request.json());
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    const { effect, stdoutSpy, stderrSpy } = runWithCapture([]);

    const error = await Effect.runPromise(Effect.flip(effect));

    expect(patchSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).toHaveBeenCalledTimes(1);
    expect(discordSpy).toHaveBeenCalledTimes(1);
    expect(discordSpy.mock.calls[0]?.[0]).toMatchObject({
      embeds: [
        {
          title: "modggl: 判定不能な重複を検出して停止しました",
          color: 0xF3_9C_12,
        },
      ],
    });
    expect(error._tag).toBe("ModifyEntriesAbortedError");

    const stderrJson: unknown = JSON.parse(String(stderrSpy.mock.calls[0]?.[0]));
    expect(stderrJson).toMatchObject({
      status: "aborted",
      reason: "NotDetermine",
      first: { id: 10, description: "A" },
      second: { id: 11, description: "B" },
    });
  });

  it("API が 402 Quota Exceeded を返したとき stderr 出力と Discord エラー通知を行って失敗すること", async () => {
    const discordSpy = vi.fn<(body: unknown) => void>();

    server.use(
      http.get(
        `${baseUrl}/time-entries/stream`,
        () =>
          new HttpResponse("Quota exceeded", {
            status: 402,
            headers: { "X-Toggl-Quota-Resets-In": "1800" },
          }),
      ),
      http.post(discordWebhookUrl, async ({ request }) => {
        discordSpy(await request.json());
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    const { effect, stderrSpy } = runWithCapture([]);
    const error = await Effect.runPromise(Effect.flip(effect));

    expect(error._tag).toBe("TimeEntriesError");
    expect(discordSpy).toHaveBeenCalledTimes(1);
    expect(discordSpy.mock.calls[0]?.[0]).toMatchObject({
      embeds: [
        {
          title: "modggl: 実行エラーが発生しました",
          color: 0xE7_4C_3C,
        },
      ],
    });
    const stderrJson: unknown = JSON.parse(String(stderrSpy.mock.calls[0]?.[0]));
    expect(stderrJson).toMatchObject({
      status: "error",
      error: "TimeEntriesError",
      reason: "QuotaExceeded",
      httpStatus: 402,
      resetsInSeconds: 1800,
    });
  });

  it.each([
    { label: "通常実行", args: [] as readonly string[] },
    { label: "--dry-run --notify", args: ["--dry-run", "--notify"] as readonly string[] },
  ])(
    "通知有効（$label）かつ DISCORD_WEBHOOK_URL 未設定のとき API を呼ばず EnvValidationError で失敗すること",
    async ({ args }) => {
      const getSpy = vi.fn();
      server.use(
        http.get(`${baseUrl}/time-entries/stream`, () => {
          getSpy();
          return HttpResponse.json([]);
        }),
      );

      const { effect, stderrSpy } = runWithCapture(args, envWithoutDiscordProvider);
      const error = await Effect.runPromise(Effect.flip(effect));

      expect(getSpy).not.toHaveBeenCalled();
      expect(error._tag).toBe("EnvValidationError");
      const stderrJson: unknown = JSON.parse(String(stderrSpy.mock.calls[0]?.[0]));
      expect(stderrJson).toMatchObject({
        status: "error",
        error: "EnvValidationError",
      });
    },
  );

  it("since >= until のときは API を呼ばず InvalidDateRangeError JSON を stderr 出力して失敗すること", async () => {
    const getSpy = vi.fn();
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        getSpy();
        return HttpResponse.json([]);
      }),
    );

    const { effect, stderrSpy } = runWithCapture([
      "--since",
      "2026-11-28T00:00:00Z",
      "--until",
      "2026-11-27T00:00:00Z",
    ]);
    const error = await Effect.runPromise(Effect.flip(effect));

    expect(getSpy).not.toHaveBeenCalled();
    expect(error._tag).toBe("InvalidDateRangeError");
    const stderrJson: unknown = JSON.parse(String(stderrSpy.mock.calls[0]?.[0]));
    expect(stderrJson).toMatchObject({
      status: "error",
      error: "InvalidDateRangeError",
    });
  });

  it("環境変数が不足しているときは API を呼ばず EnvValidationError JSON を stderr 出力して失敗すること", async () => {
    const getSpy = vi.fn();
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        getSpy();
        return HttpResponse.json([]);
      }),
    );

    const { effect, stderrSpy } = runWithCapture([], ConfigProvider.fromMap(new Map()));
    const error = await Effect.runPromise(Effect.flip(effect));

    expect(getSpy).not.toHaveBeenCalled();
    expect(error._tag).toBe("EnvValidationError");
    const stderrJson: unknown = JSON.parse(String(stderrSpy.mock.calls[0]?.[0]));
    expect(stderrJson).toMatchObject({
      status: "error",
      error: "EnvValidationError",
    });
  });
});
