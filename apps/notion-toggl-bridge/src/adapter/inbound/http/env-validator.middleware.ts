import { Schema } from "effect";
import { createMiddleware } from "hono/factory";

import { type Bindings } from "./types";

/**
 * 環境変数のバリデーションスキーマ
 */
export const Env = Schema.Struct({
  NOTION_API_TOKEN: Schema.String,
  NOTION_WEBHOOK_SECRET: Schema.String,
  SLACK_WEBHOOK_URL: Schema.String,
  TOGGL_API_TOKEN: Schema.String,
  TOGGL_WORKSPACE_ID: Schema.NumberFromString,
});

export type Env = Schema.Schema.Type<typeof Env>;

/**
 * 環境変数バリデーションミドルウェア
 * 起動時（最初のfetch時）に設定漏れを検知する
 */
export const envValidatorMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: { env: Env };
}>(async (c, next) => {
  const result = Schema.decodeUnknownEither(Env)(c.env);

  if (result._tag === "Left") {
    console.error("Environment variable validation failed:", result.left);
    return c.json({ message: "Internal Server Error: Invalid Configuration" }, 500);
  }

  c.set("env", result.right);
  return next();
});
