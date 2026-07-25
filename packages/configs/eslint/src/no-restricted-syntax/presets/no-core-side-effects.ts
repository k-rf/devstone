import { noCloudflareStorageTypes } from "../selectors/no-cloudflare-storage-types.js";
import { noMathRandom } from "../selectors/no-math-random.js";
import { noNondeterministicDate } from "../selectors/no-nondeterministic-date.js";

import { base } from "./base.js";

export const noCoreSideEffects = [
  ...base,
  ...noCloudflareStorageTypes,
  ...noNondeterministicDate,
  ...noMathRandom,
] as const;
