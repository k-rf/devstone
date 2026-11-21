import { type Primitives } from "../primitives/index.js";
import { type SemanticToken } from "../spec/index.js";

/**
 * モード（Light / Dark）に依存しない、テーマ共通の Semantic トークン契約型です。
 */
export type BaseThemeContract = Readonly<{
  readonly font: {
    readonly family: {
      readonly heading: SemanticToken<Primitives, "fontFamily">;
      readonly body: SemanticToken<Primitives, "fontFamily">;
      readonly mono: SemanticToken<Primitives, "fontFamily">;
    };
    readonly size: {
      readonly xs: SemanticToken<Primitives, "dimension">;
      readonly sm: SemanticToken<Primitives, "dimension">;
      readonly md: SemanticToken<Primitives, "dimension">;
      readonly lg: SemanticToken<Primitives, "dimension">;
      readonly xl: SemanticToken<Primitives, "dimension">;
      readonly "2xl": SemanticToken<Primitives, "dimension">;
      readonly "3xl": SemanticToken<Primitives, "dimension">;
      readonly "4xl": SemanticToken<Primitives, "dimension">;
    };
    readonly weight: {
      readonly regular: SemanticToken<Primitives, "fontWeight">;
      readonly medium: SemanticToken<Primitives, "fontWeight">;
      readonly semibold: SemanticToken<Primitives, "fontWeight">;
      readonly bold: SemanticToken<Primitives, "fontWeight">;
    };
    readonly lineHeight: {
      readonly tight: SemanticToken<Primitives, "number">;
      readonly normal: SemanticToken<Primitives, "number">;
      readonly relaxed: SemanticToken<Primitives, "number">;
    };
  };
  readonly radius: {
    readonly none: SemanticToken<Primitives, "dimension">;
    readonly xs: SemanticToken<Primitives, "dimension">;
    readonly sm: SemanticToken<Primitives, "dimension">;
    readonly md: SemanticToken<Primitives, "dimension">;
    readonly lg: SemanticToken<Primitives, "dimension">;
    readonly xl: SemanticToken<Primitives, "dimension">;
    readonly full: SemanticToken<Primitives, "dimension">;
  };
  readonly spacing: {
    readonly xs: SemanticToken<Primitives, "dimension">;
    readonly sm: SemanticToken<Primitives, "dimension">;
    readonly md: SemanticToken<Primitives, "dimension">;
    readonly lg: SemanticToken<Primitives, "dimension">;
    readonly xl: SemanticToken<Primitives, "dimension">;
    readonly "2xl": SemanticToken<Primitives, "dimension">;
    readonly "3xl": SemanticToken<Primitives, "dimension">;
  };
  readonly borderWidth: {
    readonly thin: SemanticToken<Primitives, "dimension">;
    readonly default: SemanticToken<Primitives, "dimension">;
    readonly thick: SemanticToken<Primitives, "dimension">;
  };
  readonly duration: {
    readonly fast: SemanticToken<Primitives, "duration">;
    readonly normal: SemanticToken<Primitives, "duration">;
    readonly slow: SemanticToken<Primitives, "duration">;
  };
  readonly easing: {
    readonly default: SemanticToken<Primitives, "cubicBezier">;
    readonly in: SemanticToken<Primitives, "cubicBezier">;
    readonly out: SemanticToken<Primitives, "cubicBezier">;
  };
}>;
