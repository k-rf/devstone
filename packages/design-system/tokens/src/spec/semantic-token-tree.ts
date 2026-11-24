import { type SemanticToken } from "./semantic-token.js";
import { type TokenTree } from "./token-tree.js";

/**
 * Primitive トークンツリーの実在パスのみを `$type` 別にエイリアス参照できる Semantic トークンツリー型です。
 * @template Primitives - 参照元の Primitive トークンツリー型
 */
export interface SemanticTokenTree<Primitives extends TokenTree> {
  readonly [key: string]: SemanticToken<Primitives> | SemanticTokenTree<Primitives>;
}
