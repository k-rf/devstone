import { type DtcgToken } from "./dtcg-token.js";

/**
 * 末端トークンへの `$type` と `$value` の明記を強制する DTCG トークンツリー型です。
 * ネストしたグループ構造を許容し、末端は `@terrazzo/token-types` の各 Token 型に合致する必要があります。
 */
export interface TokenTree {
  readonly [key: string]: DtcgToken | TokenTree;
}
