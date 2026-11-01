import { describe, expectTypeOf, it } from "vitest";

import { type SemanticTokenTree } from "./semantic-token-tree.js";
import { type TokenTree } from "./token-tree.js";

const samplePrimitives = {
  color: {
    blue: {
      500: {
        $type: "color",
        $value: "#3b82f6",
      },
    },
    neutral: {
      50: {
        $type: "color",
        $value: "#f8fafc",
      },
      900: {
        $type: "color",
        $value: "#0f172a",
      },
    },
  },
  spacing: {
    4: {
      $type: "dimension",
      $value: { value: 1, unit: "rem" },
    },
  },
} as const satisfies TokenTree;

type SamplePrimitives = typeof samplePrimitives;

describe("正常系", () => {
  it("実在する同一 $type のトークンパスを参照するツリーが SemanticTokenTree を満たすこと", () => {
    const semanticTokens = {
      bg: {
        canvas: {
          $type: "color",
          $value: "{color.neutral.50}",
        },
        accent: {
          $type: "color",
          $value: "{color.blue.500}",
          $description: "Accent background color",
        },
      },
      layout: {
        gutter: {
          $type: "dimension",
          $value: "{spacing.4}",
        },
      },
    } as const satisfies SemanticTokenTree<SamplePrimitives>;

    expectTypeOf(samplePrimitives).toExtend<TokenTree>();
    expectTypeOf(semanticTokens).toExtend<SemanticTokenTree<SamplePrimitives>>();
    expectTypeOf(semanticTokens).toExtend<TokenTree>();
  });
});

describe("異常系", () => {
  it("存在しないトークンパスを参照した場合はコンパイルエラーになること", () => {
    const invalidSemantic = {
      bg: {
        canvas: {
          $type: "color",
          $value: "{color.neutral.999}",
        },
      },
    } as const;

    expectTypeOf(invalidSemantic).not.toExtend<SemanticTokenTree<SamplePrimitives>>();
  });

  it("異なる $type のトークンパスを参照した場合はコンパイルエラーになること", () => {
    const invalidSemantic = {
      bg: {
        canvas: {
          $type: "color",
          $value: "{spacing.4}",
        },
      },
      layout: {
        gutter: {
          $type: "dimension",
          $value: "{color.blue.500}",
        },
      },
    } as const;

    expectTypeOf(invalidSemantic).not.toExtend<SemanticTokenTree<SamplePrimitives>>();
  });

  it("エイリアス形式ではない直接の値を指定した場合はコンパイルエラーになること", () => {
    const invalidSemantic = {
      bg: {
        canvas: {
          $type: "color",
          $value: "#ffffff",
        },
      },
    } as const;

    expectTypeOf(invalidSemantic).not.toExtend<SemanticTokenTree<SamplePrimitives>>();
  });
});
