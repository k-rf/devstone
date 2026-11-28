import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { Toggl2QuotaInfo } from "./quota-info.js";

it("Option で表されたクォータ情報をデコードできること", () => {
  const decoded = Schema.decodeUnknownSync(Toggl2QuotaInfo)({
    remaining: Option.some(29),
    resetsInSeconds: Option.none(),
  });

  expect(decoded).toStrictEqual({
    remaining: Option.some(29),
    resetsInSeconds: Option.none(),
  });
});

it("Option 以外の値を渡した場合は Schema.decodeUnknownSync で失敗すること", () => {
  expect(() =>
    Schema.decodeUnknownSync(Toggl2QuotaInfo)({
      remaining: 29,
      resetsInSeconds: 3600,
    }),
  ).toThrow();
});
