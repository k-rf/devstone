import { customAlphabet } from "nanoid";

/**
 * 16桁の小文字英数字による一意な ID を生成します。
 */
export const generateId = customAlphabet("1234567890abcdef", 16);
