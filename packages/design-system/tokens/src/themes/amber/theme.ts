import { type Theme } from "../theme.js";

import { amberDark } from "./dark.js";
import { amberLight } from "./light.js";

/**
 * 親しみやすく柔和なウォーム系テーマ（Amber）の定義です。
 */
export const amberTheme = {
  light: amberLight,
  dark: amberDark,
} as const satisfies Theme;
