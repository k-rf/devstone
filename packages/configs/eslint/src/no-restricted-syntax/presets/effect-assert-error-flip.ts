import { noEffectAssertExit } from "../selectors/no-effect-assert-exit.js";

/**
 * テストコード向けのエラーアサーション制限セレクタ集合。
 */
export const effectAssertErrorFlip = [...noEffectAssertExit] as const;
