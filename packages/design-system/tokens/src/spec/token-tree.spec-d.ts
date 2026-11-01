import { describe, expectTypeOf, it } from "vitest";

import { type TokenTree } from "./token-tree.js";

describe("正常系", () => {
  it("ネストしたグループ構造と各種 $type の末端トークンを持つオブジェクトが TokenTree を満たすこと", () => {
    const primitives = {
      color: {
        blue: {
          500: {
            $type: "color",
            $value: "#3b82f6",
          },
        },
        white: {
          $type: "color",
          $value: "#ffffff",
          $description: "Pure white color",
          $deprecated: false,
          $extensions: {
            category: "neutral",
          },
        },
      },
      spacing: {
        4: {
          $type: "dimension",
          $value: {
            value: 1,
            unit: "rem",
          },
        },
      },
      font: {
        family: {
          sans: {
            $type: "fontFamily",
            $value: ["Inter", "sans-serif"],
          },
        },
        weight: {
          bold: {
            $type: "fontWeight",
            $value: 700,
          },
        },
      },
      easing: {
        standard: {
          $type: "cubicBezier",
          $value: [0.4, 0, 0.2, 1],
        },
      },
    } as const satisfies TokenTree;

    expectTypeOf(primitives).toExtend<TokenTree>();
  });
});

describe("異常系", () => {
  it("末端トークンに $type が欠落している場合はコンパイルエラーになること", () => {
    const invalidTree = {
      color: {
        primary: {
          $value: "#3b82f6",
        },
      },
    } as const;

    expectTypeOf(invalidTree).not.toExtend<TokenTree>();
  });

  it("末端トークンに $value が欠落している場合はコンパイルエラーになること", () => {
    const invalidTree = {
      color: {
        primary: {
          $type: "color",
        },
      },
    } as const;

    expectTypeOf(invalidTree).not.toExtend<TokenTree>();
  });

  it("$type に対して不正な型の $value を指定した場合はコンパイルエラーになること", () => {
    const invalidTree = {
      color: {
        primary: {
          $type: "color",
          $value: 12_345,
        },
      },
      spacing: {
        sm: {
          $type: "dimension",
          $value: "16px",
        },
      },
    } as const;

    expectTypeOf(invalidTree).not.toExtend<TokenTree>();
  });

  it("グループ階層に $type を指定して末端の $type を省略した場合はコンパイルエラーになること", () => {
    const invalidTree = {
      color: {
        $type: "color",
        primary: {
          $value: "#3b82f6",
        },
      },
    } as const;

    expectTypeOf(invalidTree).not.toExtend<TokenTree>();
  });
});
