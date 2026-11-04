import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { StatusLinePayload } from "./statusline.payload.js";

describe("正常系", () => {
  it("snake_case の transcript_path を持つ JSON 文字列をデコードおよびエンコードできること", () => {
    // Arrange
    const rawJson = JSON.stringify({
      transcript_path: "/home/user/transcript.jsonl",
    });

    // Act
    const decoded = Schema.decodeUnknownSync(StatusLinePayload)(rawJson);
    const encoded = Schema.encodeSync(StatusLinePayload)(decoded);

    // Assert
    expect(decoded).toEqual({
      transcriptPath: "/home/user/transcript.jsonl",
    });
    expect(JSON.parse(encoded)).toEqual({
      transcript_path: "/home/user/transcript.jsonl",
    });
  });

  it("camelCase の transcriptPath を持つ JSON 文字列をデコードできること", () => {
    // Arrange
    const rawJson = JSON.stringify({
      transcriptPath: "/home/user/transcript.jsonl",
    });

    // Act
    const decoded = Schema.decodeUnknownSync(StatusLinePayload)(rawJson);

    // Assert
    expect(decoded).toEqual({
      transcriptPath: "/home/user/transcript.jsonl",
    });
  });
});

describe("異常系", () => {
  it("transcript_path も transcriptPath も含まれない JSON の場合、デコードエラーになること", async () => {
    // Arrange
    const rawJson = JSON.stringify({
      other_field: "value",
    });

    // Act
    const error = await Effect.runPromise(
      Effect.flip(Schema.decodeUnknown(StatusLinePayload)(rawJson)),
    );

    // Assert
    expect(error).toBeDefined();
  });
});
