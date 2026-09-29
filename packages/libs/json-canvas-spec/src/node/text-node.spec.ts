import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { TextNode } from "./text-node.js";

describe("正常系", () => {
  it("正しいテキストノードをデコードできること", () => {
    const data = {
      id: "text-1",
      type: "text" as const,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      text: "hello",
      color: "1" as const,
    };
    const result = Schema.decodeSync(TextNode)(data);
    expect(result).toEqual(data);
  });
});

describe("異常系", () => {
  it("必須プロパティ（text）が欠落している場合にエラーをスローすること", () => {
    const invalidData = {
      id: "text-1",
      type: "text" as const,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
    expect(() => Schema.decodeUnknownSync(TextNode)(invalidData)).toThrow();
  });
});
