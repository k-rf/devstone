/* eslint-disable unicorn/no-null -- 外部 API の JSON レスポンスや fetch ヘッダ検証で null を再現するため */
import { faker } from "@faker-js/faker";
import { Effect, Option } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { makeToggl2ApiClient } from "./client.js";
import { Toggl2OrganizationId } from "./schema/organization-id.js";
import { Toggl2TimeEntryId } from "./schema/time-entry-id.js";
import { Toggl2WorkspaceId } from "./schema/workspace-id.js";

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

const apiToken = faker.string.alphanumeric(24);
const organizationId = Toggl2OrganizationId.make(1001);
const workspaceId = Toggl2WorkspaceId.make(2002);
const baseUrl = `https://focus.toggl.com/api/organizations/${String(organizationId)}/workspaces/${String(workspaceId)}`;
const clientEffect = makeToggl2ApiClient({
  apiToken: apiToken,
  organizationId: organizationId,
  workspaceId: workspaceId,
});

describe("タイムエントリーのストリーム取得", () => {
  it("クエリパラメータと RFC 3339 の + オフセットをエンコードしてエントリー一覧とクォータ情報を取得できること", async () => {
    const captureRequest =
      vi.fn<
        (
          url: string,
          authorization: Option.Option<string>,
          contentType: Option.Option<string>,
        ) => void
      >();
    const description = faker.lorem.sentence();

    server.use(
      http.get(`${baseUrl}/time-entries/stream`, ({ request }) => {
        captureRequest(
          request.url,
          Option.fromNullable(request.headers.get("Authorization")),
          Option.fromNullable(request.headers.get("Content-Type")),
        );

        return HttpResponse.json(
          [
            {
              id: 10,
              start: "2026-11-27T09:00:00+09:00",
              duration: 1800,
              deleted_at: null,
              archived_at: null,
              draft: false,
              pattern_managed: false,
              lock_reason: null,
              type: "activity",
              task_id: 5,
              project_id: 6,
              description: description,
              tags: [{ id: 1, name: "dev" }],
              billable: true,
              planned_start: null,
              planned_duration: null,
              calendar_event_id: null,
            },
          ],
          {
            headers: {
              "X-Toggl-Quota-Remaining": "28",
              "X-Toggl-Quota-Resets-In": "3540",
            },
          },
        );
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00+09:00",
          dateTo: "2026-11-28T00:00:00+09:00",
        }),
      ),
    );

    const result = await Effect.runPromise(program);

    expect(captureRequest).toHaveBeenCalledTimes(1);
    const [rawUrl, authorization, contentType] = captureRequest.mock.calls[0] ?? [
      "",
      Option.none(),
      Option.none(),
    ];
    expect(authorization).toStrictEqual(Option.some(`Bearer ${apiToken}`));
    expect(contentType).toStrictEqual(Option.none());

    const parsedUrl = new URL(rawUrl);
    expect(parsedUrl.search).toContain("%2B09%3A00");
    expect(parsedUrl.searchParams.get("date_from")).toBe("2026-11-20T00:00:00+09:00");
    expect(parsedUrl.searchParams.get("date_to")).toBe("2026-11-28T00:00:00+09:00");
    expect(parsedUrl.searchParams.get("include_taskless")).toBe("true");
    expect(parsedUrl.searchParams.get("archived")).toBe("false");
    expect(parsedUrl.searchParams.get("order_by")).toBe("start");
    expect(parsedUrl.searchParams.get("include_lock_reason")).toBe("true");

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      id: 10,
      start: Option.some("2026-11-27T09:00:00+09:00"),
      duration: Option.some(1800),
      description: Option.some(description),
      billable: Option.some(true),
    });
    expect(result.quota).toStrictEqual({
      remaining: Option.some(28),
      resetsInSeconds: Option.some(3540),
    });
  });

  it("任意クエリパラメータを上書き指定したとき対応するクエリ文字列が送信されること", async () => {
    const captureSearch = vi.fn<(search: string) => void>();

    server.use(
      http.get(`${baseUrl}/time-entries/stream`, ({ request }) => {
        captureSearch(new URL(request.url).search);
        return HttpResponse.json([]);
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00Z",
          dateTo: "2026-11-21T00:00:00Z",
          includeLockReason: false,
          includeTaskless: false,
          archived: true,
          orderBy: "duration",
        }),
      ),
    );

    const result = await Effect.runPromise(program);

    expect(result.entries).toStrictEqual([]);
    expect(result.quota).toStrictEqual({
      remaining: Option.none(),
      resetsInSeconds: Option.none(),
    });
    const searchParams = new URLSearchParams(captureSearch.mock.calls[0]?.[0] ?? "");
    expect(searchParams.get("include_lock_reason")).toBe("false");
    expect(searchParams.get("include_taskless")).toBe("false");
    expect(searchParams.get("archived")).toBe("true");
    expect(searchParams.get("order_by")).toBe("duration");
  });
});

describe("タイムエントリーの一括更新", () => {
  it("空配列のときは HTTP 通信を行わず Option.none を返すこと", async () => {
    const handlerSpy = vi.fn();

    server.use(
      http.patch(`${baseUrl}/time-entries/bulk`, () => {
        handlerSpy();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const program = clientEffect.pipe(Effect.flatMap((client) => client.bulkUpdateTimeEntries([])));
    const result = await Effect.runPromise(program);

    expect(handlerSpy).not.toHaveBeenCalled();
    expect(result).toStrictEqual(Option.none());
  });

  it("部分更新ペイロードと Content-Type: application/json を PATCH で送信し 204 応答のクォータ情報を返すこと", async () => {
    const capturePatch =
      vi.fn<
        (
          body: unknown,
          authorization: Option.Option<string>,
          contentType: Option.Option<string>,
        ) => void
      >();

    server.use(
      http.patch(`${baseUrl}/time-entries/bulk`, async ({ request }) => {
        capturePatch(
          await request.json(),
          Option.fromNullable(request.headers.get("Authorization")),
          Option.fromNullable(request.headers.get("Content-Type")),
        );

        return new HttpResponse(null, {
          status: 204,
          headers: {
            "X-Toggl-Quota-Remaining": "27",
            "X-Toggl-Quota-Resets-In": "3500",
          },
        });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.bulkUpdateTimeEntries([
          {
            id: Toggl2TimeEntryId.make(1),
            start: Option.some("2026-11-27T09:00:00+09:00"),
            duration: Option.some(1800),
          },
          {
            id: Toggl2TimeEntryId.make(2),
            start: Option.none(),
            duration: Option.some(900),
          },
        ]),
      ),
    );

    const result = await Effect.runPromise(program);

    expect(capturePatch).toHaveBeenCalledWith(
      [
        { id: 1, start: "2026-11-27T09:00:00+09:00", duration: 1800 },
        { id: 2, duration: 900 },
      ],
      Option.some(`Bearer ${apiToken}`),
      Option.some("application/json"),
    );
    expect(result).toStrictEqual(
      Option.some({
        remaining: Option.some(27),
        resetsInSeconds: Option.some(3500),
      }),
    );
  });

  it("不正な更新項目のエンコードに失敗したとき PATCH を送信せず Toggl2ApiError を返すこと", async () => {
    const patchSpy = vi.fn();

    server.use(
      http.patch(`${baseUrl}/time-entries/bulk`, () => {
        patchSpy();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const invalidIdProgram = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.bulkUpdateTimeEntries([
          {
            // @ts-expect-error: id に数値でない値を渡してエンコードエラーを発生させる
            id: "invalid-id",
            start: Option.none(),
            duration: Option.some(600),
          },
        ]),
      ),
    );

    const emptyFieldsProgram = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.bulkUpdateTimeEntries([
          {
            id: Toggl2TimeEntryId.make(1),
            start: Option.none(),
            duration: Option.none(),
          },
        ]),
      ),
    );

    const invalidIdError = await Effect.runPromise(Effect.flip(invalidIdProgram));
    const emptyFieldsError = await Effect.runPromise(Effect.flip(emptyFieldsProgram));

    expect(patchSpy).not.toHaveBeenCalled();
    expect(invalidIdError._tag).toBe("Toggl2ApiError");
    expect(invalidIdError.message).toBe("Failed to encode Toggl2BulkUpdateTimeEntryItem");
    expect(emptyFieldsError._tag).toBe("Toggl2ApiError");
    expect(emptyFieldsError.message).toBe("Failed to encode Toggl2BulkUpdateTimeEntryItem");
  });
});

describe("タイムエントリーの一括削除", () => {
  it("空配列のときは HTTP 通信を行わず Option.none を返すこと", async () => {
    const handlerSpy = vi.fn();

    server.use(
      http.delete(`${baseUrl}/time-entries/bulk`, () => {
        handlerSpy();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const program = clientEffect.pipe(Effect.flatMap((client) => client.bulkDeleteTimeEntries([])));
    const result = await Effect.runPromise(program);

    expect(handlerSpy).not.toHaveBeenCalled();
    expect(result).toStrictEqual(Option.none());
  });

  it("ids クエリを付けて Content-Type なしで DELETE を送信し 204 応答のクォータ情報を返すこと", async () => {
    const captureDelete =
      vi.fn<
        (
          url: string,
          authorization: Option.Option<string>,
          contentType: Option.Option<string>,
        ) => void
      >();

    server.use(
      http.delete(`${baseUrl}/time-entries/bulk`, ({ request }) => {
        captureDelete(
          request.url,
          Option.fromNullable(request.headers.get("Authorization")),
          Option.fromNullable(request.headers.get("Content-Type")),
        );
        return new HttpResponse(null, {
          status: 204,
          headers: {
            "X-Toggl-Quota-Remaining": "26",
            "X-Toggl-Quota-Resets-In": "3400",
          },
        });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.bulkDeleteTimeEntries([
          Toggl2TimeEntryId.make(11),
          Toggl2TimeEntryId.make(22),
          Toggl2TimeEntryId.make(33),
        ]),
      ),
    );

    const result = await Effect.runPromise(program);

    const [rawUrl, authorization, contentType] = captureDelete.mock.calls[0] ?? [
      "",
      Option.none(),
      Option.none(),
    ];
    expect(rawUrl).toBe(`${baseUrl}/time-entries/bulk?ids=11,22,33`);
    expect(authorization).toStrictEqual(Option.some(`Bearer ${apiToken}`));
    expect(contentType).toStrictEqual(Option.none());
    expect(result).toStrictEqual(
      Option.some({
        remaining: Option.some(26),
        resetsInSeconds: Option.some(3400),
      }),
    );
  });
});

describe("異常系", () => {
  it("401 Unauthorized のとき Toggl2UnauthorizedError を返すこと", async () => {
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        return new HttpResponse("Unauthorized", { status: 401 });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00Z",
          dateTo: "2026-11-21T00:00:00Z",
        }),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2UnauthorizedError");
    expect(error.message).toBe("Toggl 2.0 API unauthorized: Unauthorized");
  });

  it("402 Payment Required のときリセット秒数付きの Toggl2QuotaExceededError を返すこと", async () => {
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        return new HttpResponse("Quota exceeded", {
          status: 402,
          headers: {
            "X-Toggl-Quota-Resets-In": "1800",
          },
        });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00Z",
          dateTo: "2026-11-21T00:00:00Z",
        }),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2QuotaExceededError");
    if (error._tag === "Toggl2QuotaExceededError") {
      expect(error.resetsInSeconds).toStrictEqual(Option.some(1800));
    }
  });

  it("402 Payment Required でヘッダが無いとき resetsInSeconds が Option.none になること", async () => {
    server.use(
      http.patch(`${baseUrl}/time-entries/bulk`, () => {
        return new HttpResponse("Quota exceeded", { status: 402 });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.bulkUpdateTimeEntries([
          { id: Toggl2TimeEntryId.make(1), start: Option.none(), duration: Option.some(600) },
        ]),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2QuotaExceededError");
    if (error._tag === "Toggl2QuotaExceededError") {
      expect(error.resetsInSeconds).toStrictEqual(Option.none());
    }
  });

  it("409 Conflict のとき Toggl2ConflictError を返すこと", async () => {
    server.use(
      http.patch(`${baseUrl}/time-entries/bulk`, () => {
        return new HttpResponse("time_entry_invoiced", { status: 409 });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.bulkUpdateTimeEntries([
          { id: Toggl2TimeEntryId.make(1), start: Option.none(), duration: Option.some(600) },
        ]),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2ConflictError");
    expect(error.message).toBe("Toggl 2.0 API conflict: time_entry_invoiced");
  });

  it("500 Internal Server Error のとき Toggl2ApiError を返すこと", async () => {
    server.use(
      http.delete(`${baseUrl}/time-entries/bulk`, () => {
        return new HttpResponse("Internal Server Error", { status: 500 });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) => client.bulkDeleteTimeEntries([Toggl2TimeEntryId.make(1)])),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2ApiError");
    if (error._tag === "Toggl2ApiError") {
      expect(error.status).toStrictEqual(Option.some(500));
      expect(error.message).toBe("Toggl 2.0 API error: 500 Internal Server Error");
    }
  });

  it("非 2xx 応答の本文読み取りが reject しても未捕捉例外にせず型付きエラーを返すこと", async () => {
    const response = new Response(undefined, { status: 502 });
    vi.spyOn(response, "text").mockRejectedValue(new Error("stream broken"));
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    const program = clientEffect.pipe(
      Effect.flatMap((client) => client.bulkDeleteTimeEntries([Toggl2TimeEntryId.make(1)])),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2ApiError");
    if (error._tag === "Toggl2ApiError") {
      expect(error.status).toStrictEqual(Option.some(502));
      expect(error.message).toBe("Toggl 2.0 API error: 502 ");
    }
  });

  it("ネットワークエラーのとき Toggl2ApiError を返すこと", async () => {
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        return HttpResponse.error();
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00Z",
          dateTo: "2026-11-21T00:00:00Z",
        }),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2ApiError");
    expect(error.message).toBe("Toggl 2.0 API network error");
    if (error._tag === "Toggl2ApiError") {
      expect(error.status).toStrictEqual(Option.none());
      expect(Option.isSome(error.cause)).toBe(true);
    }
  });

  it("JSON パースエラーのとき Toggl2ApiError を返すこと", async () => {
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        return new HttpResponse("invalid-json", {
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00Z",
          dateTo: "2026-11-21T00:00:00Z",
        }),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2ApiError");
    expect(error.message).toBe("Toggl 2.0 API JSON parse error");
    if (error._tag === "Toggl2ApiError") {
      expect(error.status).toStrictEqual(Option.some(200));
      expect(Option.isSome(error.cause)).toBe(true);
    }
  });

  it("レスポンスのスキーマ不一致のとき Toggl2ApiError を返すこと", async () => {
    server.use(
      http.get(`${baseUrl}/time-entries/stream`, () => {
        return HttpResponse.json([{ id: "not-a-number" }]);
      }),
    );

    const program = clientEffect.pipe(
      Effect.flatMap((client) =>
        client.listTimeEntriesStream({
          dateFrom: "2026-11-20T00:00:00Z",
          dateTo: "2026-11-21T00:00:00Z",
        }),
      ),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error._tag).toBe("Toggl2ApiError");
    expect(error.message).toContain("Toggl 2.0 API response schema mismatch at");
    if (error._tag === "Toggl2ApiError") {
      expect(error.status).toStrictEqual(Option.some(200));
      expect(Option.isSome(error.cause)).toBe(true);
    }
  });
});
