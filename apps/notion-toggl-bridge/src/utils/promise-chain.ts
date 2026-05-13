export const promiseChain = <T>(funcs: (() => Promise<T>)[]) =>
  // eslint-disable-next-line sonarjs/reduce-initial-value -- 最初の要素から開始するため、初期値は不要
  funcs.reduce((prev, func) => () => prev().then(() => func()));
