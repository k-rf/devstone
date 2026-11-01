import { describe, expectTypeOf, it } from "vitest";

import { type TokenAlias } from "./token-alias.js";
import { type TokenTree } from "./token-tree.js";

const samplePrimitives = {
  color: {
    blue: {
      500: {
        $type: "color",
        $value: "#3b82f6",
      },
      600: {
        $type: "color",
        $value: "#2563eb",
      },
    },
    white: {
      $type: "color",
      $value: "#ffffff",
    },
  },
  spacing: {
    1: {
      $type: "dimension",
      $value: { value: 0.25, unit: "rem" },
    },
    4: {
      $type: "dimension",
      $value: { value: 1, unit: "rem" },
    },
  },
  font: {
    weight: {
      bold: {
        $type: "fontWeight",
        $value: 700,
      },
    },
  },
} as const satisfies TokenTree;

type SamplePrimitives = typeof samplePrimitives;

describe("正常系", () => {
  it("指定した $type を持つトークンのエイリアス表現（{path.to.token}）のみを抽出できること", () => {
    expectTypeOf(samplePrimitives).toExtend<TokenTree>();

    expectTypeOf<TokenAlias<SamplePrimitives, "color">>().toEqualTypeOf<
      "{color.blue.500}" | "{color.blue.600}" | "{color.white}"
    >();

    expectTypeOf<TokenAlias<SamplePrimitives, "dimension">>().toEqualTypeOf<
      "{spacing.1}" | "{spacing.4}"
    >();

    expectTypeOf<
      TokenAlias<SamplePrimitives, "fontWeight">
    >().toEqualTypeOf<"{font.weight.bold}">();
  });

  it("$type を省略した場合はツリー内の全トークンのエイリアス表現を抽出できること", () => {
    expectTypeOf<TokenAlias<SamplePrimitives>>().toEqualTypeOf<
      | "{color.blue.500}"
      | "{color.blue.600}"
      | "{color.white}"
      | "{spacing.1}"
      | "{spacing.4}"
      | "{font.weight.bold}"
    >();
  });
});

describe("異常系", () => {
  it("該当する $type のトークンがツリー内に存在しない場合は never になること", () => {
    expectTypeOf<TokenAlias<SamplePrimitives, "duration">>().toBeNever();
  });
});
