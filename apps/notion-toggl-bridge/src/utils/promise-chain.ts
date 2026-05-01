export const promiseChain = <T>(funcs: (() => Promise<T>)[]) =>
  // eslint-disable-next-line sonarjs/reduce-initial-value
  funcs.reduce((prev, func) => () => prev().then(() => func()));
