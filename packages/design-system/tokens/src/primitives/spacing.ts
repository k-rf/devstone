import { type TokenTree } from "../spec/index.js";

/**
 * 4px（0.25rem）グリッドを基準とする余白・サイズの物理ステップ定義です。
 */
export const spacing = {
  0: {
    $type: "dimension",
    $value: { value: 0, unit: "px" },
  },
  1: {
    $type: "dimension",
    $value: { value: 0.25, unit: "rem" },
  },
  2: {
    $type: "dimension",
    $value: { value: 0.5, unit: "rem" },
  },
  3: {
    $type: "dimension",
    $value: { value: 0.75, unit: "rem" },
  },
  4: {
    $type: "dimension",
    $value: { value: 1, unit: "rem" },
  },
  5: {
    $type: "dimension",
    $value: { value: 1.25, unit: "rem" },
  },
  6: {
    $type: "dimension",
    $value: { value: 1.5, unit: "rem" },
  },
  8: {
    $type: "dimension",
    $value: { value: 2, unit: "rem" },
  },
  10: {
    $type: "dimension",
    $value: { value: 2.5, unit: "rem" },
  },
  12: {
    $type: "dimension",
    $value: { value: 3, unit: "rem" },
  },
  16: {
    $type: "dimension",
    $value: { value: 4, unit: "rem" },
  },
} as const satisfies TokenTree;
