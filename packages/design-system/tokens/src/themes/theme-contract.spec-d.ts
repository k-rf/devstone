import { describe, expectTypeOf, it } from "vitest";

import {
  type Primitives,
  type SemanticTokenTree,
  type ThemeContract,
  type ThemeMode,
  type Themes,
  type TokenTree,
} from "../index.js";

describe("正常系", () => {
  it("ThemeContract が SemanticTokenTree<Primitives> および TokenTree を満たすこと", () => {
    expectTypeOf<ThemeContract>().toExtend<SemanticTokenTree<Primitives>>();
    expectTypeOf<ThemeContract>().toExtend<TokenTree>();
  });

  it("Themes の全テーマ・全モードが ThemeContract および SemanticTokenTree<Primitives> を満たすこと", () => {
    type AnyThemeVariant = Themes[keyof Themes][ThemeMode];

    expectTypeOf<AnyThemeVariant>().toExtend<ThemeContract>();
    expectTypeOf<AnyThemeVariant>().toExtend<SemanticTokenTree<Primitives>>();
  });
});

describe("異常系", () => {
  it("必須グループが欠落した型は ThemeContract を満たさないこと", () => {
    expectTypeOf<Omit<ThemeContract, "color">>().not.toExtend<ThemeContract>();
    expectTypeOf<Omit<ThemeContract, "font">>().not.toExtend<ThemeContract>();
  });

  it("異なる $type や存在しないトークンパスを指定した型は ThemeContract を満たさないこと", () => {
    type InvalidDurationType = Omit<ThemeContract, "duration"> & {
      readonly duration: {
        readonly fast: { readonly $type: "duration"; readonly $value: "{spacing.4}" };
        readonly normal: { readonly $type: "duration"; readonly $value: "{duration.150}" };
        readonly slow: { readonly $type: "duration"; readonly $value: "{duration.200}" };
      };
    };

    type MissingTokenPath = Omit<ThemeContract, "duration"> & {
      readonly duration: {
        readonly fast: { readonly $type: "duration"; readonly $value: "{duration.999}" };
        readonly normal: { readonly $type: "duration"; readonly $value: "{duration.150}" };
        readonly slow: { readonly $type: "duration"; readonly $value: "{duration.200}" };
      };
    };

    expectTypeOf<InvalidDurationType>().not.toExtend<ThemeContract>();
    expectTypeOf<MissingTokenPath>().not.toExtend<ThemeContract>();
  });
});
