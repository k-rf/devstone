# Vitest Coverage Aggregation Plan

## Objective

moonrepoのキャッシュ機構を活かしつつ、ワークスペース全体のVitestのテストカバレッジを集約し、単一のHTMLレポートを生成する仕組みを構築します。
集約処理のスクリプトは、TypeScriptおよびEffect-TSを用いて関数型パラダイムで実装します。
また、凝集度を高めるため、関連するスクリプトは `packages/configs/vitest` に配置します。

## Key Files & Context

- `packages/configs/vitest/package.json`: 依存関係の更新（`nyc`, `@effect/platform-node` など必要に応じて）。
- `packages/configs/vitest/src/scripts/collect-coverage.ts` (新規):
  各プロジェクトで生成された `coverage.json` をルートまたは指定ディレクトリに収集するスクリプト (Effect-TSで実装)。
- `.moon/tasks/all.jsonc`: 全プロジェクト共通の `test` タスクと、カバレッジ結果のキャッシュ設定を追加。
- `moon.jsonc` (ルート): カバレッジを集約するタスク `coverage:report` を定義。
- 各プロジェクトの `vitest.config.ts` または共通設定 (`packages/configs/vitest/src/configs/index.ts` 等):
  カバレッジレポーターとして `json` を出力するように設定し、プロバイダに `istanbul` を指定。

## Implementation Steps

### 1. 依存パッケージの追加

カバレッジ集約およびプロバイダとして必要なパッケージを追加します。

- ルートまたは `configs/vitest` の `package.json` に `@vitest/coverage-istanbul`, `nyc` を追加します。

### 2. Vitestの共通設定の更新

**`packages/configs/vitest/...`**
共有のVitest設定内で、カバレッジのプロバイダとレポーターを指定します。

```typescript
coverage: {
  provider: 'istanbul',
  reporter: ['text', 'json'], // jsonは必須
}
```

### 3. カバレッジ収集スクリプトの実装 (Effect-TS)

`packages/configs/vitest/src/scripts/collect-coverage.ts` を作成します。

- `@effect/platform-node` を使用し、純粋な関数型アプローチで記述します。
- 環境変数 `MOON_WORKSPACE_ROOT` （またはその他の方法）を利用してワークスペースルートを特定します。
- ルート以下の `apps/*` および `packages/*` （またはmoonが知っているプロジェクト）から
  `coverage/coverage.json` を探索します。
- 見つけたJSONを `coverage/raw/<project-name>.json` としてルートの特定ディレクトリにコピーします。

### 4. 共通タスクの更新

**`.moon/tasks/all.jsonc`**
各プロジェクトがテスト結果をキャッシュできるように `test` タスクを定義します。

```jsonc
"test": {
  "command": "vitest run --coverage",
  "outputs": ["coverage/**"]
}
```

### 5. カバレッジ集約タスクの定義

**ルートの `moon.jsonc`**
ワークスペース全体を管轄するタスク `coverage:report` を定義します。

```jsonc
{
  "id": "root",
  "tasks": {
    "coverage:report": {
      "command": "tsx packages/configs/vitest/src/scripts/collect-coverage.ts && nyc merge coverage/raw coverage/merged.json && nyc report -t coverage --report-dir coverage/report --reporter=html --exclude-after-remap false",
      "deps": ["*:test"],
      "outputs": ["coverage/report/**"],
    },
  },
}
```

### 6. .gitignoreの更新

ルートの `.gitignore` に `/coverage` を追加し、集約したレポートファイルや生データがコミットされないようにします。

## Verification & Testing

1. 各パッケージで意図的にカバレッジを変動させる変更を加える。
2. `moon run root:coverage:report` を実行する。
3. 全プロジェクトのテストが並列実行され、完了後に `collect-coverage.ts` が実行されて集約処理が走ることを確認する。
4. ルートの `coverage/report/index.html` をブラウザで開き、各プロジェクトのカバレッジが正しく合算されて表示されていることを確認する。
