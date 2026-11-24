import { type Primitives } from "../primitives/index.js";
import { type SemanticToken } from "../spec/index.js";

type ColorEmphasisGroup = Readonly<{
  readonly default: SemanticToken<Primitives, "color">;
  readonly emphasized: SemanticToken<Primitives, "color">;
  readonly subtle: SemanticToken<Primitives, "color">;
  readonly muted: SemanticToken<Primitives, "color">;
}>;

type StatusTokenMap<Value> = Readonly<{
  readonly info: Value;
  readonly success: Value;
  readonly warning: Value;
  readonly danger: Value;
}>;

/**
 * モード（Light / Dark）によって切り替わる Semantic カラートークン契約型です。
 */
export type ColorThemeContract = Readonly<{
  readonly color: {
    readonly bg: {
      readonly canvas: SemanticToken<Primitives, "color">;
      readonly surface: SemanticToken<Primitives, "color">;
      readonly subtle: SemanticToken<Primitives, "color">;
      readonly muted: SemanticToken<Primitives, "color">;
      readonly emphasized: SemanticToken<Primitives, "color">;
      readonly inverse: SemanticToken<Primitives, "color">;
      readonly accent: ColorEmphasisGroup;
      readonly status: StatusTokenMap<ColorEmphasisGroup>;
    };
    readonly fg: {
      readonly default: SemanticToken<Primitives, "color">;
      readonly muted: SemanticToken<Primitives, "color">;
      readonly subtle: SemanticToken<Primitives, "color">;
      readonly disabled: SemanticToken<Primitives, "color">;
      readonly inverse: SemanticToken<Primitives, "color">;
      readonly accent: SemanticToken<Primitives, "color">;
      readonly status: StatusTokenMap<SemanticToken<Primitives, "color">>;
    };
    readonly border: {
      readonly default: SemanticToken<Primitives, "color">;
      readonly subtle: SemanticToken<Primitives, "color">;
      readonly emphasized: SemanticToken<Primitives, "color">;
      readonly focus: SemanticToken<Primitives, "color">;
      readonly accent: SemanticToken<Primitives, "color">;
      readonly status: StatusTokenMap<SemanticToken<Primitives, "color">>;
    };
  };
}>;
