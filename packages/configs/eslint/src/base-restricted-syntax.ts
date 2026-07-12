/**
 * `base` と層別設定で共有する `no-restricted-syntax` セレクタ。
 * flat config では後勝ちのため、上書き側はこれを含めて合成する。
 */
export const baseRestrictedSyntaxSelectors = [
  {
    selector:
      "TSAsExpression:has(> TSAsExpression.expression[typeAnnotation.type='TSUnknownKeyword'])",
    message:
      "`as unknown as` は型チェックを完全に迂回します。型安全になるように実装を見直してください。",
  },
  {
    // HACK: エラーになる条件がかなり緩いのでカスタムを作る
    selector:
      "CallExpression:matches([callee.name='describe'], [callee.object.name='describe'])[arguments.0.type='Literal'][arguments.0.value=/^[a-zA-Z0-9$]+$/]",
    message:
      "describe の説明に関数名やクラス名などの識別子を繰り返すことは禁止されています。意味のあるコンテキストを記述してください。",
  },
  {
    selector: "ImportDeclaration[importKind='type']",
    message: "import type ... ではなく、import { type ... } を使用してください。",
  },
] as const;
