import { type ThemeContract } from "../theme-contract.js";

import { amberBase } from "./base.js";
import { amberDarkColor } from "./dark-color.js";

/**
 * Amber テーマの Dark モードにおける完全な Semantic トークンツリーです。
 */
export const amberDark = {
  ...amberBase,
  ...amberDarkColor,
} as const satisfies ThemeContract;
