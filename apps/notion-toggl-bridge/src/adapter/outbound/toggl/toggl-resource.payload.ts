import { Schema } from "effect";

/**
 * Toggl API の共通リソーススキーマ
 */
export const TogglResourcePayload = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

/**
 * Toggl API のリソース型
 */
export type TogglResourcePayload = Schema.Schema.Type<typeof TogglResourcePayload>;
