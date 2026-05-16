/**
 * 環境変数の型定義
 */
export interface Bindings {
  readonly NOTION_TOGGL_BRIDGE_API_TOKEN: string;
  readonly NOTION_WEBHOOK_SECRET: string;
  readonly SLACK_WEBHOOK_URL: string;
  readonly TOGGL_API_TOKEN: string;
  readonly TOGGL_WORKSPACE_ID: string;
  readonly TOGGL_MAPPER: KVNamespace;
}
