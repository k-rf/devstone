import { type Option } from "cz-customizable";

export const typeEnums = [
  // 機能追加・変更
  { value: "✨", name: "✨\t新機能を追加した" },
  { value: "💄", name: "💄\tUIやスタイルを改善した" },
  { value: "⚡️", name: "⚡️\tパフォーマンスを改善した" },
  { value: "🔥", name: "🔥\tコードやファイルを削除した" },

  // コード品質
  { value: "🎨", name: "🎨\tコードの構造・フォーマットを改善した" },
  { value: "♻️", name: "♻️\tコードをリファクタリングした" },

  // ドキュメント・コメント
  { value: "📝", name: "📝\tドキュメントを追加・更新した" },
  { value: "💡", name: "💡\tコメントを追加・更新した" },

  // バグ修正・テスト
  { value: "🚑️", name: "🚑️\tバグを修正した" },
  { value: "✅", name: "✅\tテストを追加・更新した" },

  // インフラ・設定
  { value: "🔧", name: "🔧\t設定ファイルを変更した" },
  { value: "🏗️", name: "🏗️\tアーキテクチャを変更した" },
  { value: "👷", name: "👷\tCI/CD を変更した" },
  { value: "🚀", name: "🚀\tデプロイした" },

  // 依存関係
  { value: "⬆️", name: "⬆️\tパッケージをアップグレードした" },
  { value: "⬇️", name: "⬇️\tパッケージをダウングレードした" },
  { value: "📦", name: "📦\tパッケージを追加・削除した" },

  // その他
  { value: "🎉", name: "🎉\t初回コミット" },
  { value: "🔖", name: "🔖\tバージョンタグ・リリース" },
  { value: "🔒️", name: "🔒️\tセキュリティを修正した" },
  { value: "🌐", name: "🌐\t国際化・ローカライゼーションを対応した" },
  { value: "🚧", name: "🚧\t作業中（WIP）" },
] as const satisfies readonly Option[];
