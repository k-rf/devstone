import { type TokenTree } from "../spec/index.js";

/**
 * 境界線の太さ（border-width）の物理ステップ定義です。
 */
export const borderWidth = {
  0: {
    $type: "dimension",
    $value: { value: 0, unit: "px" },
  },
  1: {
    $type: "dimension",
    $value: { value: 1, unit: "px" },
  },
  2: {
    $type: "dimension",
    $value: { value: 2, unit: "px" },
  },
  4: {
    $type: "dimension",
    $value: { value: 4, unit: "px" },
  },
} as const satisfies TokenTree;
