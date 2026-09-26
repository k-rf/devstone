import { type JsonCanvas, type Node } from "@devstone/libs-json-canvas-spec";
import { objectEntries } from "@devstone/libs-util";
import { Effect } from "effect";

/**
 * ノード間の重なりを解消するためのデルタ（移動量）を保持するマップ型。
 */
type DeltaMap = Record<string, { readonly dx: number; readonly dy: number }>;

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

  const aPrecedesB = cA < cB || (cA === cB && nodeA.id < nodeB.id);
  const value = aPrecedesB ? deltaValue : -deltaValue;

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
): Effect.Effect<{ readonly nextNodes: readonly Node[]; readonly hasMoved: boolean }> => {
  const effects = getUniquePairs(nodes).map(([nodeA, nodeB]) =>
    calculatePairDelta(nodeA, nodeB, padding, damping),
  );

  // ペアごとの衝突判定を並行（unbounded）で実行する
  return Effect.all(effects, { concurrency: "unbounded" }).pipe(
    Effect.map((deltas) => {
      // デルタ（移動量）を各ノードごとに累積する
      const mergedDeltas = deltas.reduce<
        Readonly<Record<string, { readonly dx: number; readonly dy: number }>>
      >(
        (acc, delta) =>
          objectEntries(delta).reduce((inner, [id, value]) => {
            const current = inner[id] ?? { dx: 0, dy: 0 };
            return {
              ...inner,
              [id]: { dx: current.dx + value.dx, dy: current.dy + value.dy },
            };
          }, acc),
        {},
      );

      const { nextNodes, hasMoved } = nodes.reduce(
        (acc, node) => {
          const delta = mergedDeltas[node.id];

          if (delta && (delta.dx !== 0 || delta.dy !== 0)) {
            return {
              nextNodes: [
                ...acc.nextNodes,
                { ...node, x: node.x + delta.dx, y: node.y + delta.dy },
              ],
              hasMoved: true,
            };
          }
          return { nextNodes: [...acc.nextNodes, node], hasMoved: acc.hasMoved };
        },
        { nextNodes: [] as readonly Node[], hasMoved: false },
      );

      return { nextNodes: nextNodes, hasMoved: hasMoved };
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
  options: {
    readonly padding?: number;
    readonly maxIterations?: number;
    readonly damping?: number;
  } = {},
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
      Effect.flatMap(({ nextNodes, hasMoved }) => {
        if (!hasMoved) return Effect.succeed(nextNodes);

        return runLoop(nextNodes, iteration + 1);
      }),
    );
  };

  return runLoop(canvas.nodes, 0).pipe(
    Effect.map((finalNodes) => ({ ...canvas, nodes: [...finalNodes] })),
  );
};
