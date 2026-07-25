export const noNondeterministicDate = [
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: "Core層で Date.now() を使わないでください。Effect-TS の Clock を使用してください。",
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message:
      "Core層で引数なしの new Date() を使わないでください。Effect-TS の Clock を使用してください。",
  },
] as const;
