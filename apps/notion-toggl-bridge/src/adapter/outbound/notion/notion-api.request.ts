export interface NotionQueryDatabaseRequest {
  readonly filter?: {
    readonly property: string;
    readonly date: {
      readonly on_or_before: string;
    };
  };
  readonly sorts?: readonly {
    readonly property: string;
    readonly direction: "ascending" | "descending";
  }[];
  readonly page_size?: number;
}

export interface NotionPatchPageRequest {
  readonly properties: Record<
    string,
    {
      readonly relation: readonly { readonly id: string }[];
    }
  >;
}
