# nfc-toggl-timer

指定した NFC タグをスマートフォンで読み取ったときに、
対応する Toggl Track タイマーを開始する Tasker プロファイルレシピです。

## 構成ファイル

| 種別       | パス                                                                 | タスク / プロファイル名        | 役割                                                               |
| :--------- | :------------------------------------------------------------------- | :----------------------------- | :----------------------------------------------------------------- |
| **共通**   | `automations/tasker/shared-tasks/start-toggl-timer.tsk.xml`          | `Start Toggl Timer`            | Toggl Track API v9 で指定タイマー（`%par1`, `%par2`）を開始する    |
| **レシピ** | `automations/tasker/recipes/nfc-toggl-timer/nfc-toggl-timer.prf.xml` | `Start Toggl Timer On NFC Tag` | 指定 NFC タグの読み取りを検知して Toggl タイマーを開始する Profile |

## 事前設定が必要なグローバル変数・端末設定

Tasker の **VARS** タブで、以下のグローバル変数を設定してください
（XML 内には機密情報をハードコードしていません）。

| 変数名                | 設定値の内容                                         |
| :-------------------- | :--------------------------------------------------- |
| `%TOGGL_API_TOKEN`    | Toggl Track の Profile Settings で取得した API Token |
| `%TOGGL_WORKSPACE_ID` | 計測対象の Toggl Workspace ID（数値）                |

また、Android 端末の「設定」→「接続設定」等から **NFC** が有効になっていることを確認してください。

## 実機へのインポートと設定手順

### 1. 共通タスクのインポート（未インポートの場合）

1. Android 端末へ `shared-tasks/start-toggl-timer.tsk.xml` を転送します。
2. Tasker アプリを開き、**TASKS** タブを長押しして **Import Task** を選択し、
   `start-toggl-timer.tsk.xml` をインポートします。

### 2. Profile レシピのインポート

1. `recipes/nfc-toggl-timer/nfc-toggl-timer.prf.xml` を Android 端末へ転送します。
2. Tasker アプリの **PROFILES** タブを長押しして **Import Profile** を選択し、
   `nfc-toggl-timer.prf.xml` をインポートします。

### 3. 対象の NFC タグ ID とタイマー情報の設定

1. **NFC タグ ID の設定**:
   - **PROFILES** タブで `Start Toggl Timer On NFC Tag` を展開し、
     左側のイベント条件 **NFC タグ ID: YOUR_NFC_TAG_ID** をタップします。
   - **ID** 欄の右側にある虫眼鏡アイコン（スキャンボタン）をタップし、
     対象の NFC タグをスマートフォンにかざしてタグ固有の ID（UID）を読み取ります。
   - `YOUR_NFC_TAG_ID` が実際のタグ ID に置き換わったことを確認し、
     左上の戻るボタン（←）で確定します。
2. **開始する Toggl タイマーの設定**:
   - 同じプロファイルの右側に紐づいている匿名タスク（Entry Task）をタップして開きます。
   - アクション 1（`Multiple Variables Set`）を開き、以下のプレースホルダーを実際の値に書き換えます。
     - `%toggl_project_id=YOUR_PROJECT_ID` → 開始したい Toggl プロジェクトの ID（数値）
     - `%toggl_description=YOUR_DESCRIPTION` → 開始したい Toggl タイマーの説明文（Description）
     - `%cooldown_seconds=5` → チャタリング防止のクールダウン秒数（初期値: `5` 秒）
3. Tasker 画面右上のチェックマーク（✓）をタップして設定を保存・適用します。
   - 別の NFC タグで異なるタイマーを開始したい場合は、プロファイルを長押しして複製（Clone）し、
     それぞれのタグ ID とタイマー情報を設定してください。

## 動作仕様・エラーハンドリング

- **対象外 NFC タグのフィルタリング**:
  Event Context（`NFC タグ`）の `ID` 条件で対象タグの UID を指定しているため、
  未登録の別 NFC タグを読み取ってもこのプロファイルは発火しません。
- **未設定防止チェック**:
  NFC タグ ID またはプロジェクト ID・説明文が初期プレースホルダー
  （`YOUR_NFC_TAG_ID` / `YOUR_PROJECT_ID` / `YOUR_DESCRIPTION`）のまま実行された場合は、
  `AI Errors` カテゴリの通知（`Notify`）とトースト（`Flash`）を表示して処理を中断します。
- **稼働中タイマーの扱い**:
  既に別の（または同じ）Toggl タイマーが稼働中の場合は、Toggl Track API v9 の標準仕様により
  既存タイマーが自動停止され、新しいタイマーが開始されます。
- **チャタリング・連続読み取り対策**:
  1. **タスク実行中の重複排除**:
     Entry Task の Collision Handling（`<rty>0</rty>`: Abort New Task）により、
     API 通信中にかざし続けて発生した重複イベントは破棄されます。
  2. **クールダウン（デバウンス）制御**:
     前回実行時の時刻（`%LastNfcTogglTime`）とタグ ID（`%LastNfcTogglTagId`）を記録し、
     同一の NFC タグが `%cooldown_seconds`（初期値 5 秒）以内に再読み取りされた場合は
     何もせず静かに終了します。異なる NFC タグ（別プロファイル）を続けて読み取った場合は
     クールダウンの対象外となり、即座に切り替わります。
