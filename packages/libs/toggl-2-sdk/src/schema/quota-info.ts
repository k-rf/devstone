import { Schema } from "effect";

/**
 * Toggl 2.0 API のクォータ情報スキーマ
 */
export const Toggl2QuotaInfo = Schema.Struct({
  remaining: Schema.OptionFromSelf(Schema.Number),
  resetsInSeconds: Schema.OptionFromSelf(Schema.Number),
});

/**
 * Toggl 2.0 API のクォータ情報型
 */
export type Toggl2QuotaInfo = typeof Toggl2QuotaInfo.Type;
