import { Config, Data, Effect, Schema } from "effect";

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
  readonly togglOrganizationId: number;
  readonly togglWorkspaceId: number;
}

const NonEmptyTokenSchema = Schema.NonEmptyString.pipe(
  Schema.filter((value) => (value.trim().length > 0 ? true : "空白のみのトークンは指定できません")),
);

const PositiveIntFromStringSchema = Schema.NumberFromString.pipe(Schema.int(), Schema.positive());

const EnvConfig = Config.all({
  togglApiToken: Schema.Config("TOGGL_API_TOKEN", NonEmptyTokenSchema),
  togglOrganizationId: Schema.Config("TOGGL_ORGANIZATION_ID", PositiveIntFromStringSchema),
  togglWorkspaceId: Schema.Config("TOGGL_WORKSPACE_ID", PositiveIntFromStringSchema),
});

/**
 * 実行時環境変数（`TOGGL_API_TOKEN`, `TOGGL_ORGANIZATION_ID`, `TOGGL_WORKSPACE_ID`）を読み込み検証する
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
