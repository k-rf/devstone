import { readCanvasStep } from "./read-canvas.step.js";

/**
 * キャンバスの全データをそのまま（ダンプ用）取得する Workflow
 * @returns 生のキャンバスデータ全体を示す Effect
 */
export const showCanvasWorkflow = () => readCanvasStep();
