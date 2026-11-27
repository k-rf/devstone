import { Context, Data, type DateTime, type Effect, type Option } from "effect";

import { type AbortReason, type EntryModification } from "../../../domain/revision-plan.js";
import { type TimeEntry } from "../../../domain/time-entry.js";

/**
 * 処理完了・ドライラン・変更なし時の通知データ
 */
export interface CompletedNotification {
  readonly status: "completed" | "no_changes" | "dry_run";
  readonly since: DateTime.Utc;
  readonly until: DateTime.Utc;
  readonly fetchedCount: number;
  readonly excludedCount: number;
  readonly modifications: readonly EntryModification[];
  readonly deletedIds: readonly number[];
  readonly quotaRemaining: Option.Option<number>;
  readonly quotaResetsInSeconds: Option.Option<number>;
}

/**
 * 判定不能重複等で全停止した際の通知データ
 */
export interface AbortedNotification {
  readonly reason: AbortReason;
  readonly first: TimeEntry;
  readonly second: TimeEntry;
}

/**
 * 外部 API エラー等で失敗した際の通知データ
 */
export interface ErrorNotification {
  readonly message: string;
  readonly reason: string;
  readonly status: Option.Option<number>;
  readonly resetsInSeconds: Option.Option<number>;
}

/**
 * 通知送信時に発生する型付きエラー
 */
export class NotificationError extends Data.TaggedError("NotificationError")<{
  readonly message: string;
  readonly cause: Option.Option<unknown>;
}> {}

/**
 * 実行結果の通知を担う Outbound Port
 */
export class NotificationPort extends Context.Tag("NotificationPort")<
  NotificationPort,
  {
    readonly notifyCompleted: (
      notification: CompletedNotification,
    ) => Effect.Effect<void, NotificationError>;
    readonly notifyAborted: (
      notification: AbortedNotification,
    ) => Effect.Effect<void, NotificationError>;
    readonly notifyError: (
      notification: ErrorNotification,
    ) => Effect.Effect<void, NotificationError>;
  }
>() {}
