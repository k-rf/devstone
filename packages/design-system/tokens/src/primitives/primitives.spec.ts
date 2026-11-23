import { expect, it } from "vitest";

import { Primitives } from "../index.js";

it("プリミティブトークン定義がスナップショットと一致すること", () => {
  expect(Primitives).toMatchSnapshot();
});
