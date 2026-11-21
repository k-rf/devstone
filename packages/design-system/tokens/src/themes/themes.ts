import { amberTheme } from "./amber/amber-theme.js";
import { quartzTheme } from "./quartz/quartz-theme.js";
import { type Theme } from "./theme.js";

/**
 * 定義済みのすべてのテーマを束ねたオブジェクトです。
 */
export const Themes = {
  quartz: quartzTheme,
  amber: amberTheme,
} as const satisfies Record<string, Theme>;

/**
 * テーマ一覧全体の型定義です。
 */
export type Themes = typeof Themes;
