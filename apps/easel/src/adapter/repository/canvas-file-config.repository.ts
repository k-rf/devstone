import { Context } from "effect";

/**
 * ファイルシステムリポジトリ固有の設定情報を保持する Tag。
 */
export class CanvasFileConfig extends Context.Tag("CanvasFileConfig")<
  CanvasFileConfig,
  {
    readonly filePath: string;
  }
>() {}
