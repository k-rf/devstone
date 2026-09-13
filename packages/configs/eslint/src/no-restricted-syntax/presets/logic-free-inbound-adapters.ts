import { noConditionalStatements } from "../selectors/no-conditional-statements.js";

/**
 * Inbound Adapter 層向けの条件分岐制限セレクタ集合。
 */
export const logicFreeInboundAdapters = [...noConditionalStatements] as const;
