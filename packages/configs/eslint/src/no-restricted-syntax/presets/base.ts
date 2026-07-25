import { noAsUnknownAs } from "../selectors/no-as-unknown-as.js";
import { noDescribeIdentifierName } from "../selectors/no-describe-identifier-name.js";
import { noImportTypeDeclaration } from "../selectors/no-import-type-declaration.js";

/**
 * ワークスペース共通の `no-restricted-syntax` セレクタ集合。
 */
export const base = [
  ...noAsUnknownAs,
  ...noDescribeIdentifierName,
  ...noImportTypeDeclaration,
] as const;
