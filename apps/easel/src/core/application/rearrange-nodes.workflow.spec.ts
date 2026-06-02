import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Option, Schema } from "effect";
import { expect, it } from "vitest";

import { assertNode } from "../../test-utils/assert-node/assert-node.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { rearrangeNodesWorkflow } from "./rearrange-nodes.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [
    { id: "node-1", type: "text", x: 0, y: 0, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "text", x: 0, y: 40, width: 100, height: 50, text: "Node 2" },
  ],
  edges: [],
});

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

it("再配置を実行したとき、重なっているノードの座標が自動で押し出されて更新されること", async () => {
  const state = { current: { ...initialCanvas } };
  const program = rearrangeNodesWorkflow({
    padding: Option.some(20),
    maxIterations: Option.some(50),
    damping: Option.none(),
  }).pipe(Effect.provide(makeTestCanvasRepository(state)));

  await Effect.runPromise(program);

  const n1 = state.current.nodes?.find((n) => n.id === "node-1");
  const n2 = state.current.nodes?.find((n) => n.id === "node-2");

  assertNode(n1);
  assertNode(n2);

  // Y軸方向に押し出されて重なりが解消されている（n2.y - (n1.y + 50) >= 20）
  expect(n2.y - (n1.y + 50)).toBeGreaterThanOrEqual(19.9);
});

it("オプション（padding, maxIterations, damping）に None を指定したとき、デフォルト値が適用されて正常に完了すること", async () => {
  const state = { current: { ...initialCanvas } };
  const program = rearrangeNodesWorkflow({
    padding: Option.none(),
    maxIterations: Option.none(),
    damping: Option.none(),
  }).pipe(Effect.provide(makeTestCanvasRepository(state)));

  await Effect.runPromise(program);

  const n1 = state.current.nodes?.find((n) => n.id === "node-1");
  const n2 = state.current.nodes?.find((n) => n.id === "node-2");

  assertNode(n1);
  assertNode(n2);

  // デフォルトの padding=20 で重なりが解消されていること
  expect(n2.y - (n1.y + 50)).toBeGreaterThanOrEqual(19.9);
});

it("damping オプションを指定したとき、指定された減衰係数が適用されること", async () => {
  const state = { current: { ...initialCanvas } };
  // damping を非常に小さく (0.01) 設定すると、maxIterations: 1 のときにはほとんど動かないはず
  const program = rearrangeNodesWorkflow({
    padding: Option.some(20),
    maxIterations: Option.some(1),
    damping: Option.some(0.01),
  }).pipe(Effect.provide(makeTestCanvasRepository(state)));

  await Effect.runPromise(program);

  const n1 = state.current.nodes?.find((n) => n.id === "node-1");
  const n2 = state.current.nodes?.find((n) => n.id === "node-2");

  assertNode(n1);
  assertNode(n2);

  // dampingが小さいため、1回の反復では重なりが解消されない (n2.y - n1.y は 40 からわずかしか動かないはず)
  expect(n2.y - (n1.y + 50)).toBeLessThan(0);
});
