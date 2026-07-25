import { noCloudflareStorageTypes } from "../selectors/no-cloudflare-storage-types.js";
import { noMathRandom } from "../selectors/no-math-random.js";
import { noNondeterministicDate } from "../selectors/no-nondeterministic-date.js";

import { base } from "./base.js";

/**
 * Core層向けの `no-restricted-syntax` セレクタ集合。
 * base に加え、ストレージ型参照と非決定的処理を禁止する。
 */
export const noCoreSideEffects = [
  ...base,
  ...noCloudflareStorageTypes,
  ...noNondeterministicDate,
  ...noMathRandom,
] as const;
