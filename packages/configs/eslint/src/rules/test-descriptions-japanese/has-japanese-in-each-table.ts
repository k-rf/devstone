import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { extractDescriptionText } from "./extract-description-text.js";
import { hasJapaneseCharacter } from "./has-japanese-character.js";

const placeholderPattern = /^\$([a-zA-Z_]\w*)$/u;

const isTargetProperty = (
  property: TSESTree.ObjectLiteralElement,
  propertyName: string,
): property is TSESTree.Property => {
  if (property.type !== AST_NODE_TYPES.Property) {
    return false;
  }

  if (property.key.type === AST_NODE_TYPES.Identifier && property.key.name === propertyName) {
    return true;
  }

  return property.key.type === AST_NODE_TYPES.Literal && property.key.value === propertyName;
};

/**
 * it.each の引数が $name 形式のプレースホルダーである場合、
 * テーブル要素の対応するプロパティ値に日本語が含まれているかを検証する。
 */
export const hasJapaneseInEachTable = (
  callNode: TSESTree.CallExpression,
  description: string,
): boolean => {
  const match = placeholderPattern.exec(description);
  const propertyName = match?.[1];
  if (propertyName === undefined) {
    return false;
  }

  if (callNode.callee.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }

  const tableNode = callNode.callee.arguments[0];
  if (tableNode === undefined) {
    return false;
  }

  if (tableNode.type !== AST_NODE_TYPES.ArrayExpression) {
    return true;
  }

  if (tableNode.elements.length === 0) {
    return true;
  }

  return tableNode.elements.every((element) => {
    if (element?.type !== AST_NODE_TYPES.ObjectExpression) {
      return false;
    }

    const targetProperty = element.properties.find((property) =>
      isTargetProperty(property, propertyName),
    );

    if (targetProperty === undefined) {
      return false;
    }

    const valueText = extractDescriptionText(targetProperty.value);
    if (valueText === undefined) {
      return true;
    }

    return hasJapaneseCharacter(valueText);
  });
};
