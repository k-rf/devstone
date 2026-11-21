import { type BaseThemeContract } from "../base-theme-contract.js";
import { defaultBase } from "../default-base.js";

/**
 * Amber テーマにおけるモード共通の Semantic トークン定義です。
 * 標準のベーススケールに対して、親しみやすい大きめの角丸スケールを上書きします。
 */
export const amberBase = {
  ...defaultBase,
  radius: {
    ...defaultBase.radius,
    xs: {
      $type: "dimension",
      $value: "{radius.4}",
    },
    sm: {
      $type: "dimension",
      $value: "{radius.6}",
    },
    md: {
      $type: "dimension",
      $value: "{radius.8}",
    },
    lg: {
      $type: "dimension",
      $value: "{radius.12}",
    },
    xl: {
      $type: "dimension",
      $value: "{radius.16}",
    },
  },
} as const satisfies BaseThemeContract;
