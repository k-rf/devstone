import { noThrowInProduction as noThrowInProductionSelector } from "../selectors/no-throw-in-production.js";

/**
 * 本番コード向け構文制限セレクタ集合。
 */
export const noThrowInProduction = [...noThrowInProductionSelector] as const;
