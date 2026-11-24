import { type BaseThemeContract } from "./base-theme-contract.js";
import { type ColorThemeContract } from "./color-theme-contract.js";

/**
 * 各テーマ・各モードが共通して満たすべき純粋な DTCG Semantic トークンツリー契約型です。
 */
export type ThemeContract = BaseThemeContract & ColorThemeContract;
