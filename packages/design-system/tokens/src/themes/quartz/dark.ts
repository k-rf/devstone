import { type ThemeContract } from "../theme-contract.js";

import { quartzBase } from "./base.js";
import { quartzDarkColor } from "./dark-color.js";

/**
 * Quartz テーマの Dark モードにおける完全な Semantic トークンツリーです。
 */
export const quartzDark = {
  ...quartzBase,
  ...quartzDarkColor,
} as const satisfies ThemeContract;
