# Design System

Panda CSS と Ark UI をベースにした、プロジェクト共通のデザインシステムリポジトリです。

## 💡 設計思想

1. **Code as SSoT (真実の単一ソース)**
   デザイントークンは Figma 等の外部ツールではなく、TypeScript コード（W3C DTCG 準拠）を一次ソース（SSoT）として管理します。
2. **関心の分離とクリーンアーキテクチャ**
   「型仕様」「変換エンジン（コンパイラ）」「具体的なトークン値」「アセット」「スタイル定義」「コンポーネント」をパッケージ境界で明確に分離し、依存関係をクリーンに保ちます。
3. **一方向の依存関係**
   循環参照を排除し、上流（型・値）から下流（UIコンポーネント）へ一方向へ依存が流れるように設計されています。

---

## 📐 パッケージ構成と役割

`packages/design-system/` 配下は、以下のように整理されています。

| ディレクトリ        | パッケージ名                                | 役割・責務                                                        |
| :------------------ | :------------------------------------------ | :---------------------------------------------------------------- |
| `tokens/spec`       | `@devstone/design-system-tokens-spec`       | W3C DTCG 仕様を TypeScript で表現した純粋な「型定義（スキーマ）」 |
| `tokens/compiler`   | `@devstone/design-system-tokens-compiler`   | Style Dictionary v4 をラップした、トークン変換用ビルドエンジン    |
| `tokens/foundation` | `@devstone/design-system-tokens-foundation` | 具体的な色や余白などの値を定義するパッケージ（SSoT）              |
| `symbols/raw`       | `@devstone/design-system-symbols-raw`       | Figma 等からエクスポートされた生の SVG アセットを管理する         |
| `symbols/react`     | `@devstone/design-system-symbols-react`     | 生の SVG からコンパイルされた React 用アイコンコンポーネント群    |
| `presets`           | `@devstone/design-system-presets`           | `tokens-foundation` の出力から生成する Panda CSS プリセット       |
| `components/react`  | `@devstone/design-system-components-react`  | Ark UI と `presets` を結合した完成版 React UI コンポーネント群    |

---

## 🔗 パッケージ依存関係

```mermaid
graph TD
    %% 内部パッケージの定義
    tokens-spec["@devstone/design-system-tokens-spec<br>(tokens/spec)"]
    tokens-compiler["@devstone/design-system-tokens-compiler<br>(tokens/compiler)"]
    tokens-foundation["@devstone/design-system-tokens-foundation<br>(tokens/foundation)"]
    symbols-raw["@devstone/design-system-symbols-raw<br>(symbols/raw)"]
    symbols-react["@devstone/design-system-symbols-react<br>(symbols/react)"]
    presets["@devstone/design-system-presets<br>(presets)"]
    components-react["@devstone/design-system-components-react<br>(components/react)"]

    %% 依存関係の定義
    tokens-foundation -->|型定義を利用| tokens-spec
    tokens-foundation -->|ビルドツールとして利用| tokens-compiler
    tokens-compiler -->|入力仕様として参照| tokens-spec

    symbols-react -->|生の SVG からコンパイル| symbols-raw

    presets -->|ビルド成果物を利用| tokens-foundation

    components-react -->|スタイルレシピを適用| presets
    components-react -->|アイコンを利用| symbols-react
```

---

## 🔄 データの流れ

```mermaid
graph TD
    %% ソース
    ts[tokens-foundation/src<br>（TS / DTCG）]

    %% 変換機
    compiler[tokens-compiler<br>（Style Dictionary）]

    %% 出力
    panda_json[tokens-foundation/dist/panda]
    figma_json[tokens-foundation/dist/figma]

    %% プリセットとコンポーネント
    presets_pkg[presets/src（Panda Preset）]
    components_pkg[components-react/src（React）]
    apps[apps/（Panda CSS ビルド）]

    %% データの流れ
    ts --> compiler
    compiler -->|Panda向け| panda_json
    compiler -->|Figma向け| figma_json

    panda_json --> presets_pkg
    presets_pkg --> components_pkg
    components_pkg --> apps
```
