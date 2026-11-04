import { Schema } from "effect";
import { expect, it } from "vitest";

import { ToolCallEntry } from "../../../core/domain/session-stats.js";

import { mapTranscriptStepsToToolCalls } from "./transcript.mapper.js";
import { type TranscriptStepPayload } from "./transcript.payload.js";

it("通常ステップの tool_calls から Path や AbsolutePath をアンエスケープして抽出できること", () => {
  // Arrange
  const compactSteps: readonly TranscriptStepPayload[] = [
    {
      step_index: 1,
    },
    {
      step_index: 2,
      truncated_fields: ["content"],
      tool_calls: [
        {
          name: "read_file",
          args: {
            Path: '"/home/devstone/.agents/skills/notion-context-sync/SKILL.md"',
          },
        },
        {
          name: "view_file",
          args: {
            AbsolutePath: "/home/devstone/.agents/skills/commit-plan/SKILL.md",
          },
        },
        {
          name: "run_command",
        },
        {
          name: "read_file",
          args: {
            Path: 123,
          },
        },
      ],
    },
  ];

  // Act
  const result = mapTranscriptStepsToToolCalls(compactSteps, []);
  const validated = Schema.decodeUnknownSync(Schema.Array(ToolCallEntry))(result);

  // Assert
  expect(validated).toEqual([
    {
      toolName: "read_file",
      targetPath: "/home/devstone/.agents/skills/notion-context-sync/SKILL.md",
    },
    {
      toolName: "view_file",
      targetPath: "/home/devstone/.agents/skills/commit-plan/SKILL.md",
    },
    {
      toolName: "run_command",
    },
    {
      toolName: "read_file",
    },
  ]);
});

it("truncated_fields に tool_calls が含まれる場合、完全版の同一 step_index の tool_calls で補完されること", () => {
  // Arrange
  const compactSteps: readonly TranscriptStepPayload[] = [
    {
      step_index: 3,
      truncated_fields: ["tool_calls"],
      tool_calls: [{ name: "read_file" }],
    },
    {
      step_index: 4,
      truncated_fields: ["tool_calls"],
      tool_calls: [{ name: "run_command" }],
    },
    {
      step_index: 5,
      truncated_fields: ["tool_calls"],
    },
    {
      truncated_fields: ["tool_calls"],
    },
  ];

  const fullSteps: readonly TranscriptStepPayload[] = [
    {
      step_index: 3,
      tool_calls: [
        {
          name: "read_file",
          args: {
            Path: "/home/devstone/.agents/skills/diff-review/SKILL.md",
          },
        },
      ],
    },
    {
      step_index: 5,
    },
  ];

  // Act
  const result = mapTranscriptStepsToToolCalls(compactSteps, fullSteps);

  // Assert
  expect(result).toEqual([
    {
      toolName: "read_file",
      targetPath: "/home/devstone/.agents/skills/diff-review/SKILL.md",
    },
    {
      toolName: "run_command",
    },
  ]);
});
