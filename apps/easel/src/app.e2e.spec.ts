import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { BunContext } from "@effect/platform-bun";
import { Effect, Schema } from "effect";
import { vol } from "memfs";
import { beforeEach, describe, expect, it } from "vitest";

import { runCli } from "./app.js";
import { assertTextNode } from "./test-utils/assert-node/assert-text-node.js";
import { mockFileSystem } from "./test-utils/mock-fs.js";

const executeCli = (args: string[]) => runCli(["node", "main.js", ...args]);

const provideTestContext = <R, E, A>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(mockFileSystem), Effect.provide(BunContext.layer));

beforeEach(() => {
  vol.reset();
  vol.mkdirSync(process.cwd(), { recursive: true });
});

const readCanvas = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const data = yield* fs.readFileString(filePath);
    const json: unknown = JSON.parse(data);
    return yield* Schema.decodeUnknown(JsonCanvas)(json);
  });

const testFile = "test-canvas.canvas";

describe("正常系", () => {
  it("ノードの追加と削除が正常に行われること", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      // テスト用キャンバスの初期化 (既存ファイルの削除)
      const exists = yield* fs
        .exists(testFile)
        .pipe(Effect.mapError((error) => new Error(`ファイル存在確認エラー: ${error.message}`)));
      if (exists) {
        yield* fs
          .remove(testFile)
          .pipe(Effect.mapError((error) => new Error(`ファイル削除エラー: ${error.message}`)));
      }

      // 1. Textノードを追加 (ID省略・自動採番)
      yield* executeCli([
        "node",
        "add",
        "text",
        "-f",
        testFile,
        "-x",
        "100",
        "-y",
        "200",
        "--width",
        "300",
        "--height",
        "400",
        "--text",
        "こんにちは",
      ]);

      const canvas1 = yield* readCanvas(testFile);
      expect(canvas1.nodes).toBeDefined();
      expect(canvas1.nodes?.length).toBe(1);

      const node1 = canvas1.nodes?.[0];

      assertTextNode(node1);

      expect(node1.id).toMatch(/^[0-9a-f]{16}$/); // 16桁のnanoidであることを確認
      expect(node1.type).toBe("text");
      expect(node1.x).toBe(100);
      expect(node1.y).toBe(200);
      expect(node1.text).toBe("こんにちは");

      // 2. Fileノードを追加
      yield* executeCli([
        "node",
        "add",
        "file",
        "-f",
        testFile,
        "--id",
        "node-2",
        "-x",
        "50",
        "-y",
        "50",
        "--width",
        "100",
        "--height",
        "100",
        "--file-ref",
        "document.md",
      ]);

      const canvas2 = yield* readCanvas(testFile);
      expect(canvas2.nodes?.length).toBe(2);

      // 3. エッジを追加（IDは自動生成）
      yield* executeCli([
        "edge",
        "add",
        "-f",
        testFile,
        "--from-node",
        node1.id,
        "--to-node",
        "node-2",
      ]);

      const canvas3 = yield* readCanvas(testFile);
      expect(canvas3.edges?.length).toBe(1);
      const edge = canvas3.edges?.[0];
      expect(edge).toBeDefined();
      if (edge !== undefined) {
        expect(edge.fromNode).toBe(node1.id);
        expect(edge.toNode).toBe("node-2");
        expect(edge.id).toMatch(/^[0-9a-f]{16}$/); // エッジのIDもnanoidであることを確認
      }

      // 4. ノードを削除（エッジも自動で削除される）
      yield* executeCli(["node", "rm", "-f", testFile, "--id", node1.id]);

      const canvas4 = yield* readCanvas(testFile);
      expect(canvas4.nodes?.length).toBe(1);
      expect(canvas4.edges?.length).toBe(0); // 接続されていたエッジが消えている

      // クリーンアップ
      yield* fs
        .remove(testFile)
        .pipe(Effect.mapError((error) => new Error(`ファイル削除エラー: ${error.message}`)));
    }).pipe(provideTestContext);

    await Effect.runPromise(program);
  });

  it("すべてのコマンド及びオプションの組み合わせが正常に動作すること", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      // キャンバス初期化 (空オブジェクトで書き込み、nodes/edges が undefined の状態を作る)
      if (yield* fs.exists(testFile)) {
        yield* fs.remove(testFile);
      }
      yield* fs.writeFileString(testFile, "{}");

      // serve コマンド (プレースホルダー検証)
      yield* executeCli(["serve"]);

      // 空の状態での list コマンド
      yield* executeCli(["list", "-f", testFile]);

      // 空（undefined）の状態でのノード/エッジ削除・追加・取得エラー（正常にエラーハンドリングされることの確認）
      yield* Effect.exit(executeCli(["node", "rm", "-f", testFile, "--id", "non-existent"]));
      yield* Effect.exit(executeCli(["edge", "rm", "-f", testFile, "--id", "non-existent"]));
      yield* Effect.exit(executeCli(["get", "-f", testFile, "--id", "non-existent"]));
      yield* Effect.exit(
        executeCli(["edge", "add", "-f", testFile, "--from-node", "n1", "--to-node", "n2"]),
      );

      // node add file (ID自動生成)
      yield* executeCli([
        "node",
        "add",
        "file",
        "-f",
        testFile,
        "-x",
        "100",
        "-y",
        "100",
        "--width",
        "150",
        "--height",
        "150",
        "--file-ref",
        "temp-doc.md",
      ]);

      // node add link (ID自動生成)
      yield* executeCli([
        "node",
        "add",
        "link",
        "-f",
        testFile,
        "-x",
        "200",
        "-y",
        "200",
        "--width",
        "200",
        "--height",
        "80",
        "--url",
        "https://example.com",
      ]);

      // node add group (ID自動生成)
      yield* executeCli([
        "node",
        "add",
        "group",
        "-f",
        testFile,
        "-x",
        "300",
        "-y",
        "300",
        "--width",
        "400",
        "--height",
        "400",
      ]);

      // node add text (初期登録)
      yield* executeCli([
        "node",
        "add",
        "text",
        "-f",
        testFile,
        "--id",
        "node-text-1",
        "-x",
        "10",
        "-y",
        "20",
        "--width",
        "100",
        "--height",
        "50",
        "--text",
        "initial text",
        "--color",
        "1",
      ]);

      // node add text (更新: upsertNode index !== -1 パス)
      yield* executeCli([
        "node",
        "add",
        "text",
        "-f",
        testFile,
        "--id",
        "node-text-1",
        "-x",
        "15",
        "-y",
        "25",
        "--width",
        "110",
        "--height",
        "55",
        "--text",
        "updated text",
        "--color",
        "2",
      ]);

      // node add file (初期登録)
      yield* executeCli([
        "node",
        "add",
        "file",
        "-f",
        testFile,
        "--id",
        "node-file-1",
        "-x",
        "100",
        "-y",
        "100",
        "--width",
        "150",
        "--height",
        "150",
        "--file-ref",
        "readme.md",
        "--label",
        "Readme File",
      ]);

      // node add file (更新)
      yield* executeCli([
        "node",
        "add",
        "file",
        "-f",
        testFile,
        "--id",
        "node-file-1",
        "-x",
        "105",
        "-y",
        "105",
        "--width",
        "155",
        "--height",
        "155",
        "--file-ref",
        "readme_updated.md",
        "--label",
        "Updated Readme File",
      ]);

      // node add link (初期登録)
      yield* executeCli([
        "node",
        "add",
        "link",
        "-f",
        testFile,
        "--id",
        "node-link-1",
        "-x",
        "200",
        "-y",
        "200",
        "--width",
        "200",
        "--height",
        "80",
        "--url",
        "https://effect.website",
        "--label",
        "Effect Homepage",
        "--color",
        "3",
      ]);

      // node add link (更新)
      yield* executeCli([
        "node",
        "add",
        "link",
        "-f",
        testFile,
        "--id",
        "node-link-1",
        "-x",
        "205",
        "-y",
        "205",
        "--width",
        "205",
        "--height",
        "85",
        "--url",
        "https://effect.website/docs",
        "--label",
        "Effect Docs",
        "--color",
        "4",
      ]);

      // node add group (初期登録)
      yield* executeCli([
        "node",
        "add",
        "group",
        "-f",
        testFile,
        "--id",
        "node-group-1",
        "-x",
        "300",
        "-y",
        "300",
        "--width",
        "400",
        "--height",
        "400",
        "--label",
        "My Group",
        "--color",
        "5",
      ]);

      // node add group (更新)
      yield* executeCli([
        "node",
        "add",
        "group",
        "-f",
        testFile,
        "--id",
        "node-group-1",
        "-x",
        "305",
        "-y",
        "305",
        "--width",
        "405",
        "--height",
        "405",
        "--label",
        "My Updated Group",
        "--color",
        "6",
      ]);

      // edge add (オプション全指定)
      yield* executeCli([
        "edge",
        "add",
        "-f",
        testFile,
        "--from-node",
        "node-text-1",
        "--to-node",
        "node-file-1",
        "--from-side",
        "right",
        "--to-side",
        "left",
        "--color",
        "3",
        "--label",
        "association",
      ]);

      // edge add (片側fromSideのみ)
      yield* executeCli([
        "edge",
        "add",
        "-f",
        testFile,
        "--from-node",
        "node-file-1",
        "--to-node",
        "node-link-1",
        "--from-side",
        "bottom",
      ]);

      // edge add (片側toSideのみを指定し sideInfo の branch を網羅)
      yield* executeCli([
        "edge",
        "add",
        "-f",
        testFile,
        "--from-node",
        "node-text-1",
        "--to-node",
        "node-link-1",
        "--to-side",
        "right",
      ]);

      // node-file-1 を to-node に指定したエッジを追加 (node rm 時の filter ブランチ網羅用)
      yield* executeCli([
        "edge",
        "add",
        "-f",
        testFile,
        "--from-node",
        "node-link-1",
        "--to-node",
        "node-file-1",
      ]);

      // node-file-1 と無関係なエッジを追加 (node rm 時の filter ブランチ網羅用)
      yield* executeCli([
        "edge",
        "add",
        "-f",
        testFile,
        "--from-node",
        "node-text-1",
        "--to-node",
        "node-link-1",
      ]);

      // list コマンド (データが入っている状態 & sideInfo 出力ルートの通過)
      yield* executeCli(["list", "-f", testFile]);

      // show コマンド
      yield* executeCli(["show", "-f", testFile]);

      // get コマンド (Node)
      yield* executeCli(["get", "-f", testFile, "--id", "node-text-1"]);

      // get コマンド (Edge - ID特定のため読み込む)
      const canvas = yield* readCanvas(testFile);
      const edgeId = canvas.edges?.[0]?.id ?? "";
      yield* executeCli(["get", "-f", testFile, "--id", edgeId]);

      // edge rm コマンド
      yield* executeCli(["edge", "rm", "-f", testFile, "--id", edgeId]);

      // node rm コマンドで node-file-1 を削除 (接続する to-node エッジや無関係エッジの filter 条件を通過させる)
      yield* executeCli(["node", "rm", "-f", testFile, "--id", "node-file-1"]);

      // nodesはあるがedgesが存在しない状態でnode rmを実行する（edges: undefinedのフォールバックルート網羅用）
      yield* fs.writeFileString(
        testFile,
        JSON.stringify({
          nodes: [
            {
              id: "temp-node",
              type: "text",
              x: 10,
              y: 10,
              width: 100,
              height: 100,
              text: "temp",
            },
          ],
        }),
      );
      yield* executeCli(["node", "rm", "-f", testFile, "--id", "temp-node"]);

      // クリーンアップ
      yield* fs.remove(testFile);

      // アサーションを追加 (ファイルが正常にクリーンアップされたことの確認)
      const cleanupSuccess = yield* fs.exists(testFile);
      expect(cleanupSuccess).toBe(false);
    }).pipe(provideTestContext);

    await Effect.runPromise(program);
  });
});

describe("異常系", () => {
  it("存在しないノードの削除を実行したときにエラーになること", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      // テスト用キャンバスの初期化
      const exists = yield* fs
        .exists(testFile)
        .pipe(Effect.mapError((error) => new Error(`ファイル存在確認エラー: ${error.message}`)));
      if (exists) {
        yield* fs
          .remove(testFile)
          .pipe(Effect.mapError((error) => new Error(`ファイル削除エラー: ${error.message}`)));
      }

      // 存在しないノードを削除しようとする
      const result = yield* Effect.exit(
        executeCli(["node", "rm", "-f", testFile, "--id", "non-existent-id"]),
      );

      // 実行が失敗終了することを確認
      expect(result.toString().includes("Failure")).toBe(true);

      // クリーンアップ
      const cleanupExists = yield* fs
        .exists(testFile)
        .pipe(Effect.mapError((error) => new Error(`ファイル存在確認エラー: ${error.message}`)));
      if (cleanupExists) {
        yield* fs
          .remove(testFile)
          .pipe(Effect.mapError((error) => new Error(`ファイル削除エラー: ${error.message}`)));
      }
    }).pipe(provideTestContext);

    await Effect.runPromise(program);
  });

  it("各コマンドでエラーハンドリング（JSONパースエラー、バリデーションエラー等）が正しく機能すること", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const corruptFile = "corrupt-test.canvas";

      // 不正な JSON ファイルを作成
      yield* fs.writeFileString(corruptFile, "invalid json");

      // 各コマンドを実行し、エラーが発生して終了することを確認
      expect(
        (yield* Effect.exit(executeCli(["show", "-f", corruptFile])))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(executeCli(["list", "-f", corruptFile])))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(executeCli(["get", "-f", corruptFile, "--id", "node-1"])))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(executeCli(["node", "rm", "-f", corruptFile, "--id", "node-1"])))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(executeCli(["edge", "rm", "-f", corruptFile, "--id", "edge-1"])))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(
          executeCli(["edge", "add", "-f", corruptFile, "--from-node", "n1", "--to-node", "n2"]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);

      const nodeAddArgs = ["-x", "10", "-y", "20", "--width", "100", "--height", "100"];
      expect(
        (yield* Effect.exit(
          executeCli(["node", "add", "text", "-f", corruptFile, "--text", "hello", ...nodeAddArgs]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(
          executeCli([
            "node",
            "add",
            "file",
            "-f",
            corruptFile,
            "--file-ref",
            "doc.md",
            ...nodeAddArgs,
          ]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(
          executeCli([
            "node",
            "add",
            "link",
            "-f",
            corruptFile,
            "--url",
            "https://example.com",
            ...nodeAddArgs,
          ]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);
      expect(
        (yield* Effect.exit(
          executeCli(["node", "add", "group", "-f", corruptFile, ...nodeAddArgs]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);

      // クリーンアップ
      yield* fs.remove(corruptFile);

      // edge add 固有のエラー検証用キャンバス初期化 (ノードを1つだけ用意)
      const validCanvasFile = "edge-error-test.canvas";
      yield* fs.writeFileString(
        validCanvasFile,
        JSON.stringify({
          nodes: [
            {
              id: "node-1",
              type: "text",
              x: 10,
              y: 10,
              width: 100,
              height: 100,
              text: "node 1",
            },
          ],
        }),
      );

      // fromNode が存在しないエラー
      expect(
        (yield* Effect.exit(
          executeCli([
            "edge",
            "add",
            "-f",
            validCanvasFile,
            "--from-node",
            "node-nonexistent",
            "--to-node",
            "node-1",
          ]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);

      // toNode が存在しないエラー
      expect(
        (yield* Effect.exit(
          executeCli([
            "edge",
            "add",
            "-f",
            validCanvasFile,
            "--from-node",
            "node-1",
            "--to-node",
            "node-nonexistent",
          ]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);

      // バリデーションエラー (color に不正な値を指定)
      expect(
        (yield* Effect.exit(
          executeCli([
            "edge",
            "add",
            "-f",
            validCanvasFile,
            "--from-node",
            "node-1",
            "--to-node",
            "node-1",
            "--color",
            "invalid-color",
          ]),
        ))
          .toString()
          .includes("Failure"),
      ).toBe(true);

      yield* fs.remove(validCanvasFile);
    }).pipe(provideTestContext);

    await Effect.runPromise(program);
  });
});
