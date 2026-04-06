import { type UserConfig, RuleConfigSeverity } from "@commitlint/types";
import { Match } from "effect";

import { typeEnums } from "./type-enum.js";

const emojis = typeEnums.map((typeEnum) => typeEnum.value).join("|");
const subjectPattern = (options: { withKey: boolean }) => {
  return Match.value(options).pipe(
    Match.when({ withKey: true }, () => new RegExp(String.raw`^(${emojis}) (.+-\d+) (.+)$`)),
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
      headerPattern: subjectPattern({ withKey: false }),
      headerCorrespondence: ["type", "subject"],
    },
  },
  plugins: [
    {
      rules: {
        "ticket-empty": (parsed, when) => {
          return Match.value(when).pipe(
            Match.withReturnType<[boolean, string]>(),
            Match.when("always", () => [parsed["ticket"] === undefined, "ticket must be empty"]),
            Match.when("never", () => [parsed["ticket"] !== undefined, "ticket may not be empty"]),
            Match.orElse(() => [false, "Unknown `when` value"]),
          );
        },
      },
    },
  ],
  rules: {
    "type-enum": rules["type-enum"],
    "type-empty": [RuleConfigSeverity.Error, "never"],
    "subject-empty": [RuleConfigSeverity.Error, "never"],
    "ticket-empty": [RuleConfigSeverity.Error, "always"],
    "header-full-stop": [RuleConfigSeverity.Error, "never", "."],
  },
};

export default config;
