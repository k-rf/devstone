import { Schema } from "effect";

/**
 * Toggl API の共通リソーススキーマ
 */
export const TogglResource = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

/**
 * Toggl API のリソース型
 */
export type TogglResource = typeof TogglResource.Type;
