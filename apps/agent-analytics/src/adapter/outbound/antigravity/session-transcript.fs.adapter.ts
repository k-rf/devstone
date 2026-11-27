import path from "node:path";

import { FileSystem } from "@effect/platform";
import { Effect, Layer, Schema } from "effect";

import {
  SessionTranscriptError,
  SessionTranscriptPort,
} from "../../../core/port/outbound/antigravity/session-transcript.port.js";

import { mapTranscriptStepsToToolCalls } from "./transcript.mapper.js";
import { TranscriptStepFromJsonPayload, type TranscriptStepPayload } from "./transcript.payload.js";

const parseJsonlContent = (
  content: string,
): Effect.Effect<readonly TranscriptStepPayload[], SessionTranscriptError> => {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return Effect.all(
    lines.map((line) =>
      Schema.decodeUnknown(TranscriptStepFromJsonPayload)(line).pipe(
        Effect.mapError(
          (error) =>
            new SessionTranscriptError({
              message: `トランスクリプト行のパースに失敗しました: ${error.message}`,
              cause: error,
            }),
        ),
      ),
    ),
  );
};

const readTranscriptFile = (
  fs: FileSystem.FileSystem,
  filePath: string,
): Effect.Effect<readonly TranscriptStepPayload[], SessionTranscriptError> =>
  fs.readFileString(filePath).pipe(
    Effect.mapError(
      (error) =>
        new SessionTranscriptError({
          message: `トランスクリプトファイルの読み込みに失敗しました: ${error.message}`,
          cause: error,
        }),
    ),
    Effect.flatMap((content) => parseJsonlContent(content)),
  );

const readFullTranscriptIfNeeded = (
  fs: FileSystem.FileSystem,
  transcriptPath: string,
  compactSteps: readonly TranscriptStepPayload[],
): Effect.Effect<readonly TranscriptStepPayload[], SessionTranscriptError> =>
  Effect.gen(function* () {
    const needsFull = compactSteps.some(
      (step) => step.truncated_fields?.includes("tool_calls") === true,
    );
    if (!needsFull) return [];

    const fullPath = path.join(path.dirname(transcriptPath), "transcript_full.jsonl");
    const exists = yield* fs.exists(fullPath).pipe(
      Effect.mapError(
        (error) =>
          new SessionTranscriptError({
            message: `完全版トランスクリプトの存在確認に失敗しました: ${error.message}`,
            cause: error,
          }),
      ),
    );

    return exists ? yield* readTranscriptFile(fs, fullPath) : [];
  });

/**
 * FileSystem を用いてセッショントランスクリプトを読み取る Outbound Adapter 実装 Layer。
 */
export const SessionTranscriptFsLive = Layer.effect(
  SessionTranscriptPort,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    return {
      readToolCalls: (transcriptPath) =>
        Effect.gen(function* () {
          const compactSteps = yield* readTranscriptFile(fs, transcriptPath);
          const fullSteps = yield* readFullTranscriptIfNeeded(fs, transcriptPath, compactSteps);
          return mapTranscriptStepsToToolCalls(compactSteps, fullSteps);
        }),
    };
  }),
);
