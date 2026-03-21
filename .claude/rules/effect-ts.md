# Effect-TS Rules

## 基本方針

Effect-TS を用いた関数型プログラミングを採用する。

## Port の定義（Context.Tag）

Port は `Context.Tag` で定義する。

```typescript
// core/port/some-api.port.ts
import { Context, Effect } from "effect";

export class SomeApiPort extends Context.Tag("SomeApiPort")<
  SomeApiPort,
  {
    readonly doSomething: (input: Input) => Effect.Effect<Output, SomeApiError>;
  }
>() {}
```

## Service の記述（Effect.gen）

Service（ユースケース）は `Effect.gen` で記述する。

```typescript
// core/application/some.service.ts
export const someService = (
  input: SomeInput,
): Effect.Effect<SomeOutput, SomeError, PortA | PortB> =>
  Effect.gen(function* () {
    const portA = yield* PortA;
    const portB = yield* PortB;
    const result = yield* portA.doSomething(input);
    return yield* portB.doOther(result);
  });
```

## Adapter の実装（Layer）

Adapter は `Layer` として実装する。

```typescript
// adapter/outbound/some-api.adapter.ts
import { Layer, Effect } from "effect";

export const SomeApiAdapterLive = (env: Env): Layer.Layer<SomeApiPort> =>
  Layer.succeed(SomeApiPort, {
    doSomething: (input) =>
      Effect.tryPromise({
        try: () => fetch(url, { ... }),
        catch: (e) => new SomeApiError({ cause: e }),
      }),
  });
```

## Effect の活用方針

| 概念 | 用途 |
|---|---|
| `Effect<A, E, R>` | 副作用を持つすべての処理の戻り値型 |
| `Context.Tag` | Port の定義（依存性注入のインターフェース） |
| `Layer` | Adapter の実装（Port の具体的な提供） |
| `Effect.gen` | do-notation スタイルで Service を記述 |
| `Schema` | ペイロード・input・output の型定義とバリデーション |
| `Option` | 存在しない可能性がある値 |
| `Match` | パターンマッチング（イベント種別の分岐など） |
| `pipe` | 関数の合成 |

## バリデーション優先順位

1. **Effect Schema** (`effect` パッケージ内の `Schema`) → 第一選択
2. **Zod** → Effect Schema で不足する場合の補強
3. **自力実装** → それでも不足する場合のみ

## 禁止事項

- 副作用を `Effect` に包まずに直接実行してはならない（Promise は `Effect.tryPromise` でラップする）
- `as unknown as` 型アサーションは禁止（`Schema.decodeUnknown` で型安全に変換する）
- Service 内で直接 fetch や外部 API を呼んではならない（必ず Port 経由で行う）
