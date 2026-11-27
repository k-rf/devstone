import { Option } from "effect";
import { expect, it } from "vitest";

import { parseQuotaHeaders } from "./parse-quota-headers.js";

it("X-Toggl-Quota-Remaining と X-Toggl-Quota-Resets-In が正の整数のとき Option.some として取得できること", () => {
  const headers = new Headers({
    "X-Toggl-Quota-Remaining": "29",
    "X-Toggl-Quota-Resets-In": "3600",
  });

  expect(parseQuotaHeaders(headers)).toStrictEqual({
    remaining: Option.some(29),
    resetsInSeconds: Option.some(3600),
  });
});

it("クォータヘッダが 0 や前後に空白を含む場合でも正常にパースできること", () => {
  const headers = new Headers({
    "x-toggl-quota-remaining": " 0 ",
    "x-toggl-quota-resets-in": "  15  ",
  });

  expect(parseQuotaHeaders(headers)).toStrictEqual({
    remaining: Option.some(0),
    resetsInSeconds: Option.some(15),
  });
});

it("クォータヘッダが存在しないとき Option.none になること", () => {
  const headers = new Headers();

  expect(parseQuotaHeaders(headers)).toStrictEqual({
    remaining: Option.none(),
    resetsInSeconds: Option.none(),
  });
});

it.each([
  { label: "空文字", value: "" },
  { label: "空白のみ", value: "   " },
  { label: "非数値", value: "abc" },
  { label: "負の数", value: "-1" },
  { label: "小数", value: "1.5" },
  { label: "NaN", value: "NaN" },
  { label: "Infinity", value: "Infinity" },
  { label: "数値と文字の混在", value: "10px" },
])("不正なクォータヘッダ値（$label）は Option.none になること", ({ value }) => {
  const headers = new Headers({
    "X-Toggl-Quota-Remaining": value,
    "X-Toggl-Quota-Resets-In": value,
  });

  expect(parseQuotaHeaders(headers)).toStrictEqual({
    remaining: Option.none(),
    resetsInSeconds: Option.none(),
  });
});
