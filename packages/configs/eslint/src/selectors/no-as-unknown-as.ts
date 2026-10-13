/**
 * `as unknown as T` による型チェックの完全迂回を禁止する。
 */
export const noAsUnknownAs = [
  {
    selector:
      "TSAsExpression:has(> TSAsExpression.expression[typeAnnotation.type='TSUnknownKeyword'])",
    message:
      "`as unknown as` は型チェックを完全に迂回します。型安全になるように実装を見直してください。",
  },
] as const;
