import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { GroupNode } from "./group-node.js";

describe("正常系", () => {
  it("正しいグループノードをデコードできること", () => {
    const data = {
      id: "group-1",
      type: "group" as const,
      x: -100,
      y: -100,
      width: 300,
      height: 300,
      label: "My Group",
      background: "image.png",
      backgroundStyle: "cover" as const,
      nodes: ["text-1", "file-1"],
    };
    const result = Schema.decodeSync(GroupNode)(data);
    expect(result).toEqual(data);
  });
});

describe("異常系", () => {
  it("無効な背景画像スタイルが指定された場合にエラーをスローすること", () => {
    const invalidData = {
      id: "group-1",
      type: "group" as const,
      x: -100,
      y: -100,
      width: 300,
      height: 300,
      backgroundStyle: "invalid-style",
    };
    expect(() => Schema.decodeUnknownSync(GroupNode)(invalidData)).toThrow();
  });
});
