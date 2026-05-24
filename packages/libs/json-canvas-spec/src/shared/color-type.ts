import { Schema } from "effect";

export const ColorType = Schema.Union(
  Schema.Literal("1").annotations({ title: "red" }),
  Schema.Literal("2").annotations({ title: "orange" }),
  Schema.Literal("3").annotations({ title: "yellow" }),
  Schema.Literal("4").annotations({ title: "green" }),
  Schema.Literal("5").annotations({ title: "cyan" }),
  Schema.Literal("6").annotations({ title: "purple" }),
  Schema.TemplateLiteral("#", Schema.String),
);
