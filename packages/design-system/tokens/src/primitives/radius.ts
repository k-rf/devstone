import { type TokenTree } from "../spec/index.js";

/**
 * px 相当の数値をキーとする角丸（border-radius）の物理ステップ定義です。
 */
export const radius = {
  0: {
    $type: "dimension",
    $value: { value: 0, unit: "px" },
  },
  2: {
    $type: "dimension",
    $value: { value: 0.125, unit: "rem" },
  },
  4: {
    $type: "dimension",
    $value: { value: 0.25, unit: "rem" },
  },
  6: {
    $type: "dimension",
    $value: { value: 0.375, unit: "rem" },
  },
  8: {
    $type: "dimension",
    $value: { value: 0.5, unit: "rem" },
  },
  12: {
    $type: "dimension",
    $value: { value: 0.75, unit: "rem" },
  },
  16: {
    $type: "dimension",
    $value: { value: 1, unit: "rem" },
  },
  24: {
    $type: "dimension",
    $value: { value: 1.5, unit: "rem" },
  },
  full: {
    $type: "dimension",
    $value: { value: 9999, unit: "px" },
  },
} as const satisfies TokenTree;
