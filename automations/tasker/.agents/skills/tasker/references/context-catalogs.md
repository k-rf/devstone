# Tasker Context Catalogs & Trigger Specifications

## Event Context Catalog Data

- JSON defining available Tasker **Event** Contexts. Used for **Profiles**.
- Each object in this JSON represents one Event context and does NOT contain a `type` field.
- For each parameter within an Event context definition, the `dialog_type_id` field is **OPTIONAL**.
  If provided, it dictates the required input dialog type. If omitted, you (the AI) must infer the
  type.
- Each Event Context object MAY include an additional key `"output_variable_list"` containing an
  array of objects `{{"name": "%varname", "description": "..."}}`. Each object defines a variable
  the context makes available. The `name` MUST be the exact Tasker variable name.
- **CRITICAL EVENT DETAIL:** Regardless of `output_variable_list`, **ALL Event Contexts** defined in
  this catalog implicitly generate built-in variables `%evtprm1`, `%evtprm2`, ... corresponding
  sequentially to ALL their input parameters listed in the `parameter_catalog` (`p.p` array),
  starting from the first parameter in the list (which is often, but not always, a Bundle with
  `u: 0`). **Therefore, the parameter with `u: 0` corresponds to `%evtprm1`, the parameter with
  `u: 1` corresponds to `%evtprm2`, the parameter with `u: 2` corresponds to `%evtprm3`, and so
  on.** You **MUST** use this sequential mapping based on the parameter list order, not just the `u`
  value directly. You **MUST** know these variables are always available and form a **Variable
  Array** named `%evtprm`. **CRITICAL: You MUST generate arguments in the XML (`<Int>`, `<Str>`,
  `<Bundle>`, etc.) ONLY if they are explicitly listed in the `parameter_catalog` for that specific
  event `code`. Do not assume a default set of arguments (like a starting Bundle) exists if it is
  not defined in the catalog for that event.**

```json
{
  "c": [
    {
      "c": 2080,
      "n": "Bluetooth 接続",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "btn:1:?", "m": "名前" },
          { "a": "Str", "u": 2, "s": "bta:1:?", "m": "住所から地図" }
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
      "c": 2081,
      "n": "音楽曲が変わった",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "曲名" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "アルバム" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "アーティスト" },
          { "a": "Str", "u": 4, "s": "apppakc", "m": "パッケージ" },
          { "a": "Int", "u": 5, "s": "", "m": "種類" }
        ]
      },
      "o": {
        "v": [
          { "n": "%mt_album", "d": "アルバム" },
          { "n": "%mt_all_metadata", "d": "すべてのメタデータ" },
          { "n": "%mt_all_metadata_keys()", "d": "すべてのメタデータ" },
          { "n": "%mt_app", "d": "アプリ" },
          { "n": "%mt_art", "d": "アート作品" },
          { "n": "%mt_artist", "d": "アーティスト" },
          { "n": "%mt_duration", "d": "曲の長さ" },
          { "n": "%mt_duration_formatted", "d": "曲の長さ" },
          { "n": "%mt_genre", "d": "ジャンル" },
          { "n": "%mt_number_tracks", "d": "曲数" },
          { "n": "%mt_queue_icons()", "d": "再生待ちのアイコン" },
          { "n": "%mt_queue_titles()", "d": "再生待ちの曲名" },
          { "n": "%mt_rating", "d": "評価" },
          { "n": "%mt_state", "d": "状態" },
          { "n": "%mt_track", "d": "曲名" },
          { "n": "%mt_track_number", "d": "曲番号" },
          { "n": "%mt_year", "d": "年" },
          { "n": "%mt_playing", "d": "再生中" }
        ]
      }
    },
    { "c": 2083, "n": "行動モーション", "p": { "p": [] } },
    {
      "c": 2084,
      "n": "アラームが編集された",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "apppakc", "m": "パッケージ" }
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
      "c": 2085,
      "n": "Logcat 出力",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "コンポーネント" },
          { "a": "Str", "u": 2, "s": "t:8:?", "m": "絞り込み" },
          { "a": "Int", "u": 3, "s": "", "m": "grepでフィルターする（ヘルプ参照）" }
        ]
      },
      "d": "If the user wants to find a logcat on their device, the configuration screen of this event has a helper (magnifying glass icon) to help them out. In this situation the user should:- start the helper\n- do the action they want to monitor\n- stop the helper\n- pick the logcat entry from a list dialog",
      "o": { "v": [{ "n": "%lc_text", "d": "文字" }] }
    },
    {
      "c": 2088,
      "n": "いずれかのセンサー",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "種類" },
          { "a": "Int", "u": 2, "s": "100:15000:1000", "m": "間隔（ミリ秒）" },
          { "a": "Int", "u": 3, "s": "", "m": "間隔の種類（ヘルプ参照）" },
          { "a": "Int", "u": 4, "s": "", "m": "向きを度数に" }
        ]
      },
      "o": {
        "v": [
          { "n": "%as_accuracy", "d": "精度" },
          { "n": "%as_values()", "d": "値" },
          { "n": "%as_sensor_type", "d": "センサー種別" }
        ]
      }
    },
    {
      "c": 2089,
      "n": "HTTP リクエスト",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "1025:9999:1821", "m": "ポート" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "方式" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "パス" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "クイック返信" },
          { "a": "Int", "u": 5, "s": "1:9999:10", "m": "タイムアウト (秒)" },
          { "a": "Int", "u": 6, "s": "true", "m": "Wifi接続時のみ" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "ネットワーク名/MACアドレス" }
        ]
      },
      "o": {
        "v": [
          { "n": "%http_request_body", "d": "本文" },
          { "n": "%http_request_files()", "d": "ファイル" },
          { "n": "%http_request_headers()", "d": "ヘッダー" },
          { "n": "%http_request_ip_address_v4", "d": "IPアドレス v4" },
          { "n": "%http_request_method", "d": "方式" },
          { "n": "%http_request_multipart_names()", "d": "マルチパート名" },
          { "n": "%http_request_multipart_types()", "d": "マルチパートタイプ" },
          { "n": "%http_request_multipart_values()", "d": "マルチパート値" },
          { "n": "%http_request_path", "d": "パス" },
          { "n": "%http_request_port", "d": "ポート" },
          { "n": "%http_request_id", "d": "リクエストID" }
        ]
      }
    },
    {
      "c": 2091,
      "n": "コマンド",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1:?", "m": "コマンド" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "変数" },
          { "a": "Int", "u": 3, "s": "", "m": "最後の変数は配列です" },
          { "a": "Int", "u": 4, "s": "bosta", "m": "構造を出力 (JSONなど)" }
        ]
      },
      "o": {
        "v": [
          { "n": "%command_parameter", "d": "コマンドパラメーター" },
          { "n": "%command_parameters()", "d": "コマンドパラメーター" },
          { "n": "%command_prefix", "d": "Prefix" },
          { "n": "%command_text", "d": "完全なコマンド" }
        ]
      }
    },
    {
      "c": 2092,
      "n": "電源メニューを表示",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": { "v": [{ "n": "%pms_add_controls", "d": "コントロールを追加" }] }
    },
    {
      "c": 2093,
      "n": "アシスタント アクション",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t", "m": "コマンド" }
        ]
      },
      "o": { "v": [{ "n": "%aa_command", "d": "完全なコマンド" }] }
    },
    {
      "c": 2094,
      "n": "電話の監視",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "p", "m": "発信元(着信)" }
        ]
      },
      "o": {
        "v": [
          { "n": "%cs_capabilities", "d": "利用可能な機能" },
          { "n": "%cs_incoming", "d": "着信した電話" },
          { "n": "%cs_name", "d": "連絡先 / 氏名" },
          { "n": "%cs_number", "d": "電話番号" },
          { "n": "%cs_properties", "d": "プロパティ" }
        ]
      }
    },
    {
      "c": 2095,
      "n": "Tick",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "間隔（ミリ秒）" }
        ]
      }
    },
    {
      "c": 2096,
      "n": "スリープ中",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "0:100:85", "m": "最小信頼度" },
          { "a": "Int", "u": 2, "s": "1:6:2", "m": "最大光量" },
          { "a": "Int", "u": 3, "s": "1:6:2", "m": "最大モーション" }
        ]
      },
      "o": {
        "v": [
          { "n": "%sl_confidence", "d": "確信度" },
          { "n": "%sl_light", "d": "明るい色" },
          { "n": "%sl_motion", "d": "モーション" }
        ]
      }
    },
    {
      "c": 2097,
      "n": "クリップボードを変更した",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "true", "m": "Taskerによる設定を無視" }
        ]
      },
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
      "c": 2098,
      "n": "ユーザー補助サービス変更",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%asc_running_services()", "d": "実行中のアクセシビリティサービス" },
          {
            "n": "%asc_running_services_app_names()",
            "d": "実行中のアクセシビリティサービスのアプリ名"
          },
          {
            "n": "%asc_running_services_service_names()",
            "d": "実行中のアクセシビリティサービス名"
          }
        ]
      }
    },
    {
      "c": 2099,
      "n": "デバイスロック解除失敗",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": { "v": [{ "n": "%uf_failed_attempts", "d": "失敗したパスワード試行回数" }] }
    },
    {
      "c": 2100,
      "n": "リモートアクショントークン変更",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
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
      "c": 2101,
      "n": "共有受信",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "apppakc", "m": "パッケージ名" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "共有トリガー" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "件名" },
          { "a": "Str", "u": 4, "s": "t:1:?", "m": "文字" },
          { "a": "Str", "u": 5, "s": "t:1:?", "m": "ファイル" },
          { "a": "Str", "u": 6, "s": "t:1:?", "m": "MIME タイプ" },
          { "a": "Str", "u": 7, "s": "t:1:?", "m": "アクション" },
          { "a": "Str", "u": 8, "s": "t:1:?", "m": "カテゴリー" }
        ]
      },
      "o": {
        "v": [
          { "n": "%rs_action", "d": "アクション" },
          { "n": "%rs_all_extras", "d": "すべての追加情報 JSON" },
          { "n": "%rs_app_name", "d": "アプリ名" },
          { "n": "%rs_categories()", "d": "カテゴリー" },
          { "n": "%rs_files()", "d": "ファイル" },
          { "n": "%rs_flags", "d": "フラグ" },
          { "n": "%rs_identifier", "d": "識別子" },
          { "n": "%rs_mime_type", "d": "MIME タイプ" },
          { "n": "%rs_package_name", "d": "パッケージ名" },
          { "n": "%rs_share_trigger", "d": "共有トリガー" },
          { "n": "%rs_subject", "d": "件名" },
          { "n": "%rs_text", "d": "文字" },
          { "n": "%rs_title", "d": "タイトル" }
        ]
      }
    },
    {
      "c": 2102,
      "n": "カレンダー変更",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "", "m": "追加済み" },
          { "a": "Int", "u": 2, "s": "", "m": "更新済み" },
          { "a": "Int", "u": 3, "s": "", "m": "削除しました" },
          { "a": "Int", "u": 4, "s": "", "m": "その他" }
        ]
      },
      "o": {
        "v": [
          { "n": "%cc_event_ids_added()", "d": "Event Ids Added" },
          { "n": "%cc_event_ids_deleted()", "d": "Event Ids Deleted" },
          { "n": "%cc_event_ids_updated()", "d": "Event Ids Updated" }
        ]
      }
    },
    {
      "c": 2103,
      "n": "Extra Trigger",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%sa_extras", "d": "追加情報" },
          { "n": "%sa_referrer", "d": "Referrer" },
          { "n": "%sa_trigger_id", "d": "Trigger ID" },
          { "n": "%sa_trigger_package_name", "d": "Trigger Package Name" }
        ]
      }
    },
    {
      "c": 2077,
      "n": "セカンドアプリを開いた",
      "p": { "p": [{ "a": "Bundle", "u": 0, "s": "", "m": "出力変数" }] },
      "o": {
        "v": [
          { "n": "%sa_action", "d": "アクション" },
          { "n": "%sa_category", "d": "カテゴリー" },
          { "n": "%sa_extras", "d": "追加情報" }
        ]
      }
    },
    {
      "c": 2078,
      "n": "アプリが変更された",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "apppakc", "m": "パッケージ" }
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
    { "c": 203, "n": "バッテリー残量が変化", "p": { "p": [] } },
    { "c": 205, "n": "バッテリーが満充電", "p": { "p": [] } },
    { "c": 206, "n": "バッテリーが過熱", "p": { "p": [] } },
    {
      "c": 305,
      "n": "アラーム鳴動",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "t", "m": "ラベル" }] }
    },
    { "c": 306, "n": "アラームが完了", "p": { "p": [] } },
    { "c": 300, "n": "日付が設定された", "p": { "p": [] } },
    { "c": 302, "n": "日付／時刻が設定された", "p": { "p": [] } },
    { "c": 304, "n": "タイムゾーンが設定された", "p": { "p": [] } },
    { "c": 210, "n": "画面が消灯した", "p": { "p": [] } },
    { "c": 208, "n": "画面が点灯した", "p": { "p": [] } },
    { "c": 1000, "n": "画面がロック解除", "p": { "p": [] } },
    {
      "c": 230,
      "n": "ファイル属性が変更",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "f", "m": "ファイル" }] }
    },
    {
      "c": 224,
      "n": "ファイルを閉じた",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "f", "m": "ファイル" }] }
    },
    {
      "c": 228,
      "n": "ファイルを削除した",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "f", "m": "ファイル" }] }
    },
    {
      "c": 222,
      "n": "ファイルを編集した",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "f", "m": "ファイル" },
          { "a": "Str", "u": 1, "s": "fme", "m": "イベント" }
        ]
      }
    },
    {
      "c": 220,
      "n": "ファイルを移動した",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "f", "m": "ファイル" }] }
    },
    {
      "c": 226,
      "n": "ファイルを開いた",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "f", "m": "ファイル" }] }
    },
    {
      "c": 3000,
      "n": "ジェスチャー",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "", "m": "名前" },
          { "a": "Str", "u": 1, "s": "acc", "m": "パターン" }
        ]
      }
    },
    {
      "c": 3001,
      "n": "シェイク",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "軸" },
          { "a": "Int", "u": 1, "s": "", "m": "感度" },
          { "a": "Int", "u": 2, "s": "", "m": "継続時間" }
        ]
      }
    },
    {
      "c": 309,
      "n": "歩数センサー",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "1:999999:1", "m": "電話番号" }] }
    },
    {
      "c": 2003,
      "n": "電話の不在着信",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "p", "m": "発信元(着信)" }] }
    },
    { "c": 4, "n": "電話を使用していない", "p": { "p": [] } },
    { "c": 2, "n": "電話に応答した", "p": { "p": [] } },
    {
      "c": 6,
      "n": "電話が鳴っている",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "p", "m": "発信元(着信)" }] }
    },
    {
      "c": 8,
      "n": "データ付き SMS を受信した",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "sms", "m": "送信者" },
          { "a": "Int", "u": 1, "s": "0:65535:?", "m": "ポート" },
          { "a": "Str", "u": 2, "s": "t:3", "m": "データ" }
        ]
      }
    },
    {
      "c": 7,
      "n": "SMS を受信した",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "sms", "m": "送信者" },
          { "a": "Str", "u": 2, "s": "t", "m": "内容" },
          { "a": "Str", "u": 3, "s": "simc:1:?", "m": "SIM カード" },
          { "a": "Str", "u": 4, "s": "t", "m": "MMS本文" }
        ]
      }
    },
    {
      "c": 2010,
      "n": "SMS 送信失敗",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "sms", "m": "宛先" }] }
    },
    {
      "c": 2005,
      "n": "SMS 送信成功",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "sms", "m": "宛先" }] }
    },
    { "c": 215, "n": "ボタン: カメラ", "p": { "p": [] } },
    { "c": 216, "n": "ボタン: 検索長押し", "p": { "p": [] } },
    {
      "c": 134,
      "n": "SDカードがマウント(認識)",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t", "m": "カードのタイトル" },
          { "a": "Int", "u": 1, "s": "", "m": "周波数" }
        ]
      }
    },
    { "c": 136, "n": "SD カードを取り外した", "p": { "p": [] } },
    { "c": 135, "n": "SDカードがマウント解除", "p": { "p": [] } },
    {
      "c": 599,
      "n": "インテントを受信した",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:1:?", "m": "アクション" },
          { "a": "Int", "u": 1, "s": "", "m": "カテゴリー" },
          { "a": "Int", "u": 2, "s": "", "m": "カテゴリー" },
          { "a": "Str", "u": 3, "s": "t:1:?", "m": "スキーム" },
          { "a": "Str", "u": 4, "s": "mime:1:?", "m": "MIME タイプ" }
        ]
      }
    },
    { "c": 411, "n": "機器本体を起動した", "p": { "p": [] } },
    { "c": 413, "n": "機器本体がシャットダウン", "p": { "p": [] } },
    { "c": 422, "n": "機器ストレージ容量低下", "p": { "p": [] } },
    { "c": 429, "n": "言語設定が変更された", "p": { "p": [] } },
    {
      "c": 450,
      "n": "新しいアプリ",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pkgLabel", "m": "名前" },
          { "a": "Str", "u": 1, "s": "pkgName", "m": "パッケージ" }
        ]
      }
    },
    {
      "c": 453,
      "n": "アプリが更新された",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "pkgLabel", "m": "名前" },
          { "a": "Str", "u": 1, "s": "pkgName", "m": "パッケージ" }
        ]
      }
    },
    {
      "c": 451,
      "n": "アプリが削除された",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "pkgName", "m": "パッケージ" }] }
    },
    { "c": 307, "n": "監視が開始した", "p": { "p": [] } },
    {
      "c": 303,
      "n": "タイマーが変更された",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "m", "m": "タスク" },
          { "a": "Int", "u": 1, "s": "", "m": "種類" }
        ]
      }
    },
    { "c": 460, "n": "壁紙が変更された", "p": { "p": [] } },
    {
      "c": 3060,
      "n": "変数が消去された",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "var", "m": "変数" },
          { "a": "Int", "u": 1, "s": "", "m": "ユーザー定義変数のみ" }
        ]
      }
    },
    {
      "c": 3050,
      "n": "変数に値を格納した",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "var", "m": "変数" },
          { "a": "Str", "u": 1, "s": "inpval", "m": "値" },
          { "a": "Int", "u": 2, "s": "", "m": "ユーザー定義変数のみ" }
        ]
      }
    },
    {
      "c": 201,
      "n": "アシストを求められた",
      "p": {
        "p": [
          { "a": "App", "u": 0, "s": "", "m": "アプリ" },
          { "a": "Str", "u": 1, "s": "t", "m": "URL" },
          { "a": "Str", "u": 2, "s": "t", "m": "テキスト" },
          { "a": "Str", "u": 3, "s": "t", "m": "追加情報" }
        ]
      }
    },
    {
      "c": 3071,
      "n": "Zoom をクリックした",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t", "m": "ウィジェット名" },
          { "a": "Str", "u": 1, "s": "t", "m": "要素名" }
        ]
      }
    },
    {
      "c": 463,
      "n": "新しいウィンドウが表示",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t", "m": "ラベル" },
          { "a": "Int", "u": 1, "s": "", "m": "ウィンドウの種類" }
        ]
      }
    },
    {
      "c": 461,
      "n": "通知が表示された",
      "p": {
        "p": [
          { "a": "App", "u": 0, "s": "", "m": "該当するアプリ" },
          { "a": "Str", "u": 1, "s": "t", "m": "タイトル" },
          { "a": "Str", "u": 2, "s": "t", "m": "文字" },
          { "a": "Str", "u": 3, "s": "t", "m": "サブテキスト" },
          { "a": "Str", "u": 4, "s": "t", "m": "メッセージ" },
          { "a": "Str", "u": 5, "s": "t", "m": "その他のテキスト" },
          { "a": "Str", "u": 6, "s": "ncat", "m": "カテゴリー" },
          { "a": "Int", "u": 7, "s": "true", "m": "新着のみ" }
        ]
      }
    },
    {
      "c": 464,
      "n": "通知が削除された",
      "p": {
        "p": [
          { "a": "App", "u": 0, "s": "", "m": "該当するアプリ" },
          { "a": "Str", "u": 1, "s": "t", "m": "タイトル" },
          { "a": "Str", "u": 2, "s": "t", "m": "文字" },
          { "a": "Str", "u": 3, "s": "t", "m": "サブテキスト" },
          { "a": "Str", "u": 4, "s": "t", "m": "その他のテキスト" },
          { "a": "Str", "u": 5, "s": "ncat", "m": "カテゴリー" }
        ]
      }
    },
    {
      "c": 2000,
      "n": "通知をクリックした",
      "p": {
        "p": [
          { "a": "App", "u": 0, "s": "", "m": "該当するアプリ" },
          { "a": "Str", "u": 1, "s": "t", "m": "タイトル" }
        ]
      }
    },
    {
      "c": 2050,
      "n": "クイック タイルをタップした",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "t", "m": "ラベル" }] }
    },
    {
      "c": 2075,
      "n": "カスタム設定",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "sset", "m": "名前" },
          { "a": "Str", "u": 2, "s": "t", "m": "値" }
        ]
      }
    },
    {
      "c": 2076,
      "n": "NFC タグ",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "nfctid", "m": "ID" },
          { "a": "Str", "u": 1, "s": "nfctcont", "m": "内容" }
        ]
      }
    },
    {
      "c": 2079,
      "n": "ボタン: 音量ボタンの長押し",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "buttprsti", "m": "長押し時間 (ヘルプ参照)" }
        ]
      }
    },
    {
      "c": 425,
      "n": "K9 メール受信",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t", "m": "これ以上" },
          { "a": "Str", "u": 1, "s": "t", "m": "件名" },
          { "a": "Str", "u": 2, "s": "t", "m": "受信するアカウント" }
        ]
      }
    },
    {
      "c": 446,
      "n": "Gentle Alarm",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "イベント" },
          { "a": "Str", "u": 1, "s": "t", "m": "名前" },
          { "a": "Str", "u": 2, "s": "t", "m": "本文" },
          { "a": "Str", "u": 3, "s": "t", "m": "プロファイル" },
          { "a": "Int", "u": 4, "s": "", "m": "種類" }
        ]
      }
    },
    {
      "c": 428,
      "n": "Kaloer Clock",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "イベント" },
          { "a": "Str", "u": 1, "s": "t", "m": "名前" }
        ]
      }
    },
    {
      "c": 448,
      "n": "Notify My Android",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t", "m": "アプリ" },
          { "a": "Str", "u": 1, "s": "t", "m": "イベント" },
          { "a": "Str", "u": 2, "s": "t", "m": "説明" },
          { "a": "Str", "u": 3, "s": "t", "m": "URL" }
        ]
      }
    },
    {
      "c": 444,
      "n": "Pomodroido",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "イベント" }] }
    },
    {
      "c": 445,
      "n": "Radardroid",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "イベント" }] }
    },
    {
      "c": 447,
      "n": "Reddit Notify",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "イベント" },
          { "a": "Int", "u": 1, "s": "", "m": "電話番号" },
          { "a": "Str", "u": 2, "s": "t", "m": "本文" }
        ]
      }
    },
    {
      "c": 424,
      "n": "Screebl / TSC",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "範囲内" }] }
    },
    {
      "c": 426,
      "n": "Widget Locker",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "イベント" }] }
    },
    { "c": 427, "n": "OpenWatch", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "イベント" }] } }
  ]
}
```

## State Context Catalog Data

- JSON defining available Tasker **State** Contexts. Used for **Profiles**.
- Each object in this JSON represents one State context and does NOT contain a `type` field.
- For each parameter within a State context definition, the `dialog_type_id` field is **OPTIONAL**.
  If provided, it dictates the required input dialog type. If omitted, you (the AI) must infer the
  type.
- Each State Context object MAY include an additional key `"output_variable_list"` containing an
  array of objects `{{"name": "%varname", "description": "..."}}` defining variables the context
  makes available. The `name` MUST be the exact Tasker variable name. (State contexts do **not**
  implicitly generate `%evtprm` variables).

```json
{
  "c": [
    {
      "c": 154,
      "n": "稼働中のユーザー",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "0:999999:?", "m": "ユーザー ID" }] }
    },
    { "c": 100, "n": "機内モード", "p": { "p": [] } },
    { "c": 135, "n": "自動同期 / Auto-Sync", "p": { "p": [] } },
    {
      "c": 140,
      "n": "バッテリー残量",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:100", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:100", "m": "これに" }
        ]
      }
    },
    {
      "c": 141,
      "n": "バッテリー温度",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:2000", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:2000", "m": "これに" }
        ]
      }
    },
    {
      "c": 3,
      "n": "接続中の Bluetooth",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "btn:1:?", "m": "名前" },
          { "a": "Str", "u": 1, "s": "bta:1:?", "m": "住所から地図" }
        ]
      }
    },
    {
      "c": 2,
      "n": "Bluetooth の状態",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "状態" }] }
    },
    {
      "c": 4,
      "n": "近くの Bluetooth",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "btn:1:?", "m": "名前" },
          { "a": "Str", "u": 1, "s": "bta:1:?", "m": "住所から地図" },
          { "a": "Int", "u": 2, "s": "", "m": "機器の大分類" },
          { "a": "Int", "u": 3, "s": "", "m": "標準的な機器" },
          { "a": "Int", "u": 4, "s": "", "m": "Low-Energy (LE) 機器" },
          { "a": "Int", "u": 5, "s": "", "m": "未接続の機器" },
          { "a": "Int", "u": 6, "s": "", "m": "Bluetooth 切替え" }
        ]
      }
    },
    {
      "c": 5,
      "n": "カレンダーの項目",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "ctit:1:?", "m": "タイトル" },
          { "a": "Str", "u": 1, "s": "cloc:1:?", "m": "場所" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "説明" },
          { "a": "Int", "u": 3, "s": "", "m": "予定なし(空き時間)" },
          { "a": "Str", "u": 4, "s": "ccal:2:?", "m": "カレンダー" }
        ]
      }
    },
    {
      "c": 40,
      "n": "通話の状態",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "p:3:?", "m": "電話番号" }
        ]
      }
    },
    {
      "c": 7,
      "n": "近くの基地局",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "t:8", "m": "基地局 / 最後の信号" },
          { "a": "Str", "u": 1, "s": "t:4:?", "m": "無視する基地局" }
        ]
      }
    },
    { "c": 16, "n": "機器がアイドル(未使用)", "p": { "p": [] } },
    {
      "c": 122,
      "n": "画面の向き",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "次の値である" }] }
    },
    {
      "c": 123,
      "n": "画面の状態",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "次の値である" }] }
    },
    { "c": 80, "n": "ドック接続", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "種類" }] } },
    { "c": 175, "n": "スクリーンセーバー表示中", "p": { "p": [] } },
    {
      "c": 161,
      "n": "イーサネット接続",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "アクティブ" }] }
    },
    {
      "c": 30,
      "n": "ヘッドホン接続",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "種類" }] }
    },
    { "c": 12, "n": "HDMI 接続", "p": { "p": [] } },
    { "c": 50, "n": "キーボード取り外し", "p": { "p": [] } },
    {
      "c": 182,
      "n": "心拍数",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:20", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:250", "m": "これに" }
        ]
      }
    },
    {
      "c": 185,
      "n": "湿度",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:100", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:100", "m": "これに" }
        ]
      }
    },
    {
      "c": 103,
      "n": "照度",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:100", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:100", "m": "これに" }
        ]
      }
    },
    {
      "c": 106,
      "n": "磁場",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "軸" },
          { "a": "Int", "u": 1, "s": "0:1000", "m": "これ以上" },
          { "a": "Int", "u": 2, "s": "0:1000", "m": "これに" }
        ]
      }
    },
    {
      "c": 105,
      "n": "メディアボタン",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "ボタン" },
          { "a": "Int", "u": 1, "s": "", "m": "押されている" },
          { "a": "Int", "u": 2, "s": "", "m": "つかむ" },
          { "a": "Int", "u": 3, "s": "", "m": "イベントの停止" }
        ]
      }
    },
    {
      "c": 107,
      "n": "不在着信",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "p:3:?", "m": "発信元(着信)" }] }
    },
    {
      "c": 110,
      "n": "モバイルネットワーク",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "2G" },
          { "a": "Int", "u": 1, "s": "", "m": "3G" },
          { "a": "Int", "u": 2, "s": "", "m": "3G - HSPA" },
          { "a": "Int", "u": 3, "s": "", "m": "4G" },
          { "a": "Int", "u": 4, "s": "", "m": "5G" },
          { "a": "Int", "u": 5, "s": "", "m": "アクティブ" }
        ]
      }
    },
    { "c": 195, "n": "NFC の状態", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "状態" }] } },
    {
      "c": 120,
      "n": "画面の向き",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "次の値である" }] }
    },
    { "c": 148, "n": "ペン取り出し", "p": { "p": [] } },
    { "c": 149, "n": "ペンメニュー", "p": { "p": [] } },
    { "c": 10, "n": "電源", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "情報取得元" }] } },
    {
      "c": 14,
      "n": "バッテリー節約モード",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "有効" }] }
    },
    {
      "c": 104,
      "n": "気圧",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:2000", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:2000", "m": "これに" }
        ]
      }
    },
    { "c": 125, "n": "近接センサー", "p": { "p": [] } },
    {
      "c": 142,
      "n": "稼働中のプロファイル",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "prof:1", "m": "名前" }] }
    },
    {
      "c": 143,
      "n": "実行中のタスク",
      "p": { "p": [{ "a": "Str", "u": 0, "s": "m:1", "m": "名前" }] }
    },
    {
      "c": 145,
      "n": "電波強度",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:8", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:8", "m": "これに" }
        ]
      }
    },
    {
      "c": 180,
      "n": "温度",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "0:50", "m": "これ以上" },
          { "a": "Int", "u": 1, "s": "0:50", "m": "これに" }
        ]
      }
    },
    {
      "c": 147,
      "n": "未読 SMS",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "sms:2:?", "m": "送信者" },
          { "a": "Str", "u": 2, "s": "t:2:?", "m": "内容" }
        ]
      }
    },
    { "c": 150, "n": "USB 接続", "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "クラス" }] } },
    { "c": 165, "n": "変数の値", "p": { "p": [] } },
    {
      "c": 136,
      "n": "VPN に接続中",
      "p": { "p": [{ "a": "Int", "u": 0, "s": "", "m": "アクティブ" }] }
    },
    {
      "c": 160,
      "n": "WiFi 接続",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "ssid:3:?", "m": "SSID" },
          { "a": "Str", "u": 1, "s": "mac:1:?", "m": "MAC" },
          { "a": "Str", "u": 2, "s": "t:1:?", "m": "IP" },
          { "a": "Int", "u": 3, "s": "", "m": "アクティブ" }
        ]
      }
    },
    {
      "c": 186,
      "n": "カスタム設定",
      "p": {
        "p": [
          { "a": "Int", "u": 0, "s": "", "m": "種類" },
          { "a": "Str", "u": 1, "s": "sset:1", "m": "名前" },
          { "a": "Str", "u": 2, "s": "t:1", "m": "値" }
        ]
      }
    },
    {
      "c": 170,
      "n": "近くの WiFi",
      "p": {
        "p": [
          { "a": "Str", "u": 0, "s": "ssid:1:?", "m": "SSID" },
          { "a": "Str", "u": 1, "s": "mac:1:?", "m": "MAC" },
          { "a": "Str", "u": 2, "s": "let:1:?", "m": "利用可能な機能" },
          { "a": "Int", "u": 3, "s": "0:9", "m": "発動する最小の信号強度" },
          { "a": "Int", "u": 4, "s": "0:196:?", "m": "チャンネル" },
          { "a": "Int", "u": 5, "s": "", "m": "WiFi 切替え" }
        ]
      }
    },
    {
      "c": 192,
      "n": "スリープ中",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Int", "u": 1, "s": "0:100:85", "m": "最小信頼度" },
          { "a": "Int", "u": 2, "s": "1:6:2", "m": "最大光量" },
          { "a": "Int", "u": 3, "s": "1:6:2", "m": "最大モーション" }
        ]
      }
    },
    {
      "c": 193,
      "n": "Matterライト（実験的）",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "mattdevi:1", "m": "デバイスID/名前" }
        ]
      }
    },
    { "c": 194, "n": "仕事用プロファイル", "p": { "p": [] } },
    { "c": 198, "n": "Shizuku Available", "p": { "p": [] } },
    { "c": 188, "n": "暗色モード", "p": { "p": [] } },
    {
      "c": 190,
      "n": "いずれかのセンサー",
      "p": {
        "p": [
          { "a": "Bundle", "u": 0, "s": "", "m": "出力変数" },
          { "a": "Str", "u": 1, "s": "t:1", "m": "種類" },
          { "a": "Int", "u": 2, "s": "100:15000:1000", "m": "間隔（ミリ秒）" },
          { "a": "Int", "u": 3, "s": "", "m": "間隔の種類（ヘルプ参照）" },
          { "a": "Int", "u": 4, "s": "", "m": "向きを度数に" }
        ]
      }
    }
  ]
}
```

## Tasker Command System (General)

- **Purpose:** A flexible system for triggering Profiles based on custom commands sent from various
  Tasker actions or contexts. Primarily useful for creating dynamic actions or simplifying setups
  where one Profile can handle multiple variations of a request based on command parameters.
- **Mechanism:**
  - **Sending:** Commands are sent using actions like `Command` (code 385) or within parameters of
    other actions like `Set up Quick Setting Tile` (code 162, arg9/10/11) or `Widget v2` (code 461,
    arg13 JSON `command` property - _use only as fallback_).
  - **Receiving:** A Profile is created using the `Command` **Event** context (code 2091).
- **Command Syntax:** Commands typically use the format `prefix=:=value1=:=value2=:=...`
  - `prefix`: A unique identifier for the command type (e.g., `launchapp`, `setvolume`).
  - `=:=`: The standard separator between the prefix and subsequent values/parameters.
  - `value1`, `value2`, ...: The data being passed with the command.
- **Receiving Profile (`Command` Event - code 2091):**
  - `Command` parameter (arg1): Filters which commands trigger the profile. Uses **Pattern
    Matching**. **Crucially, you CANNOT use variables in this filter field itself.** Examples:
    `launchapp=:=*` (catches all launchapp commands), `setvolume=:=media=:=*` (catches setvolume
    commands where the second part is exactly 'media'), `*lighton*` (catches any command containing
    'lighton').
  - `Variables` parameter (arg2): A comma-separated list of the **full local variable names** (e.g.,
    `%app` or `%voltype,%level`) that Tasker should create in the triggered Task. Tasker takes the
    values extracted _after_ each `=:=` separator (from the command that matched the filter in arg1)
    and assigns them sequentially to these specified local variables. The first value goes into the
    first variable, the second into the second, and so on.
  - `Last Variable Is Array` parameter (arg3): If checked (value `1`), the _last_ variable name
    listed in arg2 becomes a **Tasker Array** containing all remaining parts of the command
    separated by `=:=`. (e.g., Command: `mycmd=:=header=:=part1=:=part2`, Variables:
    `%header,%parts`, Last Array: True => `%header`="header", `%parts()`="part1,part2").
  - **Implicit Output:** The full command string is available in the triggered Task as `%evtprm1`.
- **Advantages Over Direct Task Execution (`Perform Task`):**
  - **Decoupling:** The sender doesn't need to know _which specific Task_ will handle the command,
    only the command format. The receiving Profile routes the command, allowing the handling Task to
    be changed later without modifying senders.
  - **Flexibility:** One receiving Profile can handle many command variations using parameters
    passed in the command string, reducing the need for multiple Profiles or Tasks (e.g., one
    `launchapp=:=*` profile vs. many profiles each launching a specific app).
  - **Centralized Logic:** Consolidates the handling of related actions triggered from different
    places into a single Profile/Task.
- **Comparison with `Perform Task`:** While powerful for decoupling, the Command System adds an
  layer (the Profile). For direct, clear Task-to-Task calls within a known structure (like a
  Project), `Perform Task` is often simpler and offers clearer parameter passing (`%par1`, `%par2`,
  Return Value, Passthrough).
- **Use Cases (Beyond Widgets):** Triggering parameterized actions from Quick Settings, dynamically
  controlling profiles/tasks, decoupling task actions from specific triggers.
- **Widget Interaction:** Remember the strict rule: **PREFER Task Calling with Variables** for
  `Widget v2` interactions. Use the Command System _only_ as a fallback, and if used, it **requires
  a Project structure** to hold the widget task and the reacting Command Profile/Task.
- **AutoApps Context:** The `=:=` syntax originates from AutoApps, but you should **NEVER** use or
  reference AutoApps components. Use the native Tasker `Command` event/action.
