import { expect, it } from "vitest";

import { Themes } from "../index.js";

it("テーマ定義がスナップショットと一致する", () => {
  const subject: Themes = Themes;
  expect(subject).toMatchSnapshot();
});
