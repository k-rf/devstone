import { Effect } from "effect";
import { expect, it } from "vitest";

import { formatStatusLineActivity } from "./format-statusline.activity.js";

it("スキルとツールの統計を1行の statusLine 文字列に整形できること", async () => {
  // Arrange
  const stats = {
    skills: [
      { name: "notion-context-sync", count: 2 },
      { name: "diff-review", count: 1 },
    ],
    tools: [
      { name: "read_file", count: 5 },
      { name: "run_command", count: 2 },
    ],
  };

  // Act
  const result = await Effect.runPromise(formatStatusLineActivity(stats));

  // Assert
  expect(result).toBe(
    "Skills: notion-context-sync(2), diff-review(1) | Tools: read_file(5), run_command(2)",
  );
});

it("スキルまたはツールが0件の場合、none と表記されること", async () => {
  // Arrange
  const emptyStats = {
    skills: [],
    tools: [],
  };

  // Act
  const result = await Effect.runPromise(formatStatusLineActivity(emptyStats));

  // Assert
  expect(result).toBe("Skills: none | Tools: none");
});
