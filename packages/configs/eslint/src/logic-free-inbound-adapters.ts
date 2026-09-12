import { defineConfig } from "eslint/config";

/**
 * Inbound Adapter 層での命令的な条件分岐を禁止する設定。
 *
 * 入力の構文検証は middleware、制御フローは Effect のパイプラインへ委譲する。
 */
export const logicFreeInboundAdapters = defineConfig({
  name: "devstone/logic-free-inbound-adapters",
  files: ["**/src/adapter/inbound/**/*.ts"],
  ignores: ["**/*.{spec,test}.ts", "**/*.middleware.ts"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "IfStatement",
        message:
          "Inbound Adapter で if 文を使わないでください。検証は middleware、制御フローは Effect パイプラインまたは Workflow に委譲してください。",
      },
      {
        selector: "SwitchStatement",
        message:
          "Inbound Adapter で switch 文を使わないでください。検証は middleware、制御フローは Effect パイプラインまたは Workflow に委譲してください。",
      },
    ],
  },
});
