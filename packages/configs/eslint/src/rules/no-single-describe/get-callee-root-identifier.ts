import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

import { noop } from "../libs/noop.js";

const { CallExpression, Identifier, MemberExpression, TaggedTemplateExpression } = AST_NODE_TYPES;

/**
 * 式チェーンのルートにある Identifier を取得する。
 */
export const getCalleeRootIdentifier = (node: TSESTree.Node): TSESTree.Identifier | undefined =>
  match(node)
    .with({ type: Identifier }, (identifier) => identifier)
    .with({ type: MemberExpression }, ({ object }) => getCalleeRootIdentifier(object))
    .with({ type: CallExpression }, ({ callee }) => getCalleeRootIdentifier(callee))
    .with({ type: TaggedTemplateExpression }, ({ tag }) => getCalleeRootIdentifier(tag))
    .otherwise(noop);
