import { type ThemeContract } from "../theme-contract.js";

import { quartzBase } from "./base.js";
import { quartzLightColor } from "./light-color.js";

/**
 * Quartz テーマの Light モードにおける完全な Semantic トークンツリーです。
 */
export const quartzLight = {
  ...quartzBase,
  ...quartzLightColor,
} as const satisfies ThemeContract;
