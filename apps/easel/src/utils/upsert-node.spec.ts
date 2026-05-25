import { NodeId, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { upsertNode } from "./upsert-node.js";

describe("正常系", () => {
  it("nodes が undefined または存在しない場合でも新規ノードを追加できること", async () => {
    let writtenData = "";
    const mockFs = FileSystem.layerNoop({
      writeFileString: (_path, data) => {
        writtenData = data;
        return Effect.void;
      },
    });

    const canvas: JsonCanvas = {}; // nodes が存在しないキャンバス状態
    const nodeData = {
      id: Schema.decodeSync(NodeId)("node-1"),
      type: "text" as const,
      x: 10,
      y: 20,
      width: 100,
      height: 100,
      text: "hello",
    };

    const program = upsertNode("test.canvas", canvas, nodeData).pipe(Effect.provide(mockFs));
    await Effect.runPromise(program);

    const parsed = JSON.parse(writtenData) as JsonCanvas;
    expect(parsed.nodes).toBeDefined();
    expect(parsed.nodes?.length).toBe(1);
    expect(parsed.nodes?.[0]).toEqual({
      ...nodeData,
      id: "node-1",
    });
  });

  it("既存のノード ID が存在しない場合、新規にノードが追加されること", async () => {
    let writtenData = "";
    const mockFs = FileSystem.layerNoop({
      writeFileString: (_path, data) => {
        writtenData = data;
        return Effect.void;
      },
    });

    const canvas: JsonCanvas = {
      nodes: [
        {
          id: Schema.decodeSync(NodeId)("node-1"),
          type: "text",
          x: 10,
          y: 20,
          width: 100,
          height: 100,
          text: "hello",
        },
      ],
    };

    const nodeData = {
      id: Schema.decodeSync(NodeId)("node-2"),
      type: "text" as const,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      text: "world",
    };

    const program = upsertNode("test.canvas", canvas, nodeData).pipe(Effect.provide(mockFs));
    await Effect.runPromise(program);

    const parsed = JSON.parse(writtenData) as JsonCanvas;
    expect(parsed.nodes?.length).toBe(2);
    expect(parsed.nodes?.[1]).toEqual({
      ...nodeData,
      id: "node-2",
    });
  });

  it("既存のノード ID が存在する場合、そのノード情報が更新されること", async () => {
    let writtenData = "";
    const mockFs = FileSystem.layerNoop({
      writeFileString: (_path, data) => {
        writtenData = data;
        return Effect.void;
      },
    });

    const canvas: JsonCanvas = {
      nodes: [
        {
          id: Schema.decodeSync(NodeId)("node-1"),
          type: "text",
          x: 10,
          y: 20,
          width: 100,
          height: 100,
          text: "hello",
        },
      ],
    };

    const updatedNodeData = {
      id: Schema.decodeSync(NodeId)("node-1"),
      type: "text" as const,
      x: 15,
      y: 25,
      width: 110,
      height: 110,
      text: "updated hello",
    };

    const program = upsertNode("test.canvas", canvas, updatedNodeData).pipe(Effect.provide(mockFs));
    await Effect.runPromise(program);

    const parsed = JSON.parse(writtenData) as JsonCanvas;
    expect(parsed.nodes?.length).toBe(1);
    expect(parsed.nodes?.[0]).toEqual({
      ...updatedNodeData,
      id: "node-1",
    });
  });
});

describe("異常系", () => {
  it("ノードデータが Node スキーマに合致しない場合、バリデーションエラーになること", async () => {
    const mockFs = FileSystem.layerNoop({
      writeFileString: () => Effect.void,
    });

    const canvas: JsonCanvas = { nodes: [] };
    const invalidNodeData = {
      id: Schema.decodeSync(NodeId)("node-1"),
      type: "text" as const,
      // x, y, width, height が欠けているためスキーマエラー
    };

    const program = upsertNode("test.canvas", canvas, invalidNodeData).pipe(
      Effect.provide(mockFs),
      Effect.flip,
    );
    const error = await Effect.runPromise(program);

    expect(error.message).toContain("ノードデータの検証に失敗しました");
  });
});
