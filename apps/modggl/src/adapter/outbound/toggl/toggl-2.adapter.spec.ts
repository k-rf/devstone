import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { DateTime, Effect, Option } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TimeEntriesPort } from "../../../core/port/outbound/toggl/time-entries.port.js";

import { Toggl2AdapterLive } from "./toggl-2.adapter.js";

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
const adapterLayer = Toggl2AdapterLive({
  apiToken: "test-token",
  organizationId: organizationId,
  workspaceId: workspaceId,
});

const interval = (startMs: number, endMs: number): TimeInterval =>
  TimeInterval.make({
    start: TimeInstant.make(startMs),
    end: TimeInstant.make(endMs),
  });

describe("正常系", () => {
  it("listEntries がストリームを取得してフィルタリング・ソート・クォータ情報を返すこと", async () => {
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () =>
        HttpResponse.json(
          [
            { id: 2, start: "2026-11-27T10:00:00Z", duration: 1800 },
            { id: 1, start: "2026-11-27T09:00:00Z", duration: 3600 },
            { id: 3, start: "2026-11-27T11:00:00Z", draft: true, duration: 600 },
          ],
          {
            headers: {
              "X-Toggl-Quota-Remaining": "29",
              "X-Toggl-Quota-Resets-In": "3600",
            },
          },
        ),
      ),
    );

    const program = Effect.gen(function* () {
      const port = yield* TimeEntriesPort;
      return yield* port.listEntries({
        since: DateTime.unsafeMake("2026-11-20T00:00:00Z"),
        until: DateTime.unsafeMake("2026-11-28T00:00:00Z"),
      });
    }).pipe(Effect.provide(adapterLayer));

    const result = await Effect.runPromise(program);

    expect(result.fetchedCount).toBe(3);
    expect(result.excludedCount).toBe(1);
    expect(result.entries.map((entry) => entry.id)).toStrictEqual([1, 2]);
    expect(result.quota).toStrictEqual({
      remaining: Option.some(29),
      resetsInSeconds: Option.some(3600),
    });
  });

  it("updateEntries が変更された start / duration のみを PATCH 送信すること", async () => {
    const capturePatch = vi.fn<(body: unknown) => void>();

    server.use(
      http.patch(`${baseUrl}/time-entries/bulk`, async ({ request }) => {
        capturePatch(await request.json());
        return new HttpResponse(undefined, {
          status: 204,
          headers: { "X-Toggl-Quota-Remaining": "28", "X-Toggl-Quota-Resets-In": "3500" },
        });
      }),
    );

    const t0 = Date.parse("2026-11-27T09:00:00.000Z");
    const t1 = Date.parse("2026-11-27T10:00:00.000Z");
    const t2 = Date.parse("2026-11-27T11:00:00.000Z");

    const program = Effect.gen(function* () {
      const port = yield* TimeEntriesPort;
      return yield* port.updateEntries([
        {
          id: 1,
          previousInterval: interval(t0, t1),
          interval: interval(t0, t2),
        },
        {
          id: 2,
          previousInterval: interval(t1, t2),
          interval: interval(t0, t1),
        },
      ]);
    }).pipe(Effect.provide(adapterLayer));

    const quota = await Effect.runPromise(program);

    expect(capturePatch).toHaveBeenCalledWith([
      { id: 1, duration: 7200 },
      { id: 2, start: "2026-11-27T09:00:00.000Z" },
    ]);
    expect(quota).toStrictEqual(
      Option.some({
        remaining: Option.some(28),
        resetsInSeconds: Option.some(3500),
      }),
    );
  });

  it("deleteEntries が一括削除 DELETE を送信してクォータ情報を返すこと", async () => {
    const captureUrl = vi.fn<(url: string) => void>();

    server.use(
      http.delete(`${baseUrl}/time-entries/bulk`, ({ request }) => {
        captureUrl(request.url);
        return new HttpResponse(undefined, {
          status: 204,
          headers: { "X-Toggl-Quota-Remaining": "27" },
        });
      }),
    );

    const program = Effect.gen(function* () {
      const port = yield* TimeEntriesPort;
      return yield* port.deleteEntries([10, 20]);
    }).pipe(Effect.provide(adapterLayer));

    const quota = await Effect.runPromise(program);

    expect(captureUrl).toHaveBeenCalledWith(`${baseUrl}/time-entries/bulk?ids=10,20`);
    expect(quota).toStrictEqual(
      Option.some({
        remaining: Option.some(27),
        resetsInSeconds: Option.none(),
      }),
    );
  });
});

describe("異常系（SDK エラー変換）", () => {
  it.each([
    {
      label: "401 Unauthorized",
      handler: () => new HttpResponse("unauthorized", { status: 401 }),
      expectedReason: "Unauthorized" as const,
      expectedStatus: Option.some(401),
      expectedResets: Option.none(),
    },
    {
      label: "402 Payment Required",
      handler: () =>
        new HttpResponse("quota exceeded", {
          status: 402,
          headers: { "X-Toggl-Quota-Resets-In": "1200" },
        }),
      expectedReason: "QuotaExceeded" as const,
      expectedStatus: Option.some(402),
      expectedResets: Option.some(1200),
    },
    {
      label: "409 Conflict",
      handler: () => new HttpResponse("time_entry_locked", { status: 409 }),
      expectedReason: "Conflict" as const,
      expectedStatus: Option.some(409),
      expectedResets: Option.none(),
    },
    {
      label: "500 Internal Server Error",
      handler: () => new HttpResponse("server error", { status: 500 }),
      expectedReason: "ApiError" as const,
      expectedStatus: Option.some(500),
      expectedResets: Option.none(),
    },
    {
      label: "ネットワークエラー",
      handler: () => HttpResponse.error(),
      expectedReason: "ApiError" as const,
      expectedStatus: Option.none(),
      expectedResets: Option.none(),
    },
  ])(
    "listEntries で $label が発生したとき TimeEntriesError ($expectedReason) に変換すること",
    async ({ handler, expectedReason, expectedStatus, expectedResets }) => {
      server.use(http.get(`${baseUrl}/time-entries/stream`, handler));

      const program = Effect.gen(function* () {
        const port = yield* TimeEntriesPort;
        return yield* port.listEntries({
          since: DateTime.unsafeMake("2026-11-20T00:00:00Z"),
          until: DateTime.unsafeMake("2026-11-28T00:00:00Z"),
        });
      }).pipe(Effect.provide(adapterLayer));

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("TimeEntriesError");
      expect(error.reason).toBe(expectedReason);
      expect(error.status).toStrictEqual(expectedStatus);
      expect(error.resetsInSeconds).toStrictEqual(expectedResets);
    },
  );

  it("updateEntries および deleteEntries の失敗時も TimeEntriesError に変換すること", async () => {
    server.use(
      http.patch(
        `${baseUrl}/time-entries/bulk`,
        () => new HttpResponse("conflict", { status: 409 }),
      ),
      http.delete(`${baseUrl}/time-entries/bulk`, () => new HttpResponse("error", { status: 503 })),
    );

    const t0 = Date.parse("2026-11-27T09:00:00.000Z");
    const t1 = Date.parse("2026-11-27T10:00:00.000Z");

    const patchError = await Effect.runPromise(
      Effect.flip(
        Effect.gen(function* () {
          const port = yield* TimeEntriesPort;
          return yield* port.updateEntries([
            { id: 1, previousInterval: interval(t0, t1), interval: interval(t0, t1 + 1000) },
          ]);
        }).pipe(Effect.provide(adapterLayer)),
      ),
    );
    const deleteError = await Effect.runPromise(
      Effect.flip(
        Effect.gen(function* () {
          const port = yield* TimeEntriesPort;
          return yield* port.deleteEntries([1]);
        }).pipe(Effect.provide(adapterLayer)),
      ),
    );

    expect(patchError.reason).toBe("Conflict");
    expect(deleteError.reason).toBe("ApiError");
    expect(deleteError.status).toStrictEqual(Option.some(503));
  });
});
