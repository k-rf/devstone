export const promiseChain = <T>(funcs: (() => Promise<T>)[]) =>
  // eslint-disable-next-line sonarjs/reduce-initial-value -- 最初の要素から開始するため、初期値は不要
  funcs.reduce((prev, func) => () => prev().then(() => func()));

if (import.meta.vitest) {
  const { it, expect, vi } = import.meta.vitest;

  it("複数の非同期関数が順番に直列で実行されること", async () => {
    const order: number[] = [];
    const f1 = vi.fn().mockImplementation(() => {
      order.push(1);
      return Promise.resolve("first");
    });
    const f2 = vi.fn().mockImplementation(() => {
      order.push(2);
      return Promise.resolve("second");
    });
    const f3 = vi.fn().mockImplementation(() => {
      order.push(3);
      return Promise.resolve("third");
    });

    const chain = promiseChain([f1, f2, f3]);
    const result = await chain();

    expect(order).toEqual([1, 2, 3]);
    expect(result).toBe("third");
    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
    expect(f3).toHaveBeenCalledTimes(1);
  });

  it("配列が1つの要素のみの場合、その関数がそのまま実行されること", async () => {
    const f1 = vi.fn().mockResolvedValue("only");
    const chain = promiseChain([f1]);
    const result = await chain();

    expect(result).toBe("only");
    expect(f1).toHaveBeenCalledTimes(1);
  });

  it("途中の関数でエラーが発生した場合、以降の実行が中断されエラーが伝播すること", async () => {
    const order: number[] = [];
    const f1 = vi.fn().mockImplementation(() => {
      order.push(1);
      return Promise.resolve();
    });
    const f2 = vi.fn().mockImplementation(() => {
      order.push(2);
      return Promise.reject(new Error("failed"));
    });
    const f3 = vi.fn().mockImplementation(() => {
      order.push(3);
      return Promise.resolve();
    });

    const chain = promiseChain([f1, f2, f3]);
    await expect(chain()).rejects.toThrow("failed");

    expect(order).toEqual([1, 2]);
    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
    expect(f3).not.toHaveBeenCalled();
  });
}
