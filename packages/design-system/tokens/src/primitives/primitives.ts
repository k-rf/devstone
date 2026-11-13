import { type TokenTree } from "../spec/index.js";

import { borderWidth } from "./border-width.js";
import { color } from "./color.js";
import { duration } from "./duration.js";
import { easing } from "./easing.js";
import { font } from "./font.js";
import { radius } from "./radius.js";
import { spacing } from "./spacing.js";

/**
 * すべてのプリミティブトークンを統合した定義です。
 */
export const primitives = {
  color: color,
  spacing: spacing,
  radius: radius,
  borderWidth: borderWidth,
  font: font,
  duration: duration,
  easing: easing,
} as const satisfies TokenTree;

/**
 * プリミティブトークン全体の型定義です。
 */
export type Primitives = typeof primitives;
