import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { Edge } from "./edge.js";

describe("正常系", () => {
  it("正しいエッジをデコードできること", () => {
    const data = {
      id: "edge-1",
      fromNode: "text-1",
      fromSide: "right" as const,
      fromEnd: "arrow" as const,
      toNode: "file-1",
      toSide: "left" as const,
      toEnd: "none" as const,
      color: "6" as const,
      label: "connects",
    };
    const result = Schema.decodeSync(Edge)(data);
    expect(result).toEqual(data);
  });
});

describe("異常系", () => {
  it("無効なカラー指定がある場合にエラーをスローすること", () => {
    const invalidData = {
      id: "edge-1",
      fromNode: "text-1",
      toNode: "file-1",
      color: "invalid-color-value",
    };
    expect(() => Schema.decodeUnknownSync(Edge)(invalidData)).toThrow();
  });
});
