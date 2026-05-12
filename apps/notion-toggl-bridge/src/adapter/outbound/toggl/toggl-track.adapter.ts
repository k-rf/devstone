import { Effect, Layer, Option } from "effect";

import { CachePort } from "../../../core/port/outbound/cloudflare/cache.port";
import { TimeTrackerPort } from "../../../core/port/outbound/toggl/time-tracker.port";

import { makeTogglApiClient } from "./toggl-api.client";

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
        startTimer: (item) =>
          Effect.gen(function* () {
            const projectId = yield* resolveProjectId(cache)(item.category);

            yield* client.startTimer({
              title: item.title,
              projectId: projectId,
              tags: item.tags,
            });
          }).pipe(Effect.asVoid),
      };
    }),
  );

/**
 * カテゴリからプロジェクトIDを解決する
 * @param cache - キャッシュポート
 * @returns プロジェクトIDを解決する Effect 関数
 */
const resolveProjectId = (cache: Cache) =>
  Effect.fn("resolveProjectId")(function* (category: string) {
    return yield* getCache(cache, category);
  });

/**
 * キャッシュから値を取得する
 * @param cache - キャッシュポート
 * @param key - キャッシュキー
 * @returns キャッシュから取得した値（数値）の Option を含む Effect
 * @remarks キャッシュの取得に失敗した場合は Option.none() を返す
 */
const getCache = (cache: Cache, key: string) =>
  cache.get(key).pipe(
    Effect.map((s) => (s ? Option.some(Number(s)) : Option.none())),
    Effect.catchAll(() => Effect.succeed(Option.none())),
  );
