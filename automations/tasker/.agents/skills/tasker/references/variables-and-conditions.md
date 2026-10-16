# Tasker Variables, Data Structures & Condition Rules

## Built-in Variable Catalog

- A JSON object defining common Tasker built-in variables available globally.

```json
{
  "b": [
    { "n": "%AIR", "d": "機内モードの状態 / Airplane Mode Status" },
    { "n": "%AIRR", "d": "機内モードでの電波 / Airplane Radios" },
    { "n": "%BATT", "d": "バッテリー残量 / Battery Level" },
    { "n": "%BLUE", "d": "Bluetooth 状態 / Bluetooth Status" },
    { "n": "%CALS", "d": "カレンダ一覧 / Calendar List" },
    { "n": "%CALTITLE", "d": "カレンダーの予定の件名 / Calendar Event Title" },
    { "n": "%CALDESCR", "d": "カレンダーの予定の説明 / Calendar Event Descr" },
    { "n": "%CALLOC", "d": "カレンダーの予定の場所 / Calendar Event Location" },
    { "n": "%CDATE", "d": "通話の日付 (着信)" },
    { "n": "%CNAME", "d": "発信元の名前(着信)" },
    { "n": "%CNUM", "d": "発信元の番号(着信) / Caller Number (In)" },
    { "n": "%CTIME", "d": "通話時刻 (着信) / Call Time (In)" },
    { "n": "%CODATE", "d": "通話日時 (発信) / Call Date (Out)" },
    { "n": "%CODUR", "d": "通話時間の長さ (発信) / Call Duration (Out)" },
    { "n": "%CONAME", "d": "発信先の名前(発信) / Called Name (Out)" },
    { "n": "%CONUM", "d": "発信先の番号(発信) / Called Number (Out)" },
    { "n": "%COTIME", "d": "通話時刻 (発信) / Call Time (Out)" },
    { "n": "%CELLID", "d": "基地局 ID / Cell ID" },
    { "n": "%CELLSIG", "d": "基地局の電波強度 / Cell Signal Strength" },
    { "n": "%CELLSRV", "d": "基地局サービス状態 / Cell Service State" },
    { "n": "%CLIP", "d": "クリップボードの内容" },
    { "n": "%CPUFREQ", "d": "CPU 周波数 / CPU Frequency" },
    { "n": "%CPUGOV", "d": "CPU 調速機構 (ガバナー) / CPU Governor" },
    { "n": "%DATE", "d": "日付 / Date" },
    { "n": "%DAYM", "d": "日にち" },
    { "n": "%DAYW", "d": "曜日" },
    { "n": "%DEVID", "d": "機器 ID / Device ID" },
    { "n": "%DEVMAN", "d": "機器の製造元 / Device Manufacturer" },
    { "n": "%DEVMOD", "d": "機器のモデル型番 / Device Model" },
    { "n": "%DEVPROD", "d": "機器の製品名 / Device Product" },
    { "n": "%DEVTID", "d": "機器のテレフォニー ID / Device Telephony ID" },
    { "n": "%BRIGHT", "d": "画面の明るさ / Display Brightness" },
    { "n": "%DTOUT", "d": "画面消灯までの時間 / Display Timeout" },
    { "n": "%EFROM", "d": "メールの差出人 / Email From" },
    { "n": "%ECC", "d": "メールの CC / Email Cc" },
    { "n": "%ESUBJ", "d": "メールの件名 / Email Subject" },
    { "n": "%EDATE", "d": "メールの日付 / Email Date" },
    { "n": "%ETIME", "d": "メールの時刻 / Email Time" },
    { "n": "%MEMF", "d": "空きメモリー / Free Memory" },
    { "n": "%GPS", "d": "GPS 状態 / GPS Status" },
    { "n": "%HEART", "d": "心拍数 / Heart Rate" },
    { "n": "%HTTPR", "d": "HTTP レスポンスコード / HTTP Response Code" },
    { "n": "%HTTPD", "d": "HTTP データ / HTTP Data" },
    { "n": "%HTTPL", "d": "HTTP データの長さ / HTTP Content Length" },
    { "n": "%HUMIDITY", "d": "湿度 / Humidity" },
    { "n": "%IMETHOD", "d": "キーボード / Input Method" },
    { "n": "%INTERRUPT", "d": "割り込みモード / Interrupt Mode" },
    { "n": "%KEYG", "d": "キーガードの状態 / Keyguard Status" },
    { "n": "%LAPP", "d": "直前のアプリ / Last Application" },
    { "n": "%FOTO", "d": "直前の写真 / Last Photo" },
    { "n": "%LIGHT", "d": "照度 / Light Level" },
    { "n": "%LOC", "d": "現在地 / Location" },
    { "n": "%LOCACC", "d": "現在地の精度 / Location Accuracy" },
    { "n": "%LOCALT", "d": "現在地の標高 / Location Altitude" },
    { "n": "%LOCSPD", "d": "現在地の移動速度 / Location Speed" },
    { "n": "%LOCTMS", "d": "現在地を取得したUNIX時間 / Location Fix TIme Secs" },
    { "n": "%LOCN", "d": "現在地 (ネット回線) / Location (Net)" },
    { "n": "%LOCNACC", "d": "現在地の精度 (ネット回線)" },
    {
      "n": "%LOCNTMS",
      "d": "現在地を取得したUNIX時間 (ネット回線) / Location Fix TIme Secs (Net)"
    },
    { "n": "%MFIELD", "d": "磁場強度 / Magnetic Field Strength" },
    { "n": "%MTRACK", "d": "再生中の曲 / Music Track" },
    { "n": "%MUTED", "d": "ミュート(消音)か / Muted" },
    { "n": "%NIGHT", "d": "夜間モードか / Night Mode" },
    { "n": "%NTITLE", "d": "通知のタイトル / Notification Title" },
    { "n": "%PNUM", "d": "電話番号 / Phone Number" },
    { "n": "%PRESSURE", "d": "気圧 / Pressure" },
    { "n": "%PACTIVE", "d": "プロファイル: 稼働中 / Profile Active" },
    { "n": "%PENABLED", "d": "プロファイル: 有効状態 / Profile Enabled" },
    { "n": "%ROAM", "d": "ローミング有無 / Roaming" },
    { "n": "%ROOT", "d": "ルート権限有無 / Root Available" },
    { "n": "%SCREEN", "d": "画面 / Screen" },
    { "n": "%SDK", "d": "SDK バージョン / SDK Version" },
    { "n": "%SILENT", "d": "サイレントモード / Silent Mode" },
    { "n": "%SIMNUM", "d": "SIM シリアルナンバー / SIM Serial Number" },
    { "n": "%SIMSTATE", "d": "SIM 状態 / SIM State" },
    { "n": "%SPHONE", "d": "スピーカーホン / Speakerphone" },
    { "n": "%SPEECH", "d": "音声読み上げ / Speech" },
    { "n": "%TRUN", "d": "実行中のタスク / Tasks Running" },
    { "n": "%TNET", "d": "通信事業者 / Telephone Network Operator" },
    { "n": "%SMSRF", "d": "テキストメッセージ 差出人 / Text From" },
    { "n": "%SMSRN", "d": "テキストメッセージ 差出人名 / Text From Name" },
    { "n": "%SMSRB", "d": "テキストメッセージ 本文 / Text Body" },
    { "n": "%SMSRD", "d": "テキストメッセージ 日付 / Text Date" },
    { "n": "%MMSRS", "d": "テキストメッセージ 件名 / Text SUbject" },
    { "n": "%SMSRT", "d": "テキストメッセージ 時刻 / Text Time" },
    { "n": "%TEMP", "d": "温度 (摂氏) / Temperature (Celsius)" },
    { "n": "%TETHER", "d": "テザリング / Tethering" },
    { "n": "%TIME", "d": "時刻 / Time" },
    { "n": "%TIMEMS", "d": "時刻 ミリ秒 / Time MilliSeconds" },
    { "n": "%TIMES", "d": "時刻 秒 / Time Seconds" },
    { "n": "%UIMODE", "d": "UI モード / UI Mode" },
    { "n": "%UPS", "d": "稼働時間(秒数) / Uptime Seconds" },
    { "n": "%VOICE", "d": "音声コマンドの結果 / Voice Results" },
    { "n": "%VOLA", "d": "音量 - アラーム音" },
    { "n": "%VOLC", "d": "音量 - 通話音" },
    { "n": "%VOLD", "d": "音量 - ダイヤル音" },
    { "n": "%VOLM", "d": "音量 - メディア音" },
    { "n": "%VOLN", "d": "音量 - 通知音" },
    { "n": "%VOLR", "d": "音量 - 着信音" },
    { "n": "%VOLS", "d": "音量 - システム音" },
    { "n": "%WIFII", "d": "WiFi 情報 / WiFi Info" },
    { "n": "%WIFI", "d": "WiFiの状態 / WiFi Status" },
    { "n": "%WIMAX", "d": "WiMAX の状態 / Wimax Status" },
    { "n": "%WIN", "d": "ウインドウラベル / Window Label" }
  ]
}
```

## Tasker Variable Types & Structures

- Beyond simple variables, Tasker supports Variable Arrays and Structured Variable access.
- **Fundamental Variable Types:** It is crucial to distinguish between **single-value variables**
  (e.g., `%my_variable`, `%HTTPD`, `%TIME`) which hold one piece of data, and **Variable Arrays**
  (e.g., `%array()`, `%evtprm()`) which represent an ordered list of values accessed via indices or
  specific syntax. Tasker's handling and available operations differ significantly between these
  types.
- **Variable Arrays:**
  - **Concept:** Pseudo-arrays using a base name followed by numbers (e.g., `%arr1`, `%arr2`,
    `%arr3` form the array `%arr`). The base name (`%arr` in this case) must adhere to Tasker
    variable naming rules (local/global, >=3 chars, no digit start). Individual elements are simple
    variables.
  - **Common Use:** Essential for `For` loops to iterate over multiple items (files, results, etc.).
  - **Creation:** Can be created by actions like `Array Set`, `Variable Split`, `List Files`,
    `Array Push`, or assigning individual elements (`Variable Set %arrN`). **Event Contexts**
    generate the `%evtprm` array.
  - **CRITICAL: 1-Based Indexing:** Tasker arrays are **1-based**, meaning the index of the first
    element is always `1`, not `0` like in many other programming languages. This applies to
    accessing elements (e.g., `%arr(1)`), looping (`For %index Items 1:%arr(#)`), and using array
    functions.
  - **Access Syntax (Examples):** Assume `%arr1=alpha`, `%arr2=beta`, `%arr3=cat`, `%arr4=dog`.
    - `%arr(#)`: Number of defined elements (4).
    - `%arr(#>)`: Index of the first defined element (1).
    - `%arr(#<)`: Index of the last defined element (4).
    - `%arr(#?search)`: Comma-separated list of indices where value matches `search` (e.g.,
      `%arr(#?beta/cat)` -> `2,3`). Case-sensitive unless specified otherwise.
    - `%arr(#?~Rregex)`: Comma-separated list of indices where value matches `regex`.
    - `%arr(>)`: Content of the first defined element (alpha).
    - `%arr(<)`: Content of the last defined element (dog).
    - `%arr()` or `%arr(:)`: All elements, comma-separated (alpha,beta,cat,dog).
    - `%arr(index)`: Content of element at `index` (e.g., `%arr(2)` -> beta). Note `%arr2` is
      shorthand for `%arr(2)`.
    - `%arr(start:end)`: Slice of elements from `start` to `end` (e.g., `%arr(2:4)` ->
      beta,cat,dog).
    - `%arr(:end)`: Slice from the beginning up to `end` (e.g., `%arr(:3)` -> alpha,beta,cat).
    - `%arr(start:)`: Slice from `start` to the end (e.g., `%arr(3:)` -> cat,dog).
    - `%arr($?search)`: Comma-separated list of element _values_ matching `search` pattern (e.g.,
      `%arr($?*og*)` -> dog).
    - `%arr($?~Rregex)`: Comma-separated list of element _values_ matching `regex`.
    - `%arr(*)`: A random element's content from the array.
    - `%arr(+=separator)`: Join all elements with a custom `separator` (e.g., `%arr(+=;)` ->
      alpha;beta;cat;dog).
    - `%arr(+=separator+function)`: Apply function (like slice/index) and join with `separator`
      (e.g., `%arr(+>+2:4)` -> beta>cat>dog).
    - **Dynamic Indices/Search:** Index numbers, start/end points in slices, and search terms (in
      `#?` and `$?`) can often be variables themselves (e.g., `%arr(%index)`, `%arr(1:%max_items)`,
      `%arr(#?%search_term)`).
  - **Manipulation:**
    - Actions: `Array Set`, `Variable Split`, `Array Push` (code 355): Adds an element to an array.
      **CRITICAL: Its 'Position' parameter (arg1) is 1-based. The value provided for this parameter
      MUST strictly adhere to the range defined in its Action Catalog entry's `"s"` field, which
      is `"1:999999"`.** This means the position must be an integer between 1 and 999999,
      inclusive.
      - To push to the **start** of the array, the AI MUST set 'Position' (arg1) to `1`.
      - To push to the **end** of the array, the AI MUST set 'Position' (arg1) to `999999` (the
        maximum value from the catalog's `s` field for this parameter).
      - Using `0` or values outside this range (1-999999) for 'Position' is **FORBIDDEN** and will
        cause errors. This action can also fill gaps if a position beyond the current end is
        specified (up to 999999)., `Array Pop` (remove element from start/end/index and optionally
        store its value, shifting subsequent indices), `Array Process` (sort/filter/remove
        duplicates/etc), `Array Clear` (delete all elements).
    - **Pop vs. Clear:** `Array Pop` (with appropriate parameters like index, `%arr(<)` for last, or
      `%arr(>)` for first) removes an element and optionally stores its value, shifting subsequent
      indices down and decreasing `%arr(#)`. `Variable Clear %arrN` only undefines element `%arrN`
      without changing `%arr(#)` or shifting other indices, potentially creating gaps.
    - **Strategy for Keeping First/Last N Items (Array Trimming):** This is often needed for tasks
      like keeping the '5 most recent games' or '5 closest events'. Use this efficient slicing
      method:
      - **1. Check Size (Optional but Recommended):** Use an `If %array(#) > N` condition (where N
        is the number to keep) to only perform trimming if the array is larger than desired.
      - **2. Extract Slice:** Use `Variable Set` (code 547) to extract the desired portion into
        temporary variables using Tasker's array slicing syntax:
        - **To keep the first N items:** `%temp_slice = %array(1:N)`
        - **To keep the last N items:** First calculate the start index:
          `%start_index = %array(#) - N + 1` (using 'Do Maths'), then extract the slice:
          `%temp_slice = %array(%start_index:)`
        - Repeat this step for _all_ parallel arrays that need to be trimmed, storing each slice in
          a corresponding temporary variable (e.g., `%temp_names`, `%temp_urls`).
      - **3. Overwrite Original Array:** Use `Array Set` (code 354) to replace the original array
        with the contents of the temporary slice variable. Set `Splitter` (`arg2`) to comma `,`.
        Repeat this for _each_ parallel array using its corresponding temporary slice variable.
  - **Efficiency:** Best for convenience, not high-performance/large datasets.
  - **Identifying Array Outputs:** Within the **Event Context, State Context, and Action Catalog
    Data**, if a variable name in an `output_variable_list` ends with parentheses `()`, like
    `%files()` or `%http_headers()`, it signifies that the component outputs a **Tasker Variable
    Array**. The base name (e.g., `%files`) can then be used with Tasker's array access syntax.
    Variables listed without `()` typically represent single values.
- **Structured Variables (JSON, HTML/XML, CSV):**
  - **Prerequisite:** The action _creating_ the variable (e.g., `HTTP Request`, `Variable Set`) must
    have its **"Structured Output"** option enabled (usually default). Tasker then attempts to parse
    the content.
  - **Key Naming vs. Variable Naming:** The Tasker variable naming rules (>=3 chars, no digit start,
    case for global/local) apply ONLY to the Tasker _base variable name_ (e.g., `%myjson`,
    `%myhtml`). The keys, tags, attributes, selectors, or column headers used for access (e.g.,
    `.data`, `[user name]`, `[img=:=src]`, `div{id=main}`, `.columnHeader`) follow the rules of the
    specific format (JSON, HTML, CSS, CSV) and **do not** need to conform to Tasker variable naming
    rules. Use `[]` notation for keys/headers with spaces, uppercase, or special characters
    disallowed in dot notation.
  - **JSON Access:**
    - Syntax: **ONLY** use square bracket (`[]`) notation on the base variable name (e.g.,
      `%json[data.name]`). When using square brackets, you **MUST** place the full key path, using
      dots (`.`) as separators for nested keys, _inside_ the brackets (e.g.,
      `%json[data.user.name]`). You **MUST NOT** use multiple consecutive bracket pairs (like
      `%json[data][user]`).
    - **Correct Syntax for Accessing Properties within JSON Array Elements:** To get a specific
      property from an object _within_ a JSON array, the **correct structural pattern** is
      `%variable[path.to.array.propertyname](index)`. The full path to the desired property (within
      brackets) comes _before_ the index specifying the array element. For example, if `%mydata`
      contains `{ "items": [ { "value": 10 }, { "value": 20 } ] }`, you would access the value of
      the second item using `%mydata[items.value](2)`. **Crucially, NEVER use the incorrect order
      like `%variable[path.to.array](index).propertyname`.** Remember that Tasker array indices are
      1-based.
    - **MANDATORY Bracket Notation for Uppercase/Special Keys:** You **MUST ALWAYS** use square
      bracket notation (`%variable[path.to.KeyWithCapsOrSpace]`) for accessing JSON keys/properties
      whenever a key/property name in the path contains **uppercase letters**, spaces, or other
      special characters. Dot notation is forbidden in these cases. Combining this with the array
      access rule, the correct syntax for the example from the issue report (`%http_data` containing
      `data.translations[...].translatedText`) is `%http_data[data.translations.translatedText](1)`.
      Using dot notation or omitting brackets for `translatedText` is **INCORRECT and FORBIDDEN**
      because the key contains an uppercase letter.
    - Getting Values: Use square bracket notation (`[]`). For a top-level key, use `%json[key]`. For
      a nested key, use the full path inside the brackets: `%json[path.to.key]`. This notation works
      reliably for all valid key names, including those with spaces or uppercase letters:
      `%json[Some Key With Spaces]`, `%json[KeyWithCaps]`.
    - Getting Arrays: Use `%json[key]()` to return a comma-separated list of all matching values if
      the key points to an array or matches multiple elements. Use `%json[path.to.key](index)` to
      get a specific item (using 1-based indexing) if the key points to a JSON array.
    - Root JSON Array: Use `%json_array[=:=root=:=]()` to get elements as a Tasker array.
    - Array Features: Standard Tasker array functions often work on results obtained using the `()`
      notation (e.g., `%json[names](<)` gets the last name if `names` is an array, `%json[items](#)`
      gets the count).
  - **HTML/XML Access:**
    - Syntax: Use square bracket notation for tag content (`%html[div]`), `()` for all matching tags
      (`%html[div]()`).
    - Attributes: Use `=:=` notation: `%html[img=:=src]` gets the `src` attribute of the first
      `img`. `%html[a=:=href]()` gets all `href`s from `<a>` tags.
    - Full HTML: Use `=:=html`: `%html[body=:=html]` gets the body's inner/outer HTML.
    - CSS Selectors: Supported with adaptations: Use `{}` instead of `[]` for attribute selectors
      (e.g., `div{attr=value}`). Use `«»` instead of `()` for functions (e.g., `div:nth-child«2»`).
      No nested reads like `%html[query1.query2]`; use CSS `query1 > query2`.
  - **CSV Access:**
    - Syntax: Use square bracket notation for column headers (`%csv[column_name]`). Use `()` to get
      all values in a column (`%csv[column_name]()`).
  - **List Dialogs:** Use the base access (e.g., `%json.names`, `%csv.names`) not the `()` version
    to avoid issues with commas in data.
- **Variable Scope Clarification:** Variables created by Contexts or Actions are local to that
  specific Task run unless they are Global variables (`%HasCaps`). The `Perform Task` action can
  pass local variables explicitly (`%par1`, `%par2`) or implicitly using "Local Variable
  Passthrough", which passes **all** local variables from the calling task to the called task,
  making them available at the start of the called task (useful when needing to pass more than two
  values). The `Return` action can send values back, potentially also passing back local variables.
  Recognize that calling a named task implies variable scope transfer might be needed.

## Tasker Pattern Matching Rules

- **Purpose:** Tasker conditions allow Profiles to trigger or Actions within Tasks to run based on
  comparisons. You MUST understand the available operators and their usage contexts to correctly
  interpret user requests and generate valid XML.
- **Operator Types:** Conditions generally involve a Left Hand Side (LHS), an Operator, and often a
  Right Hand Side (RHS). The main operator types are:
  - **Pattern Matching (Simple Matching):** This is the default for text comparisons in many
    contexts (like Event/State parameters, Variable Value state, If action condition with `~`
    (Matches) or `!~` (Doesn't Match)).
    - It compares the LHS against the RHS pattern.
    - The `*` pattern on the RHS matches _anything_.
    - A non-blank pattern must match the _entire_ LHS value unless wildcards are used.
    - `/` acts as an OR separator (e.g., `Value1/Value2` matches if LHS is exactly `Value1` OR
      `Value2`).
    - `*`: Matches _zero or more_ of any character (e.g., `*end` matches `legend` and `end`).
    - `+`: Matches _one or more_ of any character (e.g., `start+` matches `starter` but not
      `start`). This means `If %var Matches +` is true only if `%var` is set and contains at least
      one character; it is false if `%var` is unset or set to an empty string.
    - Case-Insensitive (Default): Matching ignores case (`hello` matches `HeLlO`).
    - Case-Sensitive (Triggered by Uppercase): If the RHS pattern contains _any uppercase letter_,
      the entire match becomes case-sensitive (`Hello` matches `Hello` but not `hello`).
    - `!`: Placed at the very start of the RHS pattern, it negates the result (e.g., `!*important*`
      matches if the LHS does _not_ contain `important`). Cannot match a literal `!` at the start
      (use `*!` instead).
    - **Caller Matching Specifics:** In contexts related to phone calls (e.g., 'Call Received'
      Event, 'Call' State), special patterns exist:
      - `C:ANY`: Matches any number belonging to a contact.
      - `C:FAV`: Matches any number belonging to a favorite/starred contact.
      - `CG:groupmatch`: Matches any number belonging to a contact in a group matching `groupmatch`
        (Simple Matching rules apply to `groupmatch`).
      - Otherwise, the standard Simple Matching rules are applied against _both_ the caller's number
        _and_ their contact name (if available).
  - **Pattern Matching (Regex):** Used with `~R` (Matches Regex) or `!~R` (Doesn't Match Regex)
    operators.
    - The RHS pattern is treated as a standard Java Regular Expression.
    - Provides more powerful and precise pattern matching capabilities than Simple Matching.
  - **String Equality:** Used for exact text comparison.
    - `Equals String` (UI symbol: `eq`): True if LHS is exactly identical to RHS (case-sensitive).
    - `Not Equals String` (UI symbol: `ne`): True if LHS is _not_ exactly identical to RHS
      (case-sensitive).
  - **Numeric Comparison:** **CRITICAL: These operators MUST ONLY be used for comparing numbers or
    variables expected to contain valid mathematical expressions.** They perform mathematical
    evaluation on both LHS and RHS.
    - `Less Than` (UI symbol: `<`): True if LHS evaluates numerically to less than RHS.
    - `Greater Than` (UI symbol: `>`): True if LHS evaluates numerically to greater than RHS.
    - `Equals` (UI symbol: `=`): True if LHS evaluates numerically to be equal to RHS. Returns true
      if both LHS and RHS are empty/undefined. Returns false if only one is empty/undefined.
    - `Not Equals` (UI symbol: `!=`): True if LHS evaluates numerically to be not equal to RHS.
      Returns false if both LHS and RHS are empty/undefined. Returns true if only one is
      empty/undefined.
    - **WARNING:** If either LHS or RHS cannot be evaluated as a number (e.g., it's plain text like
      "hello"), these comparisons will likely return `false` or produce unexpected results. **Do NOT
      use these for comparing non-numeric strings; use `Equals String` or `Matches` instead.**
  - **Mathematical Checks:** These also perform numeric evaluation on the LHS.
    - `Even`: True if LHS evaluates to an even number.
    - `Odd`: True if LHS evaluates to an odd number.
    - **WARNING:** Returns `false` if the LHS cannot be evaluated as a number.
  - **Variable State:** Checks if a variable is defined (has been assigned any value).
    - `Set`: True if the variable named in LHS exists and has been assigned a value (even an empty
      string).
    - `Not Set`: True if the variable named in LHS has not been assigned any value (is undefined).
- **XML Structure for Conditions (Actions/Variable Value State):**
  - While most Profile contexts take arguments directly (like `<State>`, `<Event>`), and some
    contexts are distinct tags with direct children (`<Time>`, `<App>`), conditions within specific
    **Actions** (most notably `If` - code 37, `Wait Until` - code 35) and the **Variable Value
    State** (code 165) use a specific XML structure:
    - `<ConditionList sr="if">`: Acts as a container for one or more conditions.
    - `<Condition sr="c[Index]" ve="3">`: Represents a single comparison.
    - `<lhs>`: Contains the Left Hand Side variable or value (e.g., `<lhs>%my_variable</lhs>`).
    - `<op>`: Contains the **numeric code** for the comparison Operator (see list below).
    - `<rhs>`: Contains the Right Hand Side value (e.g., `<rhs>Some Value</rhs>`). This tag is
      **omitted** for unary operators (Set, Not Set, Even, Odd).
  - **Operator Codes (for `<op>` tag):**
    - `0`: Equals String (`eq`, case-sensitive text)
    - `1`: Not Equals String (`ne`, case-sensitive text)
    - `2`: Matches Simple Pattern (`~`, glob/wildcard)
    - `3`: Doesn't Match Simple Pattern (`!~`)
    - `4`: Matches Regex (`~R`)
    - `5`: Doesn't Match Regex (`!~R`)
    - `6`: Less Than (`<`, numeric)
    - `7`: Greater Than (`>`, numeric)
    - `8`: Equals (`=`, numeric)
    - `9`: Not Equals (`!=`, numeric)
    - `10`: Even (numeric)
    - `11`: Odd (numeric)
    - `12`: Is Set (variable defined)
    - `13`: Is Not Set (variable undefined)
  - **Remember:** Operators 6-11 are **strictly numeric**. Use 0-3 for general string comparisons.
- **Boolean Logic (Combining Multiple Conditions in `<ConditionList>`):**
  - When a `<ConditionList>` contains multiple `<Condition>` tags, they are linked by boolean logic
    tags placed _between_ them.
  - **Crucially, if a `<ConditionList>` contains N `<Condition>` elements (where N > 1), you MUST
    generate N-1 corresponding boolean connector elements (`<bool0>`, `<bool1>`, ..., `<bool{N-2}>`)
    immediately preceding the second, third, ..., Nth `<Condition>` element, respectively. The
    content of each `<boolN>` tag (e.g., `And`, `Or`, `Xor`) determines the logical operation
    between the preceding condition(s) and the following one, respecting the specified precedence
    rules.**
  - **Operators (as tag content):** `And`, `Or`, `Xor`, `And2`, `Or2`, `Xor2` (Note: `And2`
    corresponds to `&+`, `Or2` to `|+`, `Xor2` to `X|+`). Example: `<bool0>And</bool0>`,
    `<bool1>Or2</bool1>`.
  - **Symbols (for reference):** `&` (And), `|` (Or), `X|` (Xor), `&+` (And2), `|+` (Or2), `X|+`
    (Xor2).
  - **Precedence (Evaluation Order):** Determines how complex conditions are evaluated. Operators
    are evaluated from HIGHEST precedence to LOWEST precedence.
    - Highest: `And+` / `And2` (&+)
    - Medium-High: `Or+` / `Or2` (|+)
    - Medium: `Xor+` / `Xor2` (X|+)
    - Medium-Low: `And` (&)
    - Low: `Or` (|)
    - Lowest: `Xor` (X|)
    - (Example: In `CondA & CondB |+ CondC`, the `|+` / `Or2` is evaluated first, then the `&` /
      `And`.)
- **AI Guidance:** Choose the most appropriate operator based on the user's intent. Use
  `Equals String` for exact text matches, `Matches` (with `*`/`+`) for pattern/substring checks, and
  Regex (`~R`) for complex patterns. Use numeric operators (`<`, `>`, `=`, `!=`, `Even`, `Odd`)
  **strictly for numbers or mathematical expressions**. Use `Set`/`Not Set` when checking if a
  variable simply exists. When generating `If` actions or `Variable Value` states, use the
  `<ConditionList>` structure with the correct `<op>` codes. Understand boolean precedence when
  combining conditions. **CRITICAL TASK FLOW STYLE: Prioritize 'Early Returns' for Validation/Error
  Checks.** Instead of deeply nesting the main task logic within multiple `If`/`Else` blocks, prefer
  checking for failure conditions first. If a failure condition is met (e.g., required variable not
  set, input invalid), use actions inside the `If` block to handle the error, **which MUST include
  using a `Flash` action (code 548) to clearly inform the user about the specific error**, and then
  immediately `Stop` the task (code 137). Place the main task logic _after_ these `If`/`End If`
  validation blocks. This keeps the core logic less indented and easier to follow.
- **Task Flow for Mutually Exclusive Cases:** When a task needs to perform different actions based
  on which _one_ of several mutually exclusive conditions is met (e.g., checking an event variable
  like `%evtprm2` against multiple possible app packages, or checking a variable against several
  distinct values), **avoid deep nesting with `If/Else If/Else`**. Instead, implement a series of
  independent `If` blocks. Each block should check one specific condition (`If condition X`),
  perform the actions required _only_ for that condition, and then close with `End If`. **Crucially,
  decide whether to include a `Stop` action (code 137) just before the `End If` based on the overall
  task logic:**
  - **Include `Stop`:** If handling this specific condition should prevent any subsequent actions in
    the task from running (i.e., this is the final action for this logical path).
  - **Omit `Stop`:** If there is common logic _after_ the entire sequence of independent `If` blocks
    that needs to run regardless of which condition (if any) was met.
    This approach ensures that only the actions for the _first_ matching condition run if `Stop` is
    used appropriately, or allows the task to continue to subsequent common logic if `Stop` is
    omitted. It maintains a flatter, more readable structure than deep nesting, especially for many
    conditions.
