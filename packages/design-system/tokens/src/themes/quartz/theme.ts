import { type Theme } from "../theme.js";

import { quartzDark } from "./dark.js";
import { quartzLight } from "./light.js";

/**
 * 端正で澄んだクール系テーマ（Quartz）の定義です。
 */
export const quartzTheme = {
  light: quartzLight,
  dark: quartzDark,
} as const satisfies Theme;
