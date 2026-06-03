import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasActivity } from "./read-canvas.activity.js";
import { validateNodeSchemaActivity } from "./validate-node-schema.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

/**
 * 新しいノードを検証してキャンバスに追加し、保存する Workflow
 * @param nodeData - 追加する未検証のノードデータ
 * @returns 追加されたノードの ID を示す Effect
 */
export const addNodeWorkflow = (nodeData: unknown) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    const validated = yield* validateNodeSchemaActivity(nodeData);
    const updatedCanvas = yield* Canvas.addNode(canvas, validated);
    yield* writeCanvasActivity(updatedCanvas);
    return validated.id;
  });
