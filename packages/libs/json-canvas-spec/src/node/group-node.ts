import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const GroupNode = NodeStruct("group", {
  label: Schema.optional(Schema.String),
  background: Schema.optional(Schema.String).annotations({
    description: "path to the background image.",
  }),
  backgroundStyle: Schema.optional(Schema.Literal("cover", "ratio", "repeat")),
  nodes: Schema.optional(Schema.Array(Schema.String)),
});
export type GroupNode = typeof GroupNode.Type;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

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
}
