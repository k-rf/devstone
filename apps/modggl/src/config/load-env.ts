import { Toggl2OrganizationId, Toggl2WorkspaceId } from "@devstone/libs-toggl-2-sdk";
import { Config, Data, Effect, Schema, type Option } from "effect";

/**
 * 必須環境変数の不足または形式不正時に発生するエラー
 */
export class EnvValidationError extends Data.TaggedError("EnvValidationError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

/**
 * 検証済みの実行時環境変数
 */
export interface ModgglEnv {
  readonly togglApiToken: string;
  readonly togglOrganizationId: Toggl2OrganizationId;
  readonly togglWorkspaceId: Toggl2WorkspaceId;
  readonly discordWebhookUrl: Option.Option<string>;
}

const NonEmptyTokenSchema = Schema.String.pipe(
  Schema.pattern(/^[!-~]+$/u, {
    message: () =>
      "トークンには空白・改行・制御文字を含められない空でない印字可能 ASCII のみ指定できます",
  }),
);

const DiscordWebhookUrlSchema = Schema.String.pipe(
  Schema.pattern(
    /^https:\/\/(?:(?:ptb|canary)\.)?(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/u,
  ),
);

const EnvConfig = Config.all({
  togglApiToken: Schema.Config("TOGGL_API_TOKEN", NonEmptyTokenSchema),
  togglOrganizationId: Schema.Config(
    "TOGGL_ORGANIZATION_ID",
    Schema.NumberFromString.pipe(Schema.compose(Toggl2OrganizationId)),
  ),
  togglWorkspaceId: Schema.Config(
    "TOGGL_WORKSPACE_ID",
    Schema.NumberFromString.pipe(Schema.compose(Toggl2WorkspaceId)),
  ),
  discordWebhookUrl: Config.option(Schema.Config("DISCORD_WEBHOOK_URL", DiscordWebhookUrlSchema)),
});

/**
 * 実行時環境変数（`TOGGL_API_TOKEN`, `TOGGL_ORGANIZATION_ID`, `TOGGL_WORKSPACE_ID`, 任意で `DISCORD_WEBHOOK_URL`）を読み込み検証する
 * @returns 検証済みの環境変数オブジェクト、または `EnvValidationError` を返す Effect
 */
export const loadEnv = (): Effect.Effect<ModgglEnv, EnvValidationError> =>
  EnvConfig.pipe(
    Effect.mapError(
      (cause) =>
        new EnvValidationError({
          message: `環境変数の検証に失敗しました: ${cause.message}`,
          cause: cause,
        }),
    ),
  );
