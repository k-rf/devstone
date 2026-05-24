import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const TextNode = NodeStruct("text", {
  text: Schema.String,
});

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

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
}
