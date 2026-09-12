# devstone/outbound-partitioning

Outbound Port と Adapter を、技術スタックではなく接続先の外部サービス単位で分割することを強制します。

```text
src/core/port/outbound/notion/task-board.port.ts
src/adapter/outbound/toggl/toggl-http.adapter.ts
```

`outbound` 直下へのファイル配置、および `http`、`kv`、`db`、`database`、`fetch`、`rest`、`graphql`、`api`、`r2`、`d1` を直下ディレクトリに使用することは禁止します。
