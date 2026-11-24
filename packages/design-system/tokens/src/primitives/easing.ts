import { type TokenTree } from "../spec/index.js";

/**
 * モーションの加減速カーブを表すイージング定義です。
 */
export const easing = {
  linear: {
    $type: "cubicBezier",
    $value: [0, 0, 1, 1],
  },
  in: {
    $type: "cubicBezier",
    $value: [0.4, 0, 1, 1],
  },
  out: {
    $type: "cubicBezier",
    $value: [0, 0, 0.2, 1],
  },
  inOut: {
    $type: "cubicBezier",
    $value: [0.4, 0, 0.2, 1],
  },
} as const satisfies TokenTree;
