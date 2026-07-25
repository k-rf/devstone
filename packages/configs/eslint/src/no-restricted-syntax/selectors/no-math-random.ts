/**
 * Core層での Math.random() を禁止し、Effect-TS の Random へ誘導する。
 */
export const noMathRandom = [
  {
    selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
    message:
      "Core層で Math.random() を使わないでください。Effect-TS の Random を使用してください。",
  },
] as const;
