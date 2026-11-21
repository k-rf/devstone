import { expect, it } from "vitest";

import { Primitives } from "../index.js";

it("プリミティブトークン定義がスナップショットと一致する", () => {
  const subject: Primitives = Primitives;
  expect(subject).toMatchSnapshot();
});
