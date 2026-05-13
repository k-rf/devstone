import { Effect, Layer, Option, type Context } from "effect";
import { describe, expect, it, vi } from "vitest";

import { TaskBoardItemId } from "../../../core/domain/task-board-item-id";
import { CacheError, CachePort } from "../../../core/port/outbound/cloudflare/cache.port";
import { TimeTrackerPort } from "../../../core/port/outbound/toggl/time-tracker.port";

import { makeTogglApiClient, type TogglApiClient } from "./toggl-api.client";
import { TogglTrackAdapterLive } from "./toggl-track.adapter";

vi.mock("./toggl-api.client");

const item = {
  id: TaskBoardItemId.make("item-id"),
  parentDatabaseId: "db-id",
  title: "Test Task",
  category: "Development",
  tags: ["tag1", "tag2"],
};

describe("正常系", () => {
  it("キャッシュにプロジェクトIDがある場合", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
    };
    vi.mocked(makeTogglApiClient).mockReturnValue(Effect.succeed(mockClient));

    const mockCache: Context.Tag.Service<CachePort> = {
      get: vi.fn((key: string) =>
        key === "Development" ? Effect.succeed("123") : Effect.succeed(undefined),
      ),
      put: vi.fn(() => Effect.void),
    };

    const layer = TogglTrackAdapterLive("token", 1).pipe(
      Layer.provide(Layer.succeed(CachePort, mockCache)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* TimeTrackerPort;
        yield* port.startTimer(item);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("Development");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: item.title,
      projectId: Option.some(123),
      tags: item.tags,
    });
  });

  it("キャッシュにプロジェクトIDがない場合", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
    };
    vi.mocked(makeTogglApiClient).mockReturnValue(Effect.succeed(mockClient));

    const mockCache: Context.Tag.Service<CachePort> = {
      get: vi.fn(() => Effect.succeed(undefined)),
      put: vi.fn(() => Effect.void),
    };

    const layer = TogglTrackAdapterLive("token", 1).pipe(
      Layer.provide(Layer.succeed(CachePort, mockCache)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* TimeTrackerPort;
        yield* port.startTimer(item);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("Development");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: item.title,
      projectId: Option.none(),
      tags: item.tags,
    });
  });

  it("キャッシュの取得に失敗した場合（catchAll のパスを通す）", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
    };
    vi.mocked(makeTogglApiClient).mockReturnValue(Effect.succeed(mockClient));

    const mockCache: Context.Tag.Service<CachePort> = {
      get: vi.fn(() => Effect.fail(new CacheError({ message: "cache error" }))),
      put: vi.fn(() => Effect.void),
    };

    const layer = TogglTrackAdapterLive("token", 1).pipe(
      Layer.provide(Layer.succeed(CachePort, mockCache)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* TimeTrackerPort;
        yield* port.startTimer(item);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("Development");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: item.title,
      projectId: Option.none(),
      tags: item.tags,
    });
  });
});
