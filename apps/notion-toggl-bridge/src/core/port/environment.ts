export interface Environment {
  readonly IDEMPOTENCY_KV: KVNamespace;
  readonly MAPPING_KV: KVNamespace;
  readonly NOTION_WEBHOOK_SECRET: string;
  readonly NOTION_API_TOKEN: string;
  readonly TOGGL_TRACK_API_TOKEN: string;
  readonly TOGGL_TRACK_WEBHOOK_SECRET: string;
  readonly TOGGL_TRACK_WORKSPACE_ID: string;
  readonly NOTION_DAILY_NOTE_DATABASE_ID: string;
  readonly NOTION_DAILY_NOTE_DATE_PROPERTY: string;
  readonly NOTION_DAILY_NOTE_RELATION_PROPERTY: string;
}
