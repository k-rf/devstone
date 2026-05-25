import { Command } from "@effect/cli";
import { Console } from "effect";

import { fileOption } from "./options/file-option.js";

/**
 * サーバー起動コマンド（実装予定）。
 *
 * ### 将来の実装アイデアと展望
 *
 * #### 概要
 * キャンバスファイル（.canvas）の変更を検知し、ブラウザ上で動作する Web ビジュアルエディタと
 * リアルタイム同期（自動リフレッシュ）させながら JSON-Canvas を可視化するローカルサーバーを起動します。
 *
 * #### 技術スタックの設計案
 * 1. **Web サーバー**: `Hono` (Bun 上で稼働) を採用。軽量であり、静的ファイルの配信と API の両方をシンプルに記述できる。
 * 2. **リアルタイム同期**: `node:fs` の `watch` API もしくは `chokidar` を使い、指定された `.canvas` ファイルの変更を監視。
 *    Hono の `streamSSE` を使用してサーバー側からブラウザへ即時に更新イベントを通知（Server-Sent Events）。
 *    クライアントは通知を受け取ると `/api/canvas` を叩いて最新のデータを再取得・再レンダリングする（ポーリングに比べて低遅延・高効率）。
 * 3. **フロントエンド ビューア**: React + React-Flow (`@xyflow/react`) + Panda CSS。
 *    JSON-Canvas の仕様（Nodes, Edges）を React-Flow の Node, Edge 構造へマッピングして描画する。
 *    テキスト、ファイル、リンク、グループの4種類のノードに応じたカスタムコンポーネントを提供する。
 * 4. **ファイル書き込み・バリデーション**: `libs-json-canvas-spec` の `JsonCanvas` スキーマを用い、
 *    クライアントからのドラッグ＆ドロップ読込時や、CLI 編集時のファイル保存前に厳密なバリデーションを実行し、データ破損を防ぐ。
 * @returns プレースホルダーメッセージを出力する Effect。
 */
export const serveCommand = Command.make("serve", {
  file: fileOption,
}).pipe(
  Command.withDescription("サーバーを起動してキャンバスをリアルタイムに表示します（実装予定）"),
  Command.withHandler(() =>
    Console.log(
      "serveコマンドは現在実装予定です。将来のアップデートでローカル可視化サーバーが起動可能になります。",
    ),
  ),
);
