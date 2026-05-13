/**
 * HMAC を使った定数時間比較 — crypto.timingSafeEqual は Workers 環境に存在しないため Web Crypto で代替
 * @param a - 比較する文字列
 * @param b - 比較する文字列
 * @returns 比較結果（等しい場合は true、そうでない場合は false）
 */
export const timingSafeEqual = async (a: string, b: string): Promise<boolean> => {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(sigA);
  const bytesB = new Uint8Array(sigB);

  let result = 0;
  // bytesA と bytesB の長さが同じであることを前提とするが、型安全性を確保しつつ、すべてのパスを検証可能な形にする
  for (const [i, bitA] of bytesA.entries()) {
    const bitB = bytesB[i];
    result |= typeof bitA === "number" && typeof bitB === "number" ? bitA ^ bitB : 1;
  }

  // 定時間実行を実現するために、長さの比較もこのタイミングで行う
  return result === 0 && bytesA.length === bytesB.length;
};

if (import.meta.vitest) {
  const { it, expect, vi, describe } = import.meta.vitest;

  describe("正常系", () => {
    it("内容が同じ場合に true を返すこと", async () => {
      expect(await timingSafeEqual("abc", "abc")).toBe(true);
    });
  });

  describe("異常系", () => {
    it("内容が異なる場合に false を返すこと", async () => {
      expect(await timingSafeEqual("abc", "def")).toBe(false);
    });

    it("長さが異なる場合（内部バッファ長が異なる場合）に false を返すこと", async () => {
      // crypto.subtle.sign をモックして異なる長さのバッファを返させる
      const signSpy = vi.spyOn(crypto.subtle, "sign");
      // 1回目は32バイト、2回目は16バイトを返させる
      signSpy
        .mockResolvedValueOnce(new Uint8Array(32).buffer)
        .mockResolvedValueOnce(new Uint8Array(16).buffer);

      const result = await timingSafeEqual("short", "longer-input");
      expect(result).toBe(false);
      signSpy.mockRestore();
    });
  });
}
