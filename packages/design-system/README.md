# Design System

W3C DTCG（Design Tokens Community Group）仕様と Chakra UI v3 をベースにした、
プロジェクト共通のデザインシステムです。

## 💡 設計思想

1. **Code as SSoT (真実の単一ソース)**
   デザイントークンは Figma 等の外部ツールではなく、W3C DTCG 準拠の TypeScript コードを
   一次ソース（SSoT）として管理します。
2. **型システムによる厳格なトークン制約**
   `@terrazzo/token-types` をベースに、末端トークンへの `$type` 明記ルール、`$type` 別の
   エイリアスパス自動補完（Template Literal Types）、およびテーマ間の構造一致を強制する
   `ThemeContract` 型（`spec`）を提供し、不正な定義や不整合をコンパイル時に防ぎます。
3. **UI フレームワーク非依存のトークン定義と純粋関数による直接変換**
   トークン層を UI フレームワークから独立させ、Style Dictionary 等の中間 JSON ビルド
   コンパイラを挟まずに、純粋な TypeScript 関数で DTCG トークン・テーマを Chakra UI v3 の
   `createSystem` 形式（`tokens` / `semanticTokens`）へ直接変換します。

---

## 📐 パッケージ構成と役割

`packages/design-system/` 配下は、以下の 2 パッケージ構成で管理されています。

| ディレクトリ                    | パッケージ名                     | 役割・責務                                                                       |
| :------------------------------ | :------------------------------- | :------------------------------------------------------------------------------- |
| `packages/design-system/tokens` | `@devstone/design-system-tokens` | UI フレームワーク非依存の純粋なデザイントークンパッケージ（Code as SSoT）        |
| `packages/design-system/react`  | `@devstone/design-system-react`  | Chakra UI v3 アダプター、Provider、UI コンポーネント、Storybook を提供する実装層 |

### `@devstone/design-system-tokens` (`packages/design-system/tokens`)

- UI フレームワーク非依存の純粋なデザイントークンパッケージ（Code as SSoT）。
- `@terrazzo/token-types` をベースに、以下の型安全機構（`spec`）を提供：
  - 末端トークンへの `$type` 明記ルール
  - `$type` 別のエイリアスパス自動補完（Template Literal Types）
  - テーマ間の構造一致を強制する `ThemeContract` 型
- Primitive トークンと、Light / Dark それぞれの純粋な DTCG テーマツリー
  （Semantic トークン）を定義。

### `@devstone/design-system-react` (`packages/design-system/react`)

- `@devstone/design-system-tokens` の DTCG トークン・テーマを、純粋な TypeScript 関数で
  Chakra UI v3 の `createSystem` 形式（`tokens` / `semanticTokens`）へ直接変換する
  アダプターを提供（中間 JSON ビルドコンパイラは挟まない）。
- 変換されたシステム設定を適用する Provider、UI コンポーネント、および Storybook を提供。

---

## 🔗 パッケージ依存関係

```mermaid
graph TD
    tokens["@devstone/design-system-tokens (packages/design-system/tokens)"]
    react["@devstone/design-system-react (packages/design-system/react)"]
    apps["Applications (apps/*)"]

    react -->|DTCG トークン・テーマを参照| tokens
    apps -->|Provider・UI コンポーネントを利用| react
```

---

## 🔄 データの流れ

```mermaid
graph TD
    subgraph tokens_pkg["@devstone/design-system-tokens"]
        spec["spec: @terrazzo/token-types ベース ($type 明記 / エイリアス補完 / ThemeContract)"]
        primitives["Primitive トークン (DTCG)"]
        themes["Semantic テーマツリー: Light / Dark (DTCG)"]

        spec -->|型制約・自動補完| primitives
        spec -->|型制約・ThemeContract 検証| themes
        primitives -->|$type 別エイリアス参照| themes
    end

    subgraph react_pkg["@devstone/design-system-react"]
        adapter["変換アダプター (純粋な TS 関数)"]
        system["Chakra UI v3 createSystem (tokens / semanticTokens)"]
        ui["Provider / UI コンポーネント / Storybook"]

        adapter -->|直接変換| system
        system --> ui
    end

    apps["apps/* (各アプリケーション)"]

    primitives -->|中間 JSON ビルドなしで入力| adapter
    themes -->|中間 JSON ビルドなしで入力| adapter
    ui --> apps
```
