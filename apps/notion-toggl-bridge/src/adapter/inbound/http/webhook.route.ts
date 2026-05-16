import { effectValidator } from "@hono/effect-validator";
import { Effect, Layer, Schema } from "effect";
import { Hono } from "hono";

import { startTogglTimerService } from "../../../core/application/start-toggl-timer.service";
import { TaskBoardItemId } from "../../../core/domain/task-board-item-id";
import { KvAdapterLive } from "../../outbound/cloudflare/kv.adapter";
import { NotionAdapterLive } from "../../outbound/notion/notion.adapter";
import { SlackAdapterLive } from "../../outbound/slack/slack.adapter";
import { TogglTrackAdapterLive } from "../../outbound/toggl/toggl-track.adapter";

import { envValidatorMiddleware, type Env } from "./env-validator.middleware";
import { type Bindings } from "./types";
import { verifySecretMiddleware } from "./verify-secret.middleware";
import { NotionWebhookPayload } from "./webhook.payload";

const webhookRoute = new Hono<{ Bindings: Bindings; Variables: { env: Env } }>();

webhookRoute.post(
  "/start",
  envValidatorMiddleware,
  verifySecretMiddleware,
  effectValidator("json", NotionWebhookPayload),
  (c) => {
    // 1. パース済みの環境変数を取得
    const env = c.var.env;

    // 2. 各アダプターに必要な設定を直接注入してレイヤーを作成
    const cacheLayer = KvAdapterLive(c.env.TOGGL_MAPPER);
    const mainLayer = NotionAdapterLive(env.NOTION_TOGGL_BRIDGE_API_TOKEN).pipe(
      Layer.merge(TogglTrackAdapterLive(env.TOGGL_API_TOKEN, env.TOGGL_WORKSPACE_ID)),
      Layer.merge(SlackAdapterLive(env.SLACK_WEBHOOK_URL)),
      Layer.provideMerge(cacheLayer),
    );

    const program = Effect.gen(function* () {
      // バリデーション済みのペイロードを取得
      const payload = c.req.valid("json");

      const rawTodoPageId = payload.data.properties["☑️ やること"].relation[0].id;

      // 識別子の刻印
      const todoPageId = yield* Schema.decodeUnknown(TaskBoardItemId)(rawTodoPageId).pipe(
        Effect.mapError((e) => new Error(`Invalid Page ID: ${String(e)}`)),
      );

      // バックグラウンド実行
      c.executionCtx.waitUntil(
        Effect.runPromise(
          startTogglTimerService(todoPageId, payload.data.id).pipe(
            Effect.provide(mainLayer),
            Effect.catchAllCause((cause) => {
              console.error("Background task failed:", cause);
              return Effect.void;
            }),
          ),
        ),
      );

      return c.json({ message: "Accepted" }, 202);
    }).pipe(
      Effect.catchAll((error) => {
        console.error("Webhook processing error:", error);
        return Effect.succeed(c.json({ message: "Bad Request" }, 400));
      }),
      Effect.provide(mainLayer),
    );

    return Effect.runPromise(program);
  },
);

export { webhookRoute };
