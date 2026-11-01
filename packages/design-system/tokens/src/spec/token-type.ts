import { type Token } from "@terrazzo/token-types";

/**
 * W3C DTCG 仕様で定義されるトークン種別（`$type`）のユニオン型です。
 */
export type TokenType = Token["$type"];
