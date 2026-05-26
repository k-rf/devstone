import {
  Edge as EdgeSchema,
  Node as NodeSchema,
  type JsonCanvas,
} from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import * as Domain from "../domain/canvas/index.js";
import { CanvasError } from "../domain/errors.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

export { updateNodeWorkflow as updateNode } from "./update-node.workflow.js";
export { moveNodeWorkflow as moveNode } from "./move-node.workflow.js";
export { updateEdgeWorkflow as updateEdge } from "./update-edge.workflow.js";

/**
 * ID で指定されたノードまたはエッジを取得します。
 * @param id - 取得するアイテムの ID
 * @returns 取得されたノードまたはエッジのデータを示す Effect
 */
export const getCanvasItem = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();
    return yield* Domain.getCanvasItem(canvas, id);
  });

/**
 * キャンバスに含まれるすべてのアイテム情報をフォーマットされたテキスト表現で取得します。
 * @returns ノードおよびエッジの一覧がフォーマットされた文字列を示す Effect
 */
export const listCanvasItems = (): Effect.Effect<string, CanvasError, CanvasRepository> =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();

    const nodes = canvas.nodes ?? [];
    const edges = canvas.edges ?? [];

    const nodesOutput =
      nodes.length === 0
        ? "(No nodes)\n"
        : nodes.map((n) => `- ${n.id} [${n.type}]`).join("\n") + "\n";

    const edgesOutput =
      edges.length === 0
        ? "(No edges)\n"
        : edges
            .map((e) => {
              const sideInfo =
                e.fromSide !== undefined || e.toSide !== undefined
                  ? ` (${e.fromSide ?? "any"} -> ${e.toSide ?? "any"})`
                  : "";
              return `- ${e.id} [${e.fromNode} -> ${e.toNode}]${sideInfo}`;
            })
            .join("\n") + "\n";

    return `=== Nodes ===\n${nodesOutput}\n=== Edges ===\n${edgesOutput}`;
  });

/**
 * キャンバスの全データをそのまま（ダンプ用）取得します。
 * @returns キャンバスの生データ全体を示す Effect
 */
export const showCanvas = (): Effect.Effect<JsonCanvas, CanvasError, CanvasRepository> =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    return yield* repo.read();
  });

/**
 * ノードを検証・追加し、更新されたキャンバスを保存します。
 * @param nodeData - 追加する未検証のノードデータ
 * @returns 追加されたノードの ID を示す Effect
 */
export const addNode = (nodeData: unknown) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();

    const validated = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(NodeSchema)(nodeData),
      catch: (error) =>
        new CanvasError({
          message: `ノードデータの検証に失敗しました: ${(error as Error).message}`,
          cause: error,
        }),
    });

    const updatedCanvas = yield* Domain.addNode(canvas, validated);
    yield* repo.write(updatedCanvas);
    return validated.id;
  });

/**
 * ノードを削除し（関連エッジも含む）、キャンバスを保存します。
 * @param id - 削除するノードの ID
 * @returns 処理完了を示す Effect
 */
export const removeNode = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();
    const updatedCanvas = yield* Domain.removeNode(canvas, id);
    yield* repo.write(updatedCanvas);
  });

/**
 * エッジを検証・追加し、更新されたキャンバスを保存します。
 * @param edgeData - 追加する未検証のエッジデータ
 * @returns 追加されたエッジの ID を示す Effect
 */
export const addEdge = (edgeData: unknown) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();

    const validated = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(EdgeSchema)(edgeData),
      catch: (error) =>
        new CanvasError({
          message: `エッジデータの検証に失敗しました: ${(error as Error).message}`,
          cause: error,
        }),
    });

    const updatedCanvas = yield* Domain.addEdge(canvas, validated);
    yield* repo.write(updatedCanvas);
    return validated.id;
  });

/**
 * エッジを削除し、キャンバスを保存します。
 * @param id - 削除するエッジの ID
 * @returns 処理完了を示す Effect
 */
export const removeEdge = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();
    const updatedCanvas = yield* Domain.removeEdge(canvas, id);
    yield* repo.write(updatedCanvas);
  });
