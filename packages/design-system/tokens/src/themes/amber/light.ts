import { type ThemeContract } from "../theme-contract.js";

import { amberBase } from "./base.js";
import { amberLightColor } from "./light-color.js";

/**
 * Amber テーマの Light モードにおける完全な Semantic トークンツリーです。
 */
export const amberLight = {
  ...amberBase,
  ...amberLightColor,
} as const satisfies ThemeContract;
