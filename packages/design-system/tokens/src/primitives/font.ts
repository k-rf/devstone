import { type TokenTree } from "../spec/index.js";

/**
 * タイポグラフィに関するプリミティブトークン定義です。
 */
export const font = {
  family: {
    sans: {
      $type: "fontFamily",
      $value: ["Inter", "Noto Sans JP", "sans-serif"],
    },
    mono: {
      $type: "fontFamily",
      $value: ["JetBrains Mono", "monospace"],
    },
  },
  size: {
    12: {
      $type: "dimension",
      $value: { value: 0.75, unit: "rem" },
    },
    14: {
      $type: "dimension",
      $value: { value: 0.875, unit: "rem" },
    },
    16: {
      $type: "dimension",
      $value: { value: 1, unit: "rem" },
    },
    18: {
      $type: "dimension",
      $value: { value: 1.125, unit: "rem" },
    },
    20: {
      $type: "dimension",
      $value: { value: 1.25, unit: "rem" },
    },
    24: {
      $type: "dimension",
      $value: { value: 1.5, unit: "rem" },
    },
    30: {
      $type: "dimension",
      $value: { value: 1.875, unit: "rem" },
    },
    36: {
      $type: "dimension",
      $value: { value: 2.25, unit: "rem" },
    },
    48: {
      $type: "dimension",
      $value: { value: 3, unit: "rem" },
    },
  },
  weight: {
    400: {
      $type: "fontWeight",
      $value: 400,
    },
    500: {
      $type: "fontWeight",
      $value: 500,
    },
    600: {
      $type: "fontWeight",
      $value: 600,
    },
    700: {
      $type: "fontWeight",
      $value: 700,
    },
  },
  lineHeight: {
    125: {
      $type: "number",
      $value: 1.25,
    },
    150: {
      $type: "number",
      $value: 1.5,
    },
    175: {
      $type: "number",
      $value: 1.75,
    },
  },
} as const satisfies TokenTree;
