import { type ThemeContract } from "./theme-contract.js";
import { type ThemeMode } from "./theme-mode.js";

/**
 * Light / Dark の 2 つのモードを持ち、各モードが共通の `ThemeContract` を満たすテーマ構造です。
 */
export type Theme = Readonly<Record<ThemeMode, ThemeContract>>;
