import { type TokenCore } from "@terrazzo/token-types";
import { type ReadonlyDeep } from "type-fest";

import { type TokenAlias } from "./token-alias.js";
import { type TokenTree } from "./token-tree.js";
import { type TokenType } from "./token-type.js";

/**
 * Primitive トークンツリー内の同一 `$type` トークンへのエイリアス参照のみを許容する Semantic トークン型です。
 * @template Primitives - 参照元の Primitive トークンツリー型
 * @template Type - トークンの `$type`
 */
export type SemanticToken<
  Primitives extends TokenTree,
  Type extends TokenType = TokenType,
> = Type extends TokenType
  ? ReadonlyDeep<TokenCore> & {
      readonly $type: Type;
      readonly $value: TokenAlias<Primitives, Type>;
    }
  : never;
