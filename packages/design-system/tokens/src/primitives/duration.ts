import { type TokenTree } from "../spec/index.js";

/**
 * モーションの遷移時間をミリ秒単位で表す物理ステップ定義です。
 */
export const duration = {
  0: {
    $type: "duration",
    $value: { value: 0, unit: "ms" },
  },
  100: {
    $type: "duration",
    $value: { value: 100, unit: "ms" },
  },
  150: {
    $type: "duration",
    $value: { value: 150, unit: "ms" },
  },
  200: {
    $type: "duration",
    $value: { value: 200, unit: "ms" },
  },
  300: {
    $type: "duration",
    $value: { value: 300, unit: "ms" },
  },
} as const satisfies TokenTree;
