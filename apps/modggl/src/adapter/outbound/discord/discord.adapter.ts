import { getIntervalDurationSeconds } from "@devstone/libs-time-interval";
import { DateTime, Effect, Layer, Match, Option } from "effect";

import { type TimeEntry } from "../../../core/domain/time-entry.js";
import {
  NotificationError,
  NotificationPort,
  type AbortedNotification,
  type CompletedNotification,
  type ErrorNotification,
} from "../../../core/port/outbound/notification/notification.port.js";
import { formatIsoMillis } from "../../../utils/format-iso-millis.js";

interface DiscordEmbedField {
  readonly name: string;
  readonly value: string;
  readonly inline?: boolean;
}

interface DiscordEmbed {
  readonly title: string;
  readonly description?: string;
  readonly color: number;
  readonly fields: readonly DiscordEmbedField[];
}

interface DiscordWebhookPayload {
  readonly embeds: readonly DiscordEmbed[];
}

const COLOR_COMPLETED = 0x2ecc71;
const COLOR_NO_CHANGES = 0x95a5a6;
const COLOR_DRY_RUN = 0x3498db;
const COLOR_ABORTED = 0xf39c12;
const COLOR_ERROR = 0xe74c3c;

const DISCORD_FIELD_VALUE_MAX_LENGTH = 1024;
const DISCORD_EMBED_DESCRIPTION_MAX_LENGTH = 4096;

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  const candidate = text.slice(0, maxLength - 1);
  const safePrefix = candidate.isWellFormed() ? candidate : candidate.slice(0, -1);

  return `${safePrefix}…`;
};

const formatQuotaText = (
  remaining: Option.Option<number>,
  resetsInSeconds: Option.Option<number>,
): string => {
  const remainingText = Option.match(remaining, {
    onNone: () => "不明",
    onSome: (value) => `${String(value)} req`,
  });
  const resetsText = Option.match(resetsInSeconds, {
    onNone: () => "不明",
    onSome: (value) => `${String(value)} 秒後`,
  });

  return `残り ${remainingText} / リセット ${resetsText}`;
};

const formatEntrySummary = (entry: TimeEntry): string => {
  const start = formatIsoMillis(entry.interval.start);
  const end = formatIsoMillis(entry.interval.end);
  const duration = getIntervalDurationSeconds(entry.interval);
  const description = entry.description === "" ? "(説明なし)" : entry.description;

  return truncateText(
    `ID: ${String(entry.id)}\n区間: ${start} 〜 ${end} (${String(duration)} 秒)\n説明: ${description}`,
    DISCORD_FIELD_VALUE_MAX_LENGTH,
  );
};

const buildCompletedEmbed = (notification: CompletedNotification): DiscordEmbed => {
  const meta = Match.value(notification.status).pipe(
    Match.when("completed", () => ({
      title: "modggl: タイムエントリーを補正しました",
      color: COLOR_COMPLETED,
    })),
    Match.when("no_changes", () => ({
      title: "modggl: 変更対象のエントリーはありませんでした",
      color: COLOR_NO_CHANGES,
    })),
    Match.when("dry_run", () => ({
      title: "modggl: ドライラン結果",
      color: COLOR_DRY_RUN,
    })),
    Match.exhaustive,
  );

  return {
    title: meta.title,
    color: meta.color,
    fields: [
      {
        name: "対象期間",
        value: `${DateTime.formatIso(notification.since)} 〜 ${DateTime.formatIso(notification.until)}`,
        inline: false,
      },
      {
        name: "取得 / 除外",
        value: `${String(notification.fetchedCount)} 件 / ${String(notification.excludedCount)} 件`,
        inline: true,
      },
      {
        name: "更新 / 削除",
        value: `${String(notification.modifications.length)} 件 / ${String(notification.deletedIds.length)} 件`,
        inline: true,
      },
      {
        name: "クォータ",
        value: formatQuotaText(notification.quota.remaining, notification.quota.resetsInSeconds),
        inline: false,
      },
    ],
  };
};

const buildAbortedEmbed = (notification: AbortedNotification): DiscordEmbed => ({
  title: "modggl: 判定不能な重複を検出して停止しました",
  description: `停止理由: ${notification.reason}（All-or-Nothing 保護により書き込みは一切行っていません）`,
  color: COLOR_ABORTED,
  fields: [
    {
      name: "競合エントリー 1",
      value: formatEntrySummary(notification.first),
      inline: false,
    },
    {
      name: "競合エントリー 2",
      value: formatEntrySummary(notification.second),
      inline: false,
    },
  ],
});

const buildErrorEmbed = (notification: ErrorNotification): DiscordEmbed => ({
  title: "modggl: 実行エラーが発生しました",
  description: truncateText(notification.message, DISCORD_EMBED_DESCRIPTION_MAX_LENGTH),
  color: COLOR_ERROR,
  fields: [
    {
      name: "種別",
      value: notification.reason,
      inline: true,
    },
    {
      name: "HTTP ステータス",
      value: Option.match(notification.status, {
        onNone: () => "なし",
        onSome: String,
      }),
      inline: true,
    },
    {
      name: "リセット待ち秒数",
      value: Option.match(notification.resetsInSeconds, {
        onNone: () => "なし",
        onSome: (value) => `${String(value)} 秒`,
      }),
      inline: true,
    },
  ],
});

const postWebhook = (
  webhookUrl: string,
  embed: DiscordEmbed,
): Effect.Effect<void, NotificationError> =>
  Effect.gen(function* () {
    const payload: DiscordWebhookPayload = { embeds: [embed] };

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      catch: (error) =>
        new NotificationError({
          message: "Discord Webhook への送信に失敗しました",
          cause: Option.some(error),
        }),
    });

    if (!response.ok) {
      const bodyText = yield* Effect.tryPromise(() => response.text()).pipe(
        Effect.orElseSucceed(() => ""),
      );
      return yield* Effect.fail(
        new NotificationError({
          message: `Discord Webhook がエラーを返しました (${String(response.status)}): ${bodyText}`,
          cause: Option.none(),
        }),
      );
    }
  });

/**
 * Discord Incoming Webhook を用いて通知を送信する `NotificationPort` Layer を生成する
 * @param webhookUrl - Discord Incoming Webhook URL
 * @returns Discord 通知を送信する `NotificationPort` Layer
 */
export const DiscordAdapterLive = (webhookUrl: string): Layer.Layer<NotificationPort> =>
  Layer.succeed(NotificationPort, {
    notifyCompleted: (notification) => postWebhook(webhookUrl, buildCompletedEmbed(notification)),
    notifyAborted: (notification) => postWebhook(webhookUrl, buildAbortedEmbed(notification)),
    notifyError: (notification) => postWebhook(webhookUrl, buildErrorEmbed(notification)),
  });
