/**
 * 本番コードでの throw 文を禁止し、全域関数または Effect のエラーチャネルへ誘導する。
 */
export const noThrowInProduction = [
  {
    selector: "ThrowStatement",
    message:
      "本番コードでの throw は禁止です。全域関数または Effect のエラーチャネルを使用してください。",
  },
] as const;
