import { type Token } from "@terrazzo/token-types";
import { type ReadonlyDeep } from "type-fest";

/**
 * `@terrazzo/token-types` の `Token` 型を再帰的に不変にした末端トークン型です。
 * `$type` と `$value` の明記が必須となり、`as const` で定義された配列やオブジェクト値も許容します。
 */
export type DtcgToken = ReadonlyDeep<Token>;
