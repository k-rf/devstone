<!-- cspell:words jsxtools styleframe -->

# 001. デザイントークンの型安全な定義方式とライブラリの選定

- **ステータス**: 承認済み (Accepted)
- **日付**: 2026-10-17

## 背景・コンテキスト

デザインシステムを構築するにあたり、デザイントークンの構造は W3C DTCG
(Design Tokens Community Group) の標準仕様に準拠させたい。

一方で、単なる JSON ファイルの手書きでは入力ミスや参照切れを防ぎにくい。
本リポジトリの設計原則である「制約による自由（Make Illegal States Unrepresentable）」に基づき、
トークンの定義そのものを TypeScript で記述し、コンパイル時の型安全性とエディタの自動補完
（インテリセンス）を最大限に効かせる仕組みが必要である。

## 検討した選択肢

DTCG（`2025.10` 仕様）を TypeScript で型安全に扱える主要なライブラリ・パッケージを比較検討した。

| ライブラリ                                                       | 特徴・強み                                                                                                                   | 弱点・懸念点                                                                                                                 |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **`@terrazzo/token-types`** （＋ `@terrazzo/parser`）            | 依存ゼロの純粋な型定義。`$type` ごとの Discriminated Union が厳密で、CSS / JS 出力プラグイン等のエコシステムも充実している。 | 標準の `AliasValue` 型が単なる `` `{${string}}` `` であり、単体では存在しないトークンパスの参照を `tsc` だけで検出できない。 |
| **`dtcg-tools`** （by `jsxtools`）                               | TypeScript での `satisfies Token` / `satisfies Format` による記述を最初から想定しており、Resolver 仕様の型も備える。         | Terrazzo に比べるとエコシステム（CSS 出力プラグイン等）が小さく、実験的な API が含まれる。                                   |
| **`style-dictionary` (v4+)**                                     | 業界最大手のビルドツール。v4 で ESM 化・TS 設定・DTCG ネイティブ対応が完了している。                                         | 後方互換性や拡張性のため `DesignToken` 型に緩い部分があり、コンパイル時の型制約としては Terrazzo ほど鋭くない。              |
| **`w3c-design-tokens-standard-schema`** / **`@styleframe/dtcg`** | Standard Schema（Zod 等）によるランタイム検証と型推論に特化している。                                                        | コミュニティ規模が小さく、本リポジトリが標準とする `Effect.Schema` とは別系統になる。                                        |

## 決定事項

**「`@terrazzo/token-types` の基本型をベースに採用し、参照パス（エイリアス）の型推論・型強制を行う
独自の TypeScript 型ヘルパーを被せる」** 方式を採用する。

1. **基本構造と値の型**:
   - `ColorValue` や `DimensionValue` などの DTCG 標準の値型・トークン型は、車輪の再発明を避けて
     `@terrazzo/token-types` を利用する。
2. **Primitive トークンからの有効パス抽出**:
   - Primitive トークンを `as const satisfies ...` で定義し、そのオブジェクトのキー構造から
     実在するトークンパス（例: `` `{color.blue.500}` ``）のみを Template Literal Types で抽出する。
3. **`$type` 別のインテリセンスと型強制**:
   - Semantic トークン等でエイリアス参照（`$value`）を記述する際、参照元と同じ `$type`
     （例: `$type: "color"` なら `color` 型トークンのパスのみ）だけを許可する型ヘルパーを適用する。
   - これにより、エディタ上で有効なトークンパスのみをインテリセンス表示させ、タイポや異なる型への
     誤参照を TypeScript のコンパイルエラーとして即座に検出する。

### 記述イメージ

```typescript
// 1. Primitive トークンの定義
const primitives = {
  color: {
    blue: {
      500: { $type: "color", $value: "#3b82f6" },
    },
  },
  spacing: {
    md: { $type: "dimension", $value: { value: 16, unit: "px" } },
  },
} as const satisfies TokenTree;

// 2. Semantic トークンの定義（同じ $type の実在パスのみ補完・許可される）
const semantic = {
  background: {
    brand: {
      $type: "color",
      $value: "{color.blue.500}", // OK（"{spacing.md}" や存在しないパスは型エラー）
    },
  },
} as const satisfies SemanticTokenTree<typeof primitives>;
```

## 影響・結果

- **メリット**:
  - DTCG 標準仕様への準拠と、TypeScript による最高レベルの型安全性（エイリアス参照の自動補完・
    タイポ防止・型不一致防止）を両立できる。
  - 定義したトークンオブジェクトをそのまま `@terrazzo/parser` 等のパイプラインや変換関数に渡すことで、
    CSS Variables 等への出力もスムーズに行える。
- **トレードオフ**:
  - `@terrazzo/token-types` の上に被せる再帰的な型ヘルパー（20〜30行程度）を自前で実装・保守する
    必要がある。
