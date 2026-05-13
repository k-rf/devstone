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
    let capturedBody: unknown;
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ id: 999 });
        },
      ),
    );

    const params = {
      title: "Test Task",
      projectId: Option.some(67_890),
      tags: ["Tag1", "Tag2"],
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    await Effect.runPromise(program);

    const body = capturedBody as Record<string, unknown>;
    expect(body).toMatchObject({
      description: "Test Task",
      project_id: 67_890,
      tags: ["Tag1", "Tag2"],
      workspace_id: workspaceId,
      duration: -1,
      created_with: "notion-toggl-bridge",
    });
    expect(body["start"]).toBeDefined();
  });

  it("projectId が None の場合、project_id が null になること", async () => {
    let capturedBody: unknown;
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ id: 999 });
        },
      ),
    );

    const params = {
      title: "Test Task No Project",
      projectId: Option.none(),
      tags: [],
    };

    const program = clientEffect.pipe(Effect.flatMap((client) => client.startTimer(params)));

    await Effect.runPromise(program);

    const body = capturedBody as Record<string, unknown>;
    expect(body["project_id"]).toBeNull();
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

  it("Toggl API エラー (401 Unauthorized)", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => {
          return new HttpResponse("Unauthorized", { status: 401 });
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
    expect(error.message).toBe("Toggl API error: 401 Unauthorized");
  });

  it("Toggl API エラー (500 Internal Server Error)", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => {
          return new HttpResponse("Internal Server Error", { status: 500 });
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
    expect(error.message).toBe("Toggl API error: 500 Internal Server Error");
  });

  it("ネットワークエラー", async () => {
    server.use(
      http.post(
        `https://api.track.toggl.com/api/v9/workspaces/${String(workspaceId)}/time_entries`,
        () => {
          return HttpResponse.error();
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
