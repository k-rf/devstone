# widget-switchbot-toggl-timer

ホーム画面のウィジェット（`Widget v2`）をタップすると、指定した SwitchBot シーンを実行し、
続けて指定した Toggl Track タイマーを開始する Tasker プロジェクトレシピです。

## 構成ファイル

| 種別       | パス                                                                                           | タスク / プロジェクト名      | 役割                                                            |
| :--------- | :--------------------------------------------------------------------------------------------- | :--------------------------- | :-------------------------------------------------------------- |
| **共通**   | `automations/tasker/shared-tasks/execute-switchbot-scene.tsk.xml`                              | `Execute SwitchBot Scene`    | SwitchBot API v1.1 で指定シーン（`%par1`）を実行する共通タスク  |
| **共通**   | `automations/tasker/shared-tasks/start-toggl-timer.tsk.xml`                                    | `Start Toggl Timer`          | Toggl Track API v9 で指定タイマー（`%par1`, `%par2`）を開始する |
| **レシピ** | `automations/tasker/recipes/widget-switchbot-toggl-timer/widget-switchbot-toggl-timer.prj.xml` | `SwitchBot And Toggl Widget` | ウィジェット作成タスクとタップ時の連携実行タスクを含む Project  |

## 事前設定が必要なグローバル変数

Tasker の **VARS** タブで、以下のグローバル変数を設定してください
（XML 内には機密情報をハードコードしていません）。

| 変数名                  | 設定値の内容                                                                 |
| :---------------------- | :--------------------------------------------------------------------------- |
| `%SWITCHBOT_API_TOKEN`  | SwitchBot アプリの「開発者向けオプション」で発行したトークン                 |
| `%SWITCHBOT_API_SECRET` | SwitchBot アプリの「開発者向けオプション」で発行したクライアントシークレット |
| `%TOGGL_API_TOKEN`      | Toggl Track の Profile Settings で取得した API Token                         |
| `%TOGGL_WORKSPACE_ID`   | 計測対象の Toggl Workspace ID（数値）                                        |

## 実機へのインポートと設定手順

### 1. 共通タスクのインポート

1. Android 端末へ以下の 2 ファイルを転送します。
   - `shared-tasks/execute-switchbot-scene.tsk.xml`
   - `shared-tasks/start-toggl-timer.tsk.xml`（未インポートの場合）
2. Tasker アプリを開き、上部または下部の **TASKS** タブを長押しして **Import Task** を選択し、
   それぞれの `.tsk.xml` をインポートします。

### 2. Project レシピのインポート

1. `recipes/widget-switchbot-toggl-timer/widget-switchbot-toggl-timer.prj.xml` を
   Android 端末へ転送します。
2. Tasker アプリ下部のプロジェクトバー（ホームアイコン等）を長押しして **Import Project** を選択し、
   `widget-switchbot-toggl-timer.prj.xml` をインポートします。

### 3. 実行対象のシーン ID とタイマー情報の設定

1. インポートされた `SwitchBot And Toggl Widget` プロジェクト内の **TASKS** タブから
   `Run SwitchBot And Start Toggl` を開きます。
2. アクション 1（`Multiple Variables Set`）を開き、以下のプレースホルダーを実際の値に書き換えます。
   - `%switchbot_scene_id=YOUR_SCENE_ID` → 実行したい SwitchBot シーンの ID
     （`automations/tasker/scripts/get-switchbot-scenes.sh` を実行して一覧から確認可能）
   - `%toggl_project_id=YOUR_PROJECT_ID` → 開始したい Toggl プロジェクトの ID（数値）
   - `%toggl_description=YOUR_DESCRIPTION` → 開始したい Toggl タイマーの説明文（Description）
3. ウィジェットの表示ラベル（初期値: `💤`）や識別名（初期値: `消灯`）を変更したい場合は、
   `Create SwitchBot Toggl Widget` タスク内のアクション 1（`%widget_button_label`）および
   アクション 2（`Widget v2` の Widget Name）を編集します。

### 4. ホーム画面へのウィジェット配置

1. `SwitchBot And Toggl Widget` プロジェクト内の `Create SwitchBot Toggl Widget` タスクを開き、
   画面下部の再生ボタン（▷）をタップして 1 回手動実行します。
2. `Widget v2` の「存在しない場合に確認して追加（Ask To Add If Not Present）」が有効になっているため、
   ホーム画面へウィジェットを追加する確認ポップアップが表示されます
   （またはランチャーのウィジェット一覧から **Tasker -> Widget v2** を選択し、
   `消灯` を 1x1 サイズで配置します）。
3. 配置したウィジェットをタップすると、SwitchBot シーンの実行に続けて
   Toggl タイマーが開始されます。

## 動作仕様・エラーハンドリング

- **シーン実行失敗時の挙動**:
  通信エラーや SwitchBot API エラー（`statusCode != 100`）が発生した場合は、
  `AI Errors` カテゴリの通知（`Notify`）を表示して処理を中断し、後続の Toggl タイマーは開始しません。
- **稼働中タイマーの扱い**:
  既に別の Toggl タイマーが稼働中の場合は、Toggl Track API v9 の標準仕様により
  既存タイマーが自動停止され、新しいタイマーが開始されます。
- **連打対策（多重実行制御）**:
  `Run SwitchBot And Start Toggl` タスクの Collision Handling（`<rty>0</rty>`）により、
  タスク実行中にウィジェットが連打された場合は後続の新規実行を破棄（Abort New Task）します。
