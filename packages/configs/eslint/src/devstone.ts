import { defineConfig } from "eslint/config";

import { plugin as pluginDevstone } from "./plugins/devstone/index.js";

/**
 * Devstone 固有ルールを設定する ESLint Flat Config。
 */
export const devstone = defineConfig({
  plugins: {
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    devstone: pluginDevstone,
  },
  extends: [pluginDevstone.configs.recommended],
});
