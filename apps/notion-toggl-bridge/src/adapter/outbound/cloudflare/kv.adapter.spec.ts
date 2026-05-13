/* eslint-disable unicorn/no-null -- Cloudflare KVNamespace.get は key 未存在時に null を返す */

import { Effect } from "effect";
import { describe, expect, it, vi } from "vitest";

import { CachePort } from "../../../core/port/outbound/cloudflare/cache.port";

import { KvAdapterLive, type KVNamespace } from "./kv.adapter";

describe("正常系", () => {
  it("get: 値が存在する場合、その値を返すこと", async () => {
    const mockKv: KVNamespace = {
      get: vi.fn().mockResolvedValue("test-value"),
      put: vi.fn().mockResolvedValue(undefined),
    };
    const layer = KvAdapterLive(mockKv);

    const program = Effect.gen(function* () {
      const port = yield* CachePort;
      return yield* port.get("test-key");
    }).pipe(Effect.provide(layer));

    const result = await Effect.runPromise(program);

    expect(result).toBe("test-value");
    expect(mockKv.get).toHaveBeenCalledWith("test-key");
  });

  it("get: 値が存在しない場合（KV が null を返す）、undefined を返すこと", async () => {
    const layer = KvAdapterLive({
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    });

    const program = Effect.gen(function* () {
      const port = yield* CachePort;
      return yield* port.get("test-key");
    }).pipe(Effect.provide(layer));

    const result = await Effect.runPromise(program);

    expect(result).toBeUndefined();
  });

  it("put: 値を正常に保存できること", async () => {
    const mockKv: KVNamespace = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };
    const layer = KvAdapterLive(mockKv);

    const program = Effect.gen(function* () {
      const port = yield* CachePort;
      yield* port.put("test-key", "test-value", 3600);
    }).pipe(Effect.provide(layer));

    await Effect.runPromise(program);

    expect(mockKv.put).toHaveBeenCalledWith("test-key", "test-value", {
      expirationTtl: 3600,
    });
  });

  it("put: TTLなしで値を正常に保存できること", async () => {
    const mockKv: KVNamespace = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };
    const layer = KvAdapterLive(mockKv);

    const program = Effect.gen(function* () {
      const port = yield* CachePort;
      yield* port.put("test-key", "test-value");
    }).pipe(Effect.provide(layer));

    await Effect.runPromise(program);

    expect(mockKv.put).toHaveBeenCalledWith("test-key", "test-value", {});
  });
});

describe("異常系", () => {
  it("get: エラーが発生した場合、CacheError を返すこと", async () => {
    const layer = KvAdapterLive({
      get: vi.fn().mockRejectedValue(new Error("KV Error")),
      put: vi.fn().mockResolvedValue(undefined),
    });

    const program = Effect.gen(function* () {
      const port = yield* CachePort;
      return yield* port.get("test-key");
    }).pipe(Effect.provide(layer));

    const result = Effect.runPromiseExit(program);
    await expect(result).resolves.toMatchObject({
      _tag: "Failure",
    });
  });

  it("put: エラーが発生した場合、CacheError を返すこと", async () => {
    const layer = KvAdapterLive({
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockRejectedValue(new Error("KV Error")),
    });

    const program = Effect.gen(function* () {
      const port = yield* CachePort;
      yield* port.put("test-key", "test-value");
    }).pipe(Effect.provide(layer));

    const result = Effect.runPromiseExit(program);
    await expect(result).resolves.toMatchObject({
      _tag: "Failure",
    });
  });
});
