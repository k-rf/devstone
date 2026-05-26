import { Edge, JsonCanvas, Node, NodeId } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { findNode } from "../../utils/find-node.js";

import { CanvasError } from "./errors.js";

/**
 * キャンバスにノードを追加または更新します。
 * すでに同一IDのノードが存在する場合は上書きします。
 * @param canvas - キャンバスデータ
 * @param node - 追加または更新するノードデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const addNode = (canvas: JsonCanvas, node: Node): Effect.Effect<JsonCanvas> =>
  Effect.sync(() => {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const index = nodes.findIndex((n) => n.id === node.id);
    if (index === -1) {
      nodes.push(node);
    } else {
      nodes[index] = node;
    }
    return { ...canvas, nodes: nodes };
  });

/**
 * 指定されたノードを更新します。
 * ノードが存在しない場合はエラーを返します。
 * @param canvas - キャンバスデータ
 * @param node - 更新するノードデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const updateNode = (
  canvas: JsonCanvas,
  node: Node,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const index = nodes.findIndex((n) => n.id === node.id);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${node.id}' のノードが見つかりませんでした` }),
      );
    }
    nodes[index] = node;
    return { ...canvas, nodes: nodes };
  });

/**
 * 指定されたノードを削除し、それに接続するすべてのエッジも追従して削除します。
 * ノードが存在しない場合はエラーを返します。
 * @param canvas - キャンバスデータ
 * @param nodeId - 削除するノードの ID
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const removeNode = (
  canvas: JsonCanvas,
  nodeId: string,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${nodeId}' のノードが見つかりませんでした` }),
      );
    }
    const filteredNodes = nodes.filter((n) => n.id !== nodeId);
    const edges = canvas.edges ? [...canvas.edges] : [];
    const filteredEdges = edges.filter((e) => e.fromNode !== nodeId && e.toNode !== nodeId);
    return {
      ...canvas,
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  });

/**
 * ノードを指定された座標に移動します。
 * オプションで x, y (絶対座標) または dx, dy (相対座標) を受け取ります。
 * @param canvas - キャンバスデータ
 * @param nodeId - 移動するノードの ID
 * @param options - 移動座標オプション
 * @param options.x - 移動先の絶対 X 座標
 * @param options.y - 移動先の絶対 Y 座標
 * @param options.dx - 相対移動する X 方向の距離
 * @param options.dy - 相対移動する Y 方向の距離
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const moveNode = (
  canvas: JsonCanvas,
  nodeId: NodeId,
  options: { x?: number; y?: number; dx?: number; dy?: number },
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const [node, index] = findNode(nodes, nodeId);

    if (node === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${nodeId}' のノードが見つかりませんでした` }),
      );
    }

    let nextX = node.x;
    let nextY = node.y;

    if (options.x !== undefined) {
      nextX = options.x;
    } else if (options.dx !== undefined) {
      nextX += options.dx;
    }

    if (options.y !== undefined) {
      nextY = options.y;
    } else if (options.dy !== undefined) {
      nextY += options.dy;
    }

    const updatedNode = {
      ...node,
      x: nextX,
      y: nextY,
    };

    return {
      ...canvas,
      nodes: [...nodes.slice(0, index), updatedNode, ...nodes.slice(index + 1)],
    };
  });

/**
 * キャンバスにエッジを追加します。
 * 接続元および接続先のノードが実在することを確認します。
 * @param canvas - キャンバスデータ
 * @param edge - 追加するエッジデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const addEdge = (canvas: JsonCanvas, edge: Edge): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ?? [];
    const fromExists = nodes.some((n) => n.id === edge.fromNode);
    const toExists = nodes.some((n) => n.id === edge.toNode);

    if (!fromExists) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続元ノード '${edge.fromNode}' が見つかりませんでした`,
        }),
      );
    }
    if (!toExists) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続先ノード '${edge.toNode}' が見つかりませんでした`,
        }),
      );
    }

    const edges = canvas.edges ? [...canvas.edges] : [];
    const index = edges.findIndex((e) => e.id === edge.id);
    if (index === -1) {
      edges.push(edge);
    } else {
      edges[index] = edge;
    }
    return { ...canvas, edges: edges };
  });

/**
 * キャンバスのエッジを更新します。
 * 接続元および接続先のノードが実在することを確認します。
 * @param canvas - キャンバスデータ
 * @param edge - 更新するエッジデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const updateEdge = (
  canvas: JsonCanvas,
  edge: Edge,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const edges = canvas.edges ? [...canvas.edges] : [];
    const index = edges.findIndex((e) => e.id === edge.id);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${edge.id}' のエッジが見つかりませんでした` }),
      );
    }

    const nodes = canvas.nodes ?? [];
    const fromExists = nodes.some((n) => n.id === edge.fromNode);
    const toExists = nodes.some((n) => n.id === edge.toNode);

    if (!fromExists) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続元ノード '${edge.fromNode}' が見つかりませんでした`,
        }),
      );
    }
    if (!toExists) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続先ノード '${edge.toNode}' が見つかりませんでした`,
        }),
      );
    }

    edges[index] = edge;
    return { ...canvas, edges: edges };
  });

/**
 * 指定されたエッジを削除します。
 * エッジが存在しない場合はエラーを返します。
 * @param canvas - キャンバスデータ
 * @param edgeId - 削除するエッジの ID
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const removeEdge = (
  canvas: JsonCanvas,
  edgeId: string,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const edges = canvas.edges ? [...canvas.edges] : [];
    const index = edges.findIndex((e) => e.id === edgeId);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${edgeId}' のエッジが見つかりませんでした` }),
      );
    }
    const filteredEdges = edges.filter((e) => e.id !== edgeId);
    return { ...canvas, edges: filteredEdges };
  });

/**
 * ID で指定されたノードまたはエッジを取得します。
 * @param canvas - キャンバスデータ
 * @param id - 取得するアイテムの ID
 * @returns 取得されたアイテムのデータを表す Effect
 */
export const getCanvasItem = (
  canvas: JsonCanvas,
  id: string,
): Effect.Effect<
  { readonly type: "node"; readonly data: Node } | { readonly type: "edge"; readonly data: Edge },
  CanvasError
> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ?? [];
    const foundNode = nodes.find((n) => n.id === id);
    if (foundNode !== undefined) {
      return { type: "node" as const, data: foundNode };
    }

    const edges = canvas.edges ?? [];
    const foundEdge = edges.find((e) => e.id === id);
    if (foundEdge !== undefined) {
      return { type: "edge" as const, data: foundEdge };
    }

    return yield* Effect.fail(
      new CanvasError({ message: `ID '${id}' を持つノードまたはエッジが見つかりませんでした` }),
    );
  });

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
    nodes: [
      { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
      { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
    ],
    edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
  });

  describe("正常系", () => {
    it("新規ノードを追加できること", () => {
      const newNode = Schema.decodeUnknownSync(Node)({
        id: "node-3",
        type: "text",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        text: "New",
      });
      const program = addNode(initialCanvas, newNode);
      const result = Effect.runSync(program);
      expect(result.nodes?.length).toBe(3);
      expect(result.nodes?.find((n) => n.id === "node-3")).toEqual(newNode);
    });

    it("既存のノードを上書きできること", () => {
      const updatedNode = Schema.decodeUnknownSync(Node)({
        id: "node-1",
        type: "text",
        x: 15,
        y: 25,
        width: 100,
        height: 50,
        text: "Updated",
      });
      const program = addNode(initialCanvas, updatedNode);
      const result = Effect.runSync(program);
      expect(result.nodes?.length).toBe(2);
      const foundNode = result.nodes?.find((n) => n.id === "node-1");
      expect(foundNode).toBeDefined();
      if (foundNode?.type === "text") {
        expect(foundNode.text).toBe("Updated");
      } else {
        throw new Error("expected text node");
      }
    });

    it("既存のノードを更新できること", () => {
      const updatedNode = Schema.decodeUnknownSync(Node)({
        id: "node-1",
        type: "text",
        x: 15,
        y: 25,
        width: 100,
        height: 50,
        text: "Updated",
      });
      const program = updateNode(initialCanvas, updatedNode);
      const result = Effect.runSync(program);
      const foundNode = result.nodes?.find((n) => n.id === "node-1");
      expect(foundNode).toBeDefined();
      if (foundNode?.type === "text") {
        expect(foundNode.text).toBe("Updated");
      } else {
        throw new Error("expected text node");
      }
    });

    it("ノードを削除すると、接続されているエッジも追従して削除されること", () => {
      const program = removeNode(initialCanvas, "node-1");
      const result = Effect.runSync(program);
      expect(result.nodes?.length).toBe(1);
      expect(result.nodes?.some((n) => n.id === "node-1")).toBe(false);
      expect(result.edges?.length).toBe(0);
    });

    it("絶対座標でノードを移動できること", () => {
      const program = moveNode(initialCanvas, NodeId.make("node-1"), { x: 50, y: 60 });
      const result = Effect.runSync(program);
      const node = result.nodes?.find((n) => n.id === "node-1");
      expect(node?.x).toBe(50);
      expect(node?.y).toBe(60);
    });

    it("相対座標でノードを移動できること", () => {
      const program = moveNode(initialCanvas, NodeId.make("node-1"), { dx: 10, dy: -5 });
      const result = Effect.runSync(program);
      const node = result.nodes?.find((n) => n.id === "node-1");
      expect(node?.x).toBe(20);
      expect(node?.y).toBe(15);
    });

    it("座標を指定せずにノードを移動した場合、座標が変わらないこと", () => {
      const program = moveNode(initialCanvas, NodeId.make("node-1"), {});
      const result = Effect.runSync(program);
      const node = result.nodes?.find((n) => n.id === "node-1");
      expect(node?.x).toBe(10);
      expect(node?.y).toBe(20);
    });

    it("接続元と接続先が両方存在する場合、エッジを追加できること", () => {
      const newEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-2",
        fromNode: "node-2",
        toNode: "node-1",
        color: "2",
      });
      const program = addEdge(initialCanvas, newEdge);
      const result = Effect.runSync(program);
      expect(result.edges?.length).toBe(2);
      expect(result.edges?.find((e) => e.id === "edge-2")).toEqual(newEdge);
    });

    it("既存のエッジIDを指定して追加した場合、上書きされること", () => {
      const updatedEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "4",
      });
      const program = addEdge(initialCanvas, updatedEdge);
      const result = Effect.runSync(program);
      expect(result.edges?.length).toBe(1);
      expect(result.edges?.find((e) => e.id === "edge-1")?.color).toBe("4");
    });

    it("エッジを更新できること", () => {
      const updatedEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "3",
        label: "Updated",
      });
      const program = updateEdge(initialCanvas, updatedEdge);
      const result = Effect.runSync(program);
      expect(result.edges?.find((e) => e.id === "edge-1")?.color).toBe("3");
    });

    it("エッジを削除できること", () => {
      const program = removeEdge(initialCanvas, "edge-1");
      const result = Effect.runSync(program);
      expect(result.edges?.length).toBe(0);
    });

    it("IDでノードを取得できること", () => {
      const program = getCanvasItem(initialCanvas, "node-1");
      const result = Effect.runSync(program);
      expect(result.type).toBe("node");
      expect(result.data.id).toBe("node-1");
    });

    it("IDでエッジを取得できること", () => {
      const program = getCanvasItem(initialCanvas, "edge-1");
      const result = Effect.runSync(program);
      expect(result.type).toBe("edge");
      expect(result.data.id).toBe("edge-1");
    });
  });

  describe("異常系", () => {
    it("存在しないノードの更新はエラーになること", async () => {
      const nonExistentNode = Schema.decodeUnknownSync(Node)({
        id: "node-999",
        type: "text",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        text: "No",
      });
      const program = updateNode(initialCanvas, nonExistentNode);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });

    it("キャンバスのノード一覧が存在しない状態でノード更新を試みた場合、エラーになること", async () => {
      const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({});
      const nonExistentNode = Schema.decodeUnknownSync(Node)({
        id: "node-999",
        type: "text",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        text: "No",
      });
      const program = updateNode(noNodesCanvas, nonExistentNode);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });

    it("存在しないノードの削除はエラーになること", async () => {
      const program = removeNode(initialCanvas, "node-999");
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });

    it("存在しないノードの移動はエラーになること", async () => {
      const program = moveNode(initialCanvas, NodeId.make("node-999"), { x: 0 });
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });

    it("キャンバスのノード一覧が存在しない状態でノード移動を試みた場合、エラーになること", async () => {
      const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({});
      const program = moveNode(noNodesCanvas, NodeId.make("node-999"), { x: 0 });
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });

    it("接続元ノードが存在しない場合のエッジ追加はエラーになること", async () => {
      const invalidEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-2",
        fromNode: "node-999",
        toNode: "node-2",
        color: "1",
      });
      const program = addEdge(initialCanvas, invalidEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続元ノード 'node-999' が見つかりませんでした");
    });

    it("接続先ノードが存在しない場合のエッジ追加はエラーになること", async () => {
      const invalidEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-2",
        fromNode: "node-1",
        toNode: "node-999",
        color: "1",
      });
      const program = addEdge(initialCanvas, invalidEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続先ノード 'node-999' が見つかりませんでした");
    });

    it("存在しないエッジの更新はエラーになること", async () => {
      const nonExistentEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-999",
        fromNode: "node-1",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(initialCanvas, nonExistentEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'edge-999' のエッジが見つかりませんでした");
    });

    it("接続元ノードが存在しない場合のエッジ更新はエラーになること", async () => {
      const invalidEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-999",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(initialCanvas, invalidEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続元ノード 'node-999' が見つかりませんでした");
    });

    it("接続先ノードが存在しない場合のエッジ更新はエラーになること", async () => {
      const invalidEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-999",
        color: "1",
      });
      const program = updateEdge(initialCanvas, invalidEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続先ノード 'node-999' が見つかりませんでした");
    });

    it("キャンバスのエッジ一覧が存在しない状態でエッジ更新を試みた場合、エラーになること", async () => {
      const noEdgesCanvas = Schema.decodeUnknownSync(JsonCanvas)({
        nodes: [
          { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
        ],
      });
      const someEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(noEdgesCanvas, someEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'edge-1' のエッジが見つかりませんでした");
    });

    it("キャンバスのノード一覧が存在しない状態でエッジ更新を試みた場合、エラーになること", async () => {
      const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({
        edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
      });
      const updatedEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(noNodesCanvas, updatedEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続元ノード 'node-1' が見つかりませんでした");
    });

    it("存在しないエッジの削除はエラーになること", async () => {
      const program = removeEdge(initialCanvas, "edge-999");
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'edge-999' のエッジが見つかりませんでした");
    });

    it("存在しないIDの取得はエラーになること", async () => {
      const program = getCanvasItem(initialCanvas, "non-existent");
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe(
        "ID 'non-existent' を持つノードまたはエッジが見つかりませんでした",
      );
    });
  });
}
