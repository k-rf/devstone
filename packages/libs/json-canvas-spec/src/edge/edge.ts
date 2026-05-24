import { Schema } from "effect";

import { NodeId } from "../node/node-id.js";
import { ColorType } from "../shared/color-type.js";

const SideTypeSchema = Schema.Literal("top", "right", "bottom", "left");
const EndTypeSchema = Schema.Literal("none", "arrow");

export const Edge = Schema.Struct({
  id: Schema.String,
  fromNode: NodeId,
  fromSide: Schema.optional(SideTypeSchema),
  fromEnd: Schema.optional(EndTypeSchema),
  toNode: NodeId,
  toSide: Schema.optional(SideTypeSchema),
  toEnd: Schema.optional(EndTypeSchema),
  color: ColorType,
  label: Schema.optional(Schema.String),
});
export type Edge = typeof Edge.Type;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

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
}
