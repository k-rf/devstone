/**
 * テストコード内での冗長な Exit アサーションを禁止し、Effect.flip を強制する。
 */
export const noEffectAssertExit = [
  {
    selector:
      "CallExpression[callee.object.name='Effect'][callee.property.name=/^(runPromiseExit|runSyncExit)$/]",
    message:
      "失敗系テストで Exit を使った検証は冗長です。Effect.flip と Effect.runPromise を使用してください。",
  },
  {
    selector: "CallExpression[callee.object.name='Exit'][callee.property.name='match']",
    message:
      "失敗系テストで Exit.match を使った検証は冗長です。Effect.flip と Effect.runPromise を使用してください。",
  },
] as const;
