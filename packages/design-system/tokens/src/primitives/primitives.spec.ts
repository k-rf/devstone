import { expect, it } from "vitest";

import { primitives, type Primitives } from "../index.js";

it("プリミティブトークン定義がスナップショットと一致する", () => {
  const subject: Primitives = primitives;
  expect(subject).toMatchSnapshot();
});
