import { Schema } from "effect";

/**
 * タイムエントリー補正ユースケースへの入力スキーマ
 */
export const ModifyEntriesInput = Schema.Struct({
  since: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  until: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  days: Schema.Int.pipe(Schema.positive()),
  dryRun: Schema.Boolean,
  notify: Schema.Boolean,
});

/**
 * タイムエントリー補正ユースケースへの入力型
 */
export type ModifyEntriesInput = typeof ModifyEntriesInput.Type;
