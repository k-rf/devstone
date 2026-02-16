# gitmoji リファレンス

gitmoji は、コミットメッセージに絵文字プレフィックスを使用する規約。
変更の種類を視覚的に表現する。

## 絵文字選択ガイド

| 絵文字 | コード                        | 説明             | 使用場面                                       |
| ------ | ----------------------------- | ---------------- | ---------------------------------------------- |
| ✨     | `:sparkles:`                  | 新機能           | 新しい機能の追加                               |
| 🐛     | `:bug:`                       | バグ修正         | バグの修正                                     |
| ♻️     | `:recycle:`                   | リファクタリング | 振る舞いを変えないコード構造の改善             |
| 🔧     | `:wrench:`                    | 設定             | 設定ファイルの変更                             |
| 📝     | `:memo:`                      | ドキュメント     | ドキュメントの追加・更新                       |
| ⬆️     | `:arrow_up:`                  | アップグレード   | 依存関係やツールのアップグレード               |
| ⬇️     | `:arrow_down:`                | ダウングレード   | 依存関係のダウングレード                       |
| 🔥     | `:fire:`                      | 削除             | コードやファイルの削除                         |
| 🚀     | `:rocket:`                    | デプロイ         | デプロイ関連の変更                             |
| 💄     | `:lipstick:`                  | UI・スタイル     | UI やスタイルファイルの更新                    |
| 🎨     | `:art:`                       | 構造改善         | コード構造やフォーマットの改善                 |
| ⚡     | `:zap:`                       | パフォーマンス   | パフォーマンスの改善                           |
| 🔒     | `:lock:`                      | セキュリティ     | セキュリティ問題の修正                         |
| 🚧     | `:construction:`              | 作業中           | 作業途中                                       |
| ✅     | `:white_check_mark:`          | テスト           | テストの追加・更新                             |
| 👷     | `:construction_worker:`       | CI               | CI/CD の追加・更新                             |
| 📦     | `:package:`                   | パッケージ       | コンパイル済みファイルやパッケージの追加・更新 |
| 🗃️     | `:card_file_box:`             | データベース     | データベース関連の変更                         |
| 🏗️     | `:building_construction:`     | アーキテクチャ   | アーキテクチャの変更                           |
| 💚     | `:green_heart:`               | CI 修正          | CI ビルドの修正                                |
| 📌     | `:pushpin:`                   | バージョン固定   | 依存関係を特定バージョンに固定                 |
| 🔀     | `:twisted_rightwards_arrows:` | マージ           | ブランチのマージ                               |
| ⏪     | `:rewind:`                    | リバート         | 変更の取り消し                                 |
| 🍱     | `:bento:`                     | アセット         | アセットの追加・更新                           |
| ♿     | `:wheelchair:`                | アクセシビリティ | アクセシビリティの改善                         |
| 💬     | `:speech_balloon:`            | テキスト         | テキストやリテラルの更新                       |
| 🗑️     | `:wastebasket:`               | 非推奨化         | クリーンアップが必要なコードの非推奨化         |
| 🛂     | `:passport_control:`          | 認証             | 認可・認証に関する作業                         |
| 🩹     | `:adhesive_bandage:`          | 軽微な修正       | 重大でない問題の簡単な修正                     |
| 🧐     | `:monocle_face:`              | 調査             | データの探索や調査                             |
| ⚰️     | `:coffin:`                    | デッドコード     | 不要なコードの削除                             |
| 🧪     | `:test_tube:`                 | 失敗テスト       | 失敗するテストの追加                           |
| 👔     | `:necktie:`                   | ビジネスロジック | ビジネスロジックの追加・更新                   |
| 🩺     | `:stethoscope:`               | ヘルスチェック   | ヘルスチェックの追加・更新                     |

## メッセージフォーマット

```plaintext
<emoji> <件名行>
```

### 英語の例

```plaintext
✨ Add user authentication with JWT
🐛 Fix race condition in WebSocket handler
♻️ Refactor tsconfig files to extend shared configuration
🔧 Update ESLint configuration for stricter rules
⬆️ Upgrade Moon to v2 and migrate configuration to JSONC
📝 Add API documentation for payment endpoints
```

### 日本語の例

```plaintext
✨ JWT を使用したユーザー認証を追加する
🐛 WebSocket ハンドラーの競合状態を修正する
♻️ tsconfig を共有設定パッケージから拡張するようにリファクタリングする
🔧 ESLint の設定をより厳格なルールに更新する
⬆️ Moon を v2 にアップグレードし JSONC 設定に移行する
📝 決済エンドポイントの API ドキュメントを追加する
```

## 絵文字選択戦略

1. 変更の主要な性質を特定する
2. 複数のタイプが該当する場合、変更の**意図**に基づいて選択する
3. 複数の絵文字が必要な場合、コミットのさらなる分割を検討する（単一責任原則）
4. 汎用的な絵文字（🎨、🔧）より具体的な絵文字（🐛、✨）を優先する
