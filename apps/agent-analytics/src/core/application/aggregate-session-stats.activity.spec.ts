import { Effect } from "effect";
import { expect, it } from "vitest";

import { type ToolCallEntry } from "../domain/session-stats.js";

import { aggregateSessionStatsActivity } from "./aggregate-session-stats.activity.js";

it("スキル発動回数とツール使用回数をそれぞれカウント降順・名前昇順で集計できること", async () => {
  // Arrange
  const toolCalls: readonly ToolCallEntry[] = [
    {
      toolName: "read_file",
      targetPath: "/workspace/.agents/skills/notion-context-sync/SKILL.md",
    },
    {
      toolName: "view_file",
      targetPath: "/workspace/.agents/skills/diff-review/SKILL.md",
    },
    {
      toolName: "read_file",
      targetPath: "skills/notion-context-sync/SKILL.md",
    },
    {
      toolName: "read_file",
      targetPath: "/workspace/README.md",
    },
    {
      toolName: "read_file",
    },
    {
      toolName: "run_command",
    },
    {
      toolName: "edit_file",
      targetPath: "/workspace/.agents/skills/ignored-skill/SKILL.md",
    },
  ];

  // Act
  const result = await Effect.runPromise(aggregateSessionStatsActivity(toolCalls));

  // Assert
  expect(result).toEqual({
    skills: [
      { name: "notion-context-sync", count: 2 },
      { name: "diff-review", count: 1 },
    ],
    tools: [
      { name: "read_file", count: 4 },
      { name: "edit_file", count: 1 },
      { name: "run_command", count: 1 },
      { name: "view_file", count: 1 },
    ],
  });
});

it("ツール呼び出しが空の場合、skills と tools がともに空配列になること", async () => {
  // Arrange & Act
  const result = await Effect.runPromise(aggregateSessionStatsActivity([]));

  // Assert
  expect(result).toEqual({
    skills: [],
    tools: [],
  });
});
