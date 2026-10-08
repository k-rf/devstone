# no-ui-spec-files

UI コンポーネントに対する個別の `*.spec.tsx` / `*.spec.jsx` ファイルを禁止します。
UI テストおよびユーザーインタラクションの検証は、Storybook の `play` 関数に集約してください。

## Rule Details

通常のアプリケーション配下に UI コンポーネントの個別テストを作成すると、
コンポーネントの振る舞いを検証する場所が Storybook とテストファイルに分散します。
このルールは対象拡張子の spec ファイルを禁止し、検証を Storybook の `play` 関数へ一元化します。

次のディレクトリ配下は対象外です。

- `packages/design-system/`
- `integration/`
- `e2e/`
- `end-to-end/`

### ❌ Incorrect

```tsx
// apps/easel/src/button.spec.tsx
import { render } from "@testing-library/react";

it("ボタンを表示すること", () => {
  render(<button>保存</button>);
});
```

### ✅ Correct

```tsx
// apps/easel/src/button.stories.tsx
export const Default = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "保存" })).toBeVisible();
  },
};
```

```tsx
// packages/design-system/src/button.spec.tsx
it("ボタンを表示すること", () => {});
```

## Options

このルールにオプションはありません。
