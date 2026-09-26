export const promiseChain = <T>(funcs: readonly (() => Promise<T>)[]) => {
  if (funcs.length === 0) {
    return () => Promise.reject(new Error("promiseChain には1つ以上の関数が必要です"));
  }

  return funcs.reduce((prev, func) => () => prev().then(() => func()));
};
