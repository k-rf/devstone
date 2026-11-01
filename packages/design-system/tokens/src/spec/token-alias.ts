import { type ValueOf } from "type-fest";

import { type TokenTree } from "./token-tree.js";
import { type TokenType } from "./token-type.js";

/**
 * トークンツリーから、指定した `$type` を持つ末端トークンのドット区切りパス（`path.to.token`）を抽出する内部型です。
 * @template Tree - 抽出元のトークンツリー型
 * @template Type - 抽出対象のトークン `$type`
 */
type TokenPath<Tree extends TokenTree, Type extends TokenType = TokenType> = ValueOf<{
  readonly [K in keyof Tree & (string | number)]: Tree[K] extends {
    readonly $type: infer LeafType extends TokenType;
    readonly $value: unknown;
  }
    ? LeafType extends Type
      ? `${K}`
      : never
    : Tree[K] extends TokenTree
      ? `${K}.${TokenPath<Tree[K], Type>}`
      : never;
}>;

/**
 * Primitive トークンツリーから、指定した `$type` を持つトークンの実在パスだけを
 * DTCG エイリアス形式（`{path.to.token}`）として抽出・補完する型です。
 * @template Primitives - 参照元の Primitive トークンツリー型
 * @template Type - 抽出対象のトークン `$type`
 */
export type TokenAlias<
  Primitives extends TokenTree,
  Type extends TokenType = TokenType,
> = `{${TokenPath<Primitives, Type>}}`;
