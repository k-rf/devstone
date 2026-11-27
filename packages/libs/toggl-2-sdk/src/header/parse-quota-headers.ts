import { Option } from "effect";

import { type Toggl2QuotaInfo } from "../schema/quota-info.js";

const parseNonNegativeIntegerHeader = (headers: Headers, name: string): Option.Option<number> =>
  Option.fromNullable(headers.get(name)).pipe(
    Option.map((value) => value.trim()),
    Option.filter((trimmed) => trimmed.length > 0),
    Option.map(Number),
    Option.filter((parsed) => Number.isInteger(parsed) && parsed >= 0),
  );

/**
 * HTTP レスポンスヘッダから Toggl 2.0 のクォータ情報を解析する
 * @param headers - HTTP レスポンスヘッダ
 * @returns パースされたクォータ情報
 */
export const parseQuotaHeaders = (headers: Headers): Toggl2QuotaInfo => ({
  remaining: parseNonNegativeIntegerHeader(headers, "X-Toggl-Quota-Remaining"),
  resetsInSeconds: parseNonNegativeIntegerHeader(headers, "X-Toggl-Quota-Resets-In"),
});
