import { defineConfig } from "vitest/config";

const config = defineConfig({
  test: {
    include: ["src/e2e/**/*.e2e.spec.ts", "src/**/*.spec.ts"],
    includeSource: ["src/**/*.ts"],
    environment: "node",
    typecheck: { enabled: true, include: ["src/**/*.spec-d.ts"] },
    coverage: {
      provider: "istanbul",
      reporter: [["json", { file: "coverage.json" }], "text-summary"],
      enabled: true,
    },
    onConsoleLog: (...[, type]) => {
      // 期待されるエラーケースのテスト時にアプリが出すスタックトレースを抑制する
      return type !== "stderr";
    },
  },
});

export default config;
