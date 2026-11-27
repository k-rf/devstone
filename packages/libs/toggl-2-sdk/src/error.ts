import { Data, type Option } from "effect";

/**
 * Toggl 2.0 API のクォータ超過エラー（HTTP 402）
 */
export class Toggl2QuotaExceededError extends Data.TaggedError("Toggl2QuotaExceededError")<{
  readonly message: string;
  readonly resetsInSeconds: Option.Option<number>;
}> {}

/**
 * Toggl 2.0 API の競合エラー（HTTP 409）
 */
export class Toggl2ConflictError extends Data.TaggedError("Toggl2ConflictError")<{
  readonly message: string;
}> {}

/**
 * Toggl 2.0 API の認証エラー（HTTP 401）
 */
export class Toggl2UnauthorizedError extends Data.TaggedError("Toggl2UnauthorizedError")<{
  readonly message: string;
}> {}

/**
 * Toggl 2.0 API の通信・応答・スキーマ検証エラー
 */
export class Toggl2ApiError extends Data.TaggedError("Toggl2ApiError")<{
  readonly message: string;
  readonly status: Option.Option<number>;
  readonly cause: Option.Option<unknown>;
}> {}

/**
 * Toggl 2.0 SDK が返却するエラーのユニオン型
 */
export type Toggl2SdkError =
  | Toggl2QuotaExceededError
  | Toggl2ConflictError
  | Toggl2UnauthorizedError
  | Toggl2ApiError;
