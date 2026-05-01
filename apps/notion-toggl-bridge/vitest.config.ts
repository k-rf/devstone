import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/e2e/**/*.e2e.spec.ts", "src/**/*.spec.ts"],
    includeSource: ["src/**/*.ts"],
    environment: "node",
    onConsoleLog: (...[, type]) => {
      // 期待されるエラーケースのテスト時にアプリが出すスタックトレースを抑制する
      return type !== "stderr";
    },
  },
});
