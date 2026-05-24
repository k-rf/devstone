import { describe, expectTypeOf, it } from "vitest";

import { type Edge } from "./edge/edge.js";
import { type JsonCanvas } from "./json-canvas.js";
import { type NodeId } from "./node/node-id.js";
import { type Node } from "./node/node.js";

describe("正常系", () => {
  it("JsonCanvasが期待するノードおよびエッジのプロパティ構造と完全に一致すること", () => {
    expectTypeOf<JsonCanvas>().toEqualTypeOf<{
      readonly nodes?: readonly Node[] | undefined;
      readonly edges?: readonly Edge[] | undefined;
    }>();
  });

  it("空のオブジェクト、またはnodes/edgesのみのオブジェクトがJsonCanvas型を満たすこと", () => {
    expectTypeOf({}).toExtend<JsonCanvas>();
    expectTypeOf({ nodes: [] }).toExtend<JsonCanvas>();
    expectTypeOf({ edges: [] }).toExtend<JsonCanvas>();
    expectTypeOf({ nodes: [], edges: [] }).toExtend<JsonCanvas>();
  });

  it("具体的なテキスト/ファイル/リンク/グループの各ノードがJsonCanvasのノードリストに適合すること", () => {
    expectTypeOf({
      nodes: [
        {
          id: "text-1" as NodeId,
          type: "text" as const,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          text: "hello",
        },
        {
          id: "file-1" as NodeId,
          type: "file" as const,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          file: "doc.md",
          subpath: "#section-1" as const,
        },
        {
          id: "link-1" as NodeId,
          type: "link" as const,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          url: "https://example.com",
        },
        {
          id: "group-1" as NodeId,
          type: "group" as const,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          label: "My Group",
          background: "bg.png",
          backgroundStyle: "cover" as const,
          nodes: ["text-1"],
        },
      ],
    }).toExtend<JsonCanvas>();
  });

  it("正常なエッジのオブジェクトがJsonCanvasのエッジリストに適合すること", () => {
    expectTypeOf({
      edges: [
        {
          id: "edge-1",
          fromNode: "node-1" as NodeId,
          fromSide: "left" as const,
          fromEnd: "arrow" as const,
          toNode: "node-2" as NodeId,
          toSide: "right" as const,
          toEnd: "none" as const,
          color: "1" as const, // red
          label: "connects",
        },
        {
          id: "edge-2",
          fromNode: "node-2" as NodeId,
          toNode: "node-3" as NodeId,
          color: "#ff0000" as const,
        },
      ],
    }).toExtend<JsonCanvas>();
  });
});

describe("異常系", () => {
  it("必須フィールドが欠落しているノードがJsonCanvas型を満たさないこと", () => {
    expectTypeOf({
      nodes: [
        {
          id: "text-1" as NodeId,
          type: "text" as const,
          x: 0,
          y: 0,
          // width と height が欠落
          text: "hello",
        },
      ],
    }).not.toExtend<JsonCanvas>();
  });

  it("無効な型の値（textに数値など）を持つノードがJsonCanvas型を満たさないこと", () => {
    expectTypeOf({
      nodes: [
        {
          id: "text-1" as NodeId,
          type: "text" as const,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          text: 123, // 文字列であるべき
        },
      ],
    }).not.toExtend<JsonCanvas>();
  });

  it("無効なカラー指定を持つエッジがJsonCanvas型を満たさないこと", () => {
    expectTypeOf({
      edges: [
        {
          id: "edge-1",
          fromNode: "node-1" as NodeId,
          toNode: "node-2" as NodeId,
          color: "7", // 無効なカラーリテラル
        },
      ],
    }).not.toExtend<JsonCanvas>();
  });
});
