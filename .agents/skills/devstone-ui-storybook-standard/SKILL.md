---
name: devstone-ui-storybook-standard
description: UIコンポーネントおよびStorybookの作成と記述に関する標準。Storybookのメタ情報、satisfiesの使用、play関数内でのテスト実装規律を定義します。
---

# Devstone UI Storybook 標準

このスキルは、UIコンポーネントのStory作成およびStorybookを用いた検証における記述ルールを定義し、一貫したフロントエンド開発を維持するためのものです。

## 1. 原則: UIテストのStorybookへの一元化

UIコンポーネントの単体テストやインタラクションテストは、個別のテストファイル（例: `*.spec.tsx`）を作らず、**Storybookのplay関数内で完結させます**。

- `vitest` 等を用いた個別の `*.spec.tsx` の作成は原則禁止します。
- `@storybook/test` から `within`, `userEvent`, `expect` などをインポートして、Storyの `play` 関数内でインタラクションとアサーションを記述します。

### play関数の記述例

```typescript
import { expect, userEvent, within } from "@storybook/test";

export const InteractionTest = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 要素の取得と検証
    const button = canvas.getByRole("button", { name: "Click me" });
    await expect(button).toBeInTheDocument();

    // ユーザー操作のシミュレーション
    await userEvent.click(button);

    // 操作後の状態検証
    // ...
  },
} satisfies Story;
```

## 2. Storybook メタ情報の記述ルール

### 2.1. `title` 指定の廃止

- Storybook上での表示構造は、ファイルの物理的なディレクトリ構造と自動的に一致させます。
- ディレクトリ構造とStorybook上のツリーの乖離を防ぐため、メタ情報オブジェクト (`meta`) 内で **`title` プロパティは指定しません**。

### 2.2. `autodocs` のグローバル設定

- すべての Story において自動ドキュメント生成 (`autodocs`) を有効にします。
- そのため、各 Story ファイルの `meta` で `tags: ["autodocs"]` を指定することは禁止します。
- グローバルの `.storybook/preview.ts` の `tags` に `["autodocs"]` を指定してください。

  ```typescript
  import type { Preview } from "@storybook/react";

  const preview: Preview = {
    // ...
    tags: ["autodocs"],
  };

  export default preview;
  ```

### 2.3. `satisfies` キーワードの徹底

- 型安全性を向上させ、Story定義側でのプロパティ漏れや過不足を検出するため、明示的な型アノテーションではなく TypeScript の `satisfies` を使用します。
- `const MyStory: Story = ...` のようにアノテーションすると、型が `StoryObj` に固定されて過剰に広い型になってしまいますが、`satisfies` を使うことで、Storyオブジェクトの具体的な値の型を保持したまま検証できるため、argsの過不足やプロパティの補完が正しく機能します。
- **Metaオブジェクトの定義**:

  ```typescript
  import { type Meta } from "@storybook/react";

  const meta = {
    component: MyComponent,
    // ...
  } satisfies Meta<typeof MyComponent>;

  export default meta;
  ```

- **Storyオブジェクトの定義**:

  ```typescript
  import { type StoryObj } from "@storybook/react";

  type Story = StoryObj<typeof MyComponent>;

  export const Default = {
    args: { ... },
  } satisfies Story;
  ```
