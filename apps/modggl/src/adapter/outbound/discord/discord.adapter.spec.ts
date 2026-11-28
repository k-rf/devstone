import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { DateTime, Effect, Option } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TimeEntryId } from "../../../core/domain/time-entry-id.js";
import { NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";

import { DiscordAdapterLive } from "./discord.adapter.js";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => {
  server.close();
});

const webhookUrl = "https://discord.com/api/webhooks/123456789/test-webhook-token";
const adapterLayer = DiscordAdapterLive(webhookUrl);

const entry = (id: number, description: string) => ({
  id: TimeEntryId.make(id),
  interval: TimeInterval.make({
    start: TimeInstant.make(Date.parse("2026-11-27T09:00:00.000Z")),
    end: TimeInstant.make(Date.parse("2026-11-27T09:30:00.000Z")),
  }),
  type: "activity" as const,
  taskId: Option.none(),
  projectId: Option.none(),
  clientId: Option.none(),
  description: description,
  tagIds: [],
  billable: false,
  hasScheduleBinding: false,
});

describe("正常系", () => {
  it.each([
    {
      status: "completed" as const,
      expectedTitle: "modggl: タイムエントリーを補正しました",
      expectedColor: 0x2ecc71,
      modifiedCount: 1,
      deletedIds: [TimeEntryId.make(2)],
      quotaRemaining: Option.some(27),
      quotaResetsInSeconds: Option.some(3500),
      expectedQuota: "残り 27 req / リセット 3500 秒後",
    },
    {
      status: "no_changes" as const,
      expectedTitle: "modggl: 変更対象のエントリーはありませんでした",
      expectedColor: 0x95a5a6,
      modifiedCount: 0,
      deletedIds: [],
      quotaRemaining: Option.none(),
      quotaResetsInSeconds: Option.none(),
      expectedQuota: "残り 不明 / リセット 不明",
    },
    {
      status: "dry_run" as const,
      expectedTitle: "modggl: ドライラン結果",
      expectedColor: 0x3498db,
      modifiedCount: 1,
      deletedIds: [],
      quotaRemaining: Option.some(29),
      quotaResetsInSeconds: Option.none(),
      expectedQuota: "残り 29 req / リセット 不明",
    },
  ])(
    "notifyCompleted が $status 用の Embed JSON を Discord Webhook へ送信すること",
    async ({
      status,
      expectedTitle,
      expectedColor,
      modifiedCount,
      deletedIds,
      quotaRemaining,
      quotaResetsInSeconds,
      expectedQuota,
    }) => {
      const postSpy = vi.fn<(body: unknown) => void>();

      server.use(
        http.post(webhookUrl, async ({ request }) => {
          postSpy(await request.json());
          return new HttpResponse(undefined, { status: 204 });
        }),
      );

      const t0 = TimeInstant.make(Date.parse("2026-11-27T09:00:00.000Z"));
      const t1 = TimeInstant.make(Date.parse("2026-11-27T09:30:00.000Z"));
      const t2 = TimeInstant.make(Date.parse("2026-11-27T10:00:00.000Z"));
      const modifications =
        modifiedCount === 0
          ? []
          : [
              {
                id: TimeEntryId.make(1),
                previousInterval: TimeInterval.make({ start: t0, end: t1 }),
                interval: TimeInterval.make({ start: t0, end: t2 }),
              },
            ];

      await Effect.runPromise(
        Effect.gen(function* () {
          const port = yield* NotificationPort;
          yield* port.notifyCompleted({
            status: status,
            since: DateTime.unsafeMake("2026-11-20T00:00:00Z"),
            until: DateTime.unsafeMake("2026-11-28T00:00:00Z"),
            fetchedCount: 5,
            excludedCount: 1,
            modifications: modifications,
            deletedIds: deletedIds,
            quota: {
              remaining: quotaRemaining,
              resetsInSeconds: quotaResetsInSeconds,
            },
          });
        }).pipe(Effect.provide(adapterLayer)),
      );

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith({
        embeds: [
          {
            title: expectedTitle,
            color: expectedColor,
            fields: [
              {
                name: "対象期間",
                value: "2026-11-20T00:00:00.000Z 〜 2026-11-28T00:00:00.000Z",
                inline: false,
              },
              {
                name: "取得 / 除外",
                value: "5 件 / 1 件",
                inline: true,
              },
              {
                name: "更新 / 削除",
                value: `${String(modifiedCount)} 件 / ${String(deletedIds.length)} 件`,
                inline: true,
              },
              {
                name: "クォータ",
                value: expectedQuota,
                inline: false,
              },
            ],
          },
        ],
      });
    },
  );

  it("notifyAborted が競合エントリー2件の情報を含む橙色 Embed を送信すること", async () => {
    const postSpy = vi.fn<(body: unknown) => void>();

    server.use(
      http.post(webhookUrl, async ({ request }) => {
        postSpy(await request.json());
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* NotificationPort;
        yield* port.notifyAborted({
          reason: "NotDetermine",
          first: entry(10, "開発作業"),
          second: entry(11, ""),
        });
      }).pipe(Effect.provide(adapterLayer)),
    );

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith({
      embeds: [
        {
          title: "modggl: 判定不能な重複を検出して停止しました",
          description:
            "停止理由: NotDetermine（All-or-Nothing 保護により書き込みは一切行っていません）",
          color: 0xf39c12,
          fields: [
            {
              name: "競合エントリー 1",
              value:
                "ID: 10\n区間: 2026-11-27T09:00:00.000Z 〜 2026-11-27T09:30:00.000Z (1800 秒)\n説明: 開発作業",
              inline: false,
            },
            {
              name: "競合エントリー 2",
              value:
                "ID: 11\n区間: 2026-11-27T09:00:00.000Z 〜 2026-11-27T09:30:00.000Z (1800 秒)\n説明: (説明なし)",
              inline: false,
            },
          ],
        },
      ],
    });
  });

  it("Discord Embed の上限を超える description やエラーメッセージをサロゲートペアを壊さず切り詰めること", async () => {
    interface CapturedEmbedPayload {
      readonly embeds: readonly [
        {
          readonly description?: string;
          readonly fields: readonly { readonly value: string }[];
        },
      ];
    }
    const postSpy = vi.fn<(body: CapturedEmbedPayload) => void>();

    server.use(
      http.post(webhookUrl, async ({ request }) => {
        postSpy((await request.json()) as CapturedEmbedPayload);
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    const longAsciiDescription = "a".repeat(1200);
    // 先頭文字列の後にサロゲートペア絵文字を並べて 1023 文字境界が上位サロゲートへ重なるケースを作る
    const prefixLength =
      "ID: 2\n区間: 2026-11-27T09:00:00.000Z 〜 2026-11-27T09:30:00.000Z (1800 秒)\n説明: ".length;
    const padCount = 1022 - prefixLength;
    const surrogateBoundaryDescription = `${"x".repeat(padCount)}😀😀`;
    const longErrorMessage = "e".repeat(5000);

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* NotificationPort;
        yield* port.notifyAborted({
          reason: "NotDetermine",
          first: entry(1, longAsciiDescription),
          second: entry(2, surrogateBoundaryDescription),
        });
        yield* port.notifyError({
          message: longErrorMessage,
          reason: "ApiError",
          status: Option.some(500),
          resetsInSeconds: Option.none(),
        });
      }).pipe(Effect.provide(adapterLayer)),
    );

    const abortedField1 = postSpy.mock.calls[0]?.[0].embeds[0].fields[0]?.value ?? "";
    const abortedField2 = postSpy.mock.calls[0]?.[0].embeds[0].fields[1]?.value ?? "";
    const errorDescription = postSpy.mock.calls[1]?.[0].embeds[0].description ?? "";

    expect(abortedField1).toHaveLength(1024);
    expect(abortedField1.endsWith("…")).toBe(true);
    expect(abortedField2.length).toBeLessThanOrEqual(1024);
    expect(abortedField2.endsWith("…")).toBe(true);
    expect(abortedField2.isWellFormed()).toBe(true);
    expect(errorDescription).toHaveLength(4096);
    expect(errorDescription.endsWith("…")).toBe(true);
  });

  it("notifyError がステータスとリセット待ち秒数の有無に応じた赤色 Embed を送信すること", async () => {
    const postSpy = vi.fn<(body: unknown) => void>();

    server.use(
      http.post(webhookUrl, async ({ request }) => {
        postSpy(await request.json());
        return new HttpResponse(undefined, { status: 204 });
      }),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* NotificationPort;
        yield* port.notifyError({
          message: "quota exceeded",
          reason: "QuotaExceeded",
          status: Option.some(402),
          resetsInSeconds: Option.some(900),
        });
        yield* port.notifyError({
          message: "network error",
          reason: "ApiError",
          status: Option.none(),
          resetsInSeconds: Option.none(),
        });
      }).pipe(Effect.provide(adapterLayer)),
    );

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(postSpy).toHaveBeenNthCalledWith(1, {
      embeds: [
        {
          title: "modggl: 実行エラーが発生しました",
          description: "quota exceeded",
          color: 0xe74c3c,
          fields: [
            { name: "種別", value: "QuotaExceeded", inline: true },
            { name: "HTTP ステータス", value: "402", inline: true },
            { name: "リセット待ち秒数", value: "900 秒", inline: true },
          ],
        },
      ],
    });
    expect(postSpy).toHaveBeenNthCalledWith(2, {
      embeds: [
        {
          title: "modggl: 実行エラーが発生しました",
          description: "network error",
          color: 0xe74c3c,
          fields: [
            { name: "種別", value: "ApiError", inline: true },
            { name: "HTTP ステータス", value: "なし", inline: true },
            { name: "リセット待ち秒数", value: "なし", inline: true },
          ],
        },
      ],
    });
  });
});

describe("異常系", () => {
  it("Webhook が非 2xx ステータスを返したとき NotificationError を返すこと", async () => {
    server.use(
      http.post(webhookUrl, () => new HttpResponse("Invalid Webhook Token", { status: 401 })),
    );

    const error = await Effect.runPromise(
      Effect.flip(
        Effect.gen(function* () {
          const port = yield* NotificationPort;
          yield* port.notifyError({
            message: "failure",
            reason: "ApiError",
            status: Option.some(500),
            resetsInSeconds: Option.none(),
          });
        }).pipe(Effect.provide(adapterLayer)),
      ),
    );

    expect(error._tag).toBe("NotificationError");
    expect(error.message).toBe("Discord Webhook がエラーを返しました (401): Invalid Webhook Token");
    expect(Option.isNone(error.cause)).toBe(true);
  });

  it("非 2xx 応答の本文読み取りが reject しても NotificationError を返すこと", async () => {
    const response = new Response(undefined, { status: 500 });
    vi.spyOn(response, "text").mockRejectedValue(new Error("stream broken"));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    const error = await Effect.runPromise(
      Effect.flip(
        Effect.gen(function* () {
          const port = yield* NotificationPort;
          yield* port.notifyError({
            message: "failure",
            reason: "ApiError",
            status: Option.some(500),
            resetsInSeconds: Option.none(),
          });
        }).pipe(Effect.provide(adapterLayer)),
      ),
    );

    expect(error._tag).toBe("NotificationError");
    expect(error.message).toBe("Discord Webhook がエラーを返しました (500): ");
  });

  it("ネットワークエラーが発生したとき cause 付き NotificationError を返すこと", async () => {
    server.use(http.post(webhookUrl, () => HttpResponse.error()));

    const error = await Effect.runPromise(
      Effect.flip(
        Effect.gen(function* () {
          const port = yield* NotificationPort;
          yield* port.notifyAborted({
            reason: "NotDetermine",
            first: entry(1, "A"),
            second: entry(2, "B"),
          });
        }).pipe(Effect.provide(adapterLayer)),
      ),
    );

    expect(error._tag).toBe("NotificationError");
    expect(error.message).toBe("Discord Webhook への送信に失敗しました");
    expect(Option.isSome(error.cause)).toBe(true);
  });
});
