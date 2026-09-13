/**
 * Inbound Adapter 層での命令的な条件分岐を禁止する。
 */
export const noConditionalStatements = [
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
] as const;
