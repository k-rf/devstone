import { type TokenCore } from "@terrazzo/token-types";
import { type ReadonlyDeep } from "type-fest";

import { type TokenAlias } from "./token-alias.js";
import { type TokenTree } from "./token-tree.js";
import { type TokenType } from "./token-type.js";

/**
 * Primitive トークンツリー内の同一 `$type` トークンへのエイリアス参照のみを許容する内部の Semantic トークン型です。
 * @template Primitives - 参照元の Primitive トークンツリー型
 * @template Type - トークンの `$type`
 */
type SemanticToken<
  Primitives extends TokenTree,
  Type extends TokenType = TokenType,
> = Type extends TokenType
  ? ReadonlyDeep<TokenCore> & {
      readonly $type: Type;
      readonly $value: TokenAlias<Primitives, Type>;
    }
  : never;

/**
 * Primitive トークンツリーの実在パスのみを `$type` 別にエイリアス参照できる Semantic トークンツリー型です。
 * @template Primitives - 参照元の Primitive トークンツリー型
 */
export interface SemanticTokenTree<Primitives extends TokenTree> {
  readonly [key: string]: SemanticToken<Primitives> | SemanticTokenTree<Primitives>;
}
