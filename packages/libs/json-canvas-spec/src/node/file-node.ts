import { Schema } from "effect";

import { NodeStruct } from "./node-struct.js";

export const FileNode = NodeStruct("file", {
  file: Schema.String,
  subpath: Schema.optional(Schema.TemplateLiteral("#", Schema.String)),
});
export type FileNode = typeof FileNode.Type;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("正常系", () => {
    it("正しいファイルノードをデコードできること", () => {
      const data = {
        id: "file-1",
        type: "file" as const,
        x: 10,
        y: 20,
        width: 150,
        height: 150,
        file: "document.pdf",
        subpath: "#page=2" as const,
        color: "#00ff00" as const,
      };
      const result = Schema.decodeSync(FileNode)(data);
      expect(result).toEqual(data);
    });
  });

  describe("異常系", () => {
    it("必須プロパティ（file）が欠落している場合にエラーをスローすること", () => {
      const invalidData = {
        id: "file-1",
        type: "file" as const,
        x: 10,
        y: 20,
        width: 150,
        height: 150,
      };
      expect(() => Schema.decodeUnknownSync(FileNode)(invalidData)).toThrow();
    });
  });
}
