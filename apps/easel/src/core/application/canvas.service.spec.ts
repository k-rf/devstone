import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Option, Schema } from "effect";
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
      const program = updateNode({
        id: "node-1",
        type: "text",
        x: Option.some(15),
        y: Option.some(25),
        width: Option.some(100),
        height: Option.some(50),
        color: Option.none(),
        text: Option.some("Updated"),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      await Effect.runPromise(program);

      // Assert
      const foundNode = state.current.nodes?.find((n) => n.id === "node-1");

      assertTextNode(foundNode);
      expect(foundNode.text).toBe("Updated");
      expect(foundNode.x).toBe(15);
      expect(foundNode.y).toBe(25);
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
      const program = moveNode("node-1", {
        x: Option.none(),
        y: Option.none(),
        dx: Option.some(10),
        dy: Option.some(-5),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

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
      const program = updateEdge({
        id: "edge-1",
        fromNode: Option.some("node-1"),
        toNode: Option.some("node-2"),
        fromSide: Option.none(),
        toSide: Option.none(),
        fromEnd: Option.none(),
        toEnd: Option.none(),
        color: Option.some("3"),
        label: Option.some("Updated"),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

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
      const program = updateNode({
        id: "node-1",
        type: "text",
        x: Option.none(),
        y: Option.none(),
        width: Option.none(),
        height: Option.none(),
        color: Option.some("invalid-color-preset"), // 不正なカラー指定でスキーマ検証エラーを期待
        text: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("ノードデータの検証に失敗しました");
    });

    it("ノード更新時に対象のノードが見つからない場合にエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = updateNode({
        id: "non-existent-node",
        type: "text",
        x: Option.none(),
        y: Option.none(),
        width: Option.none(),
        height: Option.none(),
        color: Option.none(),
        text: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("のノードが見つかりませんでした");
    });

    it("ノード更新時にノードタイプが不一致の場合にエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = updateNode({
        id: "node-1", // node-1 は実際には text ノード
        type: "file", // file ノードとして更新しようとする
        x: Option.none(),
        y: Option.none(),
        width: Option.none(),
        height: Option.none(),
        color: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("は file ノードではありません");
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
      const program = updateEdge({
        id: "edge-1",
        fromNode: Option.none(),
        toNode: Option.none(),
        fromSide: Option.none(),
        toSide: Option.none(),
        fromEnd: Option.none(),
        toEnd: Option.none(),
        color: Option.some("invalid-color-preset"), // 不正なカラー指定でスキーマ検証エラーを期待
        label: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("エッジデータの検証に失敗しました");
    });

    it("エッジ更新時に対象のエッジが見つからない場合にエラーを返すこと", async () => {
      // Arrange
      const state = { current: { ...initialCanvas } };
      const program = updateEdge({
        id: "non-existent-edge",
        fromNode: Option.none(),
        toNode: Option.none(),
        fromSide: Option.none(),
        toSide: Option.none(),
        fromEnd: Option.none(),
        toEnd: Option.none(),
        color: Option.none(),
        label: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      // Act
      const error = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("のエッジが見つかりませんでした");
    });
  });
});
