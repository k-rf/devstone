import { Effect, Layer, Schema } from "effect";

import { TaskBoardItem } from "../../../core/domain/task-board-item";
import { TaskBoardError, TaskBoardPort } from "../../../core/port/outbound/notion/task-board.port";

import {
  NotionMultiSelectProperty,
  NotionPagePayload,
  NotionSelectProperty,
  NotionTitleProperty,
} from "./notion.payload";
import { normalizeRichText } from "./notion.util";

/**
 * Notion Adapter の実装
 * @param apiToken - Notion API トークン
 * @returns Notion Adapter の Layer
 */
export const NotionAdapterLive = (apiToken: string) =>
  Layer.succeed(TaskBoardPort, {
    getItem: (id) =>
      Effect.gen(function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`https://api.notion.com/v1/pages/${id}`, {
              headers: {
                Authorization: `Bearer ${apiToken}`,
                "Notion-Version": "2022-06-28",
              },
            }),
          catch: (e) =>
            new TaskBoardError({
              message: `Notion API network error`,
              cause: e,
            }),
        });

        if (!response.ok) {
          return yield* Effect.fail(
            new TaskBoardError({
              message: `Notion API error: ${String(response.status)} ${response.statusText}`,
            }),
          );
        }

        const json: unknown = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (e) =>
            new TaskBoardError({
              message: `Notion API JSON parse error`,
              cause: e,
            }),
        });

        // ペイロードの検証
        const payload = yield* Schema.decodeUnknown(NotionPagePayload)(json).pipe(
          Effect.mapError(
            (e) =>
              new TaskBoardError({
                message: `Notion API response schema mismatch`,
                cause: e,
              }),
          ),
        );

        const props = payload.properties;

        // 名前プロパティの抽出
        const titleProp = yield* Schema.decodeUnknown(NotionTitleProperty)(props["名前"]).pipe(
          Effect.mapError(
            (e) => new TaskBoardError({ message: `Notion property "名前" parse error`, cause: e }),
          ),
        );
        const title = normalizeRichText(titleProp.title);

        // カテゴリプロパティの抽出
        const categoryProp = yield* Schema.decodeUnknown(NotionSelectProperty)(
          props["カテゴリ"],
        ).pipe(
          Effect.mapError(
            (e) =>
              new TaskBoardError({ message: `Notion property "カテゴリ" parse error`, cause: e }),
          ),
        );
        const categoryName = categoryProp.select.name;

        // タグプロパティの抽出
        const tagsProp = yield* Schema.decodeUnknown(NotionMultiSelectProperty)(props["タグ"]).pipe(
          Effect.mapError(
            (e) => new TaskBoardError({ message: `Notion property "タグ" parse error`, cause: e }),
          ),
        );
        const tags = tagsProp.multi_select.map((s) => s.name);

        // ドメインモデルへの変換
        return yield* Schema.decodeUnknown(TaskBoardItem)({
          id: id,
          parentDatabaseId: payload.parent.database_id,
          title: title,
          category: categoryName,
          tags: tags,
        }).pipe(
          Effect.mapError(
            (e) =>
              new TaskBoardError({
                message: `Domain model mapping error`,
                cause: e,
              }),
          ),
        );
      }),
  });
