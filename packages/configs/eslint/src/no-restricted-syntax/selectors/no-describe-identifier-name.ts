/**
 * describe の説明に識別子名だけを繰り返すことを禁止し、意味のあるコンテキスト記述を促す。
 */
export const noDescribeIdentifierName = [
  {
    // HACK: エラーになる条件がかなり緩いのでカスタムを作る
    selector:
      "CallExpression:matches([callee.name='describe'], [callee.object.name='describe'])[arguments.0.type='Literal'][arguments.0.value=/^[a-zA-Z0-9$]+$/]",
    message:
      "describe の説明に関数名やクラス名などの識別子を繰り返すことは禁止されています。意味のあるコンテキストを記述してください。",
  },
] as const;
