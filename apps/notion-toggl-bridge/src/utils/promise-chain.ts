import { assertDefined } from "../test-utils/assert-defined/assert-defined.js";

export const promiseChain = <T>(funcs: readonly (() => Promise<T>)[]) => {
  if (funcs.length === 0) {
    throw new Error("promiseChain には1つ以上の関数が必要です");
  }

  return funcs.reduce((prev, func) => () => prev().then(() => func()));
};

if (import.meta.vitest) {
  const { it, expect, vi } = import.meta.vitest;

  it("複数の非同期関数が順番に直列で実行されること", async () => {
    const f1 = vi.fn().mockResolvedValue("first");
    const f2 = vi.fn().mockResolvedValue("second");
    const f3 = vi.fn().mockResolvedValue("third");

    const chain = promiseChain([f1, f2, f3]);
    const result = await chain();

    expect(result).toBe("third");
    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
    expect(f3).toHaveBeenCalledTimes(1);
    const f1Order = f1.mock.invocationCallOrder[0];
    const f2Order = f2.mock.invocationCallOrder[0];
    const f3Order = f3.mock.invocationCallOrder[0];
    assertDefined(f1Order);
    assertDefined(f2Order);
    assertDefined(f3Order);
    expect(f1Order).toBeLessThan(f2Order);
    expect(f2Order).toBeLessThan(f3Order);
  });

  it("配列が1つの要素のみの場合、その関数がそのまま実行されること", async () => {
    const f1 = vi.fn().mockResolvedValue("only");
    const chain = promiseChain([f1]);
    const result = await chain();

    expect(result).toBe("only");
    expect(f1).toHaveBeenCalledTimes(1);
  });

  it("空配列の場合、分かりやすいエラーを投げること", () => {
    expect(() => promiseChain([])).toThrow("promiseChain には1つ以上の関数が必要です");
  });

  it("途中の関数でエラーが発生した場合、以降の実行が中断されエラーが伝播すること", async () => {
    const f1 = vi.fn().mockResolvedValue(undefined);
    const f2 = vi.fn().mockRejectedValue(new Error("failed"));
    const f3 = vi.fn().mockResolvedValue(undefined);

    const chain = promiseChain([f1, f2, f3]);
    await expect(chain()).rejects.toThrow("failed");

    expect(f1).toHaveBeenCalledTimes(1);
    expect(f2).toHaveBeenCalledTimes(1);
    expect(f3).not.toHaveBeenCalled();
  });
}
