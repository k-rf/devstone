import { type ColorThemeContract } from "../color-theme-contract.js";

/**
 * Quartz テーマの Light モードにおけるカラートークン定義です。
 */
export const quartzLightColor = {
  color: {
    bg: {
      canvas: {
        $type: "color",
        $value: "{color.white}",
      },
      surface: {
        $type: "color",
        $value: "{color.white}",
      },
      subtle: {
        $type: "color",
        $value: "{color.slate.50}",
      },
      muted: {
        $type: "color",
        $value: "{color.slate.100}",
      },
      emphasized: {
        $type: "color",
        $value: "{color.slate.200}",
      },
      inverse: {
        $type: "color",
        $value: "{color.slate.900}",
      },
      accent: {
        default: {
          $type: "color",
          $value: "{color.indigo.600}",
        },
        emphasized: {
          $type: "color",
          $value: "{color.indigo.700}",
        },
        subtle: {
          $type: "color",
          $value: "{color.indigo.50}",
        },
        muted: {
          $type: "color",
          $value: "{color.indigo.100}",
        },
      },
      status: {
        info: {
          default: {
            $type: "color",
            $value: "{color.blue.600}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.blue.700}",
          },
          subtle: {
            $type: "color",
            $value: "{color.blue.50}",
          },
          muted: {
            $type: "color",
            $value: "{color.blue.100}",
          },
        },
        success: {
          default: {
            $type: "color",
            $value: "{color.emerald.700}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.emerald.800}",
          },
          subtle: {
            $type: "color",
            $value: "{color.emerald.50}",
          },
          muted: {
            $type: "color",
            $value: "{color.emerald.100}",
          },
        },
        warning: {
          default: {
            $type: "color",
            $value: "{color.amber.700}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.amber.800}",
          },
          subtle: {
            $type: "color",
            $value: "{color.amber.50}",
          },
          muted: {
            $type: "color",
            $value: "{color.amber.100}",
          },
        },
        danger: {
          default: {
            $type: "color",
            $value: "{color.red.600}",
          },
          emphasized: {
            $type: "color",
            $value: "{color.red.700}",
          },
          subtle: {
            $type: "color",
            $value: "{color.red.50}",
          },
          muted: {
            $type: "color",
            $value: "{color.red.100}",
          },
        },
      },
    },
    fg: {
      default: {
        $type: "color",
        $value: "{color.slate.900}",
      },
      muted: {
        $type: "color",
        $value: "{color.slate.600}",
      },
      subtle: {
        $type: "color",
        $value: "{color.slate.500}",
      },
      disabled: {
        $type: "color",
        $value: "{color.slate.400}",
      },
      inverse: {
        $type: "color",
        $value: "{color.slate.50}",
      },
      accent: {
        $type: "color",
        $value: "{color.indigo.600}",
      },
      status: {
        info: {
          $type: "color",
          $value: "{color.blue.600}",
        },
        success: {
          $type: "color",
          $value: "{color.emerald.700}",
        },
        warning: {
          $type: "color",
          $value: "{color.amber.700}",
        },
        danger: {
          $type: "color",
          $value: "{color.red.600}",
        },
      },
    },
    border: {
      default: {
        $type: "color",
        $value: "{color.slate.200}",
      },
      subtle: {
        $type: "color",
        $value: "{color.slate.100}",
      },
      emphasized: {
        $type: "color",
        $value: "{color.slate.300}",
      },
      focus: {
        $type: "color",
        $value: "{color.indigo.600}",
      },
      accent: {
        $type: "color",
        $value: "{color.indigo.500}",
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
  },
} as const satisfies ColorThemeContract;
