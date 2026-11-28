import { Schema } from "effect";

import { LookbackDays } from "./lookback-days.input.js";

/**
 * タイムエントリー補正ユースケースへの入力スキーマ
 */
export const ModifyEntriesInput = Schema.Struct({
  since: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  until: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  days: LookbackDays,
  dryRun: Schema.Boolean,
});

/**
 * タイムエントリー補正ユースケースへの入力型
 */
export type ModifyEntriesInput = typeof ModifyEntriesInput.Type;
