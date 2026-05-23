import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { type Bindings } from "../adapter/inbound/http/types";
import app from "../index";

const server = setupServer(
  // Notion API Mock
  http.get("https://api.notion.com/v1/pages/:id", () => {
    return HttpResponse.json({
      parent: { type: "database_id", database_id: faker.string.uuid() },
      properties: {
        名前: { title: [{ plain_text: faker.lorem.sentence() }] },
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
    return HttpResponse.json({ id: faker.number.int() });
  }),

  // Slack Mock
  http.post("https://hooks.slack.com/services/mock", () => {
    return new HttpResponse(undefined, { status: 200 });
  }),
);

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => {
  server.close();
});

const mockEnv: Bindings = {
  NOTION_WEBHOOK_SECRET: faker.string.alphanumeric(10),
  NOTION_TOGGL_BRIDGE_API_TOKEN: faker.string.alphanumeric(20),
  TOGGL_API_TOKEN: faker.string.alphanumeric(20),
  TOGGL_WORKSPACE_ID: faker.number.int().toString(),
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/mock",
  TOGGL_MAPPER: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  },
};

const validPayload = {
  source: { user_id: faker.string.uuid() },
  data: {
    id: faker.string.uuid(),
    properties: {
      "☑️ やること": {
        type: "relation",
        relation: [{ id: faker.string.uuid() }],
      },
    },
  },
};

describe("正常系", () => {
  it("ルートパスへのアクセスでウェルカムメッセージを返すこと", async () => {
    const res = await app.request("/", {}, mockEnv);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Notion to Toggl Track Bridge is running!");
  });

  it("未定義のルートへのアクセスで 404 を返すこと", async () => {
    const res = await app.request("/undefined-route", {}, mockEnv);
    expect(res.status).toBe(404);
  });

  it("正しいシークレットとペイロードでタイマーが開始されること", async () => {
    const req = new Request("http://localhost/toggl/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shared-Secret": mockEnv.NOTION_WEBHOOK_SECRET,
      },
      body: JSON.stringify(validPayload),
    });

    let capturedPromise: Promise<unknown> | undefined;
    const waitUntilSpy = vi.fn((promise: Promise<unknown>) => {
      capturedPromise = promise;
    });

    const executionCtx: ExecutionContext = {
      waitUntil: waitUntilSpy,
      passThroughOnException: vi.fn(),
      props: {},
    };

    const res = await app.request(req, {}, mockEnv, executionCtx);

    expect(res.status).toBe(202);
    expect(await res.json()).toStrictEqual({ message: "Accepted" });

    if (capturedPromise) await capturedPromise;
  });
});

describe("異常系", () => {
  it("シークレットが不一致の場合は 401 を返すこと", async () => {
    const req = new Request("http://localhost/toggl/start", {
      method: "POST",
      headers: {
        "X-Shared-Secret": "wrong-secret",
      },
      body: JSON.stringify(validPayload),
    });

    const res = await app.request(req, {}, mockEnv);
    expect(res.status).toBe(401);
  });

  it("ペイロードのバリデーションに失敗した場合は 400 を返すこと", async () => {
    const invalidPayload = {
      ...validPayload,
      data: {
        ...validPayload.data,
        properties: {
          "☑️ やること": {
            type: "relation",
            relation: [{ id: "" }], // minLength(1) に抵触
          },
        },
      },
    };

    const req = new Request("http://localhost/toggl/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shared-Secret": mockEnv.NOTION_WEBHOOK_SECRET,
      },
      body: JSON.stringify(invalidPayload),
    });

    const consoleSpy = vi.spyOn(console, "error");
    const res = await app.request(req, {}, mockEnv);

    expect(res.status).toBe(400);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("バックグラウンドタスクが失敗しても、レスポンス自体は 202 Accepted であること", async () => {
    server.use(
      http.get("https://api.notion.com/v1/pages/:id", () => {
        return new HttpResponse(undefined, { status: 500 });
      }),
    );

    const req = new Request("http://localhost/toggl/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shared-Secret": mockEnv.NOTION_WEBHOOK_SECRET,
      },
      body: JSON.stringify(validPayload),
    });

    let capturedPromise: Promise<unknown> | undefined;
    const waitUntilSpy = vi.fn((promise: Promise<unknown>) => {
      capturedPromise = promise;
    });

    const executionCtx: ExecutionContext = {
      waitUntil: waitUntilSpy,
      passThroughOnException: vi.fn(),
      props: {},
    };

    const consoleSpy = vi.spyOn(console, "error");
    const res = await app.request(req, {}, mockEnv, executionCtx);

    expect(res.status).toBe(202);

    if (capturedPromise) await capturedPromise;

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Background task failed:"),
      expect.anything(),
    );
  });
});
