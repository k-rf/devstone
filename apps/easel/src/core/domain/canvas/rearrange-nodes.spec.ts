import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { expect, it } from "vitest";

import { assertNode } from "../../../test-utils/assert-node/assert-node.js";

import { rearrangeNodes } from "./rearrange-nodes.js";

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
