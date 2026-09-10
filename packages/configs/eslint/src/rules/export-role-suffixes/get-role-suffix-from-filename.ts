import { P, match } from "ts-pattern";

import { noop } from "../libs/noop.js";

const Suffix = {
  Workflow: "Workflow",
  Activity: "Activity",
} as const;

type Suffix = (typeof Suffix)[keyof typeof Suffix];

/**
 * ファイルパスから役割サフィックス（Workflow / Activity）を解決する。
 * `.workflow.spec.ts` のようなテストファイルは対象外。
 */
export const getRoleSuffixFromFilename = (filename: string): Suffix | undefined => {
  const normalized = filename.replaceAll("\\", "/");
  const regex = /\.(workflow|activity)\.(?:[cm]?[jt]sx?)$/u;

  return match(regex.exec(normalized)?.[1])
    .with("workflow", () => Suffix.Workflow)
    .with("activity", () => Suffix.Activity)
    .with(P.string.optional(), noop)
    .exhaustive();
};
