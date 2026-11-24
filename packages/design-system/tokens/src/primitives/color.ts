import { type TokenTree } from "../spec/index.js";

/**
 * OKLCH 色空間に基づく Primitive カラートークン定義です。
 * すべての 11 段階スケール（50〜950）は色相ごとの視覚バランスを最適化しつつ sRGB ガマット内に収めており、
 * どのディスプレイでも一貫した発色と正確な WCAG 相対輝度計算を保証します。
 */
export const color = {
  white: {
    $type: "color",
    $value: { colorSpace: "oklch", components: [1, 0, 0] },
  },
  black: {
    $type: "color",
    $value: { colorSpace: "oklch", components: [0, 0, 0] },
  },
  slate: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.984, 0.003, 255] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.968, 0.007, 255] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.929, 0.013, 255] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.869, 0.02, 255] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.704, 0.028, 255] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.54, 0.032, 255] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.446, 0.03, 255] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.372, 0.028, 255] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.279, 0.024, 255] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.208, 0.02, 255] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.138, 0.015, 255] },
    },
  },
  neutral: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.985, 0, 0] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.97, 0, 0] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.922, 0, 0] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.87, 0, 0] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.708, 0, 0] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.54, 0, 0] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.439, 0, 0] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.371, 0, 0] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.269, 0, 0] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.205, 0, 0] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.145, 0, 0] },
    },
  },
  stone: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.985, 0.003, 60] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.97, 0.006, 60] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.923, 0.01, 60] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.869, 0.014, 60] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.709, 0.018, 60] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.54, 0.02, 60] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.444, 0.018, 60] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.374, 0.016, 60] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.268, 0.014, 60] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.216, 0.012, 60] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.147, 0.009, 60] },
    },
  },
  blue: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.97, 0.014, 255] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.932, 0.032, 255] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.882, 0.058, 255] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.809, 0.097, 255] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.707, 0.155, 255] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.623, 0.188, 255] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.546, 0.179, 255] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.488, 0.16, 255] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.424, 0.139, 255] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.379, 0.116, 255] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.282, 0.075, 255] },
    },
  },
  indigo: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.968, 0.015, 275] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.93, 0.033, 275] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.87, 0.063, 275] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.785, 0.109, 275] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.673, 0.172, 275] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.585, 0.195, 275] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.511, 0.2, 275] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.457, 0.182, 275] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.398, 0.148, 275] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.359, 0.115, 275] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.257, 0.075, 275] },
    },
  },
  emerald: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.979, 0.021, 160] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.95, 0.048, 160] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.905, 0.084, 160] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.845, 0.128, 160] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.765, 0.158, 160] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.696, 0.157, 160] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.596, 0.134, 160] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.508, 0.114, 160] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.432, 0.097, 160] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.378, 0.078, 160] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.262, 0.052, 160] },
    },
  },
  amber: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.987, 0.01, 75] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.962, 0.03, 75] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.924, 0.062, 75] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.879, 0.102, 75] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.828, 0.15, 75] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.769, 0.162, 75] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.666, 0.14, 75] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.555, 0.117, 75] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.473, 0.099, 75] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.414, 0.087, 75] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.279, 0.058, 75] },
    },
  },
  orange: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.98, 0.01, 48] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.954, 0.025, 48] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.901, 0.056, 48] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.837, 0.098, 48] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.75, 0.163, 48] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.68, 0.18, 48] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.595, 0.162, 48] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.515, 0.14, 48] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.445, 0.121, 48] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.388, 0.098, 48] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.266, 0.068, 48] },
    },
  },
  red: {
    50: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.971, 0.013, 25] },
    },
    100: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.936, 0.032, 25] },
    },
    200: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.885, 0.06, 25] },
    },
    300: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.808, 0.108, 25] },
    },
    400: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.704, 0.175, 25] },
    },
    500: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.637, 0.198, 25] },
    },
    600: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.577, 0.205, 25] },
    },
    700: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.505, 0.185, 25] },
    },
    800: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.444, 0.155, 25] },
    },
    900: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.396, 0.125, 25] },
    },
    950: {
      $type: "color",
      $value: { colorSpace: "oklch", components: [0.258, 0.082, 25] },
    },
  },
} as const satisfies TokenTree;
