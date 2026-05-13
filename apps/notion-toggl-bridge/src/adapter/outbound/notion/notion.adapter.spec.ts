import { Effect } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { type TaskBoardItemId } from "../../../core/domain/task-board-item-id";
import { TaskBoardPort } from "../../../core/port/outbound/notion/task-board.port";

import { NotionAdapterLive } from "./notion.adapter";

const server = setupServer();

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

const apiToken = "test-token";
const adapter = NotionAdapterLive(apiToken);
const pageId = "page-123" as TaskBoardItemId;

describe("正常系", () => {
  it("正しいペイロードが返された場合に TaskBoardItem に変換されること", async () => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", ({ params }) => {
        expect(params["id"]).toBe(pageId);
        return HttpResponse.json({
          parent: { type: "database_id", database_id: "db-123" },
          properties: {
            名前: { title: [{ plain_text: "Test Task" }] },
            カテゴリ: { select: { name: "Project A" } },
            タグ: { multi_select: [{ name: "Tag 1" }, { name: "Tag 2" }] },
          },
        });
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const result = await Effect.runPromise(program);

    expect(result).toStrictEqual({
      id: pageId,
      parentDatabaseId: "db-123",
      title: "Test Task",
      category: "Project A",
      tags: ["Tag 1", "Tag 2"],
    });
  });
});

describe("異常系", () => {
  it("ネットワークエラー", async () => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", () => {
        return HttpResponse.error();
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toContain("Notion API network error");
  });

  it("API エラー (404等)", async () => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", () => {
        return new HttpResponse(undefined, { status: 404, statusText: "Not Found" });
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Notion API error: 404 Not Found");
  });

  it("JSON パースエラー", async () => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", () => {
        return new HttpResponse("invalid-json", {
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Notion API JSON parse error");
  });

  it("NotionPagePayload スキーマ不一致", async () => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", () => {
        // REMARKS: parent を欠落させる
        return HttpResponse.json({
          properties: {},
        });
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Notion API response schema mismatch");
  });

  it.each([
    { prop: "名前", payload: { カテゴリ: { select: { name: "A" } }, タグ: { multi_select: [] } } },
    { prop: "カテゴリ", payload: { 名前: { title: [] }, タグ: { multi_select: [] } } },
    { prop: "タグ", payload: { 名前: { title: [] }, カテゴリ: { select: { name: "A" } } } },
  ])("「$prop」プロパティ不一致の場合、エラーを返すこと", async ({ prop, payload }) => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", () => {
        return HttpResponse.json({
          parent: { type: "database_id", database_id: "db-123" },
          properties: payload,
        });
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe(`Notion property "${prop}" parse error`);
  });

  it("ドメインモデルへのマッピングエラー (TaskBoardItem デコード失敗)", async () => {
    const pageId = "page-123" as TaskBoardItemId;
    server.use(
      http.get(`https://api.notion.com/v1/pages/${pageId}`, () => {
        return HttpResponse.json({
          // REMARKS: parent.database_id を空文字にして TaskBoardItem のバリデーションに失敗させる
          parent: { type: "database_id", database_id: "" },
          properties: {
            名前: { title: [{ plain_text: "Test Task" }] },
            カテゴリ: { select: { name: "Project A" } },
            タグ: { multi_select: [] },
          },
        });
      }),
    );

    const program = TaskBoardPort.pipe(
      Effect.flatMap((port) => port.getItem(pageId)),
      Effect.provide(adapter),
    );

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Domain model mapping error");
  });
});
