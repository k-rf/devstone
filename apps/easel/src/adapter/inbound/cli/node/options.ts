import { Options } from "@effect/cli";

export const nodeIdOptionBase = Options.text("id");
export const xOptionBase = Options.integer("x");
export const yOptionBase = Options.integer("y");
export const widthOptionBase = Options.integer("width");
export const heightOptionBase = Options.integer("height");
export const colorOptionBase = Options.text("color");
export const labelOptionBase = Options.text("label");
