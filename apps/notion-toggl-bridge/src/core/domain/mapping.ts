import { Schema } from "effect";

export class TogglTarget extends Schema.Class<TogglTarget>("TogglTarget")({
  client: Schema.String,
  project: Schema.String,
}) {}

/**
 * Toggl Track プロジェクト ID から引いた Notion 側のターゲット。
 * pageId は Notion のページ ID（UUID）を文字列で保持する。
 */
export class NotionTarget extends Schema.Class<NotionTarget>("NotionTarget")({
  pageId: Schema.String,
}) {}
