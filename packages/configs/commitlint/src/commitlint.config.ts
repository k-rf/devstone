import lint from "@commitlint/lint";
import { parse } from "@commitlint/parse";
import {
  RuleConfigSeverity,
  type Rule,
  type RuleConfigCondition,
  type UserConfig,
} from "@commitlint/types";
import { Match } from "effect";

import { typeEnums } from "./type-enum.js";

const emojis = typeEnums.map((typeEnum) => typeEnum.value).join("|");
const headerPattern = new RegExp(String.raw`^(${emojis}) (.+-\d+) (.+)$`);
const parserOptions = {
  headerPattern: headerPattern,
  headerCorrespondence: ["type", "ticket", "subject"],
};

const isPresent = (value: string | undefined): value is string => {
  return value !== undefined && value !== "";
};

const readTicket = (parsed: Parameters<Rule>[0]): string | undefined => {
  const value = Reflect.get(parsed, "ticket");
  return typeof value === "string" ? value : undefined;
};

export const evaluateTicketEmpty = (
  ticket: string | undefined,
  when: RuleConfigCondition | (string & {}) = "always",
): readonly [boolean, string] => {
  return Match.value(when).pipe(
    Match.withReturnType<readonly [boolean, string]>(),
    Match.when("always", () => [!isPresent(ticket), "ticket must be empty"] as const),
    Match.when("never", () => [isPresent(ticket), "ticket may not be empty"] as const),
    Match.orElse(() => [false, "Unknown `when` value"] as const),
  );
};

export const ticketEmpty: Rule = (parsed, when = "always") => {
  return evaluateTicketEmpty(readTicket(parsed), when);
};

const rules = {
  "type-enum": [
    RuleConfigSeverity.Error,
    "always",
    typeEnums.map((typeEnum) => typeEnum.value),
  ] as const,
};

const config: UserConfig = {
  parserPreset: {
    parserOpts: parserOptions,
  },
  plugins: [
    {
      rules: {
        "ticket-empty": ticketEmpty,
      },
    },
  ],
  rules: {
    "type-enum": rules["type-enum"],
    "type-empty": [RuleConfigSeverity.Error, "never"],
    "subject-empty": [RuleConfigSeverity.Error, "never"],
    "ticket-empty": [RuleConfigSeverity.Error, "never"],
    "header-full-stop": [RuleConfigSeverity.Error, "never", "."],
  },
};

export default config;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const lintMessage = async (message: string) => {
    return lint(message, config.rules as Parameters<typeof lint>[1], {
      parserOpts: parserOptions,
      plugins: {
        local: {
          rules: {
            "ticket-empty": ticketEmpty,
          },
        },
      },
    });
  };

  describe("正常系", () => {
    it.each([
      "✨ DEV-33 コミットメッセージ規約を統一する",
      "🔧 DEV-1 設定を更新する",
      "♻️ ABC-123 refactor helpers",
    ] as const)("%s を受け入れる", async (message) => {
      const result = await lintMessage(message);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("異常系", () => {
    it.each([
      {
        message: "✨ 課題キーなしのコミット",
        reason: "課題キーを含まない",
      },
      {
        message: "feat: add login",
        reason: "Conventional Commits 形式",
      },
      {
        message: "feat(auth): add login",
        reason: "Conventional Commits 形式（scope 付き）",
      },
      {
        message: "DEV-33 絵文字なしのコミット",
        reason: "絵文字プレフィックスを含まない",
      },
      {
        message: "add login without prefix",
        reason: "絵文字も課題キーもない",
      },
      {
        message: "✨ DEV-33 trailing full stop.",
        reason: "ヘッダー末尾のピリオド",
      },
    ] as const)("$reason 場合に拒否する: $message", async ({ message }) => {
      const result = await lintMessage(message);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("ticket-empty ルール", () => {
    it("when 省略時は always として扱い、ticket が空なら成功する", () => {
      expect(evaluateTicketEmpty(undefined)).toEqual([true, "ticket must be empty"]);
    });

    it("always のとき、ticket が空なら成功する", () => {
      expect(evaluateTicketEmpty(undefined, "always")).toEqual([true, "ticket must be empty"]);
    });

    it("always のとき、ticket があると失敗する", () => {
      expect(evaluateTicketEmpty("DEV-33", "always")).toEqual([false, "ticket must be empty"]);
    });

    it("never のとき、ticket があると成功する", () => {
      expect(evaluateTicketEmpty("DEV-33", "never")).toEqual([true, "ticket may not be empty"]);
    });

    it("never のとき、ticket が空なら失敗する", () => {
      expect(evaluateTicketEmpty(undefined, "never")).toEqual([false, "ticket may not be empty"]);
    });

    it("never のとき、ticket が空文字なら失敗する", () => {
      expect(evaluateTicketEmpty("", "never")).toEqual([false, "ticket may not be empty"]);
    });

    it("未知の when のとき失敗する", () => {
      expect(evaluateTicketEmpty("DEV-33", "sometimes")).toEqual([false, "Unknown `when` value"]);
    });

    it("パース結果に対して when 省略で評価できる", async () => {
      const parsed = await parse("✨ DEV-33 件名", undefined, parserOptions);
      expect(ticketEmpty(parsed)).toEqual([false, "ticket must be empty"]);
    });

    it("ticket が文字列以外のとき空として扱う", async () => {
      const parsed = await parse("✨ DEV-33 件名", undefined, parserOptions);
      Reflect.set(parsed, "ticket", 123);
      expect(ticketEmpty(parsed, "never")).toEqual([false, "ticket may not be empty"]);
    });
  });
}
