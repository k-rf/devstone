import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { assertTextNode } from "../../test-utils/assert-node/assert-text-node.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

import {
  addEdge,
  addNode,
  getCanvasItem,
  listCanvasItems,
  moveNode,
  removeEdge,
  removeNode,
  showCanvas,
  updateEdge,
  updateNode,
} from "./canvas.service.js";

// テスト用キャンバスの初期値
const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

// CanvasRepository ポートをインメモリでモックするヘルパー関数
const makeTestCanvasRepository = (canvasRef: { current: JsonCanvas }) =>
  Layer.succeed(
    CanvasRepository,
    CanvasRepository.of({
      read: () => Effect.sync(() => canvasRef.current),
      write: (canvas) =>
        Effect.sync(() => {
          canvasRef.current = canvas;
        }),
    }),
  );

describe("canvas application service", () => {
  describe("正常系", () => {
    it("アイテムを取得できること (get)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = getCanvasItem("node-1").pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const result = await Effect.runPromise(program);

      // Assert
      expect(result.type).toBe("node");
      expect(result.data.id).toBe("node-1");
    });

    it("キャンバスの全アイテムの一覧をフォーマットされた文字列で取得できること (listCanvasItems)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = listCanvasItems().pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const result = await Effect.runPromise(program);

      // Assert

      expect(result).toContain("=== Nodes ===");
      expect(result).toContain("- node-1 [text]");
      expect(result).toContain("- node-2 [file]");
      expect(result).toContain("=== Edges ===");
      expect(result).toContain("- edge-1 [node-1 -> node-2]");
    });

    it("キャンバスの全データをそのままダンプできること (showCanvas)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = showCanvas().pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const result = await Effect.runPromise(program);

      // Assert
      expect(result).toEqual(initialCanvas);
    });

    it("ノードを検証・追加できること (addNode)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const newNodeData = {
        id: "node-3",
        type: "text",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        text: "New",
      };
      const program = addNode(newNodeData).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const addedId = await Effect.runPromise(program);

      // Assert
      expect(addedId).toBe("node-3");
      expect(state.current.nodes?.length).toBe(3);
      expect(state.current.nodes?.find((n) => n.id === "node-3")).toEqual(newNodeData);
    });

    it("既存のノードを更新できること (updateNode)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const updatedNodeData = {
        id: "node-1",
        type: "text",
        x: 15,
        y: 25,
        width: 100,
        height: 50,
        text: "Updated",
      };
      const program = updateNode(updatedNodeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      await Effect.runPromise(program);

      // Assert
      const foundNode = state.current.nodes?.find((n) => n.id === "node-1");

      assertTextNode(foundNode);
      expect(foundNode.text).toBe("Updated");
    });

    it("ノードを削除できること (removeNode)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = removeNode("node-1").pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      await Effect.runPromise(program);

      // Assert
      expect(state.current.nodes?.length).toBe(1);
      expect(state.current.edges?.length).toBe(0); // 接続されていたエッジも消える
    });

    it("ノードを座標移動できること (moveNode)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = moveNode("node-1", { dx: 10, dy: -5 }).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      await Effect.runPromise(program);

      // Assert
      const node = state.current.nodes?.find((n) => n.id === "node-1");

      expect(node?.x).toBe(20);
      expect(node?.y).toBe(15);
    });

    it("エッジを検証・追加できること (addEdge)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const newEdgeData = { id: "edge-2", fromNode: "node-2", toNode: "node-1", color: "2" };
      const program = addEdge(newEdgeData).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const addedId = await Effect.runPromise(program);

      // Assert
      expect(addedId).toBe("edge-2");
      expect(state.current.edges?.length).toBe(2);
    });

    it("エッジを更新できること (updateEdge)", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const updatedEdgeData = {
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "3",
        label: "Updated",
      };
      const program = updateEdge(updatedEdgeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      await Effect.runPromise(program);

      // Assert
      expect(state.current.edges?.find((e) => e.id === "edge-1")?.color).toBe("3");
    });

    it("エッジを削除できること (removeEdge)", async () => {
      const state = { current: { ...initialCanvas } };
      const program = removeEdge("edge-1").pipe(Effect.provide(makeTestCanvasRepository(state)));
      await Effect.runPromise(program);
      expect(state.current.edges?.length).toBe(0);
    });
  });

  describe("異常系", () => {
    it("不正なノードデータの検証時にエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      // REMARKS: x, y などの必須属性を欠いた無効なノードデータ
      const invalidNodeData = { id: "node-3", type: "text" };
      const program = addNode(invalidNodeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("ノードデータの検証に失敗しました");
    });

    it("ノード更新時に不正なノードデータの検証でエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const invalidNodeData = { id: "node-1", type: "text" };
      const program = updateNode(invalidNodeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("ノードデータの検証に失敗しました");
    });

    it("不正なエッジデータの検証時にエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      // REMARKS: fromNode などを欠いた無効なエッジデータ
      const invalidEdgeData = { id: "edge-2", color: "1" };
      const program = addEdge(invalidEdgeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("エッジデータの検証に失敗しました");
    });

    it("エッジ更新時に不正なエッジデータの検証でエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const invalidEdgeData = { id: "edge-1", color: "1" };
      const program = updateEdge(invalidEdgeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("エッジデータの検証に失敗しました");
    });
  });
});
