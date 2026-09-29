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

  // bytesA と bytesB の長さが同じであることを前提とするが、型安全性を確保しつつ、すべてのパスを検証可能な形にする
  const result = bytesA.reduce((acc, bitA, i) => {
    const bitB = bytesB[i];
    return acc | (typeof bitA === "number" && typeof bitB === "number" ? bitA ^ bitB : 1);
  }, 0);

  // 定時間実行を実現するために、長さの比較もこのタイミングで行う
  return result === 0 && bytesA.length === bytesB.length;
};
