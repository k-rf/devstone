import { type BaseThemeContract } from "./base-theme-contract.js";

/**
 * モード・テーマ共通で標準となる Semantic ベース定義です。
 */
export const defaultBase = {
  font: {
    family: {
      heading: {
        $type: "fontFamily",
        $value: "{font.family.sans}",
      },
      body: {
        $type: "fontFamily",
        $value: "{font.family.sans}",
      },
      mono: {
        $type: "fontFamily",
        $value: "{font.family.mono}",
      },
    },
    size: {
      xs: {
        $type: "dimension",
        $value: "{font.size.12}",
      },
      sm: {
        $type: "dimension",
        $value: "{font.size.14}",
      },
      md: {
        $type: "dimension",
        $value: "{font.size.16}",
      },
      lg: {
        $type: "dimension",
        $value: "{font.size.18}",
      },
      xl: {
        $type: "dimension",
        $value: "{font.size.20}",
      },
      "2xl": {
        $type: "dimension",
        $value: "{font.size.24}",
      },
      "3xl": {
        $type: "dimension",
        $value: "{font.size.30}",
      },
      "4xl": {
        $type: "dimension",
        $value: "{font.size.36}",
      },
    },
    weight: {
      regular: {
        $type: "fontWeight",
        $value: "{font.weight.400}",
      },
      medium: {
        $type: "fontWeight",
        $value: "{font.weight.500}",
      },
      semibold: {
        $type: "fontWeight",
        $value: "{font.weight.600}",
      },
      bold: {
        $type: "fontWeight",
        $value: "{font.weight.700}",
      },
    },
    lineHeight: {
      tight: {
        $type: "number",
        $value: "{font.lineHeight.125}",
      },
      normal: {
        $type: "number",
        $value: "{font.lineHeight.150}",
      },
      relaxed: {
        $type: "number",
        $value: "{font.lineHeight.175}",
      },
    },
  },
  radius: {
    none: {
      $type: "dimension",
      $value: "{radius.0}",
    },
    xs: {
      $type: "dimension",
      $value: "{radius.2}",
    },
    sm: {
      $type: "dimension",
      $value: "{radius.4}",
    },
    md: {
      $type: "dimension",
      $value: "{radius.6}",
    },
    lg: {
      $type: "dimension",
      $value: "{radius.8}",
    },
    xl: {
      $type: "dimension",
      $value: "{radius.12}",
    },
    full: {
      $type: "dimension",
      $value: "{radius.full}",
    },
  },
  spacing: {
    xs: {
      $type: "dimension",
      $value: "{spacing.1}",
    },
    sm: {
      $type: "dimension",
      $value: "{spacing.2}",
    },
    md: {
      $type: "dimension",
      $value: "{spacing.4}",
    },
    lg: {
      $type: "dimension",
      $value: "{spacing.6}",
    },
    xl: {
      $type: "dimension",
      $value: "{spacing.8}",
    },
    "2xl": {
      $type: "dimension",
      $value: "{spacing.12}",
    },
    "3xl": {
      $type: "dimension",
      $value: "{spacing.16}",
    },
  },
  borderWidth: {
    none: {
      $type: "dimension",
      $value: "{borderWidth.0}",
    },
    default: {
      $type: "dimension",
      $value: "{borderWidth.1}",
    },
    thick: {
      $type: "dimension",
      $value: "{borderWidth.2}",
    },
  },
  duration: {
    fast: {
      $type: "duration",
      $value: "{duration.100}",
    },
    normal: {
      $type: "duration",
      $value: "{duration.150}",
    },
    slow: {
      $type: "duration",
      $value: "{duration.200}",
    },
  },
  easing: {
    default: {
      $type: "cubicBezier",
      $value: "{easing.inOut}",
    },
    in: {
      $type: "cubicBezier",
      $value: "{easing.in}",
    },
    out: {
      $type: "cubicBezier",
      $value: "{easing.out}",
    },
  },
} as const satisfies BaseThemeContract;
