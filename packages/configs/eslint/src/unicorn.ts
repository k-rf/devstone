import { defineConfig } from "eslint/config";
import pluginUnicorn from "eslint-plugin-unicorn";

const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const allowList = () => {
  const singleLetters = ["e", "i", "j", "k"];
  const words = ["acc", "arr", "ctx", "cur", "env", "ext", "fn", "obj", "prev", "req", "res"];
  const withPluralWords = ["arg", "func", "param", "prop", "ref", "util", "var"];

  return Object.fromEntries(
    [
      singleLetters,
      words.flatMap((word) => [word, capitalize(word)]),
      withPluralWords.flatMap((word) => [
        word,
        capitalize(word),
        `${word}s`,
        `${capitalize(word)}s`,
      ]),
    ]
      .flat()
      .map((word) => [word, true]),
  );
};

export const unicorn = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [pluginUnicorn.configs.recommended],
  rules: {
    "unicorn/prevent-abbreviations": [
      "error",
      {
        allowList: allowList(),
        ignore: [".e2e"],
      },
    ],

    /** @remarks EffectのOption.someにて誤検知されるため無効化する */
    "unicorn/no-array-callback-reference": "off",

    /** @remarks TypeScript の必須引数として undefined を明示的に渡す場合があるため */
    "unicorn/no-useless-undefined": ["error", { checkArguments: false }],

    /** @remarks reduceの使用を許可する */
    "unicorn/no-array-reduce": "off",
  },
});
