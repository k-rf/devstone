# Claude Code Plugin Marketplace

Claude Code向けのプラグイン集です。

## ディレクトリ構造

```plaintext
/workspaces/devstone/
├── .claude-plugin/
│   └── marketplace.json         # マーケットプレイスカタログ
└── packages/plugins/claude/
    ├── {{plugin-name}}/         # 各プラグイン
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   ├── skills/
    │   │   └── {{skill-name}}/
    │   │       └── SKILL.md
    │   └── README.md
    └── README.md
```

## 新規プラグインの作成手順

1. `skill-development` スキルを使用してプラグインを作成する
2. `.claude-plugin/marketplace.json` の `plugins` 配列にエントリを追加する

   ```json
   {
     "name": "{{plugin-name}}",
     "source": "./{{plugin-name}}",
     "description": "プラグインの説明",
     "version": "1.0.0"
   }
   ```
