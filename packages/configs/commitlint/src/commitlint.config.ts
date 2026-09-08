import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";
import { Match } from "effect";

import { typeEnums } from "./type-enum.js";

const emojis = typeEnums.map((typeEnum) => typeEnum.value).join("|");
const subjectPattern = (options: { readonly withKey: boolean }) => {
  return Match.value(options).pipe(
    Match.when(
      { withKey: true },
      () => new RegExp(String.raw`^(${emojis}) ([A-Z]+-\d+|#\d+) (.+)$`),
    ),
    Match.when({ withKey: false }, () => new RegExp(String.raw`^(${emojis}) (.+)$`)),
    Match.exhaustive,
  );
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
    parserOpts: {
      headerPattern: subjectPattern({ withKey: true }),
      headerCorrespondence: ["type", "ticket", "subject"],
    },
  },
  plugins: [
    {
      rules: {
        "ticket-empty": (parsed, when) => {
          return Match.value(when).pipe(
            Match.withReturnType<readonly [boolean, string]>(),
            Match.when("always", () => [parsed["ticket"] === undefined, "ticket must be empty"]),
            Match.when("never", () => [
              parsed["ticket"] !== undefined && parsed["ticket"] !== "",
              "ticket may not be empty",
            ]),
            Match.orElse(() => [false, "Unknown `when` value"]),
          );
        },
        "subject-no-conventional-prefix": (parsed) => {
          if (typeof parsed["subject"] !== "string") return [true, ""];
          const isConventional =
            /^(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(.*\))?!?:/i.test(
              parsed["subject"].trim(),
            );
          return [!isConventional, "subject must not start with Conventional Commits prefix"];
        },
      },
    },
  ],
  rules: {
    "type-enum": rules["type-enum"],
    "type-empty": [RuleConfigSeverity.Error, "never"],
    "subject-empty": [RuleConfigSeverity.Error, "never"],
    "ticket-empty": [RuleConfigSeverity.Error, "never"],
    "subject-no-conventional-prefix": [RuleConfigSeverity.Error, "always"],
    "header-full-stop": [RuleConfigSeverity.Error, "never", "."],
  },
};

export default config;
