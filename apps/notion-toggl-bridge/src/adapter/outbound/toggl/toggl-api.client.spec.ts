import { faker } from "@faker-js/faker";
import { Effect, Option } from "effect";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { makeTogglApiClient } from "./toggl-api.client";

const server = setupServer();

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

const apiToken = "test-token";
const workspaceId = 12_345;
const clientEffect = makeTogglApiClient(apiToken, workspaceId);

describe("正常系", () => {
  it("正しいペイロードで POST リクエストが送信されること", async () => {
    const captured: { body?: unknown } = {};
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        async ({ request }) => {
          captured.body = await request.json();
          return HttpResponse.json({ id: 999 });
        },
      ),
    );

    const title = faker.lorem.sentence();
    const projectId = faker.number.int();
    const tags = [faker.lorem.word(), faker.lorem.word()];

    const params = {
      title: title,
      projectId: Option.some(projectId),
      tags: tags,
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    await Effect.runPromise(program);

    const body = captured.body as Record<string, unknown>;
    expect(body).toMatchObject({
      description: title,
      project_id: projectId,
      tags: tags,
      workspace_id: workspaceId,
      duration: -1,
      created_with: "notion-toggl-bridge",
    });
    expect(body["start"]).toBeDefined();
  });

  it("getClients: クライアント一覧を取得できること", async () => {
    const mockClients = [
      { id: 1, name: faker.company.name() },
      { id: 2, name: faker.company.name() },
    ];

    server.use(
      http.get(`https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/clients`, () =>
        HttpResponse.json(mockClients),
      ),
    );

    const program = clientEffect.pipe(Effect.flatMap((client) => client.getClients()));
    const result = await Effect.runPromise(program);

    expect(result).toStrictEqual(mockClients);
  });

  it("getProjects: プロジェクト一覧を取得できること", async () => {
    const mockProjects = [
      { id: 10, name: faker.commerce.productName() },
      { id: 20, name: faker.commerce.productName() },
    ];

    server.use(
      http.get(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/projects`,
        () => HttpResponse.json(mockProjects),
      ),
    );

    const program = clientEffect.pipe(Effect.flatMap((client) => client.getProjects()));
    const result = await Effect.runPromise(program);

    expect(result).toStrictEqual(mockProjects);
  });
});

describe("異常系", () => {
  it("Toggl API エラー (400 Bad Request)", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => {
          return new HttpResponse("Bad Request", { status: 400 });
        },
      ),
    );

    const params = {
      title: "Test Task",
      projectId: Option.none(),
      tags: [],
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Toggl API error: 400 Bad Request");
  });

  it("ネットワークエラー", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => HttpResponse.error(),
      ),
    );

    const params = {
      title: "Test Task",
      projectId: Option.none(),
      tags: [],
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Toggl API network error");
  });

  it("JSON パースエラー", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => {
          return new HttpResponse("invalid-json", {
            headers: { "Content-Type": "application/json" },
          });
        },
      ),
    );

    const params = {
      title: "Test Task",
      projectId: Option.none(),
      tags: [],
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Toggl API JSON parse error");
  });

  it("レスポンスのスキーマ不一致", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => {
          return HttpResponse.json({ id: "not-a-number" });
        },
      ),
    );

    const params = {
      title: "Test Task",
      projectId: Option.none(),
      tags: [],
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe(
      `Toggl API response schema mismatch at /workspaces/${String(workspaceId)}/time_entries`,
    );
  });

  it("ペイロードのエンコード失敗", async () => {
    // @ts-expect-error: workspace_id に数値でない値を渡してエンコードエラーを発生させる
    const badClientEffect = makeTogglApiClient("token", "not-a-number");

    const params = {
      title: "Test Task",
      projectId: Option.none(),
      tags: [],
    };

    const program = badClientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    const error = await Effect.runPromise(Effect.flip(program));
    expect(error.message).toBe("Failed to encode TogglTimeEntryPayload");
  });
});
