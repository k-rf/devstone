/**
 * 2 つの時間区間の位置関係を表す 9 値ユニオン型
 */
export type IntervalRelation =
  | "Equivalent"
  | "Less"
  | "Greater"
  | "LessOverlap"
  | "GreaterOverlap"
  | "LessInner"
  | "GreaterInner"
  | "LessOuter"
  | "GreaterOuter";
