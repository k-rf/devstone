import { expect, it } from "vitest";

import { Primitives } from "../index.js";

type OklchComponents = readonly [number, number, number];
type LinearRgb = readonly [number, number, number];

type LeafEntry = Readonly<{
  readonly path: string;
  readonly $type: string;
  readonly $value: unknown;
}>;

const expectedColorScaleSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const isPlainRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && Boolean(value) && !Array.isArray(value);

const isLeafToken = (
  value: unknown,
): value is Readonly<{ readonly $type: string; readonly $value: unknown }> =>
  isPlainRecord(value) &&
  typeof value["$type"] === "string" &&
  value["$type"].length > 0 &&
  "$value" in value &&
  value["$value"] !== undefined;

const collectLeafEntries = (node: unknown, prefix = ""): readonly LeafEntry[] => {
  if (isLeafToken(node)) return [{ path: prefix, $type: node.$type, $value: node.$value }];

  if (!isPlainRecord(node)) return [];

  return Object.entries(node).flatMap(([key, child]) => {
    const nextPath = prefix.length > 0 ? `${prefix}.${key}` : key;
    return collectLeafEntries(child, nextPath);
  });
};

const isOklchValue = (
  value: unknown,
): value is Readonly<{ readonly colorSpace: "oklch"; readonly components: OklchComponents }> =>
  isPlainRecord(value) &&
  value["colorSpace"] === "oklch" &&
  Array.isArray(value["components"]) &&
  value["components"].length === 3 &&
  value["components"].every((component) => typeof component === "number");

const oklchToLinearSrgb = ([lightness, chroma, hue]: OklchComponents): LinearRgb => {
  const hueRadians = (hue * Math.PI) / 180;
  const axisA = chroma * Math.cos(hueRadians);
  const axisB = chroma * Math.sin(hueRadians);

  const coneL = lightness + 0.396_337_777_4 * axisA + 0.215_803_757_3 * axisB;
  const coneM = lightness - 0.105_561_345_8 * axisA - 0.063_854_172_8 * axisB;
  const coneS = lightness - 0.089_484_177_5 * axisA - 1.291_485_548 * axisB;

  const linearL = coneL * coneL * coneL;
  const linearM = coneM * coneM * coneM;
  const linearS = coneS * coneS * coneS;

  const red = 4.076_741_662_1 * linearL - 3.307_711_591_3 * linearM + 0.230_969_929_2 * linearS;
  const green = -1.268_438_004_6 * linearL + 2.609_757_401_1 * linearM - 0.341_319_396_5 * linearS;
  const blue = -0.004_196_086_3 * linearL - 0.703_418_614_7 * linearM + 1.707_614_701 * linearS;

  return [red, green, blue];
};

it("すべての必須カテゴリを持ち、全末端トークンが $type と $value を持つこと", () => {
  expect(Object.keys(Primitives)).toEqual([
    "color",
    "spacing",
    "radius",
    "borderWidth",
    "font",
    "duration",
    "easing",
  ]);

  const leaves = collectLeafEntries(Primitives);
  expect(leaves.length).toBeGreaterThan(0);

  leaves.forEach((entry) => {
    expect(entry.$type.length, entry.path).toBeGreaterThan(0);
    expect(entry.$value, entry.path).toBeDefined();
  });
});

it("すべてのカラースケールが 11 段階を持ち、Lightness が 50 から 950 へ単調減少すること", () => {
  const colorEntries: readonly (readonly [string, unknown])[] = Object.entries(Primitives.color);
  const scaleEntries = colorEntries.filter(
    ([, group]) => isPlainRecord(group) && !("$type" in group),
  );

  expect(scaleEntries.length).toBeGreaterThan(0);

  scaleEntries.forEach(([hueName, scale]) => {
    if (!isPlainRecord(scale)) expect.unreachable(`${hueName} がオブジェクトではありません`);

    expect(Object.keys(scale), hueName).toEqual([...expectedColorScaleSteps]);

    const lightnessSteps = expectedColorScaleSteps.map((step) => {
      const token = scale[step];
      if (!isLeafToken(token) || !isOklchValue(token.$value)) {
        expect.unreachable(`${hueName}.${step} が OKLCH トークンではありません`);
      }

      return { step: step, lightness: token.$value.components[0] };
    });

    const darkestLightness = lightnessSteps.reduce((previousLightness, current) => {
      expect(current.lightness, `${hueName}.${current.step}`).toBeLessThan(previousLightness);
      return current.lightness;
    }, Number.POSITIVE_INFINITY);

    expect(darkestLightness, `${hueName}.950`).toBeGreaterThan(0);
  });
});

it("すべての Primitive カラーが sRGB ガマット内に収まっていること", () => {
  const colorLeaves = collectLeafEntries(Primitives.color, "color");
  const tolerance = 1e-6;

  colorLeaves.forEach((entry) => {
    if (!isOklchValue(entry.$value)) {
      expect.unreachable(`${entry.path} が OKLCH 形式ではありません`);
    }

    const linearRgb = oklchToLinearSrgb(entry.$value.components);
    linearRgb.forEach((channel, channelIndex) => {
      expect(channel, `${entry.path} channel[${String(channelIndex)}]`).toBeGreaterThanOrEqual(
        -tolerance,
      );
      expect(channel, `${entry.path} channel[${String(channelIndex)}]`).toBeLessThanOrEqual(
        1 + tolerance,
      );
    });
  });
});
