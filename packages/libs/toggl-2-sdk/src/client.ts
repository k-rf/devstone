import { Effect, Match, Option, Schema } from "effect";

import {
  Toggl2ApiError,
  Toggl2ConflictError,
  Toggl2QuotaExceededError,
  Toggl2UnauthorizedError,
  type Toggl2SdkError,
} from "./error.js";
import { parseQuotaHeaders } from "./header/parse-quota-headers.js";
import { BulkUpdateTimeEntryItem } from "./schema/bulk-update-time-entry.js";
import { type Toggl2QuotaInfo } from "./schema/quota-info.js";
import { TimeEntryStreamItem } from "./schema/time-entry-stream-item.js";

/**
 * Toggl 2.0 API クライアントの設定
 */
export interface Toggl2ClientConfig {
  readonly apiToken: string;
  readonly organizationId: number;
  readonly workspaceId: number;
}

/**
 * `listTimeEntriesStream` の検索パラメータ
 */
export interface ListTimeEntriesStreamParams {
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly includeLockReason: Option.Option<boolean>;
}

/**
 * `listTimeEntriesStream` の取得結果
 */
export interface ListTimeEntriesStreamResult {
  readonly entries: readonly TimeEntryStreamItem[];
  readonly quota: Toggl2QuotaInfo;
}

/**
 * Toggl 2.0 API クライアントの型定義
 */
export interface Toggl2ApiClient {
  /**
   * タイムエントリーのストリーム一覧を取得する
   * @param params - 取得範囲とオプションパラメータ
   * @returns エントリー一覧とクォータ情報を含む Effect
   */
  readonly listTimeEntriesStream: (
    params: ListTimeEntriesStreamParams,
  ) => Effect.Effect<ListTimeEntriesStreamResult, Toggl2SdkError>;

  /**
   * タイムエントリーを一括部分更新する（空配列の場合は通信せず `Option.none()` を返す）
   * @param items - 部分更新対象のエントリー配列
   * @returns 通信時のクォータ情報を含む Effect
   */
  readonly bulkUpdateTimeEntries: (
    items: readonly BulkUpdateTimeEntryItem[],
  ) => Effect.Effect<Option.Option<Toggl2QuotaInfo>, Toggl2SdkError>;

  /**
   * タイムエントリーを一括削除する（空配列の場合は通信せず `Option.none()` を返す）
   * @param ids - 削除対象のタイムエントリー ID 配列
   * @returns 通信時のクォータ情報を含む Effect
   */
  readonly bulkDeleteTimeEntries: (
    ids: readonly number[],
  ) => Effect.Effect<Option.Option<Toggl2QuotaInfo>, Toggl2SdkError>;
}

interface Toggl2Context {
  readonly authHeader: string;
  readonly workspacePath: string;
}

const baseUrl = "https://focus.toggl.com/api";

const mapHttpErrorResponse = (
  status: number,
  headers: Headers,
  bodyText: string,
): Effect.Effect<never, Toggl2SdkError> =>
  Match.value(status).pipe(
    Match.when(401, () =>
      Effect.fail(
        new Toggl2UnauthorizedError({
          message: `Toggl 2.0 API unauthorized: ${bodyText}`,
        }),
      ),
    ),
    Match.when(402, () =>
      Effect.fail(
        new Toggl2QuotaExceededError({
          message: `Toggl 2.0 API quota exceeded: ${bodyText}`,
          resetsInSeconds: parseQuotaHeaders(headers).resetsInSeconds,
        }),
      ),
    ),
    Match.when(409, () =>
      Effect.fail(
        new Toggl2ConflictError({
          message: `Toggl 2.0 API conflict: ${bodyText}`,
        }),
      ),
    ),
    Match.orElse((otherStatus) =>
      Effect.fail(
        new Toggl2ApiError({
          message: `Toggl 2.0 API error: ${String(otherStatus)} ${bodyText}`,
          status: Option.some(otherStatus),
          cause: Option.none(),
        }),
      ),
    ),
  );

const requestToggl2 = (
  ctx: Toggl2Context,
  path: string,
  options: RequestInit,
): Effect.Effect<Response, Toggl2SdkError> =>
  Effect.gen(function* () {
    const headers = new Headers(options.headers);
    headers.set("Authorization", ctx.authHeader);

    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`${baseUrl}${path}`, {
          ...options,
          headers: headers,
        }),
      catch: (e) =>
        new Toggl2ApiError({
          message: "Toggl 2.0 API network error",
          status: Option.none(),
          cause: Option.some(e),
        }),
    });

    if (!response.ok) {
      const bodyText = yield* Effect.promise(() => response.text());
      return yield* mapHttpErrorResponse(response.status, response.headers, bodyText);
    }

    return response;
  });

const parseJsonResponse = (response: Response): Effect.Effect<unknown, Toggl2ApiError> =>
  Effect.tryPromise({
    try: () => response.json(),
    catch: (e) =>
      new Toggl2ApiError({
        message: "Toggl 2.0 API JSON parse error",
        status: Option.some(response.status),
        cause: Option.some(e),
      }),
  });

const decodeTimeEntries = (
  json: unknown,
  path: string,
  status: number,
): Effect.Effect<readonly TimeEntryStreamItem[], Toggl2ApiError> =>
  Schema.decodeUnknown(Schema.Array(TimeEntryStreamItem))(json).pipe(
    Effect.mapError(
      (e) =>
        new Toggl2ApiError({
          message: `Toggl 2.0 API response schema mismatch at ${path}`,
          status: Option.some(status),
          cause: Option.some(e),
        }),
    ),
  );

const encodeBulkUpdateItems = (
  items: readonly BulkUpdateTimeEntryItem[],
): Effect.Effect<
  readonly Schema.Schema.Encoded<typeof BulkUpdateTimeEntryItem>[],
  Toggl2ApiError
> =>
  Schema.encode(Schema.Array(BulkUpdateTimeEntryItem))(items).pipe(
    Effect.mapError(
      (e) =>
        new Toggl2ApiError({
          message: "Failed to encode BulkUpdateTimeEntryItem",
          status: Option.none(),
          cause: Option.some(e),
        }),
    ),
  );

const fetchTimeEntriesStream = (
  ctx: Toggl2Context,
  params: ListTimeEntriesStreamParams,
): Effect.Effect<ListTimeEntriesStreamResult, Toggl2SdkError> =>
  Effect.gen(function* () {
    const includeLockReason = Option.getOrElse(params.includeLockReason, () => true);
    const searchParams = new URLSearchParams({
      date_from: params.dateFrom,
      date_to: params.dateTo,
      include_taskless: "true",
      archived: "false",
      order_by: "start",
      include_lock_reason: String(includeLockReason),
    });
    const path = `${ctx.workspacePath}/time-entries/stream?${searchParams.toString()}`;
    const response = yield* requestToggl2(ctx, path, { method: "GET" });
    const json = yield* parseJsonResponse(response);
    const entries = yield* decodeTimeEntries(json, path, response.status);

    return {
      entries: entries,
      quota: parseQuotaHeaders(response.headers),
    };
  });

const sendBulkUpdateTimeEntries = (
  ctx: Toggl2Context,
  items: readonly BulkUpdateTimeEntryItem[],
): Effect.Effect<Option.Option<Toggl2QuotaInfo>, Toggl2SdkError> => {
  if (items.length === 0) return Effect.succeed(Option.none());

  return Effect.gen(function* () {
    const payload = yield* encodeBulkUpdateItems(items);
    const response = yield* requestToggl2(ctx, `${ctx.workspacePath}/time-entries/bulk`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return Option.some(parseQuotaHeaders(response.headers));
  });
};

const sendBulkDeleteTimeEntries = (
  ctx: Toggl2Context,
  ids: readonly number[],
): Effect.Effect<Option.Option<Toggl2QuotaInfo>, Toggl2SdkError> => {
  if (ids.length === 0) return Effect.succeed(Option.none());

  const query = ids.map((id) => encodeURIComponent(String(id))).join(",");

  return requestToggl2(ctx, `${ctx.workspacePath}/time-entries/bulk?ids=${query}`, {
    method: "DELETE",
  }).pipe(Effect.map((response) => Option.some(parseQuotaHeaders(response.headers))));
};

/**
 * Toggl 2.0 API クライアントを作成する
 * @param config - クライアント設定
 * @returns Toggl 2.0 API クライアントを生成する Effect
 */
export const makeToggl2ApiClient = (config: Toggl2ClientConfig): Effect.Effect<Toggl2ApiClient> =>
  Effect.sync(() => {
    const ctx: Toggl2Context = {
      authHeader: `Bearer ${config.apiToken}`,
      workspacePath: `/organizations/${String(config.organizationId)}/workspaces/${String(config.workspaceId)}`,
    };

    return {
      listTimeEntriesStream: (params) => fetchTimeEntriesStream(ctx, params),
      bulkUpdateTimeEntries: (items) => sendBulkUpdateTimeEntries(ctx, items),
      bulkDeleteTimeEntries: (ids) => sendBulkDeleteTimeEntries(ctx, ids),
    };
  });
