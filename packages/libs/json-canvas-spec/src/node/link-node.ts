import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const LinkNode = NodeStruct("link", {
  url: Schema.String,
});
export type LinkNode = typeof LinkNode.Type;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("正常系", () => {
    it("正しいリンクノードをデコードできること", () => {
      const data = {
        id: "link-1",
        type: "link" as const,
        x: 50,
        y: 50,
        width: 200,
        height: 80,
        url: "https://example.com",
      };
      const result = Schema.decodeSync(LinkNode)(data);
      expect(result).toEqual(data);
    });
  });

  describe("異常系", () => {
    it("必須プロパティ（url）が欠落している場合にエラーをスローすること", () => {
      const invalidData = {
        id: "link-1",
        type: "link" as const,
        x: 50,
        y: 50,
        width: 200,
        height: 80,
      };
      expect(() => Schema.decodeUnknownSync(LinkNode)(invalidData)).toThrow();
    });
  });
}
