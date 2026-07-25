import { type Rule } from "eslint";

interface NamedExportDeclaration {
  readonly type: string;
  readonly declarations?: readonly {
    readonly id: {
      readonly type: string;
      readonly name?: string;
    };
  }[];
  readonly id?: {
    readonly type: string;
    readonly name: string;
  } | null;
}

interface NamedExportSpecifier {
  readonly type: string;
  readonly exportKind?: string;
  readonly exported: {
    readonly type: string;
    readonly name?: string;
  };
}

/**
 * ファイルパスから役割サフィックス（Workflow / Activity）を解決する。
 * `.workflow.spec.ts` のようなテストファイルは対象外。
 */
const getRoleSuffixFromFilename = (filename: string): string | undefined => {
  const normalized = filename.replaceAll("\\", "/");
  const match = /\.(workflow|activity)\.(?:[cm]?[jt]sx?)$/u.exec(normalized);

  if (match?.[1] === "workflow") {
    return "Workflow";
  }

  if (match?.[1] === "activity") {
    return "Activity";
  }

  return undefined;
};

const isTypeExportKind = (node: { readonly exportKind?: string }): boolean =>
  node.exportKind === "type";

const reportMissingRoleSuffix = (
  context: Rule.RuleContext,
  node: object,
  name: string,
  roleSuffix: string,
): void => {
  if (name.endsWith(roleSuffix)) {
    return;
  }

  context.report({
    // Visitor から得た Identifier 等は parent 付きだが、型上は欠けることがある
    node: node as Rule.Node,
    messageId: "missingRoleSuffix",
    data: {
      name: name,
      roleSuffix: roleSuffix,
    },
  });
};

const checkDeclarationExports = (
  context: Rule.RuleContext,
  declaration: NamedExportDeclaration,
  roleSuffix: string,
): void => {
  if (declaration.type === "VariableDeclaration") {
    for (const declarator of declaration.declarations ?? []) {
      if (declarator.id.type === "Identifier" && declarator.id.name !== undefined) {
        reportMissingRoleSuffix(context, declarator.id, declarator.id.name, roleSuffix);
      }
    }
    return;
  }

  if (
    (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") &&
    declaration.id
  ) {
    reportMissingRoleSuffix(context, declaration.id, declaration.id.name, roleSuffix);
  }
};

const checkExportSpecifiers = (
  context: Rule.RuleContext,
  specifiers: readonly NamedExportSpecifier[],
  roleSuffix: string,
): void => {
  for (const specifier of specifiers) {
    if (specifier.type !== "ExportSpecifier" || isTypeExportKind(specifier)) {
      continue;
    }

    if (specifier.exported.type === "Identifier" && specifier.exported.name !== undefined) {
      reportMissingRoleSuffix(context, specifier.exported, specifier.exported.name, roleSuffix);
    }
  }
};

/**
 * 役割サフィックス付きファイルの named export が、役割名で終わることを強制する。
 */
export const exportRoleSuffixesRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require exported variable/function names in role-suffixed files to end with the matching role suffix.",
    },
    schema: [],
    messages: {
      missingRoleSuffix:
        "'{{name}}' は '{{roleSuffix}}' で終わる必要があります（ファイル役割: {{roleSuffix}}）。",
    },
  },
  create: function (context) {
    const roleSuffix = getRoleSuffixFromFilename(context.filename);

    if (roleSuffix === undefined) {
      return {};
    }

    return {
      // ESLint visitor キーは AST ノード型名（PascalCase）である必要がある
      // eslint-disable-next-line @typescript-eslint/naming-convention -- AST selector
      ExportNamedDeclaration: function (node) {
        if (isTypeExportKind(node as { readonly exportKind?: string })) {
          return;
        }

        if (node.declaration) {
          checkDeclarationExports(context, node.declaration, roleSuffix);
        }

        checkExportSpecifiers(context, node.specifiers, roleSuffix);
      },
    };
  },
};
