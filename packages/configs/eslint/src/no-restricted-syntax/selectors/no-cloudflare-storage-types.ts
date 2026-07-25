export const noCloudflareStorageTypes = [
  {
    selector: "TSTypeReference[typeName.name=/^(KVNamespace|D1Database|R2Bucket)$/]",
    message:
      "Core層で Cloudflare ストレージ型を直接参照しないでください。Outbound Port 経由で隠蔽してください。",
  },
  {
    selector: "TSTypeReference[typeName.right.name=/^(KVNamespace|D1Database|R2Bucket)$/]",
    message:
      "Core層で Cloudflare ストレージ型を直接参照しないでください。Outbound Port 経由で隠蔽してください。",
  },
] as const;
