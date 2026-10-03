# test-descriptions-japanese

テスト仕様（`it` または `test` の第1引数の文字列、`.spec-d.ts` 内の型テストも含む）に
日本語（ひらがな、カタカナ、漢字）を含めることを強制します。

## Rule Details

ビジネス要件とのマッピングを明らかにするため、テストケースの説明文に
日本語の文字コード（ひらがな、カタカナ、漢字）が少なくとも1文字含まれていることを検証します。

### ❌ Incorrect

```typescript
it("should return the added edge ID when valid data is provided", () => {});

test("should fail with invalid input", () => {});

it.skip("skipped English test", () => {});

it.each([1, 2])("should test item %s", () => {});
```

### ✅ Correct

```typescript
it("正しいエッジデータを渡した場合、エッジが正常に追加され、そのIDが返されること", () => {});

test("無効な入力が渡された場合、エラーを返すこと", () => {});

it.skip("スキップされるテスト", () => {});

it.each([1, 2])("%s 番目のテストが成功すること", () => {});

// 英数字や記号が混在していても、日本語文字が含まれていれば許可
it("nodes と edges が1行になったカスタム JSON 形式で書き込めること", () => {});
```

## Options

このルールにオプションはありません。
