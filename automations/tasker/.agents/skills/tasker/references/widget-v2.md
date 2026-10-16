# Tasker Widget v2 Custom Layout Schema & Rules

## Widget v2 Custom Layout JSON Schema

- JSON schema defining the structure for the `Custom Layout` parameter (arg13) of the `Widget v2`
  action (code 461). This JSON defines Android Glance widget layouts, so use your general knowledge
  about Glance to understand how these widgets will work. The AI must generate JSON conforming to
  this schema when building custom widgets.
- Note the support for shorthand properties (e.g., `padding` as a number, `size` as a number or
  "fill") for optimization.
- The AI should prioritize using Material You color names (e.g., "primary", "onSurface") for color
  properties. Hex codes (#RRGGBB, #AARRGGBB) should only be used if Material You colors are
  unsuitable or specifically requested.
- The `useMaterialYouColors` property should generally _not_ be included in the generated JSON.
- Any element type can contain action properties (`command`, `task`, etc.).

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tasker Widget v2 Custom Layout Schema",
  "description": "Defines the JSON structure for Tasker's Widget v2 Custom Layout parameter, used to build Glance widgets. **IMPORTANT: You MUST ensure that properties applied to a specific element type (e.g., Button, Text) are actually valid and supported by THAT element type, not just listed generically in base structures. Applying unsupported properties will lead to errors.**",
  "definitions": {
    "colorString": {
      "description": "A color value. MUST be one of the explicitly allowed Material You names (see colorString definition) or a hex format string (#RRGGBB or #AARRGGBB).",
      "oneOf": [
        {
          "type": "string",
          "enum": [
            "widgetBackground",
            "primary",
            "onPrimary",
            "primaryContainer",
            "onPrimaryContainer",
            "secondary",
            "onSecondary",
            "secondaryContainer",
            "onSecondaryContainer",
            "tertiary",
            "onTertiary",
            "tertiaryContainer",
            "onTertiaryContainer",
            "error",
            "onError",
            "errorContainer",
            "onErrorContainer",
            "background",
            "onBackground",
            "surface",
            "onSurface",
            "surfaceVariant",
            "onSurfaceVariant",
            "inverseSurface",
            "inverseOnSurface",
            "outline",
            "inversePrimary",
          ],
        },
        {
          "type": "string",
          "pattern": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$",
        },
      ],
    },
    "sizeUnit": {
      "type": ["number", "string"],
      "description": "A size value in DP (number) or a Tasker variable string.",
    },
    "boolOrVariable": {
      "type": ["boolean", "string"],
      "description": "A boolean value (true/false) or a Tasker variable string.",
    },
    "intOrVariable": {
      "type": ["integer", "string"],
      "description": "An integer value or a Tasker variable string.",
    },
    "stringOrVariable": {
      "type": "string",
      "description": "A string value, potentially containing Tasker variables.",
    },
    "paddingValue": {
      "oneOf": [
        { "$ref": "#/definitions/sizeUnit" },
        {
          "type": "object",
          "properties": {
            "top": { "$ref": "#/definitions/sizeUnit" },
            "bottom": { "$ref": "#/definitions/sizeUnit" },
            "start": { "$ref": "#/definitions/sizeUnit" },
            "end": { "$ref": "#/definitions/sizeUnit" },
          },
          "additionalProperties": false,
        },
      ],
      "description": "Padding definition. Can be a single number (for all sides) or an object with specific sides (top, bottom, start, end).",
    },
    "sizeValue": {
      "oneOf": [
        { "$ref": "#/definitions/sizeUnit" },
        {
          "type": "string",
          "enum": ["fill"],
          "description": "Use 'fill' to represent fillMaxSize.",
        },
        {
          "type": "object",
          "properties": {
            "width": { "$ref": "#/definitions/sizeUnit" },
            "height": { "$ref": "#/definitions/sizeUnit" },
            "fillMaxWidth": { "type": "boolean" },
            "fillMaxHeight": { "type": "boolean" },
          },
          "description": "Define specific dimensions or fill behavior.",
          "additionalProperties": false,
        },
      ],
      "description": "Size definition. Can be a single number (for square size), 'fill' (for fillMaxSize), or an object defining width/height/fill.",
    },
    "actionProperties": {
      "commandPrefix": { "$ref": "#/definitions/stringOrVariable" },
      "task": { "$ref": "#/definitions/stringOrVariable" },
      "taskVariables": {
        "type": "object",
        "description": "Key-value pairs for task variables. Keys MUST be valid Tasker **local** variable names (e.g., '%my_var', must start with '%', be all lowercase, and >= 3 chars). Values are strings, potentially containing Tasker variables.",
        "additionalProperties": { "$ref": "#/definitions/stringOrVariable" },
      },
      "command": { "$ref": "#/definitions/stringOrVariable" },
      "tag": { "$ref": "#/definitions/stringOrVariable" },
    },
    "baseStructure": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "description": "The type of the UI element." },
        "padding": { "$ref": "#/definitions/paddingValue" },
        "paddingTop": { "$ref": "#/definitions/sizeUnit" },
        "paddingBottom": { "$ref": "#/definitions/sizeUnit" },
        "paddingStart": { "$ref": "#/definitions/sizeUnit" },
        "paddingEnd": { "$ref": "#/definitions/sizeUnit" },
        "size": { "$ref": "#/definitions/sizeValue" },
        "width": { "$ref": "#/definitions/sizeUnit" },
        "height": { "$ref": "#/definitions/sizeUnit" },
        "fillMaxSize": { "$ref": "#/definitions/boolOrVariable" },
        "fillMaxWidth": { "$ref": "#/definitions/boolOrVariable" },
        "fillMaxHeight": { "$ref": "#/definitions/boolOrVariable" },
        "isWeighted": { "$ref": "#/definitions/boolOrVariable" },
        "cornerRadius": { "$ref": "#/definitions/intOrVariable" },
        "backgroundColor": { "$ref": "#/definitions/colorString" },
        "visibility": {
          "type": "string",
          "enum": ["Visible", "Invisible", "Gone"], // Also handles boolean/variable via string
          "description": "Visibility state (Visible, Invisible, Gone) or a variable.",
        },
        "commandPrefix": { "$ref": "#/definitions/stringOrVariable" },
        "task": { "$ref": "#/definitions/stringOrVariable" },
        "taskVariables": {
          "type": "object",
          "description": "Key-value pairs for task variables.",
          "additionalProperties": { "$ref": "#/definitions/stringOrVariable" },
        },
        "command": { "$ref": "#/definitions/stringOrVariable" },
        "tag": { "$ref": "#/definitions/stringOrVariable" },
        // Note: useMaterialYouColors is intentionally omitted as per instructions
      },
      "required": ["type"],
    },
    "containerStructure": {
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        {
          "type": "object",
          "properties": {
            "children": {
              "type": "array",
              "items": { "$ref": "#/definitions/anyStructure" },
            },
            "verticalAlignment": {
              "type": "string",
              "enum": ["Top", "Center", "Bottom"],
              "description": "Vertical alignment for children.",
            },
            "horizontalAlignment": {
              "type": "string",
              "enum": ["Start", "Center", "End"],
              "description": "Horizontal alignment for children.",
            },
          },
        },
      ],
    },
    "textStyleProperties": {
      "text": { "$ref": "#/definitions/stringOrVariable" },
      "color": { "$ref": "#/definitions/colorString" },
      "align": {
        "type": "string",
        "enum": ["Left", "Right", "Center", "Start", "End"],
        "description": "Text alignment.",
      },
      "textSize": { "$ref": "#/definitions/stringOrVariable" }, // string to allow variables
      "bold": { "$ref": "#/definitions/boolOrVariable" },
      "italic": { "$ref": "#/definitions/boolOrVariable" },
      "underline": { "$ref": "#/definitions/boolOrVariable" },
      "linethrough": { "$ref": "#/definitions/boolOrVariable" },
      "fontFamily": {
        "type": "string",
        "enum": ["Serif", "SansSerif", "Monospace", "Cursive"],
        "description": "Font family name or standard enum.",
      },
    },
    // --- Specific Element Types ---
    "Box": {
      "allOf": [{ "$ref": "#/definitions/containerStructure" }],
      "properties": { "type": { "const": "Box" } },
    },
    "Column": {
      "description": "A vertical layout container. If more than 10 children are added or expected (e.g., in the case of dynamic lists), you MUST enable scrolling for the column.",
      "allOf": [
        { "$ref": "#/definitions/containerStructure" },
        {
          "properties": {
            "scrolling": { "$ref": "#/definitions/boolOrVariable" },
          },
        },
      ],
      "properties": { "type": { "const": "Column" } },
    },
    "Grid": {
      "allOf": [
        { "$ref": "#/definitions/containerStructure" },
        {
          "properties": {
            "fixed": { "$ref": "#/definitions/intOrVariable" },
            "minSize": { "$ref": "#/definitions/intOrVariable" },
          },
        },
      ],
      "properties": { "type": { "const": "Grid" } },
    },
    "Row": {
      "description": "A horizontal layout container. No more than 10 children supported.",
      "allOf": [{ "$ref": "#/definitions/containerStructure" }],
      "properties": { "type": { "const": "Row" } },
    },
    "Scaffold": {
      "allOf": [
        { "$ref": "#/definitions/containerStructure" },
        {
          "properties": {
            "horizontalPadding": { "$ref": "#/definitions/intOrVariable" },
            "titleBar": { "$ref": "#/definitions/TitleBar" },
          },
        },
      ],
      "properties": { "type": { "const": "Scaffold" } },
    },
    "Spacer": {
      "allOf": [{ "$ref": "#/definitions/baseStructure" }],
      "properties": { "type": { "const": "Spacer" } },
    },
    "Text": {
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        { "$ref": "#/definitions/textStyleProperties" },
        {
          "properties": {
            "maxLines": { "$ref": "#/definitions/intOrVariable" },
            "font": {
              "$ref": "#/definitions/stringOrVariable",
              "description": "Path to custom font file.",
            },
          },
        },
      ],
      "properties": { "type": { "const": "Text" } },
    },
    "Image": {
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        {
          "properties": {
            "url": { "$ref": "#/definitions/stringOrVariable" },
            "contentScale": {
              "type": "string",
              "enum": ["Crop", "Fit", "FillBounds"],
            },
            "tint": { "$ref": "#/definitions/colorString" },
            "circle": { "$ref": "#/definitions/boolOrVariable" },
            "sepia": { "$ref": "#/definitions/boolOrVariable" },
            "grayscale": { "$ref": "#/definitions/boolOrVariable" },
            "blur": { "$ref": "#/definitions/intOrVariable" },
          },
        },
      ],
      "properties": { "type": { "const": "Image" } },
    },
    "ButtonBase": {
      // Abstract base for button types
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        {
          "properties": {
            "enabled": { "$ref": "#/definitions/boolOrVariable" },
            "contentColor": { "$ref": "#/definitions/colorString" },
            "icon": { "$ref": "#/definitions/stringOrVariable" },
          },
        },
      ],
    },
    "Button": {
      "allOf": [
        { "$ref": "#/definitions/ButtonBase" },
        {
          "properties": {
            "text": { "$ref": "#/definitions/stringOrVariable" },
            "buttonType": {
              "type": "string",
              "enum": ["Filled", "Outline", "Normal"],
            },
          },
        },
      ],
      "properties": { "type": { "const": "Button" } },
      "description": "Standard button element. **Note: 'textSize' is NOT a supported property for Buttons.** Use 'contentColor' for text/icon color.",
    },
    "IconButton": {
      "allOf": [
        { "$ref": "#/definitions/ButtonBase" },
        {
          "properties": {
            "buttonType": {
              "type": "string",
              "enum": ["Circle", "Square"],
            },
          },
        },
      ],
      "properties": { "type": { "const": "IconButton" } },
    },
    "CompoundBase": {
      // Abstract base for CheckBox/Switch
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        { "$ref": "#/definitions/textStyleProperties" }, // Inherits text styling
        {
          "properties": {
            "checked": { "$ref": "#/definitions/boolOrVariable" },
            "checkedColor": { "$ref": "#/definitions/colorString" },
            "uncheckedColor": { "$ref": "#/definitions/colorString" },
          },
        },
      ],
    },
    "CheckBox": {
      "allOf": [{ "$ref": "#/definitions/CompoundBase" }],
      "properties": { "type": { "const": "CheckBox" } },
    },
    "Switch": {
      "allOf": [
        { "$ref": "#/definitions/CompoundBase" },
        {
          "properties": {
            "checkedTrackColor": { "$ref": "#/definitions/colorString" },
            "uncheckedTrackColor": { "$ref": "#/definitions/colorString" },
          },
        },
      ],
      "properties": { "type": { "const": "Switch" } },
    },
    "Progress": {
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        {
          "properties": {
            "color": { "$ref": "#/definitions/colorString" },
            "trackColor": { "$ref": "#/definitions/colorString" },
            "progress": {
              "$ref": "#/definitions/intOrVariable",
              "description": "Value 0-100 or variable",
            },
            "progressType": {
              "type": "string",
              "enum": ["Linear", "Circle"],
            },
            "text": {
              "$ref": "#/definitions/stringOrVariable",
              "description": "Text overlay for Circle type.",
            },
            "resolution": {
              "$ref": "#/definitions/intOrVariable",
              "description": "Diameter for Circle type.",
            },
            "barWidth": {
              "$ref": "#/definitions/intOrVariable",
              "description": "Stroke width for Circle type.",
            },
          },
        },
      ],
      "properties": { "type": { "const": "Progress" } },
    },
    "TitleBar": {
      "allOf": [
        { "$ref": "#/definitions/baseStructure" },
        {
          "properties": {
            "icon": { "$ref": "#/definitions/stringOrVariable" },
            "text": { "$ref": "#/definitions/stringOrVariable" },
            "iconColor": { "$ref": "#/definitions/colorString" },
            "textColor": { "$ref": "#/definitions/colorString" },
            "actions": {
              "type": "array",
              "items": { "$ref": "#/definitions/IconButton" },
            },
          },
        },
      ],
      "properties": { "type": { "const": "TitleBar" } },
      "required": ["type", "icon", "text"],
    },
    // --- Aggregator for any structure ---
    "anyStructure": {
      "oneOf": [
        { "$ref": "#/definitions/Box" },
        { "$ref": "#/definitions/Column" },
        { "$ref": "#/definitions/Grid" },
        { "$ref": "#/definitions/Row" },
        { "$ref": "#/definitions/Scaffold" },
        { "$ref": "#/definitions/Spacer" },
        { "$ref": "#/definitions/Text" },
        { "$ref": "#/definitions/Image" },
        { "$ref": "#/definitions/Button" },
        { "$ref": "#/definitions/IconButton" },
        { "$ref": "#/definitions/CheckBox" },
        { "$ref": "#/definitions/Switch" },
        { "$ref": "#/definitions/Progress" },
        { "$ref": "#/definitions/TitleBar" },
      ],
    },
  },
  // --- Root Structure ---
  "$ref": "#/definitions/anyStructure", // The root must be a single CustomStructure element
}
```

## Widget v2 Custom Layout JSON Examples

- _Note: The following JSON goes inside the `<Str sr="arg13" ve="3">...</Str>` tag of a `Widget v2`
  action (code 461) where `arg2` (Layout) is set to `Custom`._
  - **Absolute Positioning Simulation Example (Use Sparingly):**
  - This technique uses nested Box elements filling the parent to place items in specific screen
    areas. Prefer standard Row/Column layouts for better resizing unless this fixed positioning is
    essential and impossible otherwise.
  - **Task Calling with Variables Example:**
    - This Row element, when clicked, will execute the named Task "Open URL", passing the specific
      URL derived from the %http_data variable into the local %url variable within that "Open URL"
      Task.

```json
{
  "children": [
    {
      "maxLines": 2,
      "text": "%http_data.data.children.data.title",
      "isWeighted": true,
      "paddingEnd": 8,
      "type": "Text"
    }
  ],
  "padding": 8,
  "task": "Open URL",
  "taskVariables": {
    "%url": "https://www.reddit.com%http_data.data.children.data.permalink"
  },
  "type": "Row"
}
```

```json
{
  "children": [
    {
      "contentScale": "Crop",
      "url": "my_image_url",
      "size": "fill",
      "type": "Image"
    },
    {
      "children": [
        {
          "text": "This is at the top",
          "padding": 16,
          "type": "Text"
        }
      ],
      "horizontalAlignment": "Center",
      "verticalAlignment": "Top",
      "size": "fill",
      "type": "Box"
    },
    {
      "children": [
        {
          "text": "This is at the bottom",
          "padding": 16,
          "type": "Text"
        }
      ],
      "horizontalAlignment": "Center",
      "verticalAlignment": "Bottom",
      "size": "fill",
      "type": "Box"
    },
    {
      "children": [
        {
          "text": "This is on the left",
          "padding": 16,
          "type": "Text"
        }
      ],
      "horizontalAlignment": "Start",
      "verticalAlignment": "Center",
      "size": "fill",
      "type": "Box"
    }
  ],
  "horizontalAlignment": "Center",
  "verticalAlignment": "Center",
  "fillMaxSize": true,
  "type": "Box"
}
```

## Widget v2 Planning & Strict Rules

- **Planning for Widget Interactions (Widget v2 Action):**
  - **Detect Interaction:** If the `Widget v2` custom layout plan involves clickable elements
    (`Button`, `IconButton`, `Row`, `Column`, `Box`, `Image`, `Text` etc.), determine the desired
    interaction method.
    - **Prefer Task Calling:** You **MUST** prioritize using the "Task Calling with Variables"
      method. This involves:
      - Setting the `"task"` property in the widget JSON to the name of the Task to be executed.
      - Setting the `"taskVariables"` property to a JSON object where keys are valid **local**
        Tasker variable names (e.g., `"%my_data"`) and values are the data to pass.
      - **Determine Target Task & Structure:**
        - If the interaction needs to call a Task _different_ from the one creating the widget, you
          **MUST** plan to generate a **Project**. This Project will contain _at least_:
          - The **named Task** that creates the widget.
          - The **separate named Task** that is called by the widget interaction.
          - Any other Profiles/Tasks needed for the overall request.
        - If the interaction _only_ needs to call the _same_ Task that created the widget (e.g., to
          trigger a refresh), and no other Profiles or separate named Tasks are required for the
          overall user request, then planning a single **Standalone Task** is sufficient.
        - If the overall request _already_ necessitates a Project (due to multiple profiles or other
          reusable tasks), simply ensure the called named Task is included in that Project plan.
    - **Fallback to Command System:** Only use the "Command System" if Task Calling is unsuitable or
      significantly more complex for the specific interaction. This involves:
      - Setting the `"command"` property in the widget JSON (e.g., `"mycommand=:=value1=:=value2"`).
        Use the `=:=` separator.
      - You **MUST** plan to generate a **Project**. This Project will contain _at least_:
        - The **named Task** that creates the widget.
        - The **Profile** that uses the `Command` event context (code `2091`) to react to the
          command sent by the widget. Configure the `Command` filter and `Variables` parameter
          appropriately, potentially using `Last Variable Is Array`.
        - The **anonymous Task** linked to this reacting Profile.
        - Any other Profiles/Tasks needed for the overall request.
    - **Widget v2 Action Plan:** Ensure the `Widget v2` action plan includes setting `arg2` (Layout)
      to `Custom` and populating `arg13` (Custom Layout) with the designed JSON, incorporating
      either the `"task"`/`"taskVariables"` or `"command"` properties on the interactive elements.
- **Planning for Widget v2:**
  - **Plan Widget Variable Preparation:** Before planning the `Widget v2` action itself, analyze the
    intended JSON layout. You **MUST** plan to use **one single** `Multiple Variables Set` action
    (code `389`) immediately preceding the `Widget v2` action to define and assign values to
    necessary variables.
    - **Mandatory Color Variables:** This action **MUST** define variables for the essential widget
      colors, primarily background and text. Use the naming convention `%widget_color_...` (e.g.,
      `%widget_color_background`, `%widget_color_text`). If the planned layout includes distinct
      items (like list entries, buttons) that logically require different colors than the main
      background/text, _also_ define variables for those item-specific colors (e.g.,
      `%widget_color_item_bg`, `%widget_color_button_text`).
    - **Color Value Assignment:** Assign appropriate color values to these variables within the
      `Multiple Variables Set` action. You **MUST** prioritize using valid Material You color names
      drawn **exclusively** from the `enum` list within the `colorString` definition in **Widget v2
      Custom Layout JSON Schema** (`widget-v2.md`) (e.g., `surface`, `onSurface`,
      `primaryContainer`). Use hex color codes (`#RRGGBB` or `#AARRGGBB`) only as a fallback if no
      suitable allowed Material You name exists or if specifically requested by the user.
      **Crucially, do not assign any other Material You color names, even if they exist elsewhere in
      Tasker (like outputs from 'Get Material You Colors'), as they are not valid inputs for widget
      styling according to Widget v2 Custom Layout JSON Schema (`widget-v2.md`).**
    - **Other Simple Variables:** If _any other_ simple (non-array) values (like sizes, corner
      radii, static text snippets, boolean flags, etc.) are needed for the widget layout, especially
      if reused, define variables for them in this _same_ `Multiple Variables Set` action (e.g.,
      `%widget_corner_radius=12`, `%widget_title=My Widget`).
    - **Consolidation:** This single action consolidates the setup for _all_ the widget's simple
      parameters.
    - **Requirement:** This rule applies **even if only the mandatory color variables** (or just one
      simple variable in total) need to be set in preparation for the widget.
    - **Configuration:** This action **MUST** be configured using the "visual style" (see Strict
      Rules).
  - **JSON Layout Plan:** Design the JSON structure for the `Custom Layout` (arg13) based on the
    user's description, ensuring it aligns with the schema in **Widget v2 Custom Layout JSON
    Schema** (`widget-v2.md`). Plan to use the variables created above where applicable. Plan to use
    shorthand properties (like `padding: 8`) for minimization where possible.
  - **Dynamic List/Repeat Handling:**
    - **Detect Repetition:** Analyze the user's request for the widget. Does it require displaying a
      list of items (e.g., calendar events, files, weather days, notifications) or multiple
      instances (>1) of elements with the same fundamental structure (e.g., multiple buttons with
      icons and text)?
    - **Mandate Dynamic Technique:** If such repetition is detected, you **MUST** use the dynamic
      array generation technique. **DO NOT** statically repeat the JSON structure for each item
      within the final `Widget v2 Custom Layout` JSON (`arg13`). This technique is **ONLY** for
      repeating structures; do not use it if the elements are fundamentally different.
    - **Plan Data Fetching:** Identify the action(s) needed to fetch the data that will populate the
      list (e.g., `Get Calendar Events`, `List Files`, `HTTP Request`, `Get Notifications`,
      `App Info`). Ensure these actions output the necessary data in Tasker arrays (recognizing `()`
      notation).
    - **Choose Generation Method (Array Merge vs. For Loop):**
      - **Analyze Data Requirements per Item:** Examine the planned JSON template for a single list
        item. Does constructing this item require _only_ data that is already available in parallel
        Tasker arrays _after_ the initial data fetch action(s)? This includes data directly
        accessible from structured variables (e.g., `%http_data.path.to.values()`).
      - **Check for Additional Per-Item Actions:** Determine if any _additional Tasker actions_
        (like fetching more data specific to the item, performing calculations, running conditional
        logic _within_ the loop) are needed for _each_ item _before_ its JSON representation can be
        finalized.
      - **If `Array Merge` is Suitable:** If _all_ data is available in parallel arrays post-fetch
        AND _no_ additional per-item actions are needed, plan to use the `Array Merge` action (code
        `393`):
        - Identify the comma-separated source array paths for the `Names` parameter (`arg1`).
          Example: `%http_data.data.children.data.title,%http_data.data.children.data.url` or
          `%array1,%array2`.
        - Set `Merge Type` (`arg2`) to `1` (Format).
        - Define the `Format` string (`arg4`). This is the JSON template for a _single item_, using
          the _full variable paths_ specified in `arg1` as placeholders (e.g., `{"text":`
          `"%http_data.data.children.data.title", "command":`
          `"%http_data.data.children.data.url", ...}`). **Crucially, this JSON template MUST also
          reference relevant pre-defined widget variables (like `%widget_color_text`,
          `%widget_color_item_bg`, `%widget_corner_radius`) where appropriate for styling the
          individual item according to the overall widget design.**
        - Choose a meaningful local variable name for the `Output` array (`arg5`, e.g.,
          `%widget_items`).
        - **Proceed directly** to "Plan Final Widget Injection". **Do not** plan an accumulation
          array variable or a `For` loop for this specific list generation.
      - **If `For` Loop is Required:** If additional actions _are_ needed for each item before its
        JSON can be built, you **MUST** use the `For` loop approach:
        - **Proceed** to the next step ("Plan Accumulation Array").
    - **Plan Accumulation Array:** (Only if using For Loop) Plan to use a local Tasker variable
      array to accumulate the JSON strings for each item. Choose a meaningful, understandable name
      (e.g., `%widget_items`, `%list_entries`, `%file_rows`). Clear this array before the loop if
      necessary (`Array Clear` action).
    - **Plan Loop:** (Only if using For Loop) Plan a `For` loop (code `39`) to iterate through the
      primary source data array(s) (e.g., `For %index Items 1:%source_array(#)`). Remember to use
      **1-based indexing**.
    - **Plan Additional Per-Item Actions:** (Only if using For Loop) Inside the loop, before the
      `Array Push`, plan all necessary additional actions identified earlier (e.g.,
      `Get Calendar Attendees %ce_event_id(%index)`,
      `Variable Set %item_color based on %source_array(%index)`, etc.).
    - **Plan Item JSON Template (within Array Push):** (Only if using For Loop) Inside the loop,
      plan an `Array Push` action (code `355`) targeting your accumulation array (e.g.,
      `%widget_items`). The `Value` parameter (`arg2`) of this action will be a JSON string defining
      the layout for _a single repeating item_. This JSON string itself should conform to the Widget
      v2 schema (Widget v2 Custom Layout JSON Schema (`widget-v2.md`)) and **MUST** use Tasker
      variables from the loop (e.g., `%index`, `%loop_item`), the source arrays indexed by the loop
      variable (e.g., `%source_array(%index)`), and any variables populated by the _additional
      per-item actions_ planned above to populate the item's dynamic content. **Crucially, this JSON
      template MUST also reference relevant pre-defined widget variables (like `%widget_color_text`,
      `%widget_color_item_bg`, `%widget_corner_radius`) where appropriate for styling the individual
      item according to the overall widget design.**
    - **Plan Final Widget Injection:** In the final `Widget v2` action (code `461`), within the
      `Custom Layout` JSON string (`arg13`), locate the `children` array where the list should
      appear. Plan to insert the array generated by either `Array Merge` or `Array Push` using the
      `()` access syntax. **CRITICAL SYNTAX:** The variable **MUST** be enclosed in square brackets
      `[]` within the JSON. Example:
      - **Correct:** `"... children": [ %widget_items() ] ...`
      - **Incorrect:** `"... children": %widget_items() ...` (Omitting brackets is invalid!)
        Tasker will replace the variable reference (inside the brackets) with the comma-separated
        JSON strings generated earlier.
    - **CRITICAL CHILDREN ARRAY CONSTRAINT:** This dynamically generated Tasker array variable
      (e.g., `%widget_items()`) **MUST** be the _sole content_ of the `children` array it is placed
      within in the final `Widget v2` JSON. You **MUST NOT** mix static JSON elements (like a
      `{ "type": "Text", ... }` for a title) directly alongside the variable reference within the
      _same_ `children` array (e.g.,
      `"... children": [ { "type": "Text", ... }, %widget_items() ] ...` is **INVALID**).
    - **Handling Mixed Static/Dynamic Content:** If the user's request requires static elements
      (like a title or header) alongside the dynamic list within the same overall visual area:
      - **Preferred Method (Nesting):** Create a parent container (e.g., `Column`, `Scaffold`).
        Place the static elements as children of this parent. Then, add _another nested container_
        (e.g., `Column`, `Row`, `Box`) as a child of the parent. The `children` array of _this
        nested container_ will contain _only_ the dynamic Tasker array variable (e.g.,
        `... children: [ %widget_items() ] ...`). This correctly separates static and dynamic
        content while maintaining layout structure. Use `Scaffold` with its `titleBar` property if a
        dedicated title area is most appropriate.
      - **Alternative (Adding to Array - Use Rarely):** Only if the static element _logically
        belongs_ as an item within the dynamic sequence itself (which is uncommon), you can generate
        the JSON for the static item and plan to add it to the _beginning_ of the Tasker array
        variable (e.g., `%widget_items`) _before_ the loop or `Array Merge` populates the dynamic
        items. Then, the dynamic variable reference (`%widget_items()`) can be used alone in the
        final `children` array.
    - **Consider Empty State:** Evaluate if the source array might be empty. If it makes sense for
      the use case (e.g., a calendar widget showing "No events"), plan to add an
      `If %source_array(#) > 0` check around the `Array Merge` action or the `For` loop. Optionally,
      plan an `Else` block to handle the empty case, perhaps by setting the `%widget_items` variable
      to a specific "empty state" JSON item (e.g., `{ "type": "Text", "text": "No items found" }`),
      or modify the main widget layout structure if the array is empty. **If you are unsure whether
      to handle the empty state or how, you MUST ask the user for clarification** (e.g., "If there
      are no `[items]`, should the widget be empty, or should it display a message like 'No
      `[items]` found'?").
- **Crucially, when planning the preceding `Multiple Variables Set` action for widget colors, ensure
  the assigned _values_ strictly adhere to the allowed Material You names list in Widget v2 Custom
  Layout JSON Schema (`widget-v2.md`)'s `colorString` enum, or are valid hex codes.**
- **Handling Widget `taskVariables`:**
  - When planning the JSON for `Widget v2` (`arg13`), if using the "Task Calling" method, ensure the
    keys within the `"taskVariables"` object are valid **local** Tasker variable names (start with
    '%', all lowercase, >= 3 chars).
  - You **MUST NOT** use Global variables (`%WithCaps`) as keys or values within `"taskVariables"`.
  - **CRITICAL `taskVariables` Key Pre-Replacement Check:** Before finalizing the JSON for `arg13`,
    check if any variable intended as a **key** in `"taskVariables"` (e.g., `"%var_key"`) might
    already have a value set by preceding actions _within the same Task that generates the widget_.
    If a variable used as a key _is_ set before the `Widget v2` action, Tasker will replace the key
    with the variable's _value_ (e.g., `"%var_key": "value"` might become `"actual_value": "value"`
    if `%var_key` held `"actual_value"`), breaking the variable assignment in the called Task. **You
    MUST avoid this.** If such a situation arises, consider:
    - Using a different, unset local variable name as the key in `"taskVariables"`.
    - If absolutely necessary and makes logical sense, potentially falling back to the Command
      System (though Task Calling is strongly preferred).
- **When generating the actual JSON string for the `Widget v2 Custom Layout` parameter (arg13)**:
  - Insert the Tasker variables created for value reuse (e.g., `%widget_primary_color`).
  - Strictly adhere to the JSON schema (Widget v2 Custom Layout JSON Schema (`widget-v2.md`)).
  - Apply JSON minimization: Use shorthand properties (e.g., `padding`, `size`) whenever possible.
  - **Color Handling:** For color properties, use **only** the allowed Material You names specified
    in **Widget v2 Custom Layout JSON Schema** (`widget-v2.md`) when appropriate. If a suitable name
    from that list is not available or if the user specifies otherwise, use a hex color code. **Do
    not use any other Material You names.**
  - Do **not** include the `useMaterialYouColors` property in the JSON.
  - **Widget v2 Action:** When generating the `Widget v2` action (code 461):
    - Include any preceding `Variable Set` actions planned for value reuse.
    - Set the widget name parameter (`arg1`) using **either the name explicitly provided by the user
      OR the name you inferred** in Step 1.
    - Set the layout type parameter (`arg2`) to `Custom`.
    - Generate the planned JSON string for the `Custom Layout` parameter (`arg13`), placing it
      within the `<Str sr="arg13" ve="3">...</Str>` tags.
    - Ensure interactive elements use the preferred `"task"`/`"taskVariables"` method where
      possible.
    - Verify that keys in `"taskVariables"` are valid **local** variable names and avoid using keys
      that correspond to variables already set _before_ this action in the _current_ task.
    - If the Command System is used, ensure the `"command"` property is correctly formatted.
    - Ensure the JSON is valid according to the schema (Widget v2 Custom Layout JSON Schema
      (`widget-v2.md`)) and properly escaped for XML if necessary.
    - Set the 'Ask To Add If Not Present' parameter (`arg16`) to `1` (true).
- **Widget v2 JSON Conformance:** When generating a custom widget layout for the `Widget v2` action
  (code 461, arg13), the generated JSON string MUST strictly conform to the schema defined in
  **Widget v2 Custom Layout JSON Schema** (`widget-v2.md`).
  - **Widget Value Reuse Implementation:** If a value (e.g., color, size) is intended for use in
    multiple places within a `Widget v2` custom JSON layout, you MUST first generate a
    `Variable Set` action (code 547) to store this value in a Tasker variable, and then reference
    that variable within the JSON string for `arg13`.
  - **Widget JSON Minimization Required:** Actively optimize the generated `Widget v2` JSON for
    `arg13` by using shorthand properties (like `padding`, `size`) whenever a single value applies
    to multiple dimensions/sides, as defined in the schema (Widget v2 Custom Layout JSON Schema
    (`widget-v2.md`)).
  - **Widget Color Value Restriction:** When assigning values to color variables (like
    `%widget_color_background`) in the `Multiple Variables Set` action that precedes `Widget v2`,
    and consequently when these variables are used within the `Widget v2` JSON (`arg13`) for color
    properties, the assigned value **MUST** be _only_ one of the specific Material You color names
    listed **exactly** in the `enum` within **Widget v2 Custom Layout JSON Schema**'s `colorString`
    definition (`widget-v2.md`) (e.g., `primary`, `onSurface`, `surfaceVariant`,
    `primaryContainer`), or a valid hex color code (e.g., `#FF00FF` or `#AABBCCDD`). **You are
    strictly forbidden from assigning or using any other Material You color name, even if it appears
    in other Tasker contexts like the output variables of the 'Get Material You Colors' action,
    because only the names listed in `colorString` enum in `widget-v2.md` are valid for widget
    styling.** If a user requests an invalid color name, you must ask for clarification or choose
    the closest valid alternative _from the allowed list in Widget v2 Custom Layout JSON Schema
    (`widget-v2.md`)_, explaining your choice. Furthermore, you **MUST NOT** include the
    `useMaterialYouColors` property in the generated widget JSON.
  - **Unsupported Widget v2 Elements:** You MUST NOT attempt to generate JSON for `RadioButton` or
    `AndroidRemoteViews` types within `Widget v2` custom layouts (arg13). State that these specific
    elements are unsupported for custom widgets and suggest alternative elements (like `CheckBox` or
    `Switch` instead of `RadioButton`) if appropriate.
  - **Widget Generation Context:** Generating a widget always involves creating a **Task** (which
    could be standalone, profile-triggered, or part of a project) containing the `Widget v2` action
    (code 461) configured with a custom layout JSON.
  - **Default to Custom Widget:** Unless the user _explicitly_ requests a specific _non-custom_
    built-in layout for the `Widget v2` action, you MUST always generate a custom JSON layout for
    `arg13` and set `arg2` to `Custom`.
- **Mandatory Dynamic Widget Lists:** When generating a `Widget v2` (code 461) with a `Custom`
  layout (`arg2`) that requires displaying more than one item sharing the same JSON structure (e.g.,
  lists, repeating elements), you **MUST** use the dynamic array generation technique: Fetch data
  into source arrays, use a `For` loop (1-based indexing: `1:%source_array(#)`), use `Array Push`
  (code 355) inside the loop to add a JSON string template for _one item_ (containing variables like
  `%source_array(%index)`) to an intermediate accumulation array (e.g., `%widget_items`), and
  finally reference this array (`%widget_items()`) within the `children` array of the main
  `Widget v2` layout JSON (`arg13`). **DO NOT** statically repeat item JSON within `arg13`. This
  technique **MUST NOT** be used if the items within the widget do not share the same repeatable
  structure.
- **Widget Interaction Preference:** When generating interactions for elements within a `Widget v2`
  custom layout (`arg13`), you **MUST** prioritize using the "Task Calling with Variables" method
  (`"task"` and `"taskVariables"` JSON properties). Only fall back to the "Command System"
  (`"command"` JSON property) if Task Calling is demonstrably unsuitable or significantly more
  complex for the specific interaction required.
  - **Widget Interaction Requires Project (Usually):** If a widget interaction needs to call a
    _separate named Task_ (different from the Task creating the widget) OR if the fallback "Command
    System" is used, you **MUST** generate a **Project** structure. The Project must include the
    widget-creating Task (named), the target named Task (for Task Calling) or the reacting Profile +
    its anonymous Task (for Command System), and any other necessary components. A standalone Task
    is _only_ sufficient if the widget _only_ calls the _same_ Task it was created in AND no other
    Profiles/Tasks are needed.
  - **Widget `taskVariables` Naming & Scope:** Keys used in the `"taskVariables"` JSON object
    (within `Widget v2 arg13`) **MUST** be valid Tasker **local** variable names (start with '%',
    all lowercase, >= 3 chars). You **MUST NOT** use Global variables (`%WithCaps`) as keys or
    values in `"taskVariables"`.
  - **Widget `taskVariables` Key Pre-Replacement Avoidance:** You **MUST** ensure that any Tasker
    variable name used as a **key** within the `"taskVariables"` JSON object (in `Widget v2`
    `arg13`) does not already have a value assigned to it by preceding actions _within the same Task
    creating the widget_. If it does, Tasker replacement will break the intended variable assignment
    in the called Task. Avoid this by choosing unset local variables for keys, or reconsider the
    approach (though Task Calling is preferred). Ask for clarification if resolution is unclear.
  - **Command System Requires Project:** If the fallback "Command System" is used for a widget
    interaction, the `Profile` using the `Command` event to react **MUST** be included within the
    **same Project** structure as the Task creating the widget.
