import { JsonCanvas, type Node } from "@devstone/libs-json-canvas-spec";
import { objectEntries } from "@devstone/libs-util";
import { Effect, Schema } from "effect";

import { assertNode } from "../../../test-utils/assert-node/assert-node.js";

/**
 * ノード間の重なりを解消するためのデルタ（移動量）を保持するマップ型。
 */
type DeltaMap = Record<string, { dx: number; dy: number }>;

/**
 * ノードの中心X座標を計算します。
 * @param node - 計算対象のノード
 * @returns ノードの中心X座標
 */
const getCenterX = (node: Node): number => node.x + node.width / 2;

/**
 * ノードの中心Y座標を計算します。
 * @param node - 計算対象のノード
 * @returns ノードの中心Y座標
 */
const getCenterY = (node: Node): number => node.y + node.height / 2;

/**
 * 1つの軸に沿ってノードを押し出すための DeltaMap を計算します。
 * @param nodeA - 押し出し対象のノードA
 * @param nodeB - 押し出し対象のノードB
 * @param overlap - 対象軸の重なり量
 * @param damping - 移動にかける減衰係数
 * @param axis - 押し出し対象の軸 ('x' または 'y')
 * @returns 押し出し用の移動量を格納した DeltaMap
 */
const calculateAxisDelta = (
  nodeA: Node,
  nodeB: Node,
  overlap: number,
  damping: number,
  axis: "x" | "y",
): DeltaMap => {
  const getCenter = axis === "x" ? getCenterX : getCenterY;
  const cA = getCenter(nodeA);
  const cB = getCenter(nodeB);
  const deltaValue = overlap * damping * 0.5;

  const isALessThanB = cA < cB || (cA === cB && nodeA.id < nodeB.id);
  const value = isALessThanB ? deltaValue : -deltaValue;

  return axis === "x"
    ? {
        [nodeA.id]: { dx: -value, dy: 0 },
        [nodeB.id]: { dx: value, dy: 0 },
      }
    : {
        [nodeA.id]: { dx: 0, dy: -value },
        [nodeB.id]: { dx: 0, dy: value },
      };
};

/**
 * 2つのノード間の重なりを判定し、衝突している場合は押し出すための移動量を計算します。
 * @param nodeA - 判定対象のノードA
 * @param nodeB - 判定対象のノードB
 * @param padding - ノード間の最小余白
 * @param damping - 移動にかける減衰係数
 * @returns 押し出し用の移動量を格納した DeltaMap を表す Effect
 */
const calculatePairDelta = (
  nodeA: Node,
  nodeB: Node,
  padding: number,
  damping: number,
): Effect.Effect<DeltaMap> =>
  Effect.sync(() => {
    // padding を加味した重なり量を計算する
    const overlapX =
      Math.min(nodeA.x + nodeA.width + padding, nodeB.x + nodeB.width + padding) -
      Math.max(nodeA.x, nodeB.x);
    const overlapY =
      Math.min(nodeA.y + nodeA.height + padding, nodeB.y + nodeB.height + padding) -
      Math.max(nodeA.y, nodeB.y);

    const TOLERANCE = 0.1;

    // X軸とY軸の両方で重なりが閾値より大きい場合のみ衝突しているとみなす
    if (overlapX > TOLERANCE && overlapY > TOLERANCE) {
      // 重なりが小さい方の軸に沿って押し出す
      return overlapX < overlapY
        ? calculateAxisDelta(nodeA, nodeB, overlapX, damping, "x")
        : calculateAxisDelta(nodeA, nodeB, overlapY, damping, "y");
    }

    return {};
  });

/**
 * ノードのリストから、重複のない全ノードペアの組み合わせを生成します。
 * @param nodes - ペア生成元のノードリスト
 * @returns 重複のないノードペアの読み取り専用リスト
 */
const getUniquePairs = (nodes: readonly Node[]): readonly (readonly [Node, Node])[] =>
  nodes.flatMap((nodeA, i) => nodes.slice(i + 1).map((nodeB) => [nodeA, nodeB]));

/**
 * 1ステップ分の衝突検知とノード移動を行い、更新後のノードリストと移動が発生したかを返します。
 * ペアごとの衝突判定は Effect-TS を用いて並行処理で行われます。
 * @param nodes - 現在のノードリスト
 * @param padding - ノード間の最小余白
 * @param damping - 移動にかける減衰係数
 * @returns 次のステップのノードリストと移動が発生したかのフラグを含むオブジェクトを表す Effect
 */
const stepRearrange = (
  nodes: readonly Node[],
  padding: number,
  damping: number,
): Effect.Effect<{ nextNodes: readonly Node[]; moved: boolean }> => {
  const effects = getUniquePairs(nodes).map(([nodeA, nodeB]) =>
    calculatePairDelta(nodeA, nodeB, padding, damping),
  );

  // ペアごとの衝突判定を並行（unbounded）で実行する
  return Effect.all(effects, { concurrency: "unbounded" }).pipe(
    Effect.map((deltas) => {
      const mergedDeltas: Record<string, { dx: number; dy: number }> = {};

      // デルタ（移動量）を各ノードごとに累積する
      for (const delta of deltas) {
        for (const [id, value] of objectEntries(delta)) {
          const current = mergedDeltas[id] ?? { dx: 0, dy: 0 };
          mergedDeltas[id] = { dx: current.dx + value.dx, dy: current.dy + value.dy };
        }
      }

      const { nextNodes, moved } = nodes.reduce(
        (acc, node) => {
          const delta = mergedDeltas[node.id];

          if (delta && (delta.dx !== 0 || delta.dy !== 0)) {
            return {
              nextNodes: [
                ...acc.nextNodes,
                { ...node, x: node.x + delta.dx, y: node.y + delta.dy },
              ],
              moved: true,
            };
          }
          return { nextNodes: [...acc.nextNodes, node], moved: acc.moved };
        },
        { nextNodes: [] as Node[], moved: false },
      );

      return { nextNodes: nextNodes, moved: moved };
    }),
  );
};

/**
 * キャンバス内のノードの重なりを自動的に解消（再配置）します。
 * 衝突判定は並行処理で行われ、再帰的（ループ）に重なりが解消されるまで反復します。
 * @param canvas - キャンバスデータ
 * @param options - 再配置のオプション
 * @param options.padding - ノード間の最小余白 (デフォルト: 20)
 * @param options.maxIterations - 重なり解消の最大ループ回数 (デフォルト: 50)
 * @param options.damping - 移動にかける減衰係数 (デフォルト: 0.5)
 * @returns 再配置されたキャンバスデータを表す Effect
 */
export const rearrangeNodes = (
  canvas: JsonCanvas,
  options: { padding?: number; maxIterations?: number; damping?: number } = {},
): Effect.Effect<JsonCanvas> => {
  const padding = options.padding ?? 20;
  const maxIterations = options.maxIterations ?? 50;
  const damping = options.damping ?? 0.5;

  if (!canvas.nodes) return Effect.succeed(canvas);

  // 再帰による関数型ループ
  const runLoop = (
    currentNodes: readonly Node[],
    iteration: number,
  ): Effect.Effect<readonly Node[]> => {
    if (iteration >= maxIterations) return Effect.succeed(currentNodes);

    return stepRearrange(currentNodes, padding, damping).pipe(
      Effect.flatMap(({ nextNodes, moved }) => {
        if (!moved) return Effect.succeed(nextNodes);

        return runLoop(nextNodes, iteration + 1);
      }),
    );
  };

  return runLoop(canvas.nodes, 0).pipe(
    Effect.map((finalNodes) => ({ ...canvas, nodes: [...finalNodes] })),
  );
};

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  const makeCanvas = (nodes?: readonly Record<string, unknown>[]) =>
    Schema.decodeUnknownSync(JsonCanvas)({
      nodes: nodes,
    });

  it("ノードが空、あるいは1つだけの場合は何も変更しないこと", () => {
    const emptyCanvas = makeCanvas([]);
    const singleCanvas = makeCanvas([
      { id: "node-1", type: "text", x: 0, y: 0, width: 100, height: 50, text: "Node 1" },
    ]);

    const resultEmpty = Effect.runSync(rearrangeNodes(emptyCanvas));
    const resultSingle = Effect.runSync(rearrangeNodes(singleCanvas));

    expect(resultEmpty.nodes).toEqual([]);
    expect(resultSingle.nodes?.[0]?.x).toBe(0);
  });

  it("nodes プロパティが存在しない（undefined）キャンバスでも、正常に処理されること", () => {
    const canvas = makeCanvas();
    const result = Effect.runSync(rearrangeNodes(canvas));
    expect(result.nodes).toBeUndefined();
  });

  it("重なっていない複数のノードは移動しないこと", () => {
    const canvas = makeCanvas([
      { id: "node-1", type: "text", x: 0, y: 0, width: 100, height: 50, text: "1" },
      { id: "node-2", type: "text", x: 200, y: 0, width: 100, height: 50, text: "2" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    expect(result.nodes?.[0]?.x).toBe(0);
    expect(result.nodes?.[1]?.x).toBe(200);
  });

  it("X軸方向で重なっている2つのノードが押し出されること", () => {
    // node-1: [0, 100], node-2: [80, 180] -> 重なりは 20px。paddingが20pxなので、合計重なりは40px。
    const canvas = makeCanvas([
      { id: "node-1", type: "text", x: 0, y: 0, width: 100, height: 50, text: "1" },
      { id: "node-2", type: "text", x: 80, y: 0, width: 100, height: 50, text: "2" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20, maxIterations: 50 }));
    const n1 = result.nodes?.find((n) => n.id === "node-1");
    const n2 = result.nodes?.find((n) => n.id === "node-2");

    assertNode(n1);
    assertNode(n2);

    // 重なりが完全に解消されている（n2.x - (n1.x + 100) >= 20）
    expect(n2.x - (n1.x + 100)).toBeGreaterThanOrEqual(19.9); // 浮動小数点の誤差を考慮
  });

  it("Y軸方向で重なっている2つのノードが押し出されること", () => {
    const canvas = makeCanvas([
      { id: "node-1", type: "text", x: 0, y: 0, width: 100, height: 50, text: "1" },
      { id: "node-2", type: "text", x: 0, y: 40, width: 100, height: 50, text: "2" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    const n1 = result.nodes?.find((n) => n.id === "node-1");
    const n2 = result.nodes?.find((n) => n.id === "node-2");

    assertNode(n1);
    assertNode(n2);

    expect(n2.y - (n1.y + 50)).toBeGreaterThanOrEqual(19.9);
  });

  it("中心座標が完全に同一の2つのノードが、ID比較により決定論的に押し出されること", () => {
    const canvas = makeCanvas([
      { id: "node-a", type: "text", x: 0, y: 0, width: 100, height: 100, text: "A" },
      { id: "node-b", type: "text", x: 0, y: 0, width: 100, height: 100, text: "B" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    const na = result.nodes?.find((n) => n.id === "node-a");
    const nb = result.nodes?.find((n) => n.id === "node-b");

    assertNode(na);
    assertNode(nb);

    // X軸またはY軸で押し出され、重なりが解消されていること
    const xGap = Math.abs(na.x - nb.x);
    const yGap = Math.abs(na.y - nb.y);
    expect(xGap >= 119.9 || yGap >= 119.9).toBe(true);
  });

  it("X軸方向でAが右側にある重なりでも、正しく逆方向に押し出されること", () => {
    const canvas = makeCanvas([
      { id: "node-1", type: "text", x: 80, y: 0, width: 100, height: 50, text: "1" },
      { id: "node-2", type: "text", x: 0, y: 0, width: 100, height: 50, text: "2" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    const n1 = result.nodes?.find((n) => n.id === "node-1");
    const n2 = result.nodes?.find((n) => n.id === "node-2");

    assertNode(n1);
    assertNode(n2);

    expect(n1.x - (n2.x + 100)).toBeGreaterThanOrEqual(19.9);
  });

  it("Y軸方向でAが下側にある重なりでも、正しく逆方向に押し出されること", () => {
    const canvas = makeCanvas([
      { id: "node-1", type: "text", x: 0, y: 40, width: 100, height: 50, text: "1" },
      { id: "node-2", type: "text", x: 0, y: 0, width: 100, height: 50, text: "2" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    const n1 = result.nodes?.find((n) => n.id === "node-1");
    const n2 = result.nodes?.find((n) => n.id === "node-2");

    assertNode(n1);
    assertNode(n2);

    expect(n1.y - (n2.y + 50)).toBeGreaterThanOrEqual(19.9);
  });

  it("3つのノードが同一箇所で重なっている場合、すべての重なりが解消されること", () => {
    const canvas = makeCanvas([
      { id: "node-a", type: "text", x: 0, y: 0, width: 100, height: 100, text: "A" },
      { id: "node-b", type: "text", x: 0, y: 0, width: 100, height: 100, text: "B" },
      { id: "node-c", type: "text", x: 0, y: 0, width: 100, height: 100, text: "C" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    const na = result.nodes?.find((n) => n.id === "node-a");
    const nb = result.nodes?.find((n) => n.id === "node-b");
    const nc = result.nodes?.find((n) => n.id === "node-c");

    assertNode(na);
    assertNode(nb);
    assertNode(nc);

    const distributionAB = Math.max(Math.abs(na.x - nb.x), Math.abs(na.y - nb.y));
    const distributionBC = Math.max(Math.abs(nb.x - nc.x), Math.abs(nb.y - nc.y));
    const distributionAC = Math.max(Math.abs(na.x - nc.x), Math.abs(na.y - nc.y));

    expect(distributionAB).toBeGreaterThanOrEqual(119.9);
    expect(distributionBC).toBeGreaterThanOrEqual(119.9);
    expect(distributionAC).toBeGreaterThanOrEqual(119.9);
  });

  it("最大反復回数（maxIterations）に達した場合、処理がそこで打ち切られること", () => {
    const canvas = makeCanvas([
      { id: "node-1", type: "text", x: 0, y: 0, width: 100, height: 50, text: "1" },
      { id: "node-2", type: "text", x: 0, y: 40, width: 100, height: 50, text: "2" },
    ]);

    // maxIterations を 1 に指定。1回だけ移動して、まだ重なりが残っている状態で終わる
    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20, maxIterations: 1 }));
    const n1 = result.nodes?.find((n) => n.id === "node-1");
    const n2 = result.nodes?.find((n) => n.id === "node-2");

    assertNode(n1);
    assertNode(n2);

    expect(n2.y - (n1.y + 50)).toBeLessThan(20);
  });

  it("中心Xが同一で幅の異なるノードが重なっている場合、X軸方向でID比較により決定論的に押し出されること", () => {
    const canvas = makeCanvas([
      { id: "node-a", type: "text", x: 0, y: 0, width: 100, height: 100, text: "A" },
      { id: "node-b", type: "text", x: 10, y: 0, width: 80, height: 100, text: "B" },
    ]);

    const result = Effect.runSync(rearrangeNodes(canvas, { padding: 20 }));
    const na = result.nodes?.find((n) => n.id === "node-a");
    const nb = result.nodes?.find((n) => n.id === "node-b");

    assertNode(na);
    assertNode(nb);

    expect(Math.abs(na.x - nb.x)).toBeGreaterThan(10);
  });
}
