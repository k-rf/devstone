import { Effect, Layer, Option, type Context } from "effect";
import { describe, expect, it, vi } from "vitest";

import { type TrackingEntry } from "../../../core/domain/tracking-entry";
import { CacheError, CachePort } from "../../../core/port/outbound/cloudflare/cache.port";
import { TimeTrackerPort } from "../../../core/port/outbound/toggl/time-tracker.port";

import { makeTogglApiClient, type TogglApiClient } from "./toggl-api.client";
import { TogglTrackAdapterLive } from "./toggl-track.adapter";

vi.mock("./toggl-api.client");

const entry: TrackingEntry = {
  description: "Test Task",
  category: Option.some("Client / Project"),
  tags: ["tag1", "tag2"],
  startTime: Option.none(),
  endTime: Option.none(),
};

describe("正常系", () => {
  it("キャッシュにプロジェクトIDがある場合", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
      getClients: vi.fn(() => Effect.succeed([])),
      getProjects: vi.fn(() => Effect.succeed([])),
    };
    vi.mocked(makeTogglApiClient).mockReturnValue(Effect.succeed(mockClient));

    const mockCache: Context.Tag.Service<CachePort> = {
      get: vi.fn((key: string) =>
        key === "Project" ? Effect.succeed("123") : Effect.succeed(undefined),
      ),
      put: vi.fn(() => Effect.void),
    };

    const layer = TogglTrackAdapterLive("token", 1).pipe(
      Layer.provide(Layer.succeed(CachePort, mockCache)),
    );

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* TimeTrackerPort;
        yield* port.startTimer(entry);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("Project");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: entry.description,
      projectId: Option.some(123),
      tags: entry.tags,
    });
  });

  it("キャッシュにプロジェクトIDがない場合", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
      getClients: vi.fn(() => Effect.succeed([])),
      getProjects: vi.fn(() => Effect.succeed([])),
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
        yield* port.startTimer(entry);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("Project");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: entry.description,
      projectId: Option.none(),
      tags: entry.tags,
    });
  });

  it("キャッシュの取得に失敗した場合（catchAll のパスを通す）", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
      getClients: vi.fn(() => Effect.succeed([])),
      getProjects: vi.fn(() => Effect.succeed([])),
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
        yield* port.startTimer(entry);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("Project");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: entry.description,
      projectId: Option.none(),
      tags: entry.tags,
    });
  });

  it("カテゴリ形式が不正な場合、そのままの文字列で検索すること", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
      getClients: vi.fn(() => Effect.succeed([])),
      getProjects: vi.fn(() => Effect.succeed([])),
    };
    vi.mocked(makeTogglApiClient).mockReturnValue(Effect.succeed(mockClient));

    const mockCache: Context.Tag.Service<CachePort> = {
      get: vi.fn((key: string) =>
        key === "InvalidCategory" ? Effect.succeed("456") : Effect.succeed(undefined),
      ),
      put: vi.fn(() => Effect.void),
    };

    const layer = TogglTrackAdapterLive("token", 1).pipe(
      Layer.provide(Layer.succeed(CachePort, mockCache)),
    );

    const invalidEntry = { ...entry, category: Option.some("InvalidCategory") };

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* TimeTrackerPort;
        yield* port.startTimer(invalidEntry);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("InvalidCategory");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: entry.description,
      projectId: Option.some(456),
      tags: entry.tags,
    });
  });

  it("カテゴリが None の場合、空文字で検索すること", async () => {
    const mockClient: TogglApiClient = {
      startTimer: vi.fn(() => Effect.void),
      getClients: vi.fn(() => Effect.succeed([])),
      getProjects: vi.fn(() => Effect.succeed([])),
    };
    vi.mocked(makeTogglApiClient).mockReturnValue(Effect.succeed(mockClient));

    const mockCache: Context.Tag.Service<CachePort> = {
      get: vi.fn(() => Effect.succeed(undefined)),
      put: vi.fn(() => Effect.void),
    };

    const layer = TogglTrackAdapterLive("token", 1).pipe(
      Layer.provide(Layer.succeed(CachePort, mockCache)),
    );

    const noneEntry = { ...entry, category: Option.none() };

    await Effect.runPromise(
      Effect.gen(function* () {
        const port = yield* TimeTrackerPort;
        yield* port.startTimer(noneEntry);
      }).pipe(Effect.provide(layer)),
    );

    expect(mockCache.get).toHaveBeenCalledWith("");
    expect(mockClient.startTimer).toHaveBeenCalledWith({
      title: entry.description,
      projectId: Option.none(),
      tags: entry.tags,
    });
  });
});
