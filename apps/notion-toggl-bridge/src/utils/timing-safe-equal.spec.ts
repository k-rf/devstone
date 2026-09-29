import { describe, expect, it, vi } from "vitest";

import { timingSafeEqual } from "./timing-safe-equal.js";

describe("正常系", () => {
  it("内容が同じ場合に true を返すこと", async () => {
    expect(await timingSafeEqual("abc", "abc")).toBe(true);
  });
});

describe("異常系", () => {
  it("内容が異なる場合に false を返すこと", async () => {
    expect(await timingSafeEqual("abc", "def")).toBe(false);
  });

  it("長さが異なる場合（内部バッファ長が異なる場合）に false を返すこと", async () => {
    // crypto.subtle.sign をモックして異なる長さのバッファを返させる
    const signSpy = vi.spyOn(crypto.subtle, "sign");
    // 1回目は32バイト、2回目は16バイトを返させる
    signSpy
      .mockResolvedValueOnce(new Uint8Array(32).buffer)
      .mockResolvedValueOnce(new Uint8Array(16).buffer);

    const result = await timingSafeEqual("short", "longer-input");
    expect(result).toBe(false);
    signSpy.mockRestore();
  });
});
