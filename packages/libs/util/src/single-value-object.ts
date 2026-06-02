import { type IsUnion } from "type-fest";

/**
 * 単一のプロパティキーのみを持つ（キーがユニオン型ではない）オブジェクトの型を表現します。
 * @template T - 対象のオブジェクト型
 * @template K - オブジェクトのキーの型
 */
export type SingleValueObject<T extends Record<PropertyKey, unknown>, K extends keyof T = keyof T> =
  IsUnion<K> extends true ? never : T;
