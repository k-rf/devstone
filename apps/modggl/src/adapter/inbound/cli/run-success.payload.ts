import { getIntervalDurationSeconds } from "@devstone/libs-time-interval";
import { DateTime, Option } from "effect";

import { type ModifyEntriesOutput } from "../../../core/application/modify-entries.output.js";
import { formatIsoMillis } from "../../../utils/format-iso-millis.js";

/**
 * `ModifyEntriesOutput` を標準出力向けの構造化 JSON 文字列へ整形する
 * @param output - タイムエントリー補正ユースケースの出力データ
 * @returns JSON 文字列
 */
export const formatSuccessJson = (output: ModifyEntriesOutput): string =>
  JSON.stringify({
    status: output.status,
    since: DateTime.formatIso(output.since),
    until: DateTime.formatIso(output.until),
    stats: output.stats,
    modifications: output.modifications.map((modification) => ({
      id: modification.id,
      start: formatIsoMillis(modification.interval.start),
      end: formatIsoMillis(modification.interval.end),
      durationSeconds: getIntervalDurationSeconds(modification.interval),
    })),
    deletedIds: output.deletedIds,
    quota: {
      remaining: Option.getOrUndefined(output.quota.remaining),
      resetsInSeconds: Option.getOrUndefined(output.quota.resetsInSeconds),
    },
  });
