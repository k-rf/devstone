import { type ColorThemeContract } from "../color-theme-contract.js";

/**
 * Amber テーマの Dark モードにおけるカラートークン定義です。
 */
export const amberDarkColor = {
  color: {
    bg: {
      canvas: {
        $type: "color",
        $value: "{color.stone.950}",
      },
      surface: {
        $type: "color",
        $value: "{color.stone.900}",
      },
      subtle: {
        $type: "color",
        $value: "{color.stone.900}",
      },
      muted: {
        $type: "color",
        $value: "{color.stone.800}",
      },
      emphasized: {
        $type: "color",
        $value: "{color.stone.700}",
      },
      inverse: {
        $type: "color",
        $value: "{color.stone.50}",
      },
      accent: {
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
        $value: "{color.stone.50}",
      },
      muted: {
        $type: "color",
        $value: "{color.stone.300}",
      },
      subtle: {
        $type: "color",
        $value: "{color.stone.400}",
      },
      disabled: {
        $type: "color",
        $value: "{color.stone.600}",
      },
      inverse: {
        $type: "color",
        $value: "{color.stone.900}",
      },
      accent: {
        $type: "color",
        $value: "{color.amber.400}",
      },
      status: {
        info: {
          $type: "color",
          $value: "{color.blue.400}",
        },
        success: {
          $type: "color",
          $value: "{color.emerald.400}",
        },
        warning: {
          $type: "color",
          $value: "{color.amber.400}",
        },
        danger: {
          $type: "color",
          $value: "{color.red.400}",
        },
      },
    },
    border: {
      default: {
        $type: "color",
        $value: "{color.stone.700}",
      },
      subtle: {
        $type: "color",
        $value: "{color.stone.800}",
      },
      emphasized: {
        $type: "color",
        $value: "{color.stone.600}",
      },
      focus: {
        $type: "color",
        $value: "{color.amber.400}",
      },
      accent: {
        $type: "color",
        $value: "{color.amber.500}",
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
