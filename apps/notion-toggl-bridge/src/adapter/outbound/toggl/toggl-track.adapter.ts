import { Effect, Layer, Option } from "effect";

import { type TrackingEntry } from "../../../core/domain/tracking-entry";
import { CachePort } from "../../../core/port/outbound/cloudflare/cache.port";
import { TimeTrackerPort } from "../../../core/port/outbound/toggl/time-tracker.port";

import { makeTogglApiClient, type TogglApiClient } from "./toggl-api.client";
import { splitCategory } from "./toggl.util";

type Cache = Effect.Effect.Success<typeof CachePort>;

/**
 * Toggl Track Adapter の実装
 * @param apiToken - Toggl API トークン
 * @param workspaceId - Toggl ワークスペース ID
 * @returns Toggl Track Adapter の Layer
 */
export const TogglTrackAdapterLive = (apiToken: string, workspaceId: number) =>
  Layer.effect(
    TimeTrackerPort,
    Effect.gen(function* () {
      const client = yield* makeTogglApiClient(apiToken, workspaceId);
      const cache = yield* CachePort;

      return {
        startTimer: (entry) => startTimerImpl(client, cache, entry),
      };
    }),
  );

/**
 * タイマー開始の具体実装
 * @param client - Toggl API クライアント
 * @param cache - キャッシュポート
 * @param entry - トラッキングエントリ
 * @returns 処理結果を示す Effect
 */
const startTimerImpl = (client: TogglApiClient, cache: Cache, entry: TrackingEntry) =>
  Effect.gen(function* () {
    const category = Option.getOrElse(entry.category, () => "");
    const splitted = splitCategory(category);
    const lookupKey = splitted ? splitted.child : category;

    const projectId = yield* resolveProjectId(cache)(lookupKey);

    yield* client.startTimer({
      title: entry.description,
      projectId: projectId,
      tags: entry.tags,
    });
  }).pipe(Effect.asVoid);

/**
 * カテゴリからプロジェクトIDを解決する
 * @param cache - キャッシュポート
 * @returns プロジェクトIDを解決する関数
 */
const resolveProjectId = (cache: Cache) => (category: string) => getCache(cache, category);

/**
 * キャッシュから値を取得する
 * @param cache - キャッシュポート
 * @param key - キャッシュキー
 * @returns キャッシュから取得した値（数値）の Option を含む Effect
 */
const getCache = (cache: Cache, key: string) =>
  cache.get(key).pipe(
    Effect.map((s) => (s ? Option.some(Number(s)) : Option.none())),
    Effect.catchAll(() => Effect.succeed(Option.none())),
  );
