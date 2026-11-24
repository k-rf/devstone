import { type ColorThemeContract } from "../color-theme-contract.js";

/**
 * Quartz テーマの Dark モードにおけるカラートークン定義です。
 */
export const quartzDarkColor = {
  color: {
    bg: {
      canvas: {
        $type: "color",
        $value: "{color.slate.950}",
      },
      surface: {
        $type: "color",
        $value: "{color.slate.950}",
      },
      subtle: {
        $type: "color",
        $value: "{color.slate.900}",
      },
      muted: {
        $type: "color",
        $value: "{color.slate.800}",
      },
      emphasized: {
        $type: "color",
        $value: "{color.slate.700}",
      },
      inverse: {
        $type: "color",
        $value: "{color.slate.50}",
      },
      accent: {
        default: {
          $type: "color",
          $value: "{color.indigo.400}",
        },
        emphasized: {
          $type: "color",
          $value: "{color.indigo.300}",
        },
        subtle: {
          $type: "color",
          $value: "{color.indigo.950}",
        },
        muted: {
          $type: "color",
          $value: "{color.indigo.900}",
        },
      },
      status: {
        info: {
          default: {
            $type: "color",
            $value: "{color.blue.500}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.blue.400}",
          },
          subtle: {
            $type: "color",
            $value: "{color.blue.950}",
          },
          muted: {
            $type: "color",
            $value: "{color.blue.900}",
          },
        },
        success: {
          default: {
            $type: "color",
            $value: "{color.emerald.500}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.emerald.400}",
          },
          subtle: {
            $type: "color",
            $value: "{color.emerald.950}",
          },
          muted: {
            $type: "color",
            $value: "{color.emerald.900}",
          },
        },
        warning: {
          default: {
            $type: "color",
            $value: "{color.amber.500}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.amber.400}",
          },
          subtle: {
            $type: "color",
            $value: "{color.amber.950}",
          },
          muted: {
            $type: "color",
            $value: "{color.amber.900}",
          },
        },
        danger: {
          default: {
            $type: "color",
            $value: "{color.red.500}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.red.400}",
          },
          subtle: {
            $type: "color",
            $value: "{color.red.950}",
          },
          muted: {
            $type: "color",
            $value: "{color.red.900}",
          },
        },
      },
    },
    fg: {
      default: {
        $type: "color",
        $value: "{color.slate.50}",
      },
      muted: {
        $type: "color",
        $value: "{color.slate.300}",
      },
      subtle: {
        $type: "color",
        $value: "{color.slate.400}",
      },
      disabled: {
        $type: "color",
        $value: "{color.slate.600}",
      },
      inverse: {
        $type: "color",
        $value: "{color.slate.900}",
      },
      accent: {
        $type: "color",
        $value: "{color.indigo.300}",
      },
      status: {
        info: {
          $type: "color",
          $value: "{color.blue.300}",
        },
        success: {
          $type: "color",
          $value: "{color.emerald.300}",
        },
        warning: {
          $type: "color",
          $value: "{color.amber.300}",
        },
        danger: {
          $type: "color",
          $value: "{color.red.300}",
        },
      },
    },
    border: {
      default: {
        $type: "color",
        $value: "{color.slate.700}",
      },
      subtle: {
        $type: "color",
        $value: "{color.slate.800}",
      },
      emphasized: {
        $type: "color",
        $value: "{color.slate.600}",
      },
      focus: {
        $type: "color",
        $value: "{color.indigo.400}",
      },
      accent: {
        $type: "color",
        $value: "{color.indigo.500}",
      },
      status: {
        info: {
          $type: "color",
          $value: "{color.blue.800}",
        },
        success: {
          $type: "color",
          $value: "{color.emerald.800}",
        },
        warning: {
          $type: "color",
          $value: "{color.amber.800}",
        },
        danger: {
          $type: "color",
          $value: "{color.red.800}",
        },
      },
    },
  },
} as const satisfies ColorThemeContract;
