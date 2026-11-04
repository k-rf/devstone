import { type ToolCallEntry } from "../../../core/domain/session-stats.js";

import {
  type TranscriptStepPayload,
  type TranscriptToolCallPayload,
} from "./transcript.payload.js";

const extractTargetPath = (toolCall: TranscriptToolCallPayload): string | undefined => {
  const rawPath = toolCall.args?.["Path"] ?? toolCall.args?.["AbsolutePath"];
  return typeof rawPath === "string" ? rawPath.replaceAll(/^"|"$|\\/gu, "") : undefined;
};

const toToolCallEntry = (toolCall: TranscriptToolCallPayload): ToolCallEntry => {
  const targetPath = extractTargetPath(toolCall);
  return targetPath === undefined
    ? { toolName: toolCall.name }
    : { toolName: toolCall.name, targetPath: targetPath };
};

const resolveStepToolCalls = (
  step: TranscriptStepPayload,
  fullSteps: readonly TranscriptStepPayload[],
): readonly TranscriptToolCallPayload[] => {
  const isToolCallsTruncated = step.truncated_fields?.includes("tool_calls") === true;
  if (!isToolCallsTruncated || step.step_index === undefined) {
    return step.tool_calls ?? [];
  }

  const matchedFullStep = fullSteps.find((fullStep) => fullStep.step_index === step.step_index);
  return matchedFullStep?.tool_calls ?? step.tool_calls ?? [];
};

/**
 * コンパクト版および完全版のトランスクリプトステップ群をマージし、ドメインの ToolCallEntry 配列に変換する。
 * @param compactSteps - transcript.jsonl から読み取ったステップ配列
 * @param fullSteps - transcript_full.jsonl から読み取ったステップ配列
 * @returns ドメインのツール呼び出しエントリ配列
 */
export const mapTranscriptStepsToToolCalls = (
  compactSteps: readonly TranscriptStepPayload[],
  fullSteps: readonly TranscriptStepPayload[],
): readonly ToolCallEntry[] =>
  compactSteps.flatMap((step) =>
    resolveStepToolCalls(step, fullSteps).map((toolCall) => toToolCallEntry(toolCall)),
  );
