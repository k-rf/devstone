import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import app from "../index";

const server = setupServer(
  // Notion API Mock
  http.get("https://api.notion.com/v1/pages/:id", () => {
    return HttpResponse.json({
      parent: { type: "database_id", database_id: "allowed-db-id" },
      properties: {
        名前: { title: [{ plain_text: "E2E Task" }] },
        カテゴリ: { select: { name: "Client / Project" } },
        タグ: { multi_select: [{ name: "TagA" }] },
      },
    });
  }),

  // Toggl API Mock
  http.get("https://api.track.toggl.com/api/v9/workspaces/:wid/clients", () => {
    return HttpResponse.json([{ id: 101, name: "Client" }]);
  }),
  http.get("https://api.track.toggl.com/api/v9/workspaces/:wid/projects", () => {
    return HttpResponse.json([{ id: 201, name: "Project", client_id: 101 }]);
  }),
  http.get("https://api.track.toggl.com/api/v9/workspaces/:wid/tags", () => {
    return HttpResponse.json([{ id: 301, name: "TagA" }]);
  }),
  http.post("https://api.track.toggl.com/api/v9/workspaces/:wid/time_entries", () => {
    return HttpResponse.json({ id: 999 });
  }),

  // Slack Mock
  http.post("https://hooks.slack.com/services/mock", () => {
    return new HttpResponse(undefined, { status: 200 });
  }),
);

describe("E2E: Webhook Handler", () => {
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  const mockEnv = {
    NOTION_WEBHOOK_SECRET: "test-secret",
    NOTION_API_TOKEN: "test-notion-token",
    TOGGL_API_TOKEN: "test-toggl-token",
    TOGGL_WORKSPACE_ID: "12345",
    SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/mock",
    TOGGL_MAPPER: {
      get: vi.fn(() => Promise.resolve(undefined)),
      put: vi.fn(() => Promise.resolve()),
    },
  };

  it("正常系: 正しいシークレットとペイロードでタイマーが開始されること", async () => {
    const payload = {
      source: { user_id: "user-1" },
      data: {
        id: "block-123",
        properties: {
          "☑️ やること": {
            type: "relation",
            relation: [{ id: "todo-456" }],
          },
        },
      },
    };

    const req = new Request("http://localhost/toggl/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shared-Secret": "test-secret",
      },
      body: JSON.stringify(payload),
    });

    let capturedPromise: Promise<unknown> | undefined;
    const waitUntilSpy = vi.fn((promise: Promise<unknown>) => {
      capturedPromise = promise;
    });

    // @ts-expect-error: テスト用に ExecutionContext を部分的にモックするため
    const executionCtx: ExecutionContext = {
      waitUntil: waitUntilSpy,
      passThroughOnException: vi.fn(() => {
        // Mock
      }),
    };

    const res = await app.request(req, {}, mockEnv, executionCtx);

    expect(res.status).toBe(202);
    const body: { message: string } = await res.json();
    expect(body.message).toBe("Accepted");

    // バックグラウンド処理の完了を待機
    if (capturedPromise) {
      await capturedPromise;
    }
  });

  it("異常系: シークレットが不一致の場合は 401 を返すこと", async () => {
    const req = new Request("http://localhost/toggl/start", {
      method: "POST",
      headers: {
        "X-Shared-Secret": "wrong-secret",
      },
      body: JSON.stringify({}),
    });

    const res = await app.request(req, {}, mockEnv);
    expect(res.status).toBe(401);
  });
});
