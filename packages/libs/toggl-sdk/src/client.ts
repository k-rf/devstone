import { Effect, Option, Schema } from "effect";

import { TogglApiError } from "./error.js";
import { TogglResource } from "./schema/resource.js";
import { TogglTimeEntry } from "./schema/time-entry.js";

/**
 * Toggl API クライアントの型定義
 */
export interface TogglApiClient {
  /**
   * タイマーを開始する
   * @param params - 開始パラメータ
   * @param params.title - タイマーのタイトル
   * @param params.projectId - プロジェクトID
   * @param params.tags - タグのリスト
   * @returns 処理結果を示す Effect
   */
  readonly startTimer: (params: {
    readonly title: string;
    readonly projectId: Option.Option<number>;
    readonly tags: readonly string[];
  }) => Effect.Effect<void, TogglApiError>;

  /**
   * クライアント一覧を取得する
   * @returns クライアント一覧を含む Effect
   */
  readonly getClients: () => Effect.Effect<readonly TogglResource[], TogglApiError>;

  /**
   * プロジェクト一覧を取得する
   * @returns プロジェクト一覧を含む Effect
   */
  readonly getProjects: () => Effect.Effect<readonly TogglResource[], TogglApiError>;
}

/**
 * Toggl API クライアントのオプション
 */
export interface TogglClientOptions {
  /**
   * タイムエントリーを作成するアプリケーション名
   */
  readonly createdWith: string;
}

/**
 * Toggl API 通信に必要なコンテキスト
 */
interface TogglContext {
  readonly authHeader: string;
  readonly workspaceId: number;
  readonly createdWith: string;
}

/**
 * Toggl API に対してリクエストを送信する内部関数
 * @param ctx - Togglコンテキスト
 * @param path - APIパス
 * @param schema - レスポンススキーマ
 * @param options - Fetchオプション
 * @returns デコード済みレスポンス
 */
const fetchToggl = <A, I>(
  ctx: TogglContext,
  path: string,
  schema: Schema.Schema<A, I>,
  options: RequestInit,
): Effect.Effect<A, TogglApiError> =>
  Effect.gen(function* () {
    const headers = new Headers(options.headers);
    headers.set("Authorization", ctx.authHeader);
    headers.set("Content-Type", "application/json");

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(`https://api.track.toggl.com/api/v9${path}`, {
          ...options,
          headers: headers,
        }),
      catch: (e) =>
        new TogglApiError({
          message: `Toggl API network error`,
          cause: e,
        }),
    });

    if (!response.ok) {
      const text = yield* Effect.promise(() => response.text());
      return yield* Effect.fail(
        new TogglApiError({
          message: `Toggl API error: ${String(response.status)} ${text}`,
        }),
      );
    }

    const json: unknown = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (e) =>
        new TogglApiError({
          message: `Toggl API JSON parse error`,
          cause: e,
        }),
    });

    return yield* Schema.decodeUnknown(schema)(json).pipe(
      Effect.mapError(
        (e) =>
          new TogglApiError({
            message: `Toggl API response schema mismatch at ${path}`,
            cause: e,
          }),
      ),
    );
  });

/**
 * Toggl API クライアントを作成する
 * @param apiToken - Toggl API トークン
 * @param workspaceId - Toggl ワークスペース ID
 * @param options - クライアントオプション
 * @returns Toggl API クライアントを生成する Effect
 */
export const makeTogglApiClient = (
  apiToken: string,
  workspaceId: number,
  options: TogglClientOptions,
): Effect.Effect<TogglApiClient> =>
  Effect.sync(() => {
    const ctx: TogglContext = {
      authHeader: `Basic ${btoa(apiToken + ":api_token")}`,
      workspaceId: workspaceId,
      createdWith: options.createdWith,
    };

    return {
      startTimer: (params) =>
        Effect.gen(function* () {
          const payload = yield* encodeTimeEntry(params, workspaceId, ctx.createdWith);

          yield* fetchToggl(
            ctx,
            `/workspaces/${String(workspaceId)}/time_entries`,
            Schema.Struct({ id: Schema.Number }),
            {
              method: "POST",
              body: JSON.stringify(payload),
            },
          );
        }).pipe(Effect.asVoid),

      getClients: () =>
        fetchToggl(ctx, `/workspaces/${String(workspaceId)}/clients`, Schema.Array(TogglResource), {
          method: "GET",
        }),

      getProjects: () =>
        fetchToggl(
          ctx,
          `/workspaces/${String(workspaceId)}/projects`,
          Schema.Array(TogglResource),
          { method: "GET" },
        ),
    };
  });

/**
 * タイムエントリー作成用ペイロードをエンコードする
 * @param params - 開始パラメータ
 * @param params.title - タイマーのタイトル
 * @param params.projectId - プロジェクトID
 * @param params.tags - タグのリスト
 * @param workspaceId - ワークスペースID
 * @param createdWith - 作成元アプリケーション名
 * @returns エンコード済みペイロード
 */
const encodeTimeEntry = (
  params: {
    readonly title: string;
    readonly projectId: Option.Option<number>;
    readonly tags: readonly string[];
  },
  workspaceId: number,
  createdWith: string,
) =>
  Schema.encode(TogglTimeEntry)({
    description: params.title,
    project_id: Option.getOrNull(params.projectId),
    tags: params.tags,
    workspace_id: workspaceId,
    start: new Date().toISOString(),
    duration: -1,
    created_with: createdWith,
  }).pipe(
    Effect.mapError(
      (e) =>
        new TogglApiError({
          message: "Failed to encode TogglTimeEntry",
          cause: e,
        }),
    ),
  );
