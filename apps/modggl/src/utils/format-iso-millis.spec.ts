import { expect, it } from "vitest";

import { formatIsoMillis } from "./format-iso-millis.js";

it("Unix エポックミリ秒を ISO 8601 UTC 文字列へ変換できること", () => {
  expect(formatIsoMillis(Date.parse("2026-11-27T09:00:00.123Z"))).toBe("2026-11-27T09:00:00.123Z");
});
