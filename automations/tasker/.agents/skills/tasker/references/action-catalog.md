# Tasker Action Catalog Data

## Action Catalog Data

- JSON defining available Tasker Actions. Used for **Tasks** (standalone, anonymous within Profiles,
  or named within Projects).
- For each parameter, the `dialog_type_id` field is **OPTIONAL**. If provided, it dictates the
  required input dialog type. If omitted, you must infer the type.
- **CRITICAL FORMAT ADHERENCE:** For any action parameter where a specific input format is described
  in its catalog entry (e.g., for HTTP Request Query Parameters, or specific date/time patterns),
  you **MUST** strictly adhere to that specified format when generating the value for the
  corresponding XML argument. Do not assume default web/common formats if Tasker specifies
  otherwise.
- Action objects MAY include `"output_variable_list"`: an array of objects
  `{{"name": "%varname", "description": "..."}}` defining explicitly named output variables produced
  _after_ the action runs. The `name` MUST be the exact Tasker variable name. (This is the "New
  Style"). Some actions explicitly output **Variable Arrays** (e.g., `List Files`).
- Some older Actions do NOT use `output_variable_list`. Instead, they have specific **input
  parameters** (identified by names like "Store Result In", "To Var", "**Variable Array**", "Return
  Value Variable", "Read Result To", "Output Variable Name", etc.) whose **value** is the **name**
  of the variable the user wants the action's result stored into. You must identify these specific
  parameters within an action's `parameter_catalog` and understand that the user needs to provide
  the desired output variable name as the value for **that specific input parameter**. (This is the
  "Old Style"). This output can be a simple variable or a **Variable Array**. **Crucially, you must
  know the standard output variables for common dialog actions:**
- `List Dialog` (code 378): `%ld_selected` (single choice item), `%ld_button` (button label if
  pressed), `%ld_selected_indices` (indices for multiple choice).
- `Input Dialog` (code 360): The variable name specified in the 'Output Variable Name' parameter
  (arg8), or `%input` if arg8 is empty.
- `Pick Input Dialog` (code 390): The result is **always** available in the variable `%input`. This
  dialog does not use a parameter to set a custom output variable name; rely on `%input` ONLY!
- `Text/Image Dialog` (code 377): `%td_button` (label of button pressed).
- Use these specific variables to retrieve user input from dialogs.
- The `Bundle` parameter often named "Output Variables" (e.g., u: 0 or arg0 in XML) is typically for
  Tasker's internal configuration and SHOULD NOT be interpreted as the list of usable output
  variables like %http_data. Use the dedicated output_variable_list (New Style) or the "Old Style"
  input parameters instead for determining usable output variables. **However, if such a Bundle
  parameter is listed in a component's catalog parameter_catalog (p.p array), it MUST still be
  generated in the XML as its corresponding sequential argument (e.g., as
  `<Bundle sr="arg0">...</Bundle>` if it's the first parameter in the catalog), even if it's
  primarily for internal use or appears empty. It contributes to the strict sequential mapping of
  all cataloged parameters to XML arguments.**
- **Interpreting Parameter 's' Field:** **CRITICAL ADHERENCE TO `s` FIELD CONSTRAINTS: The AI MUST
  meticulously analyze and strictly adhere to any constraints or format specifications provided in
  the `"s"` field for every parameter in the Event, State, and Action catalogs. This is especially
  vital for numeric parameters where `"s"` often defines a `MIN:MAX:DEFAULT` range (e.g.,
  `"1:999999"`). The AI MUST ensure generated values fall within the specified MIN/MAX inclusive
  range and conform to any other formatting rules implied by `"s"`. Failure to respect these
  `"s"` field constraints will lead to invalid Tasker configurations.**
- Within the `parameter_catalog` (`p` array within the `p` object) for Events, States, and Actions,
  the `"s"` field provides additional context about the expected input. Common formats include:
- `"t:LINES:?"`: Indicates a text input (`t`). `LINES` is the number of lines expected (e.g., `1`,
  `5`, `999`). The trailing `?` signifies the parameter is optional.
- `"MIN:MAX:DEFAULT"`: Used for integer inputs, specifying the minimum allowed value, maximum
  allowed value, and the default value (e.g., `0:100:50`).
- `"PREFIX:..."`: Many other prefixes indicate specialized string input types (e.g., `"f"` for file
  path, `"uvar"` for user variable name (it's a normal String input that expects a value starting
  with %), `"var"` for any variable name (it's a String input that expects a value starting with %),
  `"col"` for color, `"m"` for Task name, `"prof"` for Profile name, `"locradi"` for
  location+radius, `"bosta"` for structured output toggle, `"inpval"` for a value that can contain
  variables, etc.). These prefixes can provide hints for validation and may assist in inferring the
  appropriate `dialog_type_id` if one is not explicitly provided.
- **CRITICAL STRUCTURED OUTPUT DETAIL:** Actions like `HTTP Request`, `Variable Set`, `Read File`,
  `Read Line` etc., MAY have a parameter option like **"Structured Output"** (often indicated by
  `bosta` in the `s` field, or named explicitly). When this option is enabled (typically by setting
  its corresponding XML argument value to `1`), if the variable populated by this action contains
  valid JSON, HTML/XML, or CSV content, Tasker allows **Structured Variable** access (see
  `variables-and-conditions.md` (Tasker Variable Types & Structures)). **The AI MUST explicitly plan
  to enable this parameter in the relevant action if it intends to use structured access syntax on
  the resulting variable later in the Task.**

```json
{
  "a": [
    { "c": 245, "n": "戻るボタン / Back Button", "p": { "p": [] } },
    { "c": 246, "n": "電源ボタン長押し / Long Power Button", "p": { "p": [] } },
    { "c": 247, "n": "アプリ履歴 / Show Recents", "p": { "p": [] } },
    { "c": 244, "n": "画面分割の切り替え / Toggle Split Screen", "p": { "p": [] } },
    { "c": 219, "n": "クイック タイル / Quick Settings", "p": { "p": [] } },
    { "c": 249, "n": "システムのスクリーンショット / System Screenshot", "p": { "p": [] } },
    {
      "c": 259,
      "n": "通知の点滅 / Notification Pulse",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 18,
      "n": "アプリを強制終了 / Kill App",
      "p": {
        "p": [
          { "a": "App", "u": 0, "s": "", "m": "アプリ" },
          { "a": "Int", "u": 1, "s": "", "m": "ルート権限使用" }
        ]
      }
    },
    { "c": 22, "n": "直前のアプリ / Load Last App", "p": { "p": [] } },
    { "c": 804, "n": "キーボード切り替え / Input Method Select", "p": { "p": [] } },
    {
      "c": 548,
      "n": "フラッシュ表示 / Flash",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "s:4", "m": "文字" },
          { "a": "Int", "u": 1, "s": "", "m": "長く" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "Taskerレイアウト",
            "d": "通常のシステムトーストを使用する代わりに、カスタムTaskerトーストでテキストを表示します。\n\nこのオプションを有効にすると、HTMLを使用してテキストを書式設定できます。例えば、\u003cfont color\u003d\"red\"\u003e一部のテキスト\u003c/font\u003e を使用して、一部のテキストを赤で表示できます。\n\n高度なトースト機能を取得したり、お使いのデバイスが複数行のトーストをサポートしていない場合などに便利です。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "t:1:?",
            "m": "タイトル",
            "d": "通常のトーストテキストの上に表示するタイトル。設定されていない場合、テキストのみが表示されます。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "img:1:?",
            "m": "アイコン",
            "d": "トーストに表示するアイコン。\n\n設定されていない場合、アイコンはまったく表示されません。"
          },
          {
            "a": "Str",
            "u": 5,
            "s": "t:1:?",
            "m": "アイコンサイズ",
            "d": "dip単位のアイコンサイズ（密度非依存ピクセル）。\n\nデフォルト値は24です。"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "col:1:?",
            "m": "背景色",
            "d": "トーストの背景色。\n\n設定されていない場合、現在のTaskerテーマの背景色が使用されます。"
          },
          {
            "a": "Str",
            "u": 7,
            "s": "m:1:?",
            "m": "タスク",
            "d": "設定されている場合、トーストをインタラクティブにし、クリックされると選択したタスクを呼び出します。\n\nトーストが作成されたタスクで利用可能なすべての変数は、呼び出されたタスクでも利用可能になります。"
          },
          {
            "a": "Str",
            "u": 8,
            "s": "t:1:?",
            "m": "タイムアウト",
            "d": "トーストが画面に表示される時間（ミリ秒）。\n\n設定されている場合、上記の通常の「長」設定を上書きします。"
          },
          {
            "a": "Int",
            "u": 9,
            "s": "true",
            "m": "すぐに次のタスクに進む",
            "d": "無効にすると、トーストが画面から消えるまでタスクを次のアクションに進めません。"
          },
          {
            "a": "Str",
            "u": 10,
            "s": "col:1:?",
            "m": "文字の色",
            "d": "トーストのテキストの色。\n\n設定されていない場合、良好なコントラストを持つように、背景色に適したテキスト色が選択されます。\n\nテキストでHTMLが使用され、そのように色が送信された場合、テキストのそれらの部分についてのみこの設定を上書きします。"
          },
          {
            "a": "Int",
            "u": 11,
            "s": "true",
            "m": "クリック時に閉じる",
            "d": "有効にすると、クリックされてタスクが起動されるとすぐにフラッシュが消えます。"
          },
          {
            "a": "Int",
            "u": 12,
            "s": "false",
            "m": "すべての上に表示",
            "d": "有効にすると、通知トレイ、ロック画面、または一部のデバイスのAODなどのシステムUIの上にトーストが表示されます。\n\nこれを機能させるには、Taskerのユーザー補助サービスをオンにする必要があります。\n\n必要に応じて、「タスクをすぐに続行」オプションを無効にすると、Taskerが必要に応じてサービスを自動的にオン/オフします。"
          },
          {
            "a": "Str",
            "u": 13,
            "s": "t:1:?",
            "m": "位置",
            "d": "TopLeft、Top、TopRight、Right、BottomRight、Bottom、BottomLeft、またはLeftのいずれか。\n\nオプションで、位置からカンマで区切られたdip単位のオフセットを提供できます。\n\n簡単な設定にはヘルパーを使用してください。"
          },
          { "a": "Int", "u": 14, "s": "false", "m": "HTML を使う" },
          {
            "a": "Str",
            "u": 15,
            "s": "t:1:?",
            "m": "ID",
            "d": "IDを設定し、同じIDを持つ既存のフラッシュが既に表示されている場合、新しいもので置き換えられます。\n\nIDが設定されていない場合、互いに重なって表示されます。"
          }
        ]
      }
    },
    {
      "c": 806,
      "n": "画面点灯 / Turn On",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "100:999:500", "m": "ブロック時間 (ヘルプ参照)" }] }
    },
    {
      "c": 820,
      "n": "常時点灯 / Stay On",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": {
              "なし": 0,
              "AC 充電時": 1,
              "USB 充電時": 2,
              "AC または USB 充電時": 3,
              "無線充電時": 4,
              "無線または AC 充電時": 5,
              "無線または USB 充電時": 6,
              "無線、 AC 、USB 充電時": 7
            }
          }
        ]
      }
    },
    {
      "c": 312,
      "n": "割り込みモード / Interrupt Mode",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": {
              "割り込み無し": 0,
              "優先度": 1,
              "全て許可": 2,
              "アラーム": 3,
              "カスタム設定 / Custom Setting": 4,
              "クエリー": 5
            }
          },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "発信元を許可する",
            "p": { "任意": 0, "連絡先": 1, "スター付き": 2, "無し": 3 }
          },
          { "a": "Int", "u": 2, "s": "", "m": "複数回の発信者を許可する" },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "SMS送信者を許可する",
            "p": { "任意": 0, "連絡先": 1, "スター付き": 2, "無し": 3 }
          },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "カテゴリーを許可する" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "抑制されたエフェクト" },
          { "a": "Bundle", "u": 6, "s": "", "m": "出力変数" }
        ]
      },
      "o": {
        "v": [
          { "n": "%dnd_allow_callers", "d": "発信元を許可する" },
          { "n": "%dnd_allow_message_senders", "d": "SMS送信者を許可する" },
          { "n": "%dnd_categories()", "d": "カテゴリーを許可する" },
          { "n": "%dnd_mode", "d": "モード" },
          { "n": "%dnd_suppressed_effects()", "d": "抑制されたエフェクト" }
        ]
      }
    },
    {
      "c": 313,
      "n": "マナーモード解除 / Sound Mode",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "ミュート(消音)": 0, "バイブ(振動)": 1, "サウンド": 2 }
          },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "DNDを無視",
            "d": "有効にした場合、サウンドモードを変更した後、アクティブなDNDモードを復元しようとしません。"
          }
        ]
      }
    },
    {
      "c": 314,
      "n": "認証ダイアログ / Authentication Dialog",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類", "p": { "パスコード": 0, "生体認証": 1 } },
          { "a": "Str", "u": 1, "s": "t:1", "m": "タイトル" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "副題" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "説明" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "キャンセルボタンの文字" },
          { "a": "Int", "u": 5, "s": "1:5:3", "m": "試行回数" },
          { "a": "Str", "u": 6, "s": "uvar:1:?", "m": "結果の読み込み先" },
          { "a": "Int", "u": 7, "s": "5:120:10", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 8, "s": "", "m": "確認が必要" },
          { "a": "Int", "u": 9, "s": "", "m": "デバイス認証情報の許容" }
        ]
      }
    },
    {
      "c": 316,
      "n": "画面のサイズ / Display Size",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "サイズ",
            "p": { "中": 0, "小": 1, "小さめ": 2, "最小": 3, "大": 4, "大きめ": 5, "最大": 6 }
          },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "手動" }
        ]
      }
    },
    {
      "c": 317,
      "n": "NFC",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Bundle", "u": 1, "s": "", "m": "出力変数" }
        ]
      },
      "o": { "v": [{ "n": "%new_state", "d": "新しい状態" }] }
    },
    {
      "c": 318,
      "n": "回転を強制する / Force Rotation",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "オフ": 0, "縦向き": 1, "縦向き(逆さ)": 2, "横向き": 3, "横向き(逆さ)": 4 }
          },
          { "a": "Int", "u": 1, "s": "", "m": "代替手段 (ヘルプ参照)" }
        ]
      }
    },
    {
      "c": 319,
      "n": "権限を要求 / Ask Permissions",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:5", "m": "必要な権限" },
          {
            "a": "Str",
            "u": 1,
            "s": "t:5:?",
            "m": "未付与の場合にプロンプト表示",
            "d": "上記の権限のいずれかがまだ付与されていない場合、権限を求める前に、なぜそれらが必要なのかを説明するダイアログが表示されます。"
          }
        ]
      }
    },
    {
      "c": 320,
      "n": "ping",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "ホスト" },
          { "a": "Int", "u": 1, "s": "1:10", "m": "電話番号" },
          { "a": "Str", "u": 2, "s": "uvar:1:?", "m": "結果の平均値の変数" },
          { "a": "Str", "u": 3, "s": "uvar:1:?", "m": "結果の最小値の変数" },
          { "a": "Str", "u": 4, "s": "uvar:1:?", "m": "結果の最大値の変数" }
        ]
      }
    },
    {
      "c": 321,
      "n": "ドライブにアップロード / GD Upload",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "Google ドライブ アカウント" },
          { "a": "Str", "u": 2, "s": "t:3", "m": "データ / ファイル" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "リモート(機器側)のファイル名" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "リモート(機器側)のフォルダー" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "内容の説明" },
          { "a": "Int", "u": 6, "s": "", "m": "存在すれば上書き" },
          { "a": "Int", "u": 7, "s": "", "m": "ファイル共有の公開用リンク" },
          {
            "a": "Str",
            "u": 8,
            "s": "t:1:?",
            "m": "MIME タイプ",
            "d": "アップロードされたファイルのMIMEタイプを変更すると、Googleはそのタイプにファイルを自動的に変換しようとします。\n\nたとえば、Microsoft ExcelファイルをGoogle SheetsのMIMEタイプでアップロードすると、アップロードされたファイルは使用可能なGoogle Sheetsファイルになります。\n\n一部のタイプはアップロードされたデータと互換性がなく、その場合、Google Driveは「Bad Request」エラーで応答します。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%gd_id", "d": "ファイル ID" },
          { "n": "%gd_md5", "d": "MD5" },
          { "n": "%gd_mimetype", "d": "MIME タイプ" },
          { "n": "%gd_time", "d": "ファイルの時刻" },
          { "n": "%gd_name", "d": "ファイル名" },
          { "n": "%gd_size", "d": "ファイルサイズ" },
          { "n": "%gd_uploaded", "d": "アップロード済み" },
          { "n": "%gd_weburl", "d": "ウェブ URL" }
        ]
      }
    },
    {
      "c": 322,
      "n": "データのバックアップ / Data Backup",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:3", "m": "パス" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "Google ドライブ アカウント" },
          { "a": "Int", "u": 2, "s": "", "m": "ユーザー変数や設定を含める" }
        ]
      }
    },
    {
      "c": 323,
      "n": "機内モードでの電波 / Airplane Radios",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "Bluetooth" },
          { "a": "Int", "u": 1, "s": "", "m": "基地局" },
          { "a": "Int", "u": 2, "s": "", "m": "NFC" },
          { "a": "Int", "u": 3, "s": "", "m": "WiFi" },
          { "a": "Int", "u": 4, "s": "", "m": "WiMAX" }
        ]
      }
    },
    {
      "c": 324,
      "n": "ドライブ 一覧 / GD List",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "Google ドライブ アカウント" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "種類",
            "p": { "リモート(機器側)のフォルダー": 0, "クエリー": 1 }
          },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "ファイルまたはフォルダー",
            "p": { "両方": 0, "ファイル": 1, "フォルダー": 2 }
          },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "リモート(機器側)のフォルダー" },
          { "a": "Str", "u": 5, "s": "t:1", "m": "クエリー" }
        ]
      },
      "o": {
        "v": [
          { "n": "%gd_id()", "d": "ファイル ID" },
          { "n": "%gd_md5()", "d": "MD5" },
          { "n": "%gd_mimetype()", "d": "MIME タイプ" },
          { "n": "%gd_time()", "d": "ファイルの時刻" },
          { "n": "%gd_name()", "d": "ファイル名" },
          { "n": "%gd_size()", "d": "ファイルサイズ" },
          { "n": "%gd_weburl()", "d": "ウェブ URL" }
        ]
      }
    },
    {
      "c": 325,
      "n": "ドライブ ごみ箱 / GD Trash",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "Google ドライブ アカウント" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "ごみ箱の値",
            "p": { "ごみ箱": 0, "ごみ箱から削除する": 1 }
          },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "種類",
            "p": { "ファイル ID": 0, "リモート(機器側)のパス": 1 }
          },
          { "a": "Str", "u": 4, "s": "t:1", "m": "ファイル ID" },
          { "a": "Str", "u": 5, "s": "t:1", "m": "リモート(機器側)のフォルダー" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "リモート(機器側)のファイル名" },
          { "a": "Str", "u": 7, "s": "t:1", "m": "リモート(機器側)の名前" }
        ]
      },
      "o": {
        "v": [
          { "n": "%gd_id", "d": "ファイル ID" },
          { "n": "%gd_md5", "d": "MD5" },
          { "n": "%gd_mimetype", "d": "MIME タイプ" },
          { "n": "%gd_time", "d": "ファイルの時刻" },
          { "n": "%gd_name", "d": "ファイル名" },
          { "n": "%gd_size", "d": "ファイルサイズ" },
          { "n": "%gd_weburl", "d": "ウェブ URL" }
        ]
      }
    },
    {
      "c": 326,
      "n": "ドライブからダウンロード / GD Download",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "Google ドライブ アカウント" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "種類",
            "p": { "ファイル ID": 0, "リモート(機器側)のパス": 1 }
          },
          { "a": "Str", "u": 3, "s": "t:1", "m": "ファイル ID" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "リモート(機器側)のフォルダー" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "リモート(機器側)のファイル名" },
          { "a": "Str", "u": 6, "s": "t:1", "m": "ローカル(機器側)のパス" }
        ]
      },
      "o": { "v": [{ "n": "%gd_local_paths()", "d": "ローカルパス" }] }
    },
    {
      "c": 327,
      "n": "ドライブ ログイン / GD Sign In",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "Google ドライブ アカウント" },
          { "a": "Int", "u": 2, "s": "", "m": "完全なアクセス権" }
        ]
      },
      "o": { "v": [{ "n": "%gd_account", "d": "アカウント" }] }
    },
    {
      "c": 328,
      "n": "キーボード / Keyboard",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:5:?", "m": "入力" },
          { "a": "Int", "u": 2, "s": "50:999:500", "m": "入力間の時間" },
          { "a": "Int", "u": 3, "s": "", "m": "キーボードを復元しない" }
        ]
      },
      "o": {
        "v": [
          { "n": "%kb_text", "d": "文字" },
          { "n": "%kb_text_selected", "d": "選択された文字列" },
          { "n": "%kb_text_after_cursor", "d": "カーソルより後ろの文字列" },
          { "n": "%kb_text_before_cursor", "d": "カーソルより前の文字列" }
        ]
      }
    },
    {
      "c": 329,
      "n": "ナビバー / Navigation Bar",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1:?", "m": "左" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "中" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "右" }
        ]
      }
    },
    {
      "c": 330,
      "n": "NFC タグ",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "書き込む内容" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "内容の種類" }
        ]
      },
      "o": {
        "v": [
          { "n": "%nfc_id", "d": "ID" },
          { "n": "%nfc_id_with_colons", "d": "コロン付きID" },
          { "n": "%nfc_payload", "d": "内容" },
          { "n": "%nfc_present", "d": "現状" },
          { "n": "%nfc_types()", "d": "種類" }
        ]
      }
    },
    {
      "c": 333,
      "n": "機内モード / Airplane Mode",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Bundle", "u": 1, "s": "", "m": "出力変数" }
        ]
      },
      "o": { "v": [{ "n": "%new_state", "d": "新しい状態" }] }
    },
    {
      "c": 334,
      "n": "読み上げ (WaveNet) / Say WaveNet",
      "p": {
        "p": [
          {
            "a": "Str",
            "u": 0,
            "s": "s:4",
            "m": "テキスト/SSML",
            "d": "通常のテキストまたはSSMLのいずれかを使用できます。\n\n通常のテキストは、文の自然なイントネーションを自動的に作成しようとします。\n\nSSMLを使用すると、文がどのように生成されるかを非常に正確に制御できます。\n\n以下のボタンをタップしてSSMLについて詳しく学びましょう。"
          },
          { "a": "Str", "u": 1, "s": "t:1", "m": "音声" },
          {
            "a": "Int",
            "u": 2,
            "s": "0:0:3",
            "m": "出力先",
            "p": {
              "通話音": 0,
              "システム音": 1,
              "電話着信音": 2,
              "メディア音": 3,
              "アラーム音": 4,
              "通知音": 5
            }
          },
          { "a": "Int", "u": 3, "s": "1:40:20", "m": "ピッチ" },
          { "a": "Int", "u": 4, "s": "2:32:8", "m": "速度" },
          { "a": "Int", "u": 5, "s": "", "m": "すぐに次のタスクに進む" },
          { "a": "Str", "u": 6, "s": "d:2:?", "m": "ファイル" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "API キーを上書きする" },
          { "a": "Int", "u": 8, "s": "true", "m": "音声の行き先を優先する" }
        ]
      }
    },
    {
      "c": 335,
      "n": "アプリ情報 / App Info",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "パッケージ/アプリ名" },
          { "a": "Str", "u": 2, "s": "apppakc:1:?", "m": "無視するパッケージ" },
          { "a": "Int", "u": 3, "s": "", "m": "起動できないアプリを無視する" },
          { "a": "Int", "u": 4, "s": "", "m": "全ての詳細を取得する" }
        ]
      },
      "o": {
        "v": [
          { "n": "%app_icon", "d": "アイコン" },
          { "n": "%app_name", "d": "名前" },
          { "n": "%app_package", "d": "パッケージ" }
        ]
      }
    },
    {
      "c": 337,
      "n": "通知設定 / Notification Settings",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1:?", "m": "パッケージ" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "カテゴリー" }
        ]
      }
    },
    {
      "c": 338,
      "n": "通知カテゴリー情報 / Notification Category Info",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "カテゴリー" }
        ]
      },
      "o": {
        "v": [
          { "n": "%nc_id()", "d": "ID" },
          { "n": "%nc_description()", "d": "説明" },
          { "n": "%nc_enabled()", "d": "有効" },
          { "n": "%nc_group_enabled()", "d": "グループを有効" },
          { "n": "%nc_group_id()", "d": "グループ ID" },
          { "n": "%nc_group_name()", "d": "グループ名" },
          { "n": "%nc_importance()", "d": "重要度" },
          { "n": "%nc_name()", "d": "名前" }
        ]
      }
    },
    {
      "c": 339,
      "n": "HTTP リクエスト / Request",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "方式",
            "p": {
              "GET": 0,
              "POST": 1,
              "HEAD": 2,
              "PUT": 3,
              "PATCH": 4,
              "DELETE": 5,
              "OPTIONS": 6,
              "TRACE": 7
            }
          },
          { "a": "Str", "u": 2, "s": "t:3", "m": "URL" },
          {
            "a": "Str",
            "u": 3,
            "s": "t:3:?",
            "m": "ヘッダー",
            "d": "Query Parameters (Format: key1:value1\nkey2:value2... - Same format as Headers)"
          },
          { "a": "Str", "u": 4, "s": "t:3:?", "m": "クエリーパラメーター" },
          { "a": "Str", "u": 5, "s": "t:3:?", "m": "本文" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "送信するファイル" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "出力と同時に保存するファイルやディレクトリー" },
          { "a": "Int", "u": 8, "s": "5:60:30", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 9, "s": "", "m": "全ての証明書も信頼する" },
          { "a": "Int", "u": 10, "s": "", "m": "自動でリダイレクトに従う" },
          { "a": "Int", "u": 11, "s": "", "m": "クッキーを使う" },
          { "a": "Int", "u": 12, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      },
      "o": {
        "v": [
          { "n": "%http_data", "d": "データ" },
          { "n": "%http_file_output", "d": "ファイル出力" },
          { "n": "%http_response_code", "d": "レスポンスコード" },
          { "n": "%http_cookies", "d": "Cookie" },
          { "n": "%http_headers()", "d": "レスポンスのヘッダー" },
          { "n": "%http_response_length", "d": "レスポンスの長さ" }
        ]
      }
    },
    {
      "c": 340,
      "n": "Bluetooth 接続 / BT Connection",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "アクション",
            "p": { "接続": 0, "切断": 1, "ペアリング": 2, "ペアリング解除(消去)": 3 }
          },
          { "a": "Str", "u": 2, "s": "t:1", "m": "機器" },
          { "a": "Int", "u": 3, "s": "5:120:60", "m": "タイムアウト (秒)" }
        ]
      },
      "o": {
        "v": [
          { "n": "%bt_address", "d": "住所から地図" },
          { "n": "%bt_alias", "d": "エイリアス" },
          { "n": "%bt_battery_level", "d": "バッテリー残量" },
          { "n": "%bt_paired", "d": "ペアリング済み" },
          { "n": "%bt_class", "d": "クラス" },
          { "n": "%bt_class_name", "d": "クラス名" },
          { "n": "%bt_connected", "d": "接続済み" },
          { "n": "%bt_encrypted", "d": "暗号化済み" },
          { "n": "%bt_major_class", "d": "メジャークラス" },
          { "n": "%bt_major_class_name", "d": "メジャークラス名" },
          { "n": "%bt_name", "d": "名前" },
          { "n": "%bt_signal_strength", "d": "電波の強度" },
          { "n": "%bt_type", "d": "種類" }
        ]
      }
    },
    {
      "c": 351,
      "n": "HTTP Auth 認証",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "方式",
            "p": { "OAuth 2.0": 0, "ユーザー名とパスワード": 1 }
          },
          { "a": "Str", "u": 2, "s": "t:1", "m": "クライアント ID" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "クライアント シークレット" },
          { "a": "Str", "u": 4, "s": "t:1", "m": "コードを取得しにいくエンドポイント" },
          {
            "a": "Str",
            "u": 5,
            "s": "t:1",
            "m": "リフレッシュトークンを取得しにいくエンドポイント"
          },
          { "a": "Str", "u": 6, "s": "t:3:?", "m": "スコープ" },
          { "a": "Int", "u": 7, "s": "", "m": "強制的に再認証" },
          { "a": "Int", "u": 8, "s": "5:60:30", "m": "タイムアウト (秒)" },
          { "a": "Str", "u": 9, "s": "t:1", "m": "ユーザー名" },
          { "a": "Str", "u": 10, "s": "t:1", "m": "パスワード" }
        ]
      },
      "o": { "v": [{ "n": "%http_auth_headers", "d": "ヘッダー" }] }
    },
    {
      "c": 352,
      "n": "ネットワークデータを要求する / Query Network Data",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "ネットワークの種類",
            "p": { "モバイル": 0, "WiFi": 1, "Bluetooth": 2, "イーサネット": 3, "VPN": 4, "MMS": 5 }
          },
          {
            "a": "Str",
            "u": 2,
            "s": "dttmms:1",
            "m": "これ以上",
            "d": "データクエリの開始時刻（1970年1月1日00:00:00.000 GMT（エポック時間）からのミリ秒単位）。\n\nこの入力は、検索したい期間の開始点を決定します。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "dttmms:1",
            "m": "これに",
            "d": "データクエリの終了時刻（1970年1月1日00:00:00.000 GMT（エポック時間）からのミリ秒単位）。\n\n%TIMEMS 変数を使用して、現在までのデータを検索できます。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "apppakc:1:?",
            "m": "パッケージ",
            "d": "空の場合、特定のアプリだけでなく、デバイス全体のデータが取得されます"
          },
          { "a": "Str", "u": 5, "s": "simc:1:?", "m": "SIM カード" }
        ]
      },
      "o": {
        "v": [
          { "n": "%nd_received_bytes", "d": "受信済みバイト数" },
          { "n": "%nd_received_g_bytes", "d": "受信済みバイト数" },
          { "n": "%nd_received_k_bytes", "d": "受信済みバイト数" },
          { "n": "%nd_received_m_bytes", "d": "受信済みバイト数" },
          { "n": "%nd_sent_bytes", "d": "送信済みバイト数" },
          { "n": "%nd_sent_g_bytes", "d": "送信済みバイト数" },
          { "n": "%nd_sent_k_bytes", "d": "送信済みバイト数" },
          { "n": "%nd_sent_m_bytes", "d": "送信済みバイト数" },
          { "n": "%nd_received_packets", "d": "受信済みパケット数" },
          { "n": "%nd_sent_packets", "d": "送信済みパケット数" }
        ]
      }
    },
    {
      "c": 358,
      "n": "Bluetooth 情報 / Bluetooth Info",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "種類",
            "p": { "単独のデバイス": 0, "ペアリング済みデバイス": 1, "デバイスを検出": 2 }
          },
          { "a": "Str", "u": 2, "s": "t:1", "m": "機器" },
          { "a": "Int", "u": 3, "s": "1:60:5", "m": "タイムアウト (秒)" }
        ]
      },
      "o": {
        "v": [
          { "n": "%bt_address", "d": "住所から地図" },
          { "n": "%bt_alias", "d": "エイリアス" },
          { "n": "%bt_battery_level", "d": "バッテリー残量" },
          { "n": "%bt_paired", "d": "ペアリング済み" },
          { "n": "%bt_class", "d": "クラス" },
          { "n": "%bt_class_name", "d": "クラス名" },
          { "n": "%bt_connected", "d": "接続済み" },
          { "n": "%bt_encrypted", "d": "暗号化済み" },
          { "n": "%bt_major_class", "d": "メジャークラス" },
          { "n": "%bt_major_class_name", "d": "メジャークラス名" },
          { "n": "%bt_name", "d": "名前" },
          { "n": "%bt_signal_strength", "d": "電波の強度" },
          { "n": "%bt_type", "d": "種類" }
        ]
      }
    },
    {
      "c": 102,
      "n": "ファイルを開く / Open File",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "mime:1:?", "m": "MIME タイプ" }
        ]
      }
    },
    {
      "c": 360,
      "n": "入力ダイアログ / Input Dialog",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "タイトル" },
          { "a": "Str", "u": 2, "s": "t:3:?", "m": "文字" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "デフォルト入力" },
          { "a": "Int", "u": 4, "s": "5:120:30", "m": "経過後 (秒数) で閉じる" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "入力方式" },
          { "a": "Int", "u": 6, "s": "", "m": "HTML を使う" },
          { "a": "Int", "u": 7, "s": "", "m": "入力内容を選択状態にしておく" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "出力変数名" }
        ]
      },
      "d": "If input is left empty, the action will end in error. If you need to handle the empty case specifically, you **MUST** enable \u0027Continue Task On Error\u0027 for this action (generate \u003cse\u003efalse\u003c/se\u003e in the XML) and then check if %err is set immediately afterward.",
      "o": { "v": [{ "n": "%input", "d": "入力" }] }
    },
    {
      "c": 361,
      "n": "暗色モード",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Bundle", "u": 1, "s": "", "m": "出力変数" }
        ]
      },
      "o": { "v": [{ "n": "%new_state", "d": "新しい状態" }] }
    },
    {
      "c": 105,
      "n": "クリップボードにコピー / Set Clipboard",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:5:?", "m": "文字" },
          { "a": "Int", "u": 1, "s": "", "m": "追加する" },
          {
            "a": "Str",
            "u": 2,
            "s": "img:1:?",
            "m": "画像",
            "d": "クリップボードに画像を設定すると、上記のテキストが上書きされます"
          },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "機密データである",
            "d": "有効にすると、システムクリップボードオーバーレイに設定したテキストや画像が表示されなくなります"
          }
        ]
      }
    },
    {
      "c": 362,
      "n": "アシスタント設定 / Set Assistant",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "", "m": "アシスタント" }] }
    },
    {
      "c": 363,
      "n": "モバイル通信の種類 / Mobile Network Type",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "自動": 0,
              "2G": 1,
              "3G": 2,
              "4G": 3,
              "2Gと3G": 4,
              "3Gと4G": 5,
              "5G": 6,
              "3G 4G 5G": 7,
              "4G と 5G": 8
            }
          },
          { "a": "Str", "u": 1, "s": "simc:1:?", "m": "SIM カード" }
        ]
      }
    },
    {
      "c": 364,
      "n": "次のアラームの調査 / Test Next Alarm",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "-60:60:0", "m": "分の誤差" }
        ]
      },
      "o": {
        "v": [
          { "n": "%na_day", "d": "曜日" },
          { "n": "%na_month", "d": "月" },
          { "n": "%na_package", "d": "パッケージ" },
          { "n": "%na_time", "d": "時間" },
          { "n": "%na_time_to_alarm_days", "d": "アラームまでの日数" },
          { "n": "%na_time_to_alarm_hours", "d": "アラームまでの時間数" },
          { "n": "%na_time_to_alarm_minutes", "d": "アラームまでの分数" },
          { "n": "%na_time_to_alarm_seconds", "d": "アラームまでの秒数" },
          { "n": "%na_time_ms", "d": "時刻（ミリ秒）" },
          { "n": "%na_year", "d": "年" }
        ]
      }
    },
    {
      "c": 365,
      "n": "Taskerの機能 / Tasker Function",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:3", "m": "関数" }
        ]
      }
    },
    {
      "c": 366,
      "n": "現在地の取得 v2 / Get Location V2",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "5:360:30", "m": "タイムアウト (秒)" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "最小精度（メートル）" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "速度（毎秒メートル）" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "標高（メートル）" },
          { "a": "Str", "u": 5, "s": "locradi:1:?", "m": "近くの位置情報" },
          { "a": "Int", "u": 6, "s": "", "m": "必要なら位置情報を有効にする" },
          { "a": "Int", "u": 7, "s": "", "m": "タイムアウトなら直前の位置情報" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "速度の最小精度（毎秒メートル）" },
          {
            "a": "Int",
            "u": 9,
            "s": "",
            "m": "高精度で強制",
            "d": "有効にすると、TaskerはGPSを使用して現在の位置情報を取得し、その他の位置情報の取得方法をまったく使用しなくなります。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%gl_coordinates_accuracy", "d": "3. 緯度経度の精度" },
          { "n": "%gl_altitude", "d": "標高（メートル）" },
          { "n": "%gl_altitude_above_sea_level", "d": "Altitude Above Sea Level" },
          { "n": "%gl_altitude_accuracy", "d": "標高の精度" },
          { "n": "%gl_bearing", "d": "移動方向" },
          { "n": "%gl_bearing_accuracy", "d": "方向の精度" },
          { "n": "%gl_latitude", "d": "1. 緯度" },
          { "n": "%gl_coordinates", "d": "緯度経度" },
          { "n": "%gl_longitude", "d": "2. 経度" },
          { "n": "%gl_map_url", "d": "Google マップの URL" },
          { "n": "%gl_satellites", "d": "サテライト" },
          { "n": "%gl_speed", "d": "速度" },
          { "n": "%gl_speed_accuracy", "d": "速度" },
          { "n": "%gl_time_seconds", "d": "時間" },
          { "n": "%gl_time_gnss_milliseconds", "d": "GNSS時間 (ミリ秒)" },
          { "n": "%gl_time_milliseconds", "d": "時間 (ミリ秒)" },
          { "n": "%gl_time_adjusted_milliseconds", "d": "調整済み時間 (ミリ秒)" },
          { "n": "%gl_time_offset_milliseconds", "d": "時間オフセット (ミリ秒)" },
          { "n": "%gl_time_taken_millis", "d": "所要時間" }
        ]
      }
    },
    {
      "c": 367,
      "n": "カメラ / Camera",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Bundle", "u": 1, "s": "", "m": "出力変数" }
        ]
      },
      "o": { "v": [{ "n": "%new_state", "d": "新しい状態" }] }
    },
    {
      "c": 368,
      "n": "位置を選ぶ / Pick Location",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "タイトル" },
          { "a": "Int", "u": 2, "s": "", "m": "半径を選ぶ" },
          { "a": "Str", "u": 3, "s": "locradi:1:?", "m": "位置の初期値" },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "種類",
            "p": { "標準地図": 0, "航空写真": 1, "地形": 2, "航空写真と地図": 3, "なし": 4 }
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%pl_latitude", "d": "1. 緯度" },
          { "n": "%pl_coordinates", "d": "緯度経度" },
          { "n": "%pl_longitude", "d": "2. 経度" },
          { "n": "%pl_map_url", "d": "Google マップの URL" },
          { "n": "%pl_radius", "d": "半径" }
        ]
      }
    },
    {
      "c": 113,
      "n": "WiFi テザリング / WiFi Tether",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Int", "u": 1, "s": "", "m": "作動中は WiFiをOFFにしない" }
        ]
      }
    },
    {
      "c": 370,
      "n": "ショートカット / Shortcut",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "", "m": "ショートカット / Shortcut" }
        ]
      }
    },
    {
      "c": 372,
      "n": "センサー情報 / Sensor Info",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "", "m": "種類" }
        ]
      },
      "o": {
        "v": [
          { "n": "%sensor_max_range", "d": "センサーの最大範囲" },
          { "n": "%sensor_mode", "d": "センサーモード" },
          { "n": "%sensor_name", "d": "センサー名" },
          { "n": "%sensor_power", "d": "センサーの電流（mA）" },
          { "n": "%sensor_resolution", "d": "センサーの解像度" },
          { "n": "%sensor_type", "d": "センサー種別" },
          { "n": "%sensor_type_string", "d": "センサー種別の文字表記" },
          { "n": "%sensor_vendor", "d": "センサーの製造元" },
          { "n": "%sensor_is_wake_up", "d": "センサーは稼働中" }
        ]
      }
    },
    {
      "c": 373,
      "n": "センサーの調査 / Test Sensor",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "", "m": "種類" },
          { "a": "Int", "u": 2, "s": "1:360:30", "m": "タイムアウト (秒)" },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "向きを度数に",
            "d": "有効にすると、向きの角度を度数へ変換します。結果値は、少なくとも３つの値が出力されます。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%as_accuracy", "d": "精度" },
          { "n": "%as_values()", "d": "値" }
        ]
      }
    },
    {
      "c": 374,
      "n": "画面録画 / Screen Capture",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "モード",
            "d": "画面キャプチャを開始、停止、またはクエリできます。\n\n既に開始されているときにキャプチャを開始すると、エラーが発生します。\n\n既に停止されているときにキャプチャを停止すると、エラーが発生します。\n\n現在キャプチャが進行中かどうかを知るには「クエリ」を使用します（%sc_is_capturing変数を確認してください）。",
            "p": { "開始": 0, "停止": 1, "クエリー": 2 }
          },
          { "a": "Str", "u": 2, "s": "f", "m": "出力先ファイル" },
          { "a": "Int", "u": 3, "s": "", "m": "鳴らす" },
          {
            "a": "Str",
            "u": 4,
            "s": "t:1:?",
            "m": "ビデオエンコーダー",
            "d": "デフォルトではH264になります。"
          },
          {
            "a": "Str",
            "u": 5,
            "s": "t:1:?",
            "m": "解像度",
            "d": "デフォルトでは画面の解像度が使用されます"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "t:1:?",
            "m": "ビデオビットレート",
            "d": "ビットレートが高いほど、最終的なビデオのピクセル化が少なくなります。\n\nすべてのビットレートがすべてのデバイスでサポートされているわけではありません。\n\n手動で設定されていない場合、5000000になります。"
          },
          {
            "a": "Str",
            "u": 7,
            "s": "t:1:?",
            "m": "ビデオフレームレート",
            "d": "フレームレートが高いほど、記録されたビデオの動きが滑らかになります。\n\n手動で設定されていない場合、30になります。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%sc_file", "d": "ファイル" },
          { "n": "%sc_is_capturing", "d": "キャプチャ中" }
        ]
      }
    },
    {
      "c": 375,
      "n": "ADB WiFi",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "adbsc:3", "m": "コマンド" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "ホスト" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "ポート" },
          { "a": "Int", "u": 4, "s": "1:10:10", "m": "タイムアウト (秒)" },
          {
            "a": "Int",
            "u": 5,
            "s": "",
            "m": "デバッグを有効にする（ヘルプ参照）",
            "d": "ほとんどの人は、Android機器上で常にデバッグ機能を有効にする不要はないでしょう。不明なリクエストを不意に許可してデバッグを開始しまうなど、むしろセキュリティ面でのリスクがあります。\n\nこのオプションを有効にすることで、デバッグをOFFのまま、アクション実行で有効にして、その後は無効にできます。ほとんどの時間は、スマホ機器を「closed down」状態にしておけます。"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "t:1:?",
            "m": "結果エンコーディング",
            "d": "非標準文字（àやéなど）を含む結果を期待している場合は、結果に異なるエンコーディングを使用できます。\n\nこのような状況では、たとえば「UTF-8」（引用符なし）を使用してみてください。"
          }
        ]
      },
      "o": { "v": [{ "n": "%aw_output", "d": "出力" }] }
    },
    {
      "c": 377,
      "n": "テキスト/画像ダイアログ",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "タイトル" },
          { "a": "Str", "u": 2, "s": "t:3:?", "m": "文字" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "ボタン 1" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "ボタン 2" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "ボタン 3" },
          { "a": "Int", "u": 6, "s": "5:120:30", "m": "経過後 (秒数) で閉じる" },
          { "a": "Int", "u": 7, "s": "", "m": "HTML を使う" },
          {
            "a": "Str",
            "u": 8,
            "s": "img:1:?",
            "m": "画像",
            "d": "設定されている場合、タイトルとテキストの間に画像を表示します"
          },
          {
            "a": "Str",
            "u": 9,
            "s": "t:1:?",
            "m": "最大の幅／高さ",
            "d": "dip単位のサイズ（密度非依存ピクセル）。画像が設定されている場合、オプションでこれでサイズを制限できます。\n\n元の画像の比率は常に維持されます。"
          }
        ]
      },
      "o": { "v": [{ "n": "%td_button", "d": "ボタン" }] }
    },
    {
      "c": 378,
      "n": "リストのダイアログ / List Dialog",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "モード",
            "p": { "項目を一つ選ぶ": 0, "複数選択": 1 }
          },
          { "a": "Str", "u": 2, "s": "t:1", "m": "タイトル" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "項目" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "選んだ項目" },
          { "a": "Str", "u": 5, "s": "m:1:?", "m": "長押しタスク" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "ボタン 1" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "ボタン 2" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "ボタン 3" },
          { "a": "Int", "u": 9, "s": "5:120:30", "m": "経過後 (秒数) で閉じる" },
          { "a": "Int", "u": 10, "s": "", "m": "HTML を使う" },
          { "a": "Int", "u": 11, "s": "0:100:0", "m": "見えるうちで最初の項目番号" },
          { "a": "Int", "u": 12, "s": "", "m": "フィルターを隠す" },
          { "a": "Str", "u": 13, "s": "t:3:?", "m": "文字" }
        ]
      }
    },
    {
      "c": 379,
      "n": "管理者の操作 / Admin Action",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "アクション",
            "p": {
              "カスタム": 0,
              "アプリを無効": 1,
              "アプリの停止": 2,
              "アプリ強制終了": 3,
              "アプリデータの消去": 4,
              "再起動": 5,
              "ユーザー制限": 6,
              "バックアップサービス": 7,
              "アプリのアンインストール": 8,
              "権限": 9,
              "デバイスオーナーをクリア": 10,
              "デバイスオーナーを確認": 11
            }
          },
          { "a": "App", "u": 2, "s": "", "m": "パッケージ/アプリ名" },
          { "a": "Str", "u": 3, "s": "t:3", "m": "関数" },
          { "a": "Int", "u": 4, "s": "", "m": "有効" },
          { "a": "Str", "u": 5, "s": "t:3:?", "m": "ユーザー制限" },
          { "a": "Str", "u": 6, "s": "t:3:?", "m": "権限" }
        ]
      },
      "o": { "v": [{ "n": "%ao_output()", "d": "出力" }] }
    },
    {
      "c": 380,
      "n": "HTTP レスポンス / Response",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "リクエストID" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "ステータスコード" },
          { "a": "Str", "u": 3, "s": "t:3:?", "m": "ヘッダー" },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "種類",
            "p": { "テキスト": 0, "ファイル": 1, "リダイレクト": 2 }
          },
          { "a": "Str", "u": 5, "s": "t:3:?", "m": "本文" },
          { "a": "Str", "u": 6, "s": "t:1", "m": "ファイル" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "MIME タイプ" },
          { "a": "Int", "u": 8, "s": "", "m": "インラインファイル" },
          { "a": "Str", "u": 9, "s": "t:1", "m": "URL" }
        ]
      }
    },
    {
      "c": 381,
      "n": "指定アプリで連絡する",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "連絡先" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "アプリ" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "文字" },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "戻る",
            "d": "有効にすると、開かれたWhatsApp会話から戻り、会話が開かれる前にいた場所に戻ります。"
          }
        ]
      }
    },
    {
      "c": 126,
      "n": "リターン / Return",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "値" },
          { "a": "Int", "u": 1, "s": "true", "m": "停止" },
          {
            "a": "Int",
            "u": 2,
            "s": "false",
            "m": "ローカル変数をパススルー",
            "d": "有効にすると、このタスクで利用可能なすべての変数が、以下の制限に従って親タスクでも利用可能になります。"
          },
          {
            "a": "Int",
            "u": 3,
            "s": "false",
            "m": "パススルーで置き替え",
            "d": "これが有効でない場合、親タスクで既に値を持つ変数は、このタスクの値で置き換えられません。\n\n「タスクを実行」アクションでも置換を許可するオプションを有効にする必要があることに注意してください。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "t:1:?",
            "m": "パススルー制限：",
            "d": "もし数個の変数を親タスクへ戻したいなら、スラッシュ区切りの変数名リストを使用してください。"
          }
        ]
      }
    },
    {
      "c": 383,
      "n": "設定画面 / Settings Panel",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "接続状態": 0, "NFC": 1, "音量": 2, "WiFi": 3, "メディア出力": 4 }
          },
          { "a": "Int", "u": 1, "s": "", "m": "すぐに次のタスクに進む" }
        ]
      }
    },
    {
      "c": 384,
      "n": "電源メニューアクション / Power Menu Action",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Str",
            "u": 1,
            "s": "t:1",
            "m": "ID",
            "d": "既存のアクションと同じIDを使用すると、そのアクションが上書きされます"
          },
          { "a": "Int", "u": 2, "s": "", "m": "アクション", "p": { "追加／編集": 0, "削除": 1 } },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "種類",
            "p": { "ボタン": 0, "切替え": 1, "範囲": 2, "範囲を切替え": 3, "アクションなし": 4 }
          },
          { "a": "Str", "u": 4, "s": "t:1", "m": "タイトル" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "副題" },
          { "a": "Str", "u": 6, "s": "img:2:?", "m": "アイコン" },
          {
            "a": "Str",
            "u": 7,
            "s": "t:1:?",
            "m": "コマンド",
            "d": "送信されたコマンドは、アクションの種類に依存します：\n\n・［ボタン］：コマンド接頭語(prefix)だけ\n\n・［切替え］：prefix\u003d:\u003dtrue_or_false (On/Off切替え次第)\n\n・［範囲］：prefix\u003d:\u003dcurrent_value\n\n・［切替え範囲］：prefix\u003d:\u003dtrue_or_false\u003d:\u003dcurrent_value\u003d:\u003dmode\n( モードは［切替え］か［範囲］のどちらかです、ボタンをクリックしたか、範囲を選択したか、それ次第で)"
          },
          { "a": "Str", "u": 8, "s": "strbool:1:?", "m": "アクティブ" },
          { "a": "Str", "u": 9, "s": "t:1:?", "m": "最小範囲" },
          { "a": "Str", "u": 10, "s": "t:1:?", "m": "最大範囲" },
          { "a": "Str", "u": 11, "s": "t:1:?", "m": "現在範囲" },
          { "a": "Str", "u": 12, "s": "t:1:?", "m": "ステップ範囲" },
          { "a": "Str", "u": 13, "s": "t:1:?", "m": "フォーマット範囲" },
          { "a": "Int", "u": 14, "s": "", "m": "ロックされたデバイスで使用可能" }
        ]
      }
    },
    {
      "c": 385,
      "n": "コマンド",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "t:3", "m": "コマンド" }] }
    },
    {
      "c": 386,
      "n": "電話着信の検知 / Call Screening",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "受け入れない／受け入れる",
            "d": "電話の着信を受け入れる／受け入れないを設定します。「受け入れない」を選択して、［拒否する］を有効にしない場合、その発信者は「拒否された」ことを知らず、通常の不在だと思うでしょう。",
            "p": { "受け入れない": 0, "受け入れる": 1 }
          },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "拒否する",
            "d": "［拒否する］を有効にすると、ユーザーが手動操作で拒否するのと同じく、電話着信を拒否して切断します"
          },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "サイレント(無音)",
            "d": "［サイレント］オプションを有効にすると、電話着信時に呼び出し音をサイレント(無音)にしますが、鳴らないだけで着信は続きます。"
          },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "電話履歴に残さない",
            "d": "着信中の電話を鳴らさずに、かつ、着信履歴に記録を残しません。"
          },
          {
            "a": "Int",
            "u": 5,
            "s": "",
            "m": "着信通知なし",
            "d": "着信中の電話を鳴らさずに、かつ、不在着信の履歴に記録を残しません。"
          }
        ]
      }
    },
    {
      "c": 387,
      "n": "ユーザー補助音量",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 389,
      "n": "複数の変数名をセット",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:3", "m": "名前", "d": "１つ以上のカンマ区切りで変数名" },
          {
            "a": "Str",
            "u": 2,
            "s": "t:3:?",
            "m": "変数名の区切り文字",
            "d": "上記の変数名の区切り。\n\nデフォルトで「,」(カンマ)、もしくは使い方次第で「改行」"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "inpval:3:?",
            "m": "値",
            "d": "上記の変数名にそれぞれ対応する１つ以上の値。\n\n変数名が既存の変数の数より多い場合は、それらの変数名は設定されません"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "t:3:?",
            "m": "変数値の区切り文字",
            "d": "上記の値の区切り。\n\nデフォルトで「,」(カンマ)、もしくは使い方次第で「改行」"
          },
          {
            "a": "Int",
            "u": 5,
            "s": "",
            "m": "計算する",
            "d": "計算可能なものは計算します。その他は通常のテキスト文字として残します"
          },
          { "a": "Int", "u": 6, "s": "0:10:3", "m": "四捨五入する桁" },
          {
            "a": "Int",
            "u": 7,
            "s": "",
            "m": "既存を維持",
            "d": "タスク内のこの時点までに既存がない場合は、変数の値をセットするだけです"
          },
          { "a": "Int", "u": 8, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    {
      "c": 390,
      "n": "入力ダイアログの選択",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Str",
            "u": 1,
            "s": "t:1",
            "m": "種類",
            "d": "One of the dialog types in the Tasker Input Dialog Types Catalog JSON. The \"nd\" (nameForDialogPickInput) field should be used here. Do NOT use the \"i\" or \"n\" fields. For example, for a \"Yes or No\" dialog type, use \"YesOrNo\" and NOT \"yn\" or \"Yes or No\"."
          },
          {
            "a": "Str",
            "u": 2,
            "s": "t:1:?",
            "m": "タイトル",
            "d": "もし設定すると、タイトル付きのテキスト表示より先に、ダイアログを優先して表示します。ただし指定の入力ピッカーがタイトル用に指定されている場合（例えば時間ダイアログなど）を除く。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "t:3:?",
            "m": "文字",
            "d": "タイトルありの場合にダイアログに表示されます"
          },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "デフォルト入力" },
          { "a": "Int", "u": 5, "s": "5:120:30", "m": "経過後 (秒数) で閉じる" }
        ]
      },
      "o": { "v": [{ "n": "%input", "d": "入力" }] }
    },
    {
      "c": 903,
      "n": "音声認識 / Get Voice",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1:?", "m": "タイトル" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "言語モデル",
            "p": { "自由形式": 0, "ウェブ検索": 1 }
          },
          { "a": "Str", "u": 2, "s": "la:1:?", "m": "言語" },
          { "a": "Int", "u": 3, "s": "1:50", "m": "結果の最大件数" },
          { "a": "Int", "u": 4, "s": "3:40:30", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 5, "s": "", "m": "ダイアログを閉じる" },
          { "a": "Bundle", "u": 6, "s": "", "m": "出力変数" }
        ]
      },
      "o": {
        "v": [
          { "n": "%gv_confidence", "d": "確信度" },
          { "n": "%gv_heard", "d": "聞き取り結果" }
        ]
      }
    },
    {
      "c": 391,
      "n": "進捗ダイアログ",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "アクション",
            "d": "進行状況ダイアログを表示/更新するか、既存のものを非表示にするか。\n\nダイアログを非表示にすることを選択し、ダイアログが表示されていない場合、アクションはすぐに正常に終了します。",
            "p": { "表示/更新": 0, "閉じる": 1 }
          },
          {
            "a": "Str",
            "u": 2,
            "s": "t:1:?",
            "m": "タイトル",
            "d": "ダイアログがまだ表示されていない場合は、これを設定する必要があります。\n\n既に表示されている場合は、これを省略でき、最後に使用された値が保持されます。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "t:3:?",
            "m": "文字",
            "d": "ダイアログがまだ表示されていない場合は、これを設定する必要があります。\n\n既に表示されている場合は、これを省略でき、最後に使用された値が保持されます。"
          },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "種類",
            "d": "報告する数値の進行状況がない場合はループアニメーションを表示するか、数値の進行状況を表示できる進行状況バーを表示するかを選択できます。",
            "p": { "アニメーション": 0, "プログレスバー": 1 }
          },
          {
            "a": "Str",
            "u": 5,
            "s": "imgs:3:?",
            "m": "アニメーション画像",
            "d": "ダイアログでアニメーションとして使用する画像のリスト。"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "col:1:?",
            "m": "アニメーションティント",
            "d": "「透明」を選んでない場合、選択した色で画像を表示します。\n\nデフォルト値として、Taskerのアクセント色に設定されます。"
          },
          {
            "a": "Int",
            "u": 7,
            "s": "16:1000:66",
            "m": "フレーム時間",
            "d": "画像がスクリーンに表示される時間(ミリ秒)"
          },
          { "a": "Int", "u": 8, "s": "0:100:0", "m": "進捗状況" },
          { "a": "Int", "u": 9, "s": "0:100:100", "m": "最大" },
          { "a": "Int", "u": 10, "s": "", "m": "HTML を使う" }
        ]
      },
      "o": { "v": [{ "n": "%pd_type", "d": "種類" }] }
    },
    {
      "c": 392,
      "n": "変数構造タイプ設定",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "名前" },
          {
            "a": "Str",
            "u": 2,
            "s": "t:1",
            "m": "構造種類",
            "d": "変数に含まれるデータのタイプを選択します。\n\n読み取り時にタイプがデータと一致しない場合、代わりにタイプ「なし」が想定されます。"
          },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "JSONスマート検索を防止",
            "d": "有効にすると、Taskerは読み取り時に値の完全なJSON構造を自動的に検索しません。"
          }
        ]
      }
    },
    {
      "c": 905,
      "n": "位置情報モード / Location Mode",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "Off": 0, "機器本体のみ": 1, "バッテリー節約": 2, "高精度": 3 }
          }
        ]
      }
    },
    {
      "c": 393,
      "n": "配列マージ",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Str",
            "u": 1,
            "s": "t:3",
            "m": "名前",
            "d": "1つ以上の配列名、各行に1つずつ。\n\nこれらの各配列は、同じ数の値を持つ必要があります。"
          },
          { "a": "Int", "u": 2, "s": "", "m": "統合タイプ", "p": { "シンプル": 0, "書式": 1 } },
          {
            "a": "Str",
            "u": 3,
            "s": "t:3",
            "m": "結合文字",
            "d": "上記の配列の各位置を結合子で単純にマージします。\n\nたとえば、%namesと%agesの2つの配列があり、結合子「 - 」を使用すると、「%names(1) - %ages(1)」、「%names(2) - %ages(2)」などを結合します。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "inpval:3",
            "m": "書式",
            "d": "ここで指定したフォーマットで、上記の配列の各位置をマージします。\n\nフォーマット内のプレースホルダーとして元の配列名を使用します。\n\nたとえば、%namesと%agesの2つの配列があり、フォーマット「%namesは%ages歳です」を使用すると、\n「%names(1)は%ages(1)歳です」\n「%names(2)は%ages(2)歳です」\nなどを結合します。"
          },
          {
            "a": "Str",
            "u": 5,
            "s": "t:1",
            "m": "出力",
            "d": "フォーマットされた値を含む配列の名前。\n\nこの配列の各位置には、上記のルールで結合されたすべての入力配列の対応する位置が含まれます。"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "inpval:3:?",
            "m": "出力を結合",
            "d": "設定すると、結果の配列を結合し、出力変数を配列ではなく単一の値にします。"
          },
          {
            "a": "Int",
            "u": 7,
            "s": "",
            "m": "配列内の変数を置換",
            "d": "有効にすると、Taskerは配列アイテム自体を置き換えるだけでなく、それらの配列アイテムの内部を調べて、そこにある変数も置き換えます。"
          }
        ]
      }
    },
    {
      "c": 906,
      "n": "フルスクリーン / Immersive Mode",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": {
              "オフ": 0,
              "ステータスバーを隠す": 1,
              "ナビゲーションバーを隠す": 2,
              "両方隠す": 3,
              "最終の切替え": 4
            }
          }
        ]
      }
    },
    {
      "c": 394,
      "n": "日時解析/フォーマット",
      "p": {
        "p": [
          {
            "a": "Bundle",
            "u": 0,
            "s": "",
            "m": "出力変数",
            "d": "入力は単一の値と配列の両方をサポートするため、これらの出力のいずれかを単一の値と配列の両方として使用できます。\n\n出力数は、入力される日付の数によって異なります。\n\nさらに、各出力形式について、フォーマットされた出力のための結果が追加されます。\n\nたとえば、2つの入力と3つの出力形式がある場合、フォーマットされた変数出力で合計6つの値が得られます。"
          },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "入力方式",
            "p": {
              "カスタム": 0,
              "現在日時": 1,
              "エポックからのミリ秒": 2,
              "エポックからの秒数": 3,
              "ISO 8601 (例： 2011-12-03T10:15:30+01:00)": 4,
              "エポックUTCからミリ秒数": 5,
              "エポックUTCから秒数": 6
            }
          },
          {
            "a": "Str",
            "u": 2,
            "s": "t:3",
            "m": "入力",
            "d": "1つ以上の日付。\n\n直接値、変数からの値、または直接配列（%array()ではなく%arrayを使用）を指定できます。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "t:1",
            "m": "入力形式",
            "d": "1つ以上の日付形式。\n\n例: yyyy/MM/dd HH:mm は、2021/03/05 14:18 のような日付を正しく解析します\n\n入力ごとに異なる形式を使用できます。\n\n入力数より形式数が少ない場合、リストの最後の形式が残りの入力に使用されます。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "t:3:?",
            "m": "入力の区切り文字",
            "d": "セパレータは、テキストにこれらの文字のいずれかが存在するかどうかに応じて、デフォルトでカンマまたは改行になります。\n\n必要に応じて、手動で別のセパレータに設定してください。"
          },
          {
            "a": "Str",
            "u": 5,
            "s": "t:3:?",
            "m": "出力形式",
            "d": "1つ以上の日付形式。\n\n例: yyyy/MM/dd HH:mm は、2021/03/05 14:18 のような日付を生成します\n\n複数の出力形式を指定した場合、それらの形式は各入力に適用されるため、入力と形式のすべての可能な組み合わせが得られます。\n\nたとえば、2つの入力と3つの出力形式がある場合、合計6つのフォーマットされた値が得られます。\n\n以下のすべての可能な形式を確認してください。"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "t:3:?",
            "m": "出力形式の区切り文字",
            "d": "セパレータは、テキストにこれらの文字のいずれかが存在するかどうかに応じて、デフォルトでカンマまたは改行になります。\n\n必要に応じて、手動で別のセパレータに設定してください。"
          },
          {
            "a": "Str",
            "u": 7,
            "s": "t:3:?",
            "m": "フォーマット済み変数名",
            "d": "1つ以上の変数名。\n\n各出力は、ここで利用可能な変数名に直接マッピングされます。例: 出力1 -\u003e 変数名1、出力2 -\u003e 変数名2など。\n\nこのリストの最後の名前は、直接値として、および未マッピングの残りのフォーマットされた出力を持つ配列として利用可能になります。"
          },
          { "a": "Int", "u": 8, "s": "", "m": "全ての詳細を取得する" },
          {
            "a": "Int",
            "u": 9,
            "s": "",
            "m": "計算する",
            "d": "有効にすると、「入力」フィールドでのみ数学演算を実行できるようになり、過去または未来の日付を簡単にフォーマットできます。\n\nたとえば、「エポックからの秒数」入力タイプで使用する場合、%TIMES + 86400は未来の1日（86400秒\u003d 1日）の日付をフォーマットします。"
          },
          {
            "a": "Int",
            "u": 10,
            "s": "",
            "m": "出力オフセットタイプ",
            "d": "必要に応じて、出力に秒、分、時間、または日を追加できます。このオフセットタイプはすべての出力に適用されます。",
            "p": { "無し": 0, "秒": 1, "分": 2, "時間": 3, "日": 4 }
          },
          {
            "a": "Str",
            "u": 11,
            "s": "t:1",
            "m": "出力オフセット",
            "d": "上記のタイプのオフセット量。\n\n負の値も可能です。\n\n複数の出力がある場合は、複数のオフセットを使用できます。"
          },
          {
            "a": "Str",
            "u": 12,
            "s": "t:1:?",
            "m": "タイムゾーン",
            "d": "入力時間のタイムゾーン。\n\n現在以外のタイムゾーンの日付/時刻をフォーマットしたい場合に便利です。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%dt_day_of_month", "d": "3. 日にち" },
          { "n": "%dt_millis", "d": "1. ミリ秒" },
          { "n": "%dt_month_of_year", "d": "4. 月" },
          { "n": "%dt_seconds", "d": "2. 秒" },
          { "n": "%dt_year", "d": "5. 年" }
        ]
      }
    },
    {
      "c": 907,
      "n": "ステータスバーのアイコン / Status Bar Icons",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "t:1:?", "m": "隠すアイコン" }] }
    },
    {
      "c": 396,
      "n": "シンプルマッチ/正規表現",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "", "m": "種類", "p": { "シンプル": 0, "正規表現": 1 } },
          { "a": "Str", "u": 2, "s": "t:3", "m": "文字" },
          {
            "a": "Str",
            "u": 3,
            "s": "t:3",
            "m": "正規表現",
            "d": "入力に一致する正規表現。\n\n正規表現でグループ名を使用すると、Taskerはそれらのグループごとに変数を作成します。その変数は、直接値として、または複数のマッチが見つかった場合は配列としてアクセスできます。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "t:3",
            "m": "マッチパターン",
            "d": "入力に一致する正規表現。\n\n正規表現でグループ名を使用すると、Taskerはそれらのグループごとに変数を作成します。その変数は、直接値として、または複数のマッチが見つかった場合は配列としてアクセスできます。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%mt_match", "d": "一致" },
          { "n": "%mt_match_found", "d": "一致" }
        ]
      }
    },
    {
      "c": 397,
      "n": "Material You 色を取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "true", "m": "出力ハッシュタグ" }
        ]
      },
      "o": {
        "v": [
          { "n": "%my_accent1_0", "d": "Material You アクセント 1 – 0" },
          { "n": "%my_accent1_10", "d": "Material You アクセント 1 – 10" },
          { "n": "%my_accent1_100", "d": "Material You アクセント – 100" },
          { "n": "%my_accent1_1000", "d": "Material You アクセント 1 – 1000" },
          { "n": "%my_accent1_200", "d": "Material You アクセント 1 – 200" },
          { "n": "%my_accent1_300", "d": "Material You アクセント 1 – 300" },
          { "n": "%my_accent1_400", "d": "Material You アクセント 1 – 400" },
          { "n": "%my_accent1_50", "d": "Material You アクセント 1 – 50" },
          { "n": "%my_accent1_500", "d": "Material You アクセント 1 – 500" },
          { "n": "%my_accent1_600", "d": "Material You アクセント 1 – 600" },
          { "n": "%my_accent1_700", "d": "Material You アクセント 1 – 700" },
          { "n": "%my_accent1_800", "d": "Material You アクセント 1 – 800" },
          { "n": "%my_accent1_900", "d": "Material You アクセント 1 – 900" },
          { "n": "%my_accent2_0", "d": "Material You アクセント 2 – 0" },
          { "n": "%my_accent2_10", "d": "Material You アクセント 2 – 10" },
          { "n": "%my_accent2_100", "d": "Material You アクセント 2 – 100" },
          { "n": "%my_accent2_1000", "d": "Material You アクセント 2 – 1000" },
          { "n": "%my_accent2_200", "d": "Material You アクセント 2 – 200" },
          { "n": "%my_accent2_300", "d": "Material You アクセント 2 – 300" },
          { "n": "%my_accent2_400", "d": "Material You アクセント 2 – 400" },
          { "n": "%my_accent2_50", "d": "Material You アクセント 2 – 50" },
          { "n": "%my_accent2_500", "d": "Material You アクセント 2 – 500" },
          { "n": "%my_accent2_600", "d": "Material You アクセント 2 – 600" },
          { "n": "%my_accent2_700", "d": "Material You アクセント 2 – 700" },
          { "n": "%my_accent2_800", "d": "Material You アクセント 2 – 800" },
          { "n": "%my_accent2_900", "d": "Material You アクセント 2 – 900" },
          { "n": "%my_accent3_0", "d": "Material You アクセント 3 – 0" },
          { "n": "%my_accent3_10", "d": "Material You アクセント 3 – 10" },
          { "n": "%my_accent3_100", "d": "Material You アクセント 3 – 100" },
          { "n": "%my_accent3_1000", "d": "Material You アクセント 3 – 1000" },
          { "n": "%my_accent3_200", "d": "Material You アクセント 3 – 200" },
          { "n": "%my_accent3_300", "d": "Material You アクセント 3 – 300" },
          { "n": "%my_accent3_400", "d": "Material You アクセント 3 – 400" },
          { "n": "%my_accent3_50", "d": "Material You アクセント 3 – 50" },
          { "n": "%my_accent3_500", "d": "Material You アクセント 3 – 500" },
          { "n": "%my_accent3_600", "d": "Material You アクセント 3 – 600" },
          { "n": "%my_accent3_700", "d": "Material You アクセント 3 – 700" },
          { "n": "%my_accent3_800", "d": "Material You アクセント 3 – 800" },
          { "n": "%my_accent3_900", "d": "Material You アクセント 3 – 900" },
          { "n": "%my_background", "d": "Material You 背景" },
          { "n": "%my_error", "d": "Material You エラー" },
          { "n": "%my_errorContainer", "d": "Material You エラーコンテナ" },
          { "n": "%my_inverseOnSurface", "d": "Material You Inverse On Surface" },
          { "n": "%my_inversePrimary", "d": "Material You Inverse Primary" },
          { "n": "%my_inverseSurface", "d": "Material You Inverse Surface" },
          { "n": "%my_neutral1_0", "d": "Material You 中間色 1 – 0" },
          { "n": "%my_neutral1_10", "d": "Material You 中間色 1 – 10" },
          { "n": "%my_neutral1_100", "d": "Material You 中間色 1 – 100" },
          { "n": "%my_neutral1_1000", "d": "Material You 中間色 1 – 1000" },
          { "n": "%my_neutral1_200", "d": "Material You 中間色 1 – 200" },
          { "n": "%my_neutral1_300", "d": "Material You 中間色 1 – 300" },
          { "n": "%my_neutral1_400", "d": "Material You 中間色 1 – 400" },
          { "n": "%my_neutral1_50", "d": "Material You 中間色 1 – 50" },
          { "n": "%my_neutral1_500", "d": "Material You 中間色 1 – 500" },
          { "n": "%my_neutral1_600", "d": "Material You 中間色 1 – 600" },
          { "n": "%my_neutral1_700", "d": "Material You 中間色 1 – 700" },
          { "n": "%my_neutral1_800", "d": "Material You 中間色 1 – 800" },
          { "n": "%my_neutral1_900", "d": "Material You 中間色 1 – 900" },
          { "n": "%my_neutral2_0", "d": "Material You 中間色 2 – 0" },
          { "n": "%my_neutral2_10", "d": "Material You 中間色 2 – 10" },
          { "n": "%my_neutral2_100", "d": "Material You 中間色 2 – 100" },
          { "n": "%my_neutral2_1000", "d": "Material You 中間色 2 – 1000" },
          { "n": "%my_neutral2_200", "d": "Material You 中間色 2 – 200" },
          { "n": "%my_neutral2_300", "d": "Material You 中間色 2 – 300" },
          { "n": "%my_neutral2_400", "d": "Material You 中間色 2 – 400" },
          { "n": "%my_neutral2_50", "d": "Material You 中間色 2 – 50" },
          { "n": "%my_neutral2_500", "d": "Material You 中間色 2 – 500" },
          { "n": "%my_neutral2_600", "d": "Material You 中間色 2 – 600" },
          { "n": "%my_neutral2_700", "d": "Material You 中間色 2 – 700" },
          { "n": "%my_neutral2_800", "d": "Material You 中間色 2 – 800" },
          { "n": "%my_neutral2_900", "d": "Material You 中間色 2 – 900" },
          { "n": "%my_onBackground", "d": "Material You On Background" },
          { "n": "%my_onError", "d": "Material You On Error" },
          { "n": "%my_onErrorContainer", "d": "Material You On Error Container" },
          { "n": "%my_onPrimary", "d": "Material You On Primary" },
          { "n": "%my_onPrimaryContainer", "d": "Material You On Primary Container" },
          { "n": "%my_onSecondary", "d": "Material You On Secondary" },
          { "n": "%my_onSecondaryContainer", "d": "Material You On Secondary Container" },
          { "n": "%my_onSurface", "d": "Material You On Surface" },
          { "n": "%my_onSurfaceVariant", "d": "Material You On Surface Variant" },
          { "n": "%my_onTertiary", "d": "Material You On Tertiary" },
          { "n": "%my_onTertiaryContainer", "d": "Material You On Tertiary Container" },
          { "n": "%my_outline", "d": "Material You アウトライン" },
          { "n": "%my_outlineVariant", "d": "Material You アウトラインバリアント" },
          { "n": "%my_primary", "d": "Material You プライマリ" },
          { "n": "%my_primaryContainer", "d": "Material You プライマリコンテナ" },
          { "n": "%my_scrim", "d": "Material You スクリム" },
          { "n": "%my_secondary", "d": "Material You セカンダリ" },
          { "n": "%my_secondaryContainer", "d": "Material You セカンダリコンテナ" },
          { "n": "%my_surface", "d": "Material You サーフェス" },
          { "n": "%my_surfaceBright", "d": "Material You サーフェス (明るい)" },
          { "n": "%my_surfaceContainer", "d": "Material You サーフェスコンテナ" },
          { "n": "%my_surfaceContainerHigh", "d": "Material You サーフェスコンテナ (高)" },
          { "n": "%my_surfaceContainerHighest", "d": "Material You サーフェスコンテナ (最高)" },
          { "n": "%my_surfaceContainerLow", "d": "Material You サーフェスコンテナ (低)" },
          { "n": "%my_surfaceContainerLowest", "d": "Material You サーフェスコンテナ (最低)" },
          { "n": "%my_surfaceDim", "d": "Material You サーフェス (暗い)" },
          { "n": "%my_surfaceTint", "d": "Material You サーフェス ティント" },
          { "n": "%my_surfaceVariant", "d": "Material You サーフェス バリアント" },
          { "n": "%my_tertiary", "d": "Material You ターシャリ" },
          { "n": "%my_tertiaryContainer", "d": "Material You ターシャリコンテナ" }
        ]
      }
    },
    {
      "c": 398,
      "n": "WiFiに接続",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "ssid:1", "m": "SSID" }] }
    },
    {
      "c": 399,
      "n": "変数マップ",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "入力" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "入力最小値" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "入力最大値" },
          { "a": "Str", "u": 4, "s": "t:1", "m": "出力最小値" },
          { "a": "Str", "u": 5, "s": "t:1", "m": "出力最大値" },
          { "a": "Int", "u": 6, "s": "", "m": "反転" },
          { "a": "Int", "u": 7, "s": "", "m": "範囲を制限" },
          { "a": "Int", "u": 8, "s": "1:10:3", "m": "四捨五入する桁" },
          { "a": "Str", "u": 9, "s": "t:1:?", "m": "出力変数名" }
        ]
      },
      "o": { "v": [{ "n": "%vm_output", "d": "1. 出力" }] }
    },
    {
      "c": 402,
      "n": "クリップボード取得",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%cl_extras", "d": "追加情報" },
          { "n": "%cl_html_text", "d": "HTMLテキスト" },
          { "n": "%cl_image_uri", "d": "画像URI" },
          { "n": "%cl_mimetypes()", "d": "MIMEタイプ" },
          { "n": "%cl_text", "d": "文字" },
          { "n": "%cl_uri", "d": "URI" }
        ]
      }
    },
    {
      "c": 407,
      "n": "写真を選択",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "最大数" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "MIME タイプ" },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "キャッシュにコピー",
            "d": "Androidフォトピッカーが返すURIはTaskerでのみ使用できるため、選択したファイルをサードパーティアプリ（たとえばTaskerプラグイン）で使用する場合は、このオプションを有効にしてTaskerがファイルをキャッシュにコピーし、それらのサードパーティアプリで使用できるようにする必要があります。\n\n残念ながら、このプロセスは大きなファイルの場合には時間がかかるため、本当に必要な場合にのみ使用してください。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%sb_uri", "d": "最初に選択されたURI" },
          { "n": "%sb_uris()", "d": "選択されたすべてのURI" }
        ]
      }
    },
    {
      "c": 413,
      "n": "タイル追加リクエスト",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "追加するタイル" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "タイトル" },
          { "a": "Str", "u": 3, "s": "img:2", "m": "アイコン" }
        ]
      }
    },
    {
      "c": 414,
      "n": "ピクセルカラー取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "img:1", "m": "画像" },
          {
            "a": "Str",
            "u": 2,
            "s": "t:3",
            "m": "ピクセル座標",
            "d": "\u0027x,y\u0027形式（引用符なし）のXおよびY座標。例: 画像の左上端のピクセルカラーを取得するには0,0を使用します。\n\n各座標セットを別々の行に入力することで、複数の座標を指定できます。\n\n座標の末尾に%記号を使用して、その次元の画像サイズに対するパーセンテージで座標を指定できます。\n例: 画像の正確な中心のピクセルカラーを取得したい場合は、座標50%,50%を使用できます。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%pc_color", "d": "ピクセルカラー" },
          { "n": "%pc_colors()", "d": "すべてのピクセルカラー" }
        ]
      }
    },
    {
      "c": 418,
      "n": "カレンダーイベント取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "イベントID" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "イベントの数" },
          { "a": "Str", "u": 3, "s": "ccal:1:?", "m": "カレンダー" },
          { "a": "Str", "u": 4, "s": "dttmms:1:?", "m": "開始時刻" },
          { "a": "Str", "u": 5, "s": "dttmms:1:?", "m": "終了時刻" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "タイトル" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "説明" }
        ]
      },
      "o": {
        "v": [
          { "n": "%ce_account()", "d": "アカウント" },
          { "n": "%ce_account_type()", "d": "アカウントタイプ" },
          { "n": "%ce_all_day()", "d": "終日" },
          { "n": "%ce_available()", "d": "予定なし(空き時間)" },
          { "n": "%ce_start_time()", "d": "開始時刻" },
          { "n": "%ce_start_time_utc()", "d": "開始時刻" },
          { "n": "%ce_calendar()", "d": "カレンダー" },
          { "n": "%ce_color()", "d": "色" },
          { "n": "%ce_description()", "d": "説明" },
          { "n": "%ce_end_time()", "d": "終了時刻" },
          { "n": "%ce_end_time_utc()", "d": "終了時刻" },
          { "n": "%ce_event_id()", "d": "イベントID" },
          { "n": "%ce_location()", "d": "場所" },
          { "n": "%ce_timezone()", "d": "タイムゾーン" },
          { "n": "%ce_guests_can_invite()", "d": "ゲストは他の人を招待できます" },
          { "n": "%ce_guests_can_modify()", "d": "ゲストは変更できます" },
          { "n": "%ce_guests_can_see_guests()", "d": "ゲストはゲストを見ることができます" },
          { "n": "%ce_owner_account()", "d": "所有者アカウント" },
          { "n": "%ce_title()", "d": "タイトル" },
          { "n": "%ce_visible()", "d": "見える" },
          { "n": "%ce_is_organizer()", "d": "オーガナイザーである" }
        ]
      }
    },
    {
      "c": 421,
      "n": "画面情報取得（アシスタント）",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%ai_app_class", "d": "クラス" },
          { "n": "%ai_app_package", "d": "パッケージ" },
          { "n": "%ai_extras", "d": "追加情報" },
          { "n": "%ai_app_name", "d": "アプリ名" },
          { "n": "%ai_texts", "d": "テキスト" },
          { "n": "%ai_url", "d": "URL" }
        ]
      }
    },
    {
      "c": 424,
      "n": "バッテリー情報取得",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%bi_adaptive_battery_management_enabled", "d": "20. アダプティブバッテリー有効" },
          { "n": "%bi_adaptive_charging_enabled", "d": "19. アダプティブ充電有効" },
          { "n": "%bi_capacity_percentage", "d": "14. 容量パーセンテージ" },
          { "n": "%bi_capacity", "d": "15. 容量" },
          { "n": "%bi_charging_policy", "d": "21. バッテリー充電ポリシー" },
          { "n": "%bi_current_average", "d": "16. 平均電流" },
          { "n": "%bi_current_now", "d": "17. 瞬間電流" },
          { "n": "%bi_energy_counter", "d": "18. エネルギーカウンター" },
          { "n": "%bi_first_usage_date", "d": "20. バッテリー初回使用日" },
          { "n": "%bi_health_string", "d": "09. バッテリー状態の説明" },
          { "n": "%bi_manufacturing_date", "d": "19. バッテリー製造日" },
          { "n": "%bi_power_source_string", "d": "07. 電源の説明" },
          { "n": "%bi_state_of_health", "d": "22. バッテリーの健康状態" },
          { "n": "%bi_status_string", "d": "04. ステータスの説明" },
          { "n": "%bi_time_until_charged", "d": "08. 充電完了までの時間" },
          { "n": "%bi_battery_low", "d": "10. バッテリー残量低下" },
          { "n": "%bi_health", "d": "08. バッテリー状態" },
          { "n": "%bi_level", "d": "01. レベル" },
          { "n": "%bi_power_source", "d": "06. 電源" },
          { "n": "%bi_present", "d": "12. 存在" },
          { "n": "%bi_scale", "d": "02. 拡大" },
          { "n": "%bi_status", "d": "03. 状態" },
          { "n": "%bi_technology", "d": "13. 技術" },
          { "n": "%bi_temperature", "d": "05. 温度" },
          { "n": "%bi_voltage", "d": "11. 電圧" }
        ]
      }
    },
    {
      "c": 426,
      "n": "WiFi 通信",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "アクション",
            "p": { "切断": 0, "再び関連付ける": 1, "再接続": 2 }
          },
          { "a": "Int", "u": 1, "s": "", "m": "強制" },
          { "a": "Int", "u": 2, "s": "", "m": "失敗を報告する" }
        ]
      }
    },
    {
      "c": 430,
      "n": "Tasker再起動",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "監視のみ",
            "d": "Taskerを完全に再起動するのではなく、Taskerモニターのみを再起動します（変更を加えた後にアプリを終了したときなど）。"
          }
        ]
      }
    },
    {
      "c": 175,
      "n": "電力モード / Power Mode",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "標準": 0, "バッテリー節約": 1, "切り替え": 2 }
          }
        ]
      }
    },
    {
      "c": 431,
      "n": "ユーザー補助サービス",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "アクション",
            "d": "以下のサービスに対して実行するアクション。\n\n「…実行を続ける」アクションは、Tasker \u003e メニュー \u003e 環境設定 \u003e モニター \u003e ユーザー補助の実行を維持で利用可能な一般的なTasker設定を変更します。",
            "p": {
              "始点": 0,
              "停止": 1,
              "Stop All": 2,
              "Add To Keep Running": 3,
              "Remove From Keep Running": 4,
              "クエリー": 5,
              "切り替え": 6
            }
          },
          {
            "a": "Str",
            "u": 2,
            "s": "t:5",
            "m": "サービス",
            "d": "上記のアクションで操作するユーザー補助サービスのカンマ区切りリスト。\n\n各サービスは、アプリのパッケージ名の後に「/」が続き、その後にサービスクラス名が続きます。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "t:5:?",
            "m": "サービス",
            "d": "上記のアクションで操作するユーザー補助サービスのカンマ区切りリスト。\n\n各サービスは、アプリのパッケージ名の後に「/」が続き、その後にサービスクラス名が続きます。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%as_running_services_after()", "d": "アクション後の実行中のサービス" },
          {
            "n": "%as_running_services_after_app_names()",
            "d": "アクション後の実行中のサービス (アプリ名)"
          },
          {
            "n": "%as_running_services_after_service_names()",
            "d": "アクション後の実行中のサービス (サービス名)"
          },
          { "n": "%as_running_services_before()", "d": "アクション前の実行中のサービス" },
          {
            "n": "%as_running_services_before_app_names()",
            "d": "アクション前の実行中のサービス (アプリ名)"
          },
          {
            "n": "%as_running_services_before_service_names()",
            "d": "アクション前の実行中のサービス (サービス名)"
          }
        ]
      }
    },
    {
      "c": 432,
      "n": "ネットワーク情報取得",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%ni_active_full_info_json", "d": "アクティブなネットワーク詳細情報 JSON" },
          { "n": "%ni_active_capabilities()", "d": "アクティブなネットワーク機能" },
          {
            "n": "%ni_active_dhcp_gateway_v4",
            "d": "アクティブなネットワークDHCPゲートウェイ（ルーター）IPアドレスv4"
          },
          { "n": "%ni_active_ip_v4", "d": "アクティブなネットワークIPアドレスv4" },
          { "n": "%ni_active_ips_v6()", "d": "アクティブなネットワークIPアドレスv6" },
          { "n": "%ni_active_types()", "d": "アクティブなネットワークタイプ" },
          { "n": "%ni_active_wifi_link_speed", "d": "アクティブなWi-Fiリンク速度" },
          { "n": "%ni_active_wifi_mac", "d": "アクティブなWi-Fi MACアドレス" },
          { "n": "%ni_active_wifi_ssid", "d": "アクティブなWi-Fi SSID" },
          { "n": "%ni_active_wifi_signal_strength", "d": "アクティブなWi-Fi信号強度" },
          { "n": "%ni_other_full_info_json", "d": "その他のネットワークの完全情報JSON" }
        ]
      }
    },
    {
      "c": 433,
      "n": "モバイル通信 / Mobile Data",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Bundle", "u": 1, "s": "", "m": "出力変数" }
        ]
      },
      "o": { "v": [{ "n": "%new_state", "d": "新しい状態" }] }
    },
    {
      "c": 438,
      "n": "Matterライト（実験的）",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Str",
            "u": 1,
            "s": "mattdevi:1",
            "m": "デバイスID/名前",
            "d": "Taskerのパターンマッチングを使用して、単一のアクションで複数のデバイスを制御できます。\n\nたとえば、「天井1」という名前のライトと「天井2」という名前の別のライトがある場合、名前を「天井 *」に設定することで両方を切り替えることができます。\n\n以下のすべてのオプションは、一致するすべてのデバイスに適用されます。"
          },
          { "a": "Str", "u": 2, "s": "toggle:1:?", "m": "セット" },
          { "a": "Str", "u": 3, "s": "col:1:?", "m": "色" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "明るさ" }
        ]
      },
      "o": {
        "v": [
          { "n": "%ml_light_brightness()", "d": "明るさ" },
          { "n": "%ml_device_id()", "d": "デバイスID" },
          { "n": "%ml_device_name()", "d": "デバイス名" },
          { "n": "%ml_light_on()", "d": "オン" }
        ]
      }
    },
    {
      "c": 441,
      "n": "Work Profile/Private Space",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Bundle", "u": 1, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 2, "s": "usrhnd:1:?", "m": "プロファイル" }
        ]
      },
      "o": { "v": [{ "n": "%new_state", "d": "新しい状態" }] }
    },
    {
      "c": 446,
      "n": "ファイル/フォルダプロパティ取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "f:2:?", "m": "パス" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "種類" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "名前/パスフィルター" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "その他のフィルター" },
          { "a": "Int", "u": 5, "s": "", "m": "再帰的" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "並べ替え" }
        ]
      },
      "o": {
        "v": [
          { "n": "%lfp_mimetype()", "d": "MIME タイプ" },
          { "n": "%lfp_modification_date()", "d": "更新日時(昇順)" },
          { "n": "%lfp_name()", "d": "名前" },
          { "n": "%lfp_number_of_files()", "d": "ファイル数" },
          { "n": "%lfp_full_path()", "d": "フルパス" },
          { "n": "%lfp_size()", "d": "大きさ" },
          { "n": "%lfp_type()", "d": "種類" }
        ]
      }
    },
    {
      "c": 448,
      "n": "配列比較",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Str",
            "u": 1,
            "s": "t:3",
            "m": "名前",
            "d": "1つ以上のカンマまたは改行で区切られた配列名。\n\n名前の末尾に () を使用しないでください。それらをカンマ区切りの文字列に結合してしまいます。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%ac_common()", "d": "共通" },
          { "n": "%ac_comparison_map", "d": "比較マップ" },
          { "n": "%ac_distinct()", "d": "区別" },
          { "n": "%ac_exact_match", "d": "完全一致" },
          { "n": "%ac_match", "d": "一致" }
        ]
      }
    },
    { "c": 452, "n": "実行中のタスク表示", "p": { "p": [] } },
    { "c": 454, "n": "アクティブなプロファイル表示", "p": { "p": [] } },
    {
      "c": 460,
      "n": "デバイス効果設定",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "", "m": "グレースケール" },
          { "a": "Int", "u": 2, "s": "", "m": "壁紙を暗くする" },
          { "a": "Int", "u": 3, "s": "", "m": "常時表示ディスプレイを無効化" }
        ]
      }
    },
    {
      "c": 461,
      "n": "ウィジェット v2",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "ウィジェット名" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "配置方法" },
          {
            "a": "Str",
            "u": 3,
            "s": "col:1:?",
            "m": "背景色",
            "d": "ウィジェット全体の背景色。\n\nテキストの色を指定しない場合、これと対照的な色が自動的に選択されます。"
          },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "タイトル" },
          {
            "a": "Str",
            "u": 5,
            "s": "t:3:?",
            "m": "テキスト",
            "d": "選択したレイアウトに応じて、これらのテキストは異なる場所に表示されることがあります:\n\n- ボタン: 各ボタンのラベルとして使用されます\n- メディア: ウィジェットのサブタイトルとして使用されます"
          },
          {
            "a": "Str",
            "u": 6,
            "s": "t:1:?",
            "m": "テキストスタイル",
            "d": "上記の各テキストのスタイル。\n\nテキストよりも少ないスタイルを指定した場合、最後に指定したスタイルが残りのテキストに使用されます。\n\nスタイルは次のようになります:\n\n- HTML表記の色、またはMaterial Designのカラートークン (primary, onPrimary, secondaryなど) のいずれか\n- テキストサイズをspで設定する数値\n- フォントファミリーを設定するための \u0027sansserif\u0027, \u0027serif\u0027, \u0027monospace\u0027, \u0027cursive\u0027 のいずれか\n- テキスト配置を設定するための \u0027left\u0027, \u0027right\u0027, \u0027center\u0027, \u0027start\u0027, \u0027end\u0027 のいずれか\n- italic\n- bold\n- underline\n- linethrough\n\nたとえば、2つのテキストを2つの異なるスタイルで設定できます:\n- 赤、太字のテキスト\n- 緑、斜体、下線のテキスト\n\nこれを次のように設定します\n\n#FF0000 bold,#00FF00 italic underline.\n\n重要: タイトルもテキストとしてカウントされるため、提供する最初のスタイルはタイトルに割り当てられます。"
          },
          {
            "a": "Str",
            "u": 7,
            "s": "imgs:3:?",
            "m": "画像",
            "d": "選択したレイアウトに応じて、これらの画像は異なる場所に表示されることがあります:\n\n- ボタン: 各ボタンのメイン画像として使用されます\n- メディア: 最初の画像が左側のメイン画像として使用されます。残りは下のボタンとして使用されます。"
          },
          {
            "a": "Str",
            "u": 8,
            "s": "col:1:?",
            "m": "画像ティント",
            "d": "これを設定すると、上記の画像を単一の単色で色付けします。\n\n値を空のままにして、着色しない画像を指定できます。\n\n画像よりも少ない色を指定した場合、最後に指定した色が残りの画像に使用されます。"
          },
          {
            "a": "Str",
            "u": 9,
            "s": "t:1:?",
            "m": "画像サイズ",
            "d": "画像のサイズをdp (密度非依存ピクセル) で指定します。\n\n画像よりも少ないサイズを指定した場合、最後に指定したサイズが残りの画像に使用されます。"
          },
          {
            "a": "Str",
            "u": 10,
            "s": "m:1:?",
            "m": "タスク",
            "d": "上記のテキスト/画像をタップしたときに実行されるタスク。\n\n各テキスト/画像に1つのタスクを指定するか、クリック不可にする場合は空白のままにします。"
          },
          {
            "a": "Str",
            "u": 11,
            "s": "t:1:?",
            "m": "コマンド",
            "d": "上記のテキスト/画像をタップしたときに実行されるコマンド。\n\nテキスト/画像ごとに1つのコマンドを指定するか、クリック不可にする場合は空白のままにします。\n\nこれらのコマンドはTaskerの「コマンド」イベントをトリガーします。詳細についてはそちらを確認してください。"
          },
          {
            "a": "Str",
            "u": 12,
            "s": "t:1:?",
            "m": "コマンド接頭語",
            "d": "設定されている場合、上記のすべてのコマンドの前に「prefix\u003d:\u003d」を付加します（「prefix」はここで指定する実際のプレフィックスです）。"
          },
          {
            "a": "Str",
            "u": 13,
            "s": "t:20:?",
            "m": "カスタムレイアウト",
            "d": "カスタムレイアウトをJSON構造としてここで指定します。\n\nHTTP/S URLまたはファイルパスを直接使用することもできます。\n\nカスタムレイアウトのすべてについては、以下をクリックしてください。"
          },
          {
            "a": "Int",
            "u": 14,
            "s": "true",
            "m": "Material You カラー",
            "d": "有効にすると、色が明示的に設定されていない場合にMaterial Youの色を使用します。つまり、ウィジェットの色が壁紙と一致します。"
          },
          {
            "a": "Str",
            "u": 15,
            "s": "t:20",
            "m": "列数",
            "d": "ウィジェットがデータを表示するために持つ列数。\n\nたとえば、10個のテキストを指定し、列数を5に設定すると、それぞれ5列の2行が表示されます。"
          },
          {
            "a": "Int",
            "u": 16,
            "s": "true",
            "m": "存在しない場合に確認して追加",
            "d": "ウィジェットがまだホーム画面に追加されていない場合、追加するように求めるポップアップを表示します。"
          }
        ]
      }
    },
    {
      "c": 462,
      "n": "リモートアクション実行",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "モード",
            "p": { "クエリー": 0, "トークンをリセット": 1 }
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%rae_bearer_token", "d": "ベアラートークン" },
          { "n": "%rae_fcm_token", "d": "FCMトークン" },
          { "n": "%rae_remote_device_name()", "d": "リモートデバイス名" },
          { "n": "%rae_remote_device_token()", "d": "リモートデバイス名" }
        ]
      }
    },
    {
      "c": 463,
      "n": "アプリ経由でカレンダー編集",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "true", "m": "すぐに次のタスクに進む" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "アクション" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "イベントID" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "タイトル" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "説明" },
          { "a": "Str", "u": 6, "s": "dttmms:1:?", "m": "開始時刻" },
          { "a": "Str", "u": 7, "s": "dttmms:1:?", "m": "終了時刻" }
        ]
      }
    },
    {
      "c": 464,
      "n": "カレンダーイベント編集",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "アクション" },
          { "a": "Str", "u": 2, "s": "ccal:1", "m": "カレンダー" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "イベントID" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "タイトル" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "説明" },
          { "a": "Str", "u": 6, "s": "strbool:1:?", "m": "終日" },
          { "a": "Str", "u": 7, "s": "dttmms:1:?", "m": "開始時刻" },
          { "a": "Str", "u": 8, "s": "dttmms:1:?", "m": "終了時刻" },
          { "a": "Str", "u": 9, "s": "t:1:?", "m": "オーガナイザー" },
          { "a": "Str", "u": 10, "s": "locradi:1:?", "m": "場所" },
          { "a": "Str", "u": 11, "s": "t:1:?", "m": "利用可能時間" },
          { "a": "Str", "u": 12, "s": "col:1:?", "m": "色" }
        ]
      },
      "o": { "v": [{ "n": "%ce_event_id", "d": "イベントID" }] }
    },
    {
      "c": 465,
      "n": "カレンダーリマインダー編集",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "アクション" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "イベントID" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "リマインダーID" },
          { "a": "Str", "u": 4, "s": "t:1", "m": "何分前" },
          { "a": "Str", "u": 5, "s": "t:1", "m": "方式" }
        ]
      },
      "o": { "v": [{ "n": "%ce_reminder_id", "d": "リマインダーID" }] }
    },
    {
      "c": 466,
      "n": "カレンダーリマインダー取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "リマインダーID" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "イベントID" },
          { "a": "Str", "u": 3, "s": "ccal:1:?", "m": "カレンダー" }
        ]
      },
      "o": {
        "v": [
          { "n": "%ce_reminder_method()", "d": "方式" },
          { "n": "%ce_reminder_method_code()", "d": "メソッドコード" },
          { "n": "%ce_reminder_minutes_prior()", "d": "何分前" },
          { "n": "%ce_reminder_id()", "d": "リマインダーID" }
        ]
      }
    },
    {
      "c": 467,
      "n": "カレンダー参加者編集",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "アクション" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "イベントID" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "参加者ID" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "名前" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "メール" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "状態" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "関係" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "種類" }
        ]
      },
      "o": { "v": [{ "n": "%ce_attendee_id", "d": "参加者ID" }] }
    },
    {
      "c": 468,
      "n": "カレンダー参加者取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "参加者ID" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "イベントID" },
          { "a": "Str", "u": 3, "s": "ccal:1:?", "m": "カレンダー" }
        ]
      },
      "o": {
        "v": [
          { "n": "%ce_attendee_email()", "d": "メール" },
          { "n": "%ce_attendee_name()", "d": "名前" },
          { "n": "%ce_attendee_relationship()", "d": "関係" },
          { "n": "%ce_attendee_relationship_code()", "d": "関係コード" },
          { "n": "%ce_attendee_id()", "d": "参加者ID" },
          { "n": "%ce_attendee_status()", "d": "状態" },
          { "n": "%ce_attendee_status_code()", "d": "ステータスコード" },
          { "n": "%ce_attendee_type()", "d": "種類" },
          { "n": "%ce_attendee_type_code()", "d": "タイプコード" }
        ]
      }
    },
    {
      "c": 469,
      "n": "キーボード設定",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "", "m": "キーボード / Keyboard" }] }
    },
    {
      "c": 470,
      "n": "キーボード情報取得",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%kb_active_package_name", "d": "アクティブなパッケージ名" },
          { "n": "%kb_package_name()", "d": "パッケージ名" }
        ]
      }
    },
    {
      "c": 473,
      "n": "日の出/日の入り時刻を取得",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          {
            "a": "Str",
            "u": 1,
            "s": "t:1:?",
            "m": "緯度",
            "d": "空のままにすると、現在地が使用されます。"
          },
          {
            "a": "Str",
            "u": 2,
            "s": "t:1:?",
            "m": "経度",
            "d": "空のままにすると、現在地が使用されます。"
          },
          {
            "a": "Str",
            "u": 3,
            "s": "dttms:1:?",
            "m": "エポックからの秒数",
            "d": "空のままにすると、現在時刻が使用されます。"
          },
          {
            "a": "Str",
            "u": 4,
            "s": "t:1:?",
            "m": "カスタム太陽高度角",
            "d": "1つ以上の太陽高度角を入力して、毎日2回発生する時刻を見つけます。1回は日の出時（朝）、もう1回は日の入り時（夕方）です。"
          }
        ]
      },
      "o": {
        "v": [
          { "n": "%ss_astronomical_dawn", "d": "Astronomical Dawn" },
          { "n": "%ss_astronomical_dusk", "d": "Astronomical Dusk" },
          { "n": "%ss_civil_dawn", "d": "Civil Dawn" },
          { "n": "%ss_civil_dusk", "d": "Civil Dusk" },
          { "n": "%ss_custom_morning()", "d": "Custom Morning" },
          { "n": "%ss_custom_evening()", "d": "Custom Evening" },
          { "n": "%ss_day_or_night", "d": "Day Or Night" },
          { "n": "%ss_day_or_night_code", "d": "Day Or Night Code" },
          { "n": "%ss_nautical_dawn", "d": "Nautical Dawn" },
          { "n": "%ss_nautical_dusk", "d": "Nautical Dusk" },
          { "n": "%ss_solar_noon", "d": "Solar Noon" },
          { "n": "%ss_sunlight_duration", "d": "日照時間（分）" },
          { "n": "%ss_sunrise", "d": "日の出" },
          { "n": "%ss_sunset", "d": "日の入り" }
        ]
      }
    },
    {
      "c": 474,
      "n": "Java Code",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:3", "m": "コード" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "リターン / Return" },
          { "a": "Int", "u": 2, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    {
      "c": 733,
      "n": "通話を終了 / End Call",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] }
    },
    {
      "c": 477,
      "n": "Assistant Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:15", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 248,
      "n": "画面消灯 / Turn Off",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "薄暗く" },
          { "a": "Int", "u": 1, "s": "", "m": "ロック / Lock" }
        ]
      }
    },
    {
      "c": 252,
      "n": "SMS アプリの指定 / Set SMS App",
      "p": { "p": [{ "a": "App", "u": 0, "s": "", "m": "アプリ" }] }
    },
    {
      "c": 511,
      "n": "懐中電灯 / Torch",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "レベル" }
        ]
      }
    },
    {
      "c": 115,
      "n": "調査 / Test",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 343,
      "n": "メディアの調査 / Test Media",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "音楽ファイルのアーティストタグ": 0,
              "音楽ファイルの長さタグ": 1,
              "音楽ファイルのタイトルタグ": 2,
              "音楽再生の位置": 3,
              "音楽再生位置 (ミリ秒)": 4
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 156,
      "n": "MIDI 再生 / MIDI Play",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "書式", "p": { "Tasker": 0 } },
          { "a": "Int", "u": 1, "s": "", "m": "市区町村", "p": { "英語": 0, "ドイツ語": 1 } },
          { "a": "Int", "u": 2, "s": "100:1000:300", "m": "拍子のタイミング" },
          { "a": "Str", "u": 3, "s": "score:3", "m": "楽譜" }
        ]
      }
    },
    {
      "c": 523,
      "n": "通知を表示 / Notify",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "s:3:?", "m": "文字" },
          { "a": "Img", "u": 2, "s": "", "m": "アイコン" },
          { "a": "Int", "u": 3, "s": "0:99", "m": "電話番号" },
          { "a": "Int", "u": 4, "s": "", "m": "永続" },
          { "a": "Int", "u": 5, "s": "1:5:3", "m": "優先度" },
          { "a": "Int", "u": 6, "s": "", "m": "アラートを繰り返す" },
          {
            "a": "Int",
            "u": 7,
            "s": "",
            "m": "LED 色",
            "p": {
              "赤": 0,
              "緑": 1,
              "青": 2,
              "黄": 3,
              "ターコイズ": 4,
              "紫": 5,
              "オレンジ": 6,
              "ピンク": 7,
              "白": 8
            }
          },
          { "a": "Int", "u": 8, "s": "0:1000:0", "m": "LED 比率" },
          { "a": "Str", "u": 9, "s": "f:2:?", "m": "音声ファイル" },
          { "a": "Str", "u": 10, "s": "v:4:?", "m": "バイブ(振動)パターン" },
          { "a": "Str", "u": 11, "s": "notcatoreo:1:?", "m": "カテゴリー" },
          { "a": "Str", "u": 12, "s": "t:2:?", "m": "強度パターン" },
          { "a": "Int", "u": 13, "s": "", "m": "Live Update" },
          { "a": "Str", "u": 14, "s": "t:1:?", "m": "Short Critical Text" },
          { "a": "Str", "u": 15, "s": "t:1:?", "m": "グループ" }
        ]
      }
    },
    {
      "c": 525,
      "n": "通知 (LED) / Notify LED",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "s:3:?", "m": "文字" },
          { "a": "Img", "u": 2, "s": "", "m": "アイコン" },
          { "a": "Int", "u": 3, "s": "0:99", "m": "電話番号" },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "色",
            "p": {
              "赤": 0,
              "緑": 1,
              "青": 2,
              "黄": 3,
              "ターコイズ": 4,
              "紫": 5,
              "オレンジ": 6,
              "ピンク": 7,
              "白": 8
            }
          },
          { "a": "Int", "u": 5, "s": "1:1000:500", "m": "レート" },
          { "a": "Int", "u": 6, "s": "1:5:3", "m": "優先度" },
          { "a": "Int", "u": 7, "s": "", "m": "アラートを繰り返す" }
        ]
      }
    },
    {
      "c": 538,
      "n": "通知 (音あり) / Notify Sound",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "s:3:?", "m": "文字" },
          { "a": "Img", "u": 2, "s": "", "m": "アイコン" },
          { "a": "Int", "u": 3, "s": "0:99", "m": "電話番号" },
          { "a": "Str", "u": 4, "s": "f:2:?", "m": "音声ファイル" },
          { "a": "Int", "u": 5, "s": "1:5:3", "m": "優先度" },
          { "a": "Int", "u": 6, "s": "", "m": "アラートを繰り返す" }
        ]
      }
    },
    {
      "c": 536,
      "n": "通知 (バイブ) / Notify Vibrate",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "s:3:?", "m": "文字" },
          { "a": "Img", "u": 2, "s": "", "m": "アイコン" },
          { "a": "Int", "u": 3, "s": "0:99", "m": "電話番号" },
          { "a": "Str", "u": 4, "s": "v:4:?", "m": "パターン" },
          { "a": "Int", "u": 5, "s": "1:5:3", "m": "優先度" },
          { "a": "Int", "u": 6, "s": "", "m": "アラートを繰り返す" }
        ]
      }
    },
    {
      "c": 551,
      "n": "メニュー / Menu",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1:?", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "b:2:?", "m": "背景画像" },
          { "a": "Str", "u": 2, "s": "sname", "m": "配置方法" },
          { "a": "Int", "u": 3, "s": "1:600:30", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 4, "s": "true", "m": "キーガードの上に表示する" }
        ]
      }
    },
    {
      "c": 779,
      "n": "通知を中止 / Notify Cancel",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1:?", "m": "タイトル" },
          { "a": "Int", "u": 1, "s": "", "m": "無ければ警告" }
        ]
      }
    },
    {
      "c": 550,
      "n": "ポップアップ表示 / Popup",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1:?", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "s:5", "m": "文字" },
          { "a": "Str", "u": 2, "s": "b:2:?", "m": "背景画像" },
          { "a": "Str", "u": 3, "s": "sname", "m": "配置方法" },
          { "a": "Int", "u": 4, "s": "1:600:5", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 5, "s": "true", "m": "キーガードの上に表示する" }
        ]
      }
    },
    {
      "c": 941,
      "n": "HTML ポップアップ / Popup",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "s:12", "m": "コード" },
          { "a": "Str", "u": 1, "s": "sname", "m": "配置方法" },
          { "a": "Int", "u": 2, "s": "1:600:5", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 3, "s": "true", "m": "キーガードの上に表示する" }
        ]
      }
    },
    {
      "c": 552,
      "n": "タスクボタンをポップアップ表示 / Popup Task Burrons",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:5:?", "m": "文字" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "モード",
            "p": { "アイコン": 0, "文字": 1, "アイコンと文字": 2 }
          },
          { "a": "Str", "u": 2, "s": "m:1:?", "m": "タスク" },
          { "a": "Str", "u": 3, "s": "m:1:?", "m": "タスク" },
          { "a": "Str", "u": 4, "s": "m:1:?", "m": "タスク" },
          { "a": "Str", "u": 5, "s": "b:2:?", "m": "背景画像" },
          { "a": "Str", "u": 6, "s": "sname", "m": "配置方法" },
          { "a": "Int", "u": 7, "s": "1:600:10", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 8, "s": "true", "m": "キーガードの上に表示する" }
        ]
      }
    },
    {
      "c": 999,
      "n": "照明の設定 / Set Light",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "light:1", "m": "セット" },
          { "a": "Int", "u": 1, "s": "0:255", "m": "これに" }
        ]
      }
    },
    {
      "c": 61,
      "n": "バイブ(振動) / Vibrate",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "1:1000:200", "m": "時間" }] }
    },
    {
      "c": 62,
      "n": "バイブパターン(振動) / Vibrate Pattern",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "v:2", "m": "パターン" },
          { "a": "Str", "u": 1, "s": "t:2:?", "m": "強度パターン" }
        ]
      }
    },
    {
      "c": 344,
      "n": "アプリの調査 / Test App",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "カレンダー / カレンダー名": 0,
              "カレンダー / 件名": 1,
              "カレンダー / 説明文": 2,
              "カレンダー / 場所": 3,
              "カレンダー / 開始時刻 (秒)": 4,
              "カレンダー / 終了時刻 (秒)": 5,
              "カレンダー / 終日か": 6,
              "カレンダー / 空き時間か": 7,
              "アプリ名": 8,
              "パッケージ バージョン番号": 9,
              "パッケージ / バージョンラベル": 10,
              "このパッケージ": 11
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 815,
      "n": "アプリ一覧 / List Apps",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "パッケージ": 0,
              "アプリ": 1,
              "アクティビティ": 2,
              "受信者": 3,
              "サービス": 4,
              "提供者": 5
            }
          },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "一致" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 349,
      "n": "システムの調査 / Test System",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類", "p": { "Android ID": 0, "ユーザー ID": 1 } },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 566,
      "n": "アラームの作成 / Set Alarm",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:23", "m": "時間" },
          { "a": "Int", "u": 1, "s": "0:59", "m": "分" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "ラベル" },
          { "a": "Str", "u": 3, "s": "rtn:1:?", "m": "鳴らす" },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "バイブ(振動)",
            "p": { "デフォルト": 0, "オフ": 1, "オン": 2 }
          },
          { "a": "Int", "u": 5, "s": "", "m": "確認" }
        ]
      }
    },
    {
      "c": 165,
      "n": "アラームを中止 / Cancel Alarm",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": {
              "今のをスヌーズ": 0,
              "今のを無効にする": 1,
              "ラベル指定で無効にする": 2,
              "時間指定で無効にする": 3,
              "全て無効化": 4
            }
          },
          { "a": "Int", "u": 1, "s": "0:23", "m": "時間" },
          { "a": "Int", "u": 2, "s": "0:59", "m": "分" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "ラベル" }
        ]
      }
    },
    { "c": 166, "n": "アラームを表示 / Show Alarms", "p": { "p": [] } },
    {
      "c": 543,
      "n": "タイマー開始 / Start System Timer",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "1:86400:10", "m": "秒" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "本文" },
          { "a": "Int", "u": 2, "s": "", "m": "操作画面を表示する" }
        ]
      }
    },
    {
      "c": 567,
      "n": "カレンダー登録 / Calendar Insert",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1:?", "m": "開始時刻 / 継続 (分)" },
          { "a": "Str", "u": 1, "s": "ccal:1", "m": "カレンダー" },
          { "a": "Str", "u": 2, "s": "ctit:1", "m": "タイトル" },
          { "a": "Str", "u": 3, "s": "t:3:?", "m": "説明" },
          { "a": "Str", "u": 4, "s": "cloc:1:?", "m": "場所" },
          { "a": "Int", "u": 5, "s": "", "m": "予定なし(空き時間)" },
          { "a": "Int", "u": 6, "s": "", "m": "終日" }
        ]
      }
    },
    {
      "c": 25,
      "n": "ホーム画面に戻る / Go Home",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:20", "m": "ページ" },
          { "a": "Str", "u": 1, "s": "applpakc:1:?", "m": "パッケージ" }
        ]
      }
    },
    {
      "c": 20,
      "n": "アプリ起動 / Launch App",
      "p": {
        "p": [
          { "a": "App", "u": 0, "s": "", "m": "パッケージ/アプリ名" },
          { "a": "Str", "u": 1, "s": "t:5:?", "m": "データ" },
          { "a": "Int", "u": 2, "s": "", "m": "アプリ履歴から除外する" },
          { "a": "Int", "u": 3, "s": "", "m": "常に新規に起動する" }
        ]
      }
    },
    {
      "c": 119,
      "n": "地図を開く / Open Map",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "地点": 0, "ストリートビュー": 1, "経路ナビ": 2 }
          },
          { "a": "Str", "u": 1, "s": "t:2:?", "m": "住所から地図" },
          { "a": "Str", "u": 2, "s": "latlong:2:?", "m": "緯度・経度" },
          { "a": "Int", "u": 3, "s": "1:23", "m": "倍率" },
          { "a": "Str", "u": 4, "s": "w:1:?", "m": "ラベル" }
        ]
      }
    },
    {
      "c": 303,
      "n": "アラーム音量 / Alarm Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 311,
      "n": "BT 通話音量 / BT Voice Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 309,
      "n": "ダイヤル音量 / DTMF Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 177,
      "n": "バイブ感触 / Haptic Feedback",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 306,
      "n": "通話音量 / In-Call Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 307,
      "n": "メディア音量 / Media Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 301,
      "n": "マイクをミュート(消音) / Mic Mute",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 305,
      "n": "通知音量 / Notification Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 258,
      "n": "通知でバイブ(振動) / Vibrate On Notify",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 304,
      "n": "着信音量",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 256,
      "n": "着信時にバイブ",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 308,
      "n": "システム音量 / System Volume",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "表示する" },
          { "a": "Int", "u": 2, "s": "", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 310,
      "n": "サイレント(無音)モード / Silent Mode",
      "p": {
        "p": [{ "a": "Int", "u": 0, "s": "", "m": "モード", "p": { "オフ": 0, "バイブ(振動)": 1 } }]
      }
    },
    {
      "c": 136,
      "n": "システム効果音 / Sound Effects",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 235,
      "n": "カスタム設定 / Custom Setting",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "グローバル": 0, "セキュア": 1, "システム": 2 }
          },
          { "a": "Str", "u": 1, "s": "sset:1", "m": "名前" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "値" },
          { "a": "Int", "u": 3, "s": "", "m": "ルート権限使用" },
          { "a": "Str", "u": 4, "s": "uvar:1:?", "m": "設定の読み込み先" }
        ]
      }
    },
    { "c": 200, "n": "機器本体の設定画面 / All Settings", "p": { "p": [] } },
    { "c": 236, "n": "ユーザー補助の設定画面 / Accessibility Settings", "p": { "p": [] } },
    { "c": 199, "n": "アカウント追加の設定画面 / Add Account Settings", "p": { "p": [] } },
    { "c": 201, "n": "機内モードの設定画面 / Airplane Mode Settings", "p": { "p": [] } },
    { "c": 202, "n": "APN の設定画面 / APN Settings", "p": { "p": [] } },
    {
      "c": 216,
      "n": "アプリの設定画面 / App Settings",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "pkgName:1:?", "m": "アプリ" }] }
    },
    { "c": 251, "n": "バッテリー設定 / Battery Settings", "p": { "p": [] } },
    { "c": 226, "n": "アプリ管理の設定画面 / App Manage Settings", "p": { "p": [] } },
    { "c": 218, "n": "Bluetooth の設定画面 / BT Settings", "p": { "p": [] } },
    { "c": 203, "n": "日付の設定画面 / Date Settings", "p": { "p": [] } },
    { "c": 197, "n": "開発者向けの設定画面 / Developer Settings", "p": { "p": [] } },
    { "c": 198, "n": "機器情報の設定画面 / Device Info Settings", "p": { "p": [] } },
    { "c": 959, "n": "DayDreamの設定画面 / Settings", "p": { "p": [] } },
    { "c": 234, "n": "ユーザー辞書の設定画面 / Dictionary Settings", "p": { "p": [] } },
    { "c": 222, "n": "画面の設定画面 / Display Settings", "p": { "p": [] } },
    { "c": 210, "n": "キーボードの設定画面 / Input Method Settings", "p": { "p": [] } },
    { "c": 204, "n": "内部ストレージの設定画面 / Internal Storage Settings", "p": { "p": [] } },
    { "c": 224, "n": "言語の設定画面 / Locale Settings", "p": { "p": [] } },
    { "c": 208, "n": "位置情報の設定画面 / Location Settings", "p": { "p": [] } },
    { "c": 227, "n": "ストレージの設定画面 / Memory Card Settings", "p": { "p": [] } },
    { "c": 956, "n": "NFC の設定画面 / NFC Settings", "p": { "p": [] } },
    { "c": 958, "n": "NFC 支払いの設定画面 / NFC Payment Settings", "p": { "p": [] } },
    { "c": 957, "n": "Android ビームの設定画面 / Beam Settings", "p": { "p": [] } },
    { "c": 228, "n": "通信事業者の設定画面 / Network Operator Settings", "p": { "p": [] } },
    { "c": 237, "n": "通知リスナーの設定画面 / Notificaton Listener Settings", "p": { "p": [] } },
    { "c": 257, "n": "電池使用量の設定画面 / Power Usage Settings", "p": { "p": [] } },
    { "c": 238, "n": "バックアップの設定画面", "p": { "p": [] } },
    { "c": 239, "n": "印刷の設定画面 / Print Settings", "p": { "p": [] } },
    { "c": 229, "n": "クイック起動設定画面 / Quick Launch Settings", "p": { "p": [] } },
    { "c": 230, "n": "セキュリティの設定画面 / Security Settings", "p": { "p": [] } },
    { "c": 220, "n": "モバイル通信の設定画面 / Mobile Data Settings", "p": { "p": [] } },
    { "c": 231, "n": "検索の設定画面 / Search Settings", "p": { "p": [] } },
    { "c": 232, "n": "サウンドの設定画面 / Sound Settings", "p": { "p": [] } },
    { "c": 211, "n": "同期の設定画面 / Sync Settings", "p": { "p": [] } },
    { "c": 206, "n": "WiFi の設定画面 / Wi-Fi Settings", "p": { "p": [] } },
    { "c": 212, "n": "WiFi 詳細設定画面 / Wi-Fi IP Settings", "p": { "p": [] } },
    { "c": 214, "n": "無線通信の設定画面 / Wireless Settings", "p": { "p": [] } },
    {
      "c": 348,
      "n": "画面の調査 / Test Display",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "自動回転": 0,
              "画面の向き": 1,
              "DPI": 2,
              "利用可能な解像度": 3,
              "ハードウェア解像度": 4,
              "ロック中": 5,
              "安全にロック中": 6,
              "表示の密度": 7,
              "ナビゲーションバーの高さ": 8,
              "ナビゲーションバー上部オフセット": 9,
              "ナビゲーションバー中央オフセット": 10,
              "ステータスバーオフセット": 11
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 808,
      "n": "明るさ自動調整 / Auto Brightness",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 15,
      "n": "ロック / Lock",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1:?", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "cv:1", "m": "コード" },
          { "a": "Int", "u": 2, "s": "", "m": "キャンセルも許可する" },
          { "a": "Int", "u": 3, "s": "", "m": "消灯まで記憶する" },
          { "a": "Int", "u": 4, "s": "", "m": "全画面表示" },
          { "a": "Str", "u": 5, "s": "b:2:?", "m": "背景画像" },
          { "a": "Str", "u": 6, "s": "sname", "m": "配置方法" }
        ]
      }
    },
    { "c": 16, "n": "システムロック / System Lock", "p": { "p": [] } },
    {
      "c": 810,
      "n": "画面の明るさ / Display Brightness",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:255:128", "m": "レベル" },
          { "a": "Int", "u": 1, "s": "", "m": "セーフガードを無効にする" },
          { "a": "Int", "u": 2, "s": "", "m": "現在のレベルを無視する" },
          { "a": "Int", "u": 3, "s": "true", "m": "即効" }
        ]
      }
    },
    {
      "c": 812,
      "n": "画面消灯までの時間 / Display Timeout",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:59", "m": "秒" },
          { "a": "Int", "u": 1, "s": "0:59", "m": "分" },
          { "a": "Int", "u": 2, "s": "0:23", "m": "時間" }
        ]
      }
    },
    {
      "c": 822,
      "n": "画面自動回転 / Display AutoRotate",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 109,
      "n": "壁紙設定 / Set Wallpaper",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "ランチャー": 0, "ロック画面": 1, "全て": 2 }
          },
          { "a": "Str", "u": 1, "s": "b:2:?", "m": "画像" },
          { "a": "Int", "u": 2, "s": "", "m": "拡大縮小" },
          { "a": "Int", "u": 3, "s": "", "m": "切り抜き" },
          { "a": "Int", "u": 4, "s": "", "m": "中" }
        ]
      }
    },
    {
      "c": 512,
      "n": "ステータスバー / Status Bar",
      "p": {
        "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット", "p": { "開いた": 0, "閉じた": 1 } }]
      }
    },
    {
      "c": 988,
      "n": "運転モード / Car Mode",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "セット" },
          { "a": "Int", "u": 1, "s": "", "m": "ホーム画面に戻る / Go Home" }
        ]
      }
    },
    {
      "c": 989,
      "n": "夜間モード / Night Mode",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "モード", "p": { "オフ": 0, "オン": 1, "自動": 2 } }
        ]
      }
    },
    {
      "c": 342,
      "n": "ファイルの調査 / Test File",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "親ディレクトリ": 0,
              "変更済み": 1,
              "名前": 2,
              "大きさ": 3,
              "種類": 4,
              "存在する": 5,
              "MD5": 6,
              "Base64": 7
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" },
          { "a": "Int", "u": 3, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 4, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 900,
      "n": "ファイル表示 / Browse Files",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "d:2:?", "m": "ディレクトリ" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "一致" },
          { "a": "Int", "u": 2, "s": "", "m": "隠しファイルも含める" }
        ]
      }
    },
    {
      "c": 412,
      "n": "ファイルを一覧 / List Files",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "d:2", "m": "ディレクトリ" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "一致" },
          { "a": "Int", "u": 2, "s": "", "m": "隠しファイルも含める" },
          { "a": "Int", "u": 3, "s": "", "m": "ルート権限使用" },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "選択を並べ替える",
            "p": {
              "アルファベット(昇順)": 0,
              "アルファベット(降順)": 1,
              "ディレクトリ優先": 2,
              "ファイル拡張子(昇順)": 3,
              "ファイル拡張子(降順)": 4,
              "ファイル優先": 5,
              "更新日時(昇順)": 6,
              "更新日時(降順)": 7,
              "サイズ(昇順)": 8,
              "サイズ(降順)": 9
            }
          },
          { "a": "Str", "u": 5, "s": "uvar:1", "m": "変数の配列" },
          { "a": "Int", "u": 6, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 409,
      "n": "ディレクトリ作成 / Create Directory",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "d:2", "m": "ディレクトリ" },
          { "a": "Int", "u": 1, "s": "", "m": "全て作成" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 3, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 408,
      "n": "ディレクトリ削除 / Delete Directory",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "d:2", "m": "ディレクトリ" },
          { "a": "Int", "u": 1, "s": "", "m": "再帰的" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 3, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 405,
      "n": "ディレクトリをコピー / Copy Dir",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "これ以上" },
          { "a": "Str", "u": 1, "s": "d:2", "m": "これに" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 3, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 404,
      "n": "ファイルをコピー / Copy FIle",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "これ以上" },
          { "a": "Str", "u": 1, "s": "d:2", "m": "これに" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 3, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 406,
      "n": "ファイルを削除 / Delete File",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "0:10:0", "m": "裁断レベル" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 3, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 400,
      "n": "移動 / Move",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "これ以上" },
          { "a": "Str", "u": 1, "s": "d:2", "m": "これに" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 3, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      }
    },
    {
      "c": 376,
      "n": "ファイル共有 / Share File",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "mime:1:?", "m": "MIME タイプ" },
          { "a": "Int", "u": 2, "s": "", "m": "選択ダイアログを表示する" },
          { "a": "Str", "u": 3, "s": "w:1:?", "m": "ダイアログのタイトル選択" }
        ]
      }
    },
    {
      "c": 417,
      "n": "ファイルを読み込む / Read File",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "uvar:1", "m": "保存先の変数" },
          { "a": "Int", "u": 2, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    {
      "c": 776,
      "n": "バイナリの読み込み / Read Binary",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "uvar:1", "m": "保存先の変数" }
        ]
      }
    },
    {
      "c": 775,
      "n": "バイナリの書き込み / Write Binary",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数" },
          { "a": "Str", "u": 1, "s": "f:2", "m": "ファイル" }
        ]
      }
    },
    {
      "c": 415,
      "n": "1行ずつ読み込む / Read Line",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "var:1:?", "m": "行" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "保存先の変数" },
          { "a": "Int", "u": 3, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    {
      "c": 416,
      "n": "段落ごと読み込む / Read Paragraph",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "var:1:?", "m": "段落" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "保存先の変数" }
        ]
      }
    },
    {
      "c": 410,
      "n": "ファイル書き込み / Write File",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "t:5", "m": "文字" },
          { "a": "Int", "u": 2, "s": "", "m": "追記する" },
          { "a": "Int", "u": 3, "s": "true", "m": "改行を付加する" }
        ]
      }
    },
    {
      "c": 422,
      "n": "Zip 展開(解凍) / UnZip",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "", "m": "zip を削除する" }
        ]
      }
    },
    {
      "c": 420,
      "n": "Zip 圧縮 / Zip",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "", "m": "元ファイルを削除する" },
          { "a": "Int", "u": 2, "s": "1:9:8", "m": "レベル" },
          { "a": "Str", "u": 3, "s": "f:1:?", "m": "出力先ファイル" }
        ]
      }
    },
    {
      "c": 476,
      "n": "gzip 展開(解凍) / GUnzip",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "", "m": "zip を削除する" }
        ]
      }
    },
    {
      "c": 475,
      "n": "gzip 圧縮 / GZip",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "", "m": "元ファイルを削除する" }
        ]
      }
    },
    { "c": 513, "n": "システムのダイアログを閉じる / Close System Dialogs", "p": { "p": [] } },
    {
      "c": 703,
      "n": "物理ボタン / Button",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "ボタン",
            "p": {
              "戻るボタン": 0,
              "発話ボタン": 1,
              "カメラボタン": 2,
              "通話終了ボタン": 3,
              "メニューボタン": 4,
              "音量DOWNボタン": 5,
              "音量UPボタン": 6,
              "検索ボタン": 7
            }
          }
        ]
      }
    },
    {
      "c": 701,
      "n": "十字キー / Dpad",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "ボタン",
            "p": { "上": 0, "下": 1, "左": 2, "右": 3, "中": 4 }
          },
          { "a": "Int", "u": 1, "s": "1:10", "m": "繰り返し回数" }
        ]
      }
    },
    {
      "c": 702,
      "n": "文字入力 / Type",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:2", "m": "文字" },
          { "a": "Int", "u": 1, "s": "1:10", "m": "繰り返し回数" }
        ]
      }
    },
    { "c": 987, "n": "キーボード / Soft Keyboard", "p": { "p": [] } },
    { "c": 904, "n": "音声コマンド / Voice Command", "p": { "p": [] } },
    {
      "c": 443,
      "n": "メディア操作 / Media Control",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": {
              "次へ": 0,
              "一時停止": 1,
              "前へ": 2,
              "一時停止の切替え": 3,
              "停止": 4,
              "再生 [擬似的にのみ]": 5,
              "巻き戻し": 6,
              "前へ早回し": 7
            }
          },
          { "a": "Int", "u": 1, "s": "true", "m": "メディアボタンを模倣する" },
          { "a": "App", "u": 2, "s": "", "m": "パッケージ/アプリ名" },
          { "a": "Int", "u": 3, "s": "false", "m": "可能なら通知を使用する" }
        ]
      }
    },
    {
      "c": 189,
      "n": "画像を切り取る / Crop Image",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:100:0", "m": "左から (%)" },
          { "a": "Int", "u": 1, "s": "0:100:0", "m": "右から (%)" },
          { "a": "Int", "u": 2, "s": "0:100:0", "m": "上から (%)" },
          { "a": "Int", "u": 3, "s": "0:100:0", "m": "下から (%)" }
        ]
      }
    },
    {
      "c": 190,
      "n": "画像を反転する / Flip Image",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "方向", "p": { "水平": 0, "垂直": 1 } }] }
    },
    {
      "c": 193,
      "n": "画像のサイズ変更 / Resize Image",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "幅" },
          { "a": "Int", "u": 1, "s": "", "m": "高さ" }
        ]
      }
    },
    {
      "c": 188,
      "n": "画像を読み込む / Load Image",
      "p": {
        "p": [
          { "a": "Img", "u": 0, "s": "?", "m": "情報取得元" },
          { "a": "Int", "u": 1, "s": "10:99999", "m": "最大の幅／高さ" },
          { "a": "Int", "u": 2, "s": "", "m": "EXIF の向きを優先" }
        ]
      }
    },
    {
      "c": 185,
      "n": "画像にフィルター / Filter Image",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": {
              "白黒": 0,
              "青を強調": 1,
              "緑を強調": 2,
              "赤を強調": 3,
              "グレースケール": 4,
              "不透明度の設定": 5
            }
          },
          { "a": "Int", "u": 1, "s": "1:255:200", "m": "値" }
        ]
      }
    },
    {
      "c": 187,
      "n": "画像を保存する / Save Image",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "1:100:85", "m": "画質" },
          { "a": "Int", "u": 2, "s": "true", "m": "終了後メモリーから削除する" }
        ]
      }
    },
    {
      "c": 191,
      "n": "画像を回転する / Rotate Image",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "方向", "p": { "左": 0, "右": 1 } },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "角度",
            "p": { "45": 0, "90": 1, "135": 2, "180": 3 }
          }
        ]
      }
    },
    {
      "c": 490,
      "n": "メディアボタンの操作イベント",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "アクション", "p": { "つかむ": 0, "放す": 1 } },
          { "a": "Int", "u": 1, "s": "", "m": "新しい API を使用する" }
        ]
      }
    },
    {
      "c": 445,
      "n": "音楽再生 / Music Play",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "0:300", "m": "始点" },
          { "a": "Int", "u": 2, "s": "", "m": "ループ" },
          {
            "a": "Int",
            "u": 3,
            "s": "0:0:3",
            "m": "出力先",
            "p": {
              "通話音": 0,
              "システム音": 1,
              "電話着信音": 2,
              "メディア音": 3,
              "アラーム音": 4,
              "通知音": 5
            }
          },
          { "a": "Int", "u": 4, "s": "true", "m": "すぐに次のタスクに進む" }
        ]
      }
    },
    {
      "c": 447,
      "n": "音楽再生(フォルダ) / Music Play Dir",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "d:2", "m": "ディレクトリ" },
          { "a": "Int", "u": 1, "s": "", "m": "子ディレクトリ" },
          { "a": "Int", "u": 2, "s": "", "m": "音声のみ" },
          { "a": "Int", "u": 3, "s": "", "m": "ランダム" },
          { "a": "Int", "u": 4, "s": "", "m": "フラッシュ表示で通知" },
          { "a": "Int", "u": 5, "s": "0:60", "m": "最大トラック数" }
        ]
      }
    },
    {
      "c": 451,
      "n": "音楽を飛ばす / Music Skip",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "0:300:5", "m": "行き先" }] }
    },
    {
      "c": 453,
      "n": "音楽を戻す / Music Back",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "0:300:5", "m": "行き先" }] }
    },
    {
      "c": 449,
      "n": "音楽を止める / Music Stop",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "ディレクトリ消去" }] }
    },
    {
      "c": 171,
      "n": "ビープ音 / Beep",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "20:16000:8000", "m": "周波数" },
          { "a": "Int", "u": 1, "s": "1:10000:1000", "m": "継続時間" },
          { "a": "Int", "u": 2, "s": "1:100:50", "m": "振幅" },
          {
            "a": "Int",
            "u": 3,
            "s": "0:0:3",
            "m": "出力先",
            "p": {
              "通話音": 0,
              "システム音": 1,
              "電話着信音": 2,
              "メディア音": 3,
              "アラーム音": 4,
              "通知音": 5
            }
          },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "指定時刻に実行" }
        ]
      }
    },
    {
      "c": 172,
      "n": "モールス信号 / Morse",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "文字" },
          { "a": "Int", "u": 1, "s": "20:16000:4000", "m": "周波数" },
          { "a": "Int", "u": 2, "s": "1:100:80", "m": "速度" },
          { "a": "Int", "u": 3, "s": "1:100:50", "m": "振幅" },
          {
            "a": "Int",
            "u": 4,
            "s": "0:0:3",
            "m": "出力先",
            "p": {
              "通話音": 0,
              "システム音": 1,
              "電話着信音": 2,
              "メディア音": 3,
              "アラーム音": 4,
              "通知音": 5
            }
          }
        ]
      }
    },
    {
      "c": 192,
      "n": "着信音を鳴らす / Play RIngtone",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "アラーム音": 0, "通知音": 1, "着信音": 2 }
          },
          { "a": "Str", "u": 1, "s": "rtn:1:?", "m": "鳴らす" },
          {
            "a": "Int",
            "u": 2,
            "s": "0:0:4",
            "m": "出力先",
            "p": {
              "通話音": 0,
              "システム音": 1,
              "電話着信音": 2,
              "メディア音": 3,
              "アラーム音": 4,
              "通知音": 5
            }
          }
        ]
      }
    },
    {
      "c": 101,
      "n": "写真を撮る / Take Photo",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "カメラ", "p": { "背面": 0, "前面": 1 } },
          { "a": "Str", "u": 1, "s": "t:1", "m": "ファイル名" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "命名規則",
            "p": { "無し": 0, "連番": 1, "日付": 2 }
          },
          { "a": "Int", "u": 3, "s": "true", "m": "ギャラリーに追加する" },
          { "a": "Int", "u": 4, "s": "", "m": "ひかえめ" },
          { "a": "Str", "u": 5, "s": "psize:1:?", "m": "解像度" },
          {
            "a": "Int",
            "u": 6,
            "s": "",
            "m": "シーンのモード",
            "p": {
              "自動": 0,
              "アクション": 1,
              "バーコード": 2,
              "浜辺": 3,
              "ロウソク光": 4,
              "花火": 5,
              "横長": 6,
              "夜景": 7,
              "夜景と人物": 8,
              "パーティー": 9,
              "縦長": 10,
              "雪": 11,
              "スポーツ": 12,
              "安定": 13,
              "日の入り": 14,
              "映画館": 15
            }
          },
          {
            "a": "Int",
            "u": 7,
            "s": "",
            "m": "ホワイトバランス",
            "p": {
              "自動": 0,
              "曇り": 1,
              "昼光": 2,
              "蛍光灯": 3,
              "白熱灯": 4,
              "日陰": 5,
              "夕暮れ": 6,
              "暖かい蛍光灯": 7
            }
          },
          {
            "a": "Int",
            "u": 8,
            "s": "",
            "m": "フラッシュのモード",
            "p": { "自動": 0, "オフ": 1, "オン": 2, "赤目": 3, "懐中電灯 / Torch": 4 }
          },
          {
            "a": "Int",
            "u": 9,
            "s": "",
            "m": "焦点合わせのモード",
            "p": { "自動": 0, "固定": 1, "マクロ": 2, "無限大": 3, "EDOF": 4, "切れ目なく": 5 }
          }
        ]
      }
    },
    {
      "c": 176,
      "n": "スクリーンショットを撮る / Take Screenshot",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          { "a": "Int", "u": 1, "s": "true", "m": "ギャラリーに追加する" }
        ]
      }
    },
    {
      "c": 455,
      "n": "録音する / Record Audio",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:2", "m": "ファイル" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "情報取得元",
            "p": { "デフォルト": 0, "マイク": 1, "発信電話": 2, "受信電話": 3, "通話": 4 }
          },
          { "a": "Int", "u": 2, "s": "0:500", "m": "最大サイズ" },
          {
            "a": "Int",
            "u": 3,
            "s": "",
            "m": "コーデック",
            "p": { "AMR Narrowband": 0, "AMR Wideband": 1, "AAC": 2 }
          },
          {
            "a": "Int",
            "u": 4,
            "s": "",
            "m": "書式",
            "p": { "MP4": 0, "3GPP": 1, "AMR Narrowband": 2, "AMR Wideband": 3 }
          }
        ]
      }
    },
    { "c": 657, "n": "録音を停止 / Record Audio Stop", "p": { "p": [] } },
    {
      "c": 457,
      "n": "デフォルトの着信音 / Default Ringtone",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "アラーム音": 0, "通知音": 1, "着信音": 2 }
          },
          { "a": "Str", "u": 1, "s": "rtn:1", "m": "鳴らす" }
        ]
      }
    },
    {
      "c": 459,
      "n": "メディアのスキャン / Scan Media",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "f:2:?", "m": "ファイル" }] }
    },
    {
      "c": 877,
      "n": "インテントを送信 / Send Intent",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1:?", "m": "アクション" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "カテゴリー",
            "p": {
              "None": 0,
              "Default": 1,
              "Alt": 2,
              "Browsable": 3,
              "Car Dock": 4,
              "Desk Dock": 5,
              "Home": 6,
              "Info": 7,
              "Launcher": 8,
              "Preference": 9,
              "Selected Alt": 10,
              "Tab": 11,
              "Test": 12,
              "Cardboard": 13
            }
          },
          { "a": "Str", "u": 2, "s": "mime:1:?", "m": "MIME タイプ" },
          { "a": "Str", "u": 3, "s": "t:4:?", "m": "データ" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "Extra" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "Extra" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "Extra" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "パッケージ" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "クラス" },
          {
            "a": "Int",
            "u": 9,
            "s": "",
            "m": "対象",
            "p": { "Broadcast Receiver": 0, "Activity": 1, "Service": 2 }
          }
        ]
      }
    },
    {
      "c": 901,
      "n": "現在地の取得を停止 / Stop Location",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "情報取得元",
            "p": { "GPS": 0, "ネット回線": 1, "どれでも": 2 }
          }
        ]
      }
    },
    {
      "c": 902,
      "n": "現在地の取得 / Get Location",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "情報取得元",
            "p": { "GPS": 0, "ネット回線": 1, "どれでも": 2 }
          },
          { "a": "Int", "u": 1, "s": "10:240:100", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 2, "s": "", "m": "すぐに次のタスクに進む" },
          { "a": "Int", "u": 3, "s": "", "m": "追跡を継続する" }
        ]
      }
    },
    {
      "c": 915,
      "n": "CPU",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "CPU",
            "p": { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6 }
          },
          { "a": "Str", "u": 1, "s": "cpug:1", "m": "調速機構" },
          { "a": "Int", "u": 2, "s": "", "m": "最低周波数" },
          { "a": "Int", "u": 3, "s": "", "m": "最高周波数" }
        ]
      }
    },
    { "c": 332, "n": "GPS", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] } },
    {
      "c": 59,
      "n": "再起動 / Reboot",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "通常": 0, "リカバリー": 1, "ブートローダー": 2, "シャットダウン": 3 }
          }
        ]
      }
    },
    {
      "c": 112,
      "n": "SL4A のスクリプト実行 / Run SL4A Script",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "r:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "", "m": "ターミナル" },
          { "a": "Str", "u": 2, "s": "t:2:?", "m": "変数を渡す" }
        ]
      }
    },
    {
      "c": 667,
      "n": "SQL クエリー / SQL Query",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "無加工": 0, "書式化": 1, "URI 形式にされた": 2 }
          },
          { "a": "Str", "u": 1, "s": "f:1", "m": "ファイル" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "表" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "列" },
          { "a": "Str", "u": 4, "s": "t:5:?", "m": "クエリー" },
          { "a": "Str", "u": 5, "s": "t:3:?", "m": "選択パラメーター" },
          { "a": "Str", "u": 6, "s": "t:3:?", "m": "並び順" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "出力列の区切り" },
          {
            "a": "Str",
            "u": 8,
            "s": "uvar:1",
            "m": "変数の配列",
            "d": "This field is a **String** and is **mandatory** and must NOT be empty. It should be the variable \u0027%rows\u0027 or a more suitable name for the situation, if possible. The result rows of the query are stored in the specified array with a row at each index. The columns within each row are separated by the Output Column Divider, if needed."
          },
          { "a": "Int", "u": 9, "s": "", "m": "ルート権限使用" },
          { "a": "Int", "u": 10, "s": "true", "m": "グローバル名前空間を使用" }
        ]
      },
      "d": "If the user requests database file creation or the file may not exist, you MUST first use the `Write File` action – code 410, with arg0\u003d\u0027file path variable\u0027, empty text for arg1, arg2\u003d0, arg3\u003d0 – to create an empty database file at the target path before attempting"
    },
    {
      "c": 664,
      "n": "Java 関数 / Java Function",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "jp:1:?", "m": "リターン / Return" },
          { "a": "Str", "u": 1, "s": "jc:1:?", "m": "Class または Object" },
          { "a": "Str", "u": 2, "s": "jfu:3", "m": "関数" },
          { "a": "Str", "u": 3, "s": "jp:1:?", "m": "引数" },
          { "a": "Str", "u": 4, "s": "jp:1:?", "m": "引数" },
          { "a": "Str", "u": 5, "s": "jp:1:?", "m": "引数" },
          { "a": "Str", "u": 6, "s": "jp:1:?", "m": "引数" },
          { "a": "Str", "u": 7, "s": "jp:1:?", "m": "引数" },
          { "a": "Str", "u": 8, "s": "jp:1:?", "m": "引数" },
          { "a": "Str", "u": 9, "s": "jp:1:?", "m": "引数" }
        ]
      }
    },
    {
      "c": 665,
      "n": "Java オブジェクト / Java Object",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "モード", "p": { "削除": 0 } },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "名前" }
        ]
      }
    },
    {
      "c": 123,
      "n": "シェルで実行 / Run Shell",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "adbsc:3", "m": "コマンド" },
          { "a": "Int", "u": 1, "s": "0:120", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 2, "s": "", "m": "ルート権限使用" },
          { "a": "Str", "u": 3, "s": "uvar:1:?", "m": "出力の保存先" },
          { "a": "Str", "u": 4, "s": "uvar:1:?", "m": "エラーの保存先" },
          { "a": "Str", "u": 5, "s": "uvar:1:?", "m": "結果の保存先" },
          { "a": "Int", "u": 6, "s": "true", "m": "グローバル名前空間を使用" },
          { "a": "Int", "u": 7, "s": "false", "m": "Tasker設定を使用" },
          { "a": "Int", "u": 8, "s": "", "m": "Shizukuを使用" }
        ]
      }
    },
    {
      "c": 124,
      "n": "再マウント / Remount",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "パス", "p": { "/system": 0 } },
          { "a": "Int", "u": 1, "s": "", "m": "書き込み可能" }
        ]
      }
    },
    {
      "c": 559,
      "n": "読み上げ / Say",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "s:4", "m": "文字" },
          { "a": "Str", "u": 1, "s": "l:1", "m": "エンジン:声質" },
          {
            "a": "Int",
            "u": 2,
            "s": "0:0:3",
            "m": "出力先",
            "p": {
              "通話音": 0,
              "システム音": 1,
              "電話着信音": 2,
              "メディア音": 3,
              "アラーム音": 4,
              "通知音": 5
            }
          },
          { "a": "Int", "u": 3, "s": "1:10:5", "m": "ピッチ" },
          { "a": "Int", "u": 4, "s": "1:10:5", "m": "速度" },
          { "a": "Int", "u": 5, "s": "true", "m": "音声の行き先を優先する" },
          { "a": "Int", "u": 6, "s": "", "m": "ネットワーク" },
          { "a": "Int", "u": 7, "s": "", "m": "すぐに次のタスクに進む" }
        ]
      }
    },
    {
      "c": 699,
      "n": "読み上げてファイルに保存 / Say To File",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "s:4", "m": "文字" },
          { "a": "Str", "u": 1, "s": "l:1", "m": "エンジン:声質" },
          { "a": "Str", "u": 2, "s": "d:2", "m": "ファイル" },
          { "a": "Int", "u": 3, "s": "1:10:5", "m": "ピッチ" },
          { "a": "Int", "u": 4, "s": "1:10:5", "m": "速度" },
          { "a": "Int", "u": 5, "s": "", "m": "ネットワーク" },
          { "a": "Int", "u": 6, "s": "", "m": "すぐに次のタスクに進む" }
        ]
      }
    },
    { "c": 697, "n": "読み上げ停止 / Shut Up", "p": { "p": [] } },
    {
      "c": 100,
      "n": "検索 / Search",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "へ" },
          { "a": "Int", "u": 1, "s": "", "m": "ウェブ検索" }
        ]
      }
    },
    {
      "c": 161,
      "n": "アプリショートカット / Setup App Shortcuts",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "m:1:?", "m": "タスク" },
          { "a": "Str", "u": 1, "s": "m:1:?", "m": "タスク" },
          { "a": "Str", "u": 2, "s": "m:1:?", "m": "タスク" },
          { "a": "Str", "u": 3, "s": "m:1:?", "m": "タスク" }
        ]
      }
    },
    {
      "c": 162,
      "n": "クイック タイルの設定 / Setup Quick Setting",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "電話番号", "p": { "1日": 0, "2日": 1, "3日": 2 } },
          { "a": "Str", "u": 1, "s": "m:1:?", "m": "タスク" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "状態",
            "p": { "アクティブ": 0, "非アクティブ": 1, "無効状態": 2 }
          },
          { "a": "Int", "u": 3, "s": "", "m": "ロックされたデバイスで使用可能" },
          { "a": "Str", "u": 4, "s": "m:1:?", "m": "長押しタスク" },
          { "a": "Str", "u": 5, "s": "m:1:?", "m": "ダブルクリックタスク" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "副題" },
          { "a": "Str", "u": 7, "s": "img:2:?", "m": "アイコン" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "ラベル" },
          { "a": "Str", "u": 9, "s": "t:1:?", "m": "コマンド" },
          { "a": "Str", "u": 10, "s": "t:1:?", "m": "長押しコマンド" },
          { "a": "Str", "u": 11, "s": "t:1:?", "m": "ダブルクリックコマンド" },
          { "a": "Str", "u": 12, "s": "t:1:?", "m": "コマンド接頭語" }
        ]
      }
    },
    {
      "c": 142,
      "n": "タスク編集 / Edit Task",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "m:1", "m": "タスク" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "アクション" }
        ]
      }
    },
    {
      "c": 147,
      "n": "設定を表示 / Show Prefs",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "段落",
            "p": { "操作画面": 0, "監視": 1, "アクション": 2, "その他": 3 }
          }
        ]
      }
    },
    { "c": 148, "n": "実行ログを表示 / Show Runlog", "p": { "p": [] } },
    {
      "c": 157,
      "n": "クイック タイルに追加 / Quick Setting Add",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1", "m": "ラベル" },
          { "a": "Img", "u": 1, "s": "", "m": "アイコン" },
          { "a": "Int", "u": 2, "s": "true", "m": "クリックでパネルを閉じる" }
        ]
      }
    },
    {
      "c": 158,
      "n": "クイック タイルの除去 / Quick Setting Remove",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "w:1", "m": "ラベル" }] }
    },
    {
      "c": 440,
      "n": "タイムゾーンの指定 / Set Timezone",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "tz:1", "m": "これに" }] }
    },
    {
      "c": 173,
      "n": "ネットワークアクセス許可 / Network Access",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "全て許可": 0, "許可": 1, "全て拒否": 2, "拒否": 3 }
          },
          { "a": "App", "u": 1, "s": "", "m": "パッケージ/アプリ名" }
        ]
      }
    },
    {
      "c": 331,
      "n": "自動同期 / Auto-Sync",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    { "c": 294, "n": "Bluetooth", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] } },
    {
      "c": 346,
      "n": "電話の調査 / Test Phone",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "連絡先 / 住所 - 自宅": 0,
              "連絡先 / 住所 - 勤務先": 1,
              "連絡先 / 誕生日": 2,
              "連絡先 / メールアドレス": 3,
              "連絡先 / 氏名": 4,
              "連絡先 / ニックネーム": 5,
              "連絡先 / 所属": 6,
              "連絡先 / 写真 URI": 7,
              "連絡先 / サムネイル URL": 8
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 296,
      "n": "Bluetooth 通話 / BT Voice",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 295,
      "n": "Bluetooth ID",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "t:1", "m": "名前" }] }
    },
    {
      "c": 104,
      "n": "URL を開く / Browse URL",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:2", "m": "URL" },
          { "a": "App", "u": 1, "s": "", "m": "パッケージ/アプリ名" },
          { "a": "Int", "u": 2, "s": "", "m": "\u0027アプリで開く\u0027 ダイアログ" },
          { "a": "Str", "u": 3, "s": "t:1", "m": "\u0027アプリで開く\u0027 タイトル" }
        ]
      }
    },
    {
      "c": 125,
      "n": "メール作成 / Compose Email",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:2:?", "m": "宛先" },
          { "a": "Str", "u": 1, "s": "w:2:?", "m": "件名" },
          { "a": "Str", "u": 2, "s": "s:5:?", "m": "本文" }
        ]
      }
    },
    {
      "c": 118,
      "n": "HTTP: GET メソッド",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "サーバー:ポート" },
          { "a": "Str", "u": 1, "s": "t:2:?", "m": "パス" },
          { "a": "Str", "u": 2, "s": "t:3:?", "m": "クエリ文字列" },
          { "a": "Str", "u": 3, "s": "t:2:?", "m": "クッキー" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "User Agent" },
          { "a": "Int", "u": 5, "s": "1:120:10", "m": "タイムアウト" },
          { "a": "Str", "u": 6, "s": "mime:1:?", "m": "MIME タイプ" },
          { "a": "Str", "u": 7, "s": "f:2:?", "m": "出力先ファイル" },
          { "a": "Int", "u": 8, "s": "", "m": "全ての証明書も信頼する" }
        ]
      }
    },
    {
      "c": 117,
      "n": "HTTP: HEAD メソッド",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "サーバー:ポート" },
          { "a": "Str", "u": 1, "s": "t:2:?", "m": "パス" },
          { "a": "Str", "u": 2, "s": "t:3:?", "m": "クエリ文字列" },
          { "a": "Str", "u": 3, "s": "t:2:?", "m": "クッキー" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "User Agent" },
          { "a": "Int", "u": 5, "s": "1:120:10", "m": "タイムアウト" },
          { "a": "Int", "u": 6, "s": "", "m": "全ての証明書も信頼する" }
        ]
      }
    },
    {
      "c": 116,
      "n": "HTTP: POST メソッド",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "サーバー:ポート" },
          { "a": "Str", "u": 1, "s": "t:2:?", "m": "パス" },
          { "a": "Str", "u": 2, "s": "f:3:?", "m": "データ / ファイル" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "クッキー" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "User Agent" },
          { "a": "Int", "u": 5, "s": "1:120:10", "m": "タイムアウト" },
          { "a": "Str", "u": 6, "s": "mime:1:?", "m": "Content-Type" },
          { "a": "Str", "u": 7, "s": "f:2:?", "m": "出力先ファイル" },
          { "a": "Int", "u": 8, "s": "", "m": "全ての証明書も信頼する" }
        ]
      }
    },
    {
      "c": 450,
      "n": "APN Droid",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "有効" },
          { "a": "Int", "u": 1, "s": "", "m": "MMS を保持する" },
          { "a": "Int", "u": 2, "s": "", "m": "通知する" }
        ]
      }
    },
    {
      "c": 735,
      "n": "データ通信 2G/3G / Mobile Data",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "モード",
            "p": { "2G のみ": 0, "3G のみ": 1, "3G 優先": 2 }
          }
        ]
      }
    },
    {
      "c": 114,
      "n": "USB テザリング / USB Tether",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 341,
      "n": "通信の調査 / Test Net",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "接続方式": 0,
              "モバイル通信を有効": 1,
              "WiFi ステルスか": 2,
              "WiFi のMACアドレス": 3,
              "WiFi RSSI": 4,
              "WiFi SSID": 5,
              "Bluetooth ペアリング済みのアドレス": 6,
              "Bluetooth 機器が接続済みか": 7,
              "Bluetooth 機器名": 8,
              "Bluetooth 機器のクラス名": 9,
              "自動同期 / Auto-Sync": 10,
              "ローカルネットワークIPアドレス": 11
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 425,
      "n": "WiFi の状態",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 427,
      "n": "WiFi スリープ / WiFi Sleep",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "方針",
            "p": { "デフォルト": 0, "充電中はなし": 1, "なし": 2 }
          }
        ]
      }
    },
    { "c": 439, "n": "WiMAX", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] } },
    {
      "c": 90,
      "n": "発信する / Call",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:1:?", "m": "電話番号" },
          { "a": "Int", "u": 1, "s": "", "m": "自動ダイヤル" },
          { "a": "Str", "u": 2, "s": "simc:1:?", "m": "SIM カード" }
        ]
      }
    },
    {
      "c": 910,
      "n": "電話履歴 / Call Log",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "アクション",
            "p": {
              "閲覧する": 0,
              "不在着信を消去する": 1,
              "着信電話を消去する": 2,
              "発信電話を消去する": 3,
              "全て消去する": 4,
              "全て承認済みにする": 5,
              "全て既読にする": 6
            }
          }
        ]
      }
    },
    {
      "c": 95,
      "n": "発信制限 / Call Block",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:2:?", "m": "制限条件：この番号に一致" },
          { "a": "Int", "u": 1, "s": "", "m": "情報" }
        ]
      }
    },
    {
      "c": 97,
      "n": "発信振替 / Call Divert",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:2:?", "m": "振替条件：これに一致(パターンあり)" },
          { "a": "Str", "u": 1, "s": "pv:2", "m": "振替先" },
          { "a": "Int", "u": 2, "s": "", "m": "情報" }
        ]
      }
    },
    {
      "c": 99,
      "n": "発信制限解除 / Call Revert",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:1:?", "m": "電話番号" },
          { "a": "Int", "u": 1, "s": "", "m": "情報" }
        ]
      }
    },
    {
      "c": 111,
      "n": "MMS 作成 / Compose MMS",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:1:?", "m": "宛先" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "件名" },
          { "a": "Str", "u": 2, "s": "s:5:?", "m": "本文" },
          { "a": "Str", "u": 3, "s": "f:2", "m": "添付ファイル" }
        ]
      }
    },
    {
      "c": 250,
      "n": "SMS 作成 / Compose SMS",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:1:?", "m": "宛先" },
          { "a": "Str", "u": 1, "s": "s:5:?", "m": "本文" }
        ]
      }
    },
    {
      "c": 909,
      "n": "連絡先 / Contacts",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": { "スター付き": 0, "よく使う": 1, "スター付き＆よく使う": 2 }
          }
        ]
      }
    },
    {
      "c": 732,
      "n": "電波 / Radio",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 41,
      "n": "SMS 送信 / Send SMS",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:3", "m": "電話番号" },
          { "a": "Str", "u": 1, "s": "s:5", "m": "本文" },
          { "a": "Int", "u": 2, "s": "", "m": "メッセージアプリに保管する" },
          { "a": "Str", "u": 3, "s": "simc:1:?", "m": "SIM カード" },
          { "a": "Int", "u": 4, "s": "", "m": "結果出力を待つ" }
        ]
      }
    },
    {
      "c": 42,
      "n": "SMS でデータ送信 / Send Data SMS",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pv:3", "m": "電話番号" },
          { "a": "Int", "u": 1, "s": "0:65535:60000", "m": "ポート" },
          { "a": "Str", "u": 2, "s": "t:5", "m": "データ" }
        ]
      }
    },
    { "c": 734, "n": "サイレント(無音)着信音 / Silence Ringer", "p": { "p": [] } },
    { "c": 731, "n": "通話を開始 / Take Call", "p": { "p": [] } },
    { "c": 300, "n": "目印 / Anchor", "p": { "p": [] } },
    {
      "c": 544,
      "n": "タイマーウィジェット制御 / Timer Widget Control",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "at:1", "m": "名前" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "種類",
            "p": { "終わり": 0, "一時停止": 1, "再開": 2, "リセット": 3, "更新": 4 }
          }
        ]
      }
    },
    {
      "c": 153,
      "n": "データをインポート",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類", "p": { "タスク": 0, "設定": 1 } },
          { "a": "Int", "u": 1, "s": "", "m": "情報取得元", "p": { "変数": 0 } },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "変数" }
        ]
      }
    },
    {
      "c": 546,
      "n": "タイマーウィジェットの指定 / Timer Widget Set",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "at:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "0:59", "m": "秒" },
          { "a": "Int", "u": 2, "s": "0:59", "m": "分" },
          { "a": "Int", "u": 3, "s": "0:23", "m": "時間" },
          { "a": "Int", "u": 4, "s": "0:60", "m": "日" }
        ]
      }
    },
    {
      "c": 347,
      "n": "Tasker の調査",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "アクションが利用可能か": 0,
              "イベントが利用可能か": 1,
              "状態が利用可能か": 2,
              "グローバル変数一覧": 3,
              "ローカル変数一覧": 4,
              "プロファイル": 5,
              "シーン": 6,
              "タスク": 7,
              "タイマーウィジェットの残り時間": 8,
              "現在のタスク名": 9,
              "使用済みメモリ": 10,
              "プロジェクト": 11
            }
          },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 140,
      "n": "アイコンセット変更 / Change Icon Set",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "i:1:?", "m": "古い" },
          { "a": "Str", "u": 1, "s": "i:1", "m": "新しい" }
        ]
      }
    },
    {
      "c": 135,
      "n": "行き先 / Goto",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "種類",
            "p": {
              "アクション番号": 0,
              "アクションラベル": 1,
              "ループの始点": 2,
              "ループの終点": 3,
              "If の終了": 4
            }
          },
          { "a": "Int", "u": 1, "s": "1:60", "m": "電話番号" },
          { "a": "Str", "u": 2, "s": "w:1", "m": "ラベル" }
        ]
      }
    },
    { "c": 37, "n": "If 条件開始", "p": { "p": [] } },
    { "c": 43, "n": "Else", "p": { "p": [] } },
    { "c": 38, "n": "End If 条件終了", "p": { "p": [] } },
    {
      "c": 39,
      "n": "For (繰り返し開始)",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "項目" },
          { "a": "Int", "u": 2, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    { "c": 40, "n": "End For (繰り返し終了)", "p": { "p": [] } },
    {
      "c": 131,
      "n": "Javascript / JavaScript",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f:1", "m": "パス" },
          { "a": "Str", "u": 1, "s": "jsl:3:?", "m": "ライブラリ" },
          { "a": "Int", "u": 2, "s": "true", "m": "自動で終了する" },
          { "a": "Int", "u": 3, "s": "1:50:45", "m": "タイムアウト (秒)" }
        ]
      }
    },
    {
      "c": 129,
      "n": "Javascript (小) / JavaScriptlet",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "js:999", "m": "コード" },
          { "a": "Str", "u": 1, "s": "jsl:3:?", "m": "ライブラリ" },
          { "a": "Int", "u": 2, "s": "true", "m": "自動で終了する" },
          { "a": "Int", "u": 3, "s": "1:50:45", "m": "タイムアウト (秒)" }
        ]
      }
    },
    {
      "c": 130,
      "n": "タスク実行 / Perform Task",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "m:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "0:50", "m": "優先度" },
          { "a": "Str", "u": 2, "s": "t:3:?", "m": "パラメーター 1 (%par1)" },
          { "a": "Str", "u": 3, "s": "t:3:?", "m": "パラメーター 2 (%par2)" },
          { "a": "Str", "u": 4, "s": "uvar:1:?", "m": "戻り値の変数" },
          { "a": "Int", "u": 5, "s": "", "m": "停止" },
          { "a": "Int", "u": 6, "s": "", "m": "ローカル変数をパススルー" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "パススルー制限：" },
          { "a": "Int", "u": 8, "s": "", "m": "戻り値をリセット" },
          { "a": "Int", "u": 9, "s": "", "m": "変数の上書きを許可" },
          { "a": "Int", "u": 10, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    {
      "c": 159,
      "n": "プロファイルの状態 / Profile Status",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "prof:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "", "m": "セット", "p": { "オフ": 0, "オン": 1, "切替え": 2 } }
        ]
      }
    },
    {
      "c": 134,
      "n": "アクション要求 / Query Action",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "act:2:?", "m": "アクション" }] }
    },
    {
      "c": 152,
      "n": "ウィジェットアイコンを指定 / Set Widget Icon",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "a:1", "m": "名前" },
          { "a": "Img", "u": 1, "s": "", "m": "アイコン" }
        ]
      }
    },
    {
      "c": 155,
      "n": "ウィジェットにラベル付け / Set Widget Label",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "a:1", "m": "名前" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "ラベル" }
        ]
      }
    },
    { "c": 139, "n": "無効化 / Disable", "p": { "p": [] } },
    {
      "c": 138,
      "n": "Tasker アイコンを指定 / Set Tasker Icon",
      "p": { "p": [{ "a": "Img", "u": 0, "s": "", "m": "アイコン" }] }
    },
    {
      "c": 133,
      "n": "Tasker を設定 / Set Tasker Pref",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "セット",
            "p": {
              "サービスチェック (ミリ秒)": 0,
              "Bluetooth スキャン間隔": 1,
              "WiFi スキャン間隔": 2,
              "GPS チェック間隔": 3,
              "ネット位置情報のチェック間隔": 4,
              "GPS チェックのタイムアウト": 5,
              "画面消灯＋全てのチェック": 6,
              "画面消灯＋全てのチェックのタイムアウト": 7,
              "Bluetooth スキャンの最小時間": 8,
              "WiFi スキャンの最小時間": 9,
              "カメラの遅延 (ミリ秒)": 10,
              "基地局の問題回避策を使用する": 11,
              "ネット／基地局で画面をON": 12,
              "フォアグラウンドで実行 (この機器では効果なし)": 13,
              "加速度センサー": 14,
              "近接センサー": 15,
              "照度センサー": 16,
              "気圧センサー": 17,
              "温度センサー": 18,
              "湿度センサー": 19,
              "磁気センサー": 20,
              "歩数センサー": 21,
              "信頼性の高いアラームを使う": 22,
              "実行ログ": 23,
              "システムログにデバッグ出力する": 24,
              "内部ストレージにデバッグ出力する": 25,
              "ロックコード": 26,
              "アプリ検知方法": 27,
              "モーション検出を使用する": 28,
              "ADB Wifi Logcat": 29
            }
          },
          { "a": "Int", "u": 1, "s": "", "m": "値" },
          { "a": "Int", "u": 2, "s": "", "m": "値" }
        ]
      }
    },
    {
      "c": 137,
      "n": "停止 / Stop",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "エラーとして" },
          { "a": "Str", "u": 1, "s": "m:1:?", "m": "タスク" }
        ]
      }
    },
    {
      "c": 30,
      "n": "待機 / Wait",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:999", "m": "ミリ秒" },
          { "a": "Int", "u": 1, "s": "0:59", "m": "秒" },
          { "a": "Int", "u": 2, "s": "0:59", "m": "分" },
          { "a": "Int", "u": 3, "s": "0:23", "m": "時間" },
          { "a": "Int", "u": 4, "s": "0:60", "m": "日" }
        ]
      }
    },
    {
      "c": 35,
      "n": "待機終了 / Wait Until",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:999", "m": "ミリ秒" },
          { "a": "Int", "u": 1, "s": "0:59", "m": "秒" },
          { "a": "Int", "u": 2, "s": "0:59", "m": "分" },
          { "a": "Int", "u": 3, "s": "0:23", "m": "時間" },
          { "a": "Int", "u": 4, "s": "0:60", "m": "日" }
        ]
      }
    },
    {
      "c": 345,
      "n": "変数の調査 / Test Variable",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類", "p": { "長さ": 0 } },
          { "a": "Str", "u": 1, "s": "", "m": "データ" },
          { "a": "Str", "u": 2, "s": "uvar:1", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 355,
      "n": "配列に追加 / Array Push",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数の配列" },
          {
            "a": "Int",
            "u": 1,
            "s": "1:999999",
            "m": "位置",
            "d": "Is **mandatory** and **HAS** to be a value between 1 and 999999. This **MUST NOT** be left empty."
          },
          { "a": "Str", "u": 2, "s": "inpval:3", "m": "値" },
          { "a": "Int", "u": 3, "s": "", "m": "隙間を埋める" }
        ]
      }
    },
    {
      "c": 356,
      "n": "配列から取り出し / Array Pop",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数の配列" },
          { "a": "Int", "u": 1, "s": "1:999999", "m": "位置" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "保存先の変数" }
        ]
      }
    },
    {
      "c": 354,
      "n": "配列を作成 / Array Set",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数の配列" },
          { "a": "Str", "u": 1, "s": "t:3", "m": "値" },
          { "a": "Str", "u": 2, "s": "t:3:?", "m": "区切り文字" }
        ]
      },
      "d": "Sets the content of a **Variable Array**.\n**CRITICAL: For the `Splitter` parameter (arg2), you MUST use a highly unique string that is extremely unlikely to appear in the `Values` (arg1) and does NOT use percent signs (`%`) to avoid unintended Tasker variable substitution. Good choices are sequences like `§@§` or `\u003c|@_@|\u003e`.\nYou MUST then verify that this chosen literal splitter string does NOT exist anywhere within the `Values` (arg1) string.\nIf, in the rare case it does exist, you MUST choose a *different* highly unique, percent-sign-free splitter string and re-verify, until a safe splitter is found.\nIf no `Splitter` (arg2) is provided, Tasker defaults to a comma, which is UNSAFE if values contain commas."
    },
    {
      "c": 369,
      "n": "配列に処理 / Array Process",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数の配列" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "種類",
            "p": {
              "重複を除去する": 0,
              "反転": 1,
              "左回転": 2,
              "右回転": 3,
              "シャッフル": 4,
              "アルファベット昇順": 5,
              "アルファベット降順": 6,
              "アルファベット昇順(大小文字無視)": 7,
              "アルファベット降順(大小文字無視)": 8,
              "短い順": 9,
              "長い順": 10,
              "数値順(整数)": 11,
              "数値順(浮動小数点)": 12,
              "押しつぶす": 13
            }
          }
        ]
      }
    },
    {
      "c": 357,
      "n": "配列の消去 / Array Clear",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "uvar:1", "m": "変数の配列" }] }
    },
    {
      "c": 549,
      "n": "変数の消去 / Variable Clear",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1:?", "m": "名前" },
          { "a": "Int", "u": 1, "s": "", "m": "パターン一致" },
          { "a": "Int", "u": 2, "s": "", "m": "ローカル変数のみ" },
          { "a": "Int", "u": 3, "s": "", "m": "全ての変数を消去する" }
        ]
      }
    },
    {
      "c": 596,
      "n": "変数の変換 / Variable Convert",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "関数",
            "p": {
              "バイト → キロバイト": 0,
              "バイト → メガバイト": 1,
              "バイト → ギガバイト": 2,
              "日付と時刻 → 秒数": 3,
              "秒数 → 日付と時刻": 4,
              "秒数 → 日付と時刻 (中)": 5,
              "秒数 → 日付と時刻 (長)": 6,
              "HTML の本文": 7,
              "℃ → ℉": 8,
              "℉ → ℃": 9,
              "センチメートル → インチ": 10,
              "インチ → センチメートル": 11,
              "メートル → フィート": 12,
              "フィート → メートル": 13,
              "キログラム → ポンド": 14,
              "ポンド → キログラム": 15,
              "キロメートル → マイル": 16,
              "マイル → キロメートル": 17,
              "URL デコード": 18,
              "URL エンコード": 19,
              "2進数 → 10進数": 20,
              "10進数 → 2進数": 21,
              "16進数 → 10進数": 22,
              "10進数 → 16進数": 23,
              "Base64 エンコード": 24,
              "Base64 デコード": 25,
              "MD5 ハッシュ値": 26,
              "SHA1 ハッシュ値": 27,
              "小文字にする": 28,
              "大文字にする": 29,
              "1文字目を大文字にする": 30,
              "JSON Encode": 31
            }
          },
          { "a": "Str", "u": 2, "s": "uvar:1:?", "m": "結果の保存先" },
          { "a": "Int", "u": 3, "s": "", "m": "モード", "p": { "デフォルト": 0, "Base64 URL": 1 } }
        ]
      }
    },
    {
      "c": 890,
      "n": "変数から引く / Variable Subtract",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "1:60", "m": "値" },
          { "a": "Int", "u": 2, "s": "", "m": "巻き戻る" }
        ]
      }
    },
    {
      "c": 888,
      "n": "変数に足す / Variable Add",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "1:60", "m": "値" },
          { "a": "Int", "u": 2, "s": "", "m": "巻き戻る" }
        ]
      }
    },
    {
      "c": 592,
      "n": "変数を連結 / Variable Join",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Str", "u": 1, "s": "t:3:?", "m": "結合文字" },
          { "a": "Int", "u": 2, "s": "", "m": "部品を削除する" }
        ]
      }
    },
    {
      "c": 597,
      "n": "変数の切り出し / Variable Section",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "1:100:1", "m": "これ以上" },
          { "a": "Int", "u": 2, "s": "1:100:1", "m": "長さ" },
          { "a": "Int", "u": 3, "s": "", "m": "フィット調整する" },
          { "a": "Str", "u": 4, "s": "uvar:1:?", "m": "結果の保存先" }
        ]
      }
    },
    {
      "c": 595,
      "n": "変数を要求 / Variable Query",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:3:?", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "uvar:1", "m": "変数" },
          {
            "a": "Int",
            "u": 2,
            "s": "",
            "m": "入力方式",
            "p": {
              "標準文字": 0,
              "Caps / 単語": 1,
              "Caps / 全て": 2,
              "数字 / 実数": 3,
              "数字 / 整数": 4,
              "パスワード": 5,
              "電話番号": 6,
              "パスコード": 7
            }
          },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "デフォルト" },
          { "a": "Str", "u": 4, "s": "b:2:?", "m": "背景画像" },
          { "a": "Str", "u": 5, "s": "sname", "m": "配置方法" },
          { "a": "Int", "u": 6, "s": "1:600:40", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 7, "s": "true", "m": "キーガードの上に表示する" }
        ]
      }
    },
    {
      "c": 598,
      "n": "変数内を検索や置換 / Variable Search Replace",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "検索 / Search" },
          { "a": "Int", "u": 2, "s": "", "m": "大小文字無視" },
          { "a": "Int", "u": 3, "s": "", "m": "複数行" },
          { "a": "Int", "u": 4, "s": "", "m": "1つだけ一致させる" },
          { "a": "Str", "u": 5, "s": "uvar:1:?", "m": "一致を配列に保存する" },
          { "a": "Int", "u": 6, "s": "", "m": "一致を置換する" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "置換先" }
        ]
      }
    },
    {
      "c": 547,
      "n": "変数を設定 / Variable Set",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Str", "u": 1, "s": "inpval:3", "m": "これに" },
          { "a": "Int", "u": 2, "s": "", "m": "変数に再帰呼び出し" },
          { "a": "Int", "u": 3, "s": "", "m": "計算する" },
          { "a": "Int", "u": 4, "s": "", "m": "追記する" },
          { "a": "Int", "u": 5, "s": "0:10:3", "m": "四捨五入する桁" },
          { "a": "Int", "u": 6, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      }
    },
    {
      "c": 590,
      "n": "変数を分割 / Variable Split",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Str", "u": 1, "s": "t:3:?", "m": "区切り文字" },
          { "a": "Int", "u": 2, "s": "", "m": "元を削除する" },
          { "a": "Int", "u": 3, "s": "", "m": "正規表現" }
        ]
      }
    },
    {
      "c": 545,
      "n": "変数をランダム化 / Variable Randomize",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "uvar:1", "m": "名前" },
          { "a": "Int", "u": 1, "s": "", "m": "最小" },
          { "a": "Int", "u": 2, "s": "", "m": "最大" }
        ]
      }
    },
    {
      "c": 558,
      "n": "Android Notifier",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "t:4", "m": "本文" }
        ]
      }
    },
    {
      "c": 371,
      "n": "Astrid",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": { "Google Tasks 同期": 0, "Producteev 同期": 1, "Act.fm 同期": 2 }
          }
        ]
      }
    },
    {
      "c": 555,
      "n": "BeyondPod",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": {
              "スマート再生開始": 0,
              "スマート再生を更新": 1,
              "再生": 2,
              "一時停止": 3,
              "前の曲を再生": 4,
              "前に進める": 5,
              "後ろに戻す": 6,
              "終わりまで飛ばす": 7,
              "次の曲を再生": 8,
              "再生速度(標準)": 9,
              "再生速度 1倍": 10,
              "再生速度 2倍": 11
            }
          }
        ]
      }
    },
    {
      "c": 568,
      "n": "DailyRoads Voyager",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": {
              "動画開始": 0,
              "動画終了": 1,
              "動画保留": 2,
              "写真開始": 3,
              "写真終了": 4,
              "アプリ終了": 5
            }
          }
        ]
      }
    },
    {
      "c": 599,
      "n": "Due Today",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "コマンド", "p": { "同期": 0 } }] }
    },
    {
      "c": 911,
      "n": "Gentle Alarm",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "w:1:?", "m": "名前" },
          { "a": "Int", "u": 1, "s": "", "m": "セット" }
        ]
      }
    },
    {
      "c": 456,
      "n": "JD APN",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "セット",
            "p": { "APN 無効化": 0, "APN 有効化": 1, "Juice Defender 設定": 2 }
          }
        ]
      }
    },
    {
      "c": 395,
      "n": "JD ステータス",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "セット" }] }
    },
    {
      "c": 556,
      "n": "GrazeRSS",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": { "同期": 0, "同期キャンセル": 1, "変化したものだけ同期": 2 }
          }
        ]
      }
    },
    {
      "c": 643,
      "n": "OfficeTalk",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": { "予定の有無を指定": 0, "ログイン": 1, "ログアウト": 2 }
          },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "状態",
            "p": { "空き時間": 0, "取り込み中": 1, "離席中": 2, "オフライン": 3 }
          }
        ]
      }
    },
    {
      "c": 442,
      "n": "SleepBot",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "パンチ", "p": { "中": 0, "外": 1 } },
          { "a": "Str", "u": 1, "s": "t:4:?", "m": "ノート" }
        ]
      }
    },
    { "c": 553, "n": "SMS Backup+", "p": { "p": [] } },
    {
      "c": 444,
      "n": "TeslaLED",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "セット",
            "p": { "オフ": 0, "オン": 1, "切替え": 2 }
          },
          { "a": "Int", "u": 1, "s": "0:100:0", "m": "ストロボ (ヘルツ)" }
        ]
      }
    },
    {
      "c": 458,
      "n": "WidgetLocker",
      "p": {
        "p": [
          {
            "a": "Int",
            "u": 0,
            "s": "",
            "m": "コマンド",
            "p": { "有効": 0, "無効": 1, "保留": 2, "再開": 3, "活性化": 4, "ロック解除": 5 }
          }
        ]
      }
    },
    {
      "c": 794,
      "n": "Zoom: 位置 / Zoom Position",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "画面の向き",
            "p": { "全て": 0, "縦向き": 1, "横向き": 2 }
          },
          { "a": "Int", "u": 2, "s": "", "m": "X" },
          { "a": "Int", "u": 3, "s": "", "m": "Y" }
        ]
      }
    },
    {
      "c": 795,
      "n": "Zoom: サイズ / Zoom SIze",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          {
            "a": "Int",
            "u": 1,
            "s": "",
            "m": "画面の向き",
            "p": { "全て": 0, "縦向き": 1, "横向き": 2 }
          },
          { "a": "Int", "u": 2, "s": "", "m": "幅" },
          { "a": "Int", "u": 3, "s": "", "m": "高さ" }
        ]
      }
    },
    {
      "c": 793,
      "n": "Zoom: 状態 / Zoom State",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Int", "u": 1, "s": "1:20", "m": "状態" }
        ]
      }
    },
    {
      "c": 761,
      "n": "Zoom: 画像 / Zoom Image",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Str", "u": 1, "s": "iuri:3:?", "m": "URI" }
        ]
      }
    },
    {
      "c": 760,
      "n": "Zoom: 透明度 / Zoom Alpha",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Int", "u": 1, "s": "0:255:255", "m": "セット" }
        ]
      }
    },
    {
      "c": 740,
      "n": "Zoom: 文字 / Zoom Text",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Str", "u": 1, "s": "w:3", "m": "文字" }
        ]
      }
    },
    {
      "c": 741,
      "n": "Zoom: 文字サイズ / Zoom Text Size",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Int", "u": 1, "s": "6:160:20", "m": "文字のサイズ" }
        ]
      }
    },
    {
      "c": 742,
      "n": "Zoom: 文字色 / Zoom Text Colour",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Str", "u": 1, "s": "col:1", "m": "色" }
        ]
      }
    },
    {
      "c": 762,
      "n": "Zoom: 色 / Zoom Colour",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Str", "u": 1, "s": "col:1", "m": "色" },
          { "a": "Str", "u": 2, "s": "col:1", "m": "終了色" }
        ]
      }
    },
    {
      "c": 721,
      "n": "Zoom: 可視性 / Zom Visibility",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "zelem:1", "m": "要素" },
          { "a": "Int", "u": 1, "s": "", "m": "セット" }
        ]
      }
    }
  ]
}
```
