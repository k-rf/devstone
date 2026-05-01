import { Schema } from "effect";

/**
 * タイムトラッキングのエントリ
 */
export const TrackingEntry = Schema.Struct({
  description: Schema.String,
  category: Schema.Option(Schema.String),
  tags: Schema.Array(Schema.String),
  startTime: Schema.Option(Schema.Date),
  endTime: Schema.Option(Schema.Date),
});

export type TrackingEntry = Schema.Schema.Type<typeof TrackingEntry>;
