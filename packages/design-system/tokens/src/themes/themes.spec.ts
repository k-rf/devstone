import { expect, it } from "vitest";

import { Primitives, Themes, type Theme, type ThemeContract } from "../index.js";

type OklchComponents = readonly [number, number, number];
type LinearRgb = readonly [number, number, number];

type LeafEntry = Readonly<{
  readonly path: string;
  readonly $type: string;
  readonly $value: unknown;
}>;

type ThemeVariantEntry = Readonly<{
  readonly label: string;
  readonly variant: ThemeContract;
}>;

type ContrastRequirement = Readonly<{
  readonly pairName: string;
  readonly foreground: OklchComponents;
  readonly background: OklchComponents;
  readonly minimumRatio: number;
}>;

const statusKinds = ["info", "success", "warning", "danger"] as const;

const themeVariants: readonly ThemeVariantEntry[] = Object.entries<Theme>(Themes).flatMap(
  ([themeName, theme]) =>
    Object.entries<ThemeContract>(theme).map(([modeName, variant]) => ({
      label: `${themeName}.${modeName}`,
      variant: variant,
    })),
);

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

const resolvePath = (root: unknown, segments: readonly string[]): unknown =>
  segments.reduce<unknown>(
    (current, segment) =>
      isPlainRecord(current)
        ? Object.entries(current).find(([entryKey]) => entryKey === segment)?.[1]
        : undefined,
    root,
  );

const isOklchValue = (
  value: unknown,
): value is Readonly<{ readonly colorSpace: "oklch"; readonly components: OklchComponents }> =>
  isPlainRecord(value) &&
  value["colorSpace"] === "oklch" &&
  Array.isArray(value["components"]) &&
  value["components"].length === 3 &&
  value["components"].every((component) => typeof component === "number");

const resolveColorComponents = (alias: string): OklchComponents => {
  const segments = alias.slice(1, -1).split(".");
  const target = resolvePath(Primitives, segments);
  if (!isLeafToken(target) || !isOklchValue(target.$value)) {
    expect.unreachable(`カラーエイリアス ${alias} を解決できません`);
  }

  return target.$value.components;
};

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

const clampUnit = (channel: number): number => Math.min(1, Math.max(0, channel));

const computeRelativeLuminance = (components: OklchComponents): number => {
  const [red, green, blue] = oklchToLinearSrgb(components);
  return 0.2126 * clampUnit(red) + 0.7152 * clampUnit(green) + 0.0722 * clampUnit(blue);
};

const computeContrastRatio = (first: OklchComponents, second: OklchComponents): number => {
  const firstLuminance = computeRelativeLuminance(first);
  const secondLuminance = computeRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const resolveTokenComponents = (token: Readonly<{ readonly $value: string }>): OklchComponents =>
  resolveColorComponents(token.$value);

const buildContrastRequirements = (variant: ThemeContract): readonly ContrastRequirement[] => {
  const { bg: background, fg: foreground, border } = variant.color;

  const baseRequirements: readonly ContrastRequirement[] = [
    {
      pairName: "fg.default on bg.canvas",
      foreground: resolveTokenComponents(foreground.default),
      background: resolveTokenComponents(background.canvas),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.default on bg.surface",
      foreground: resolveTokenComponents(foreground.default),
      background: resolveTokenComponents(background.surface),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.default on bg.subtle",
      foreground: resolveTokenComponents(foreground.default),
      background: resolveTokenComponents(background.subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.default on bg.muted",
      foreground: resolveTokenComponents(foreground.default),
      background: resolveTokenComponents(background.muted),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.default on bg.emphasized",
      foreground: resolveTokenComponents(foreground.default),
      background: resolveTokenComponents(background.emphasized),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.muted on bg.canvas",
      foreground: resolveTokenComponents(foreground.muted),
      background: resolveTokenComponents(background.canvas),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.muted on bg.surface",
      foreground: resolveTokenComponents(foreground.muted),
      background: resolveTokenComponents(background.surface),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.muted on bg.subtle",
      foreground: resolveTokenComponents(foreground.muted),
      background: resolveTokenComponents(background.subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.muted on bg.muted",
      foreground: resolveTokenComponents(foreground.muted),
      background: resolveTokenComponents(background.muted),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.subtle on bg.canvas",
      foreground: resolveTokenComponents(foreground.subtle),
      background: resolveTokenComponents(background.canvas),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.subtle on bg.surface",
      foreground: resolveTokenComponents(foreground.subtle),
      background: resolveTokenComponents(background.surface),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.subtle on bg.subtle",
      foreground: resolveTokenComponents(foreground.subtle),
      background: resolveTokenComponents(background.subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.subtle on bg.muted",
      foreground: resolveTokenComponents(foreground.subtle),
      background: resolveTokenComponents(background.muted),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.inverse on bg.inverse",
      foreground: resolveTokenComponents(foreground.inverse),
      background: resolveTokenComponents(background.inverse),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.inverse on bg.accent.default",
      foreground: resolveTokenComponents(foreground.inverse),
      background: resolveTokenComponents(background.accent.default),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.inverse on bg.accent.emphasized",
      foreground: resolveTokenComponents(foreground.inverse),
      background: resolveTokenComponents(background.accent.emphasized),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.accent on bg.canvas",
      foreground: resolveTokenComponents(foreground.accent),
      background: resolveTokenComponents(background.canvas),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.accent on bg.surface",
      foreground: resolveTokenComponents(foreground.accent),
      background: resolveTokenComponents(background.surface),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.accent on bg.subtle",
      foreground: resolveTokenComponents(foreground.accent),
      background: resolveTokenComponents(background.subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.accent on bg.accent.subtle",
      foreground: resolveTokenComponents(foreground.accent),
      background: resolveTokenComponents(background.accent.subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: "fg.accent on bg.accent.muted",
      foreground: resolveTokenComponents(foreground.accent),
      background: resolveTokenComponents(background.accent.muted),
      minimumRatio: 4.5,
    },
    {
      pairName: "border.focus on bg.canvas",
      foreground: resolveTokenComponents(border.focus),
      background: resolveTokenComponents(background.canvas),
      minimumRatio: 3,
    },
    {
      pairName: "border.focus on bg.surface",
      foreground: resolveTokenComponents(border.focus),
      background: resolveTokenComponents(background.surface),
      minimumRatio: 3,
    },
  ];

  const statusRequirements: readonly ContrastRequirement[] = statusKinds.flatMap((kind) => [
    {
      pairName: `fg.status.${kind} on bg.canvas`,
      foreground: resolveTokenComponents(foreground.status[kind]),
      background: resolveTokenComponents(background.canvas),
      minimumRatio: 4.5,
    },
    {
      pairName: `fg.status.${kind} on bg.surface`,
      foreground: resolveTokenComponents(foreground.status[kind]),
      background: resolveTokenComponents(background.surface),
      minimumRatio: 4.5,
    },
    {
      pairName: `fg.status.${kind} on bg.subtle`,
      foreground: resolveTokenComponents(foreground.status[kind]),
      background: resolveTokenComponents(background.subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: `fg.status.${kind} on bg.status.${kind}.subtle`,
      foreground: resolveTokenComponents(foreground.status[kind]),
      background: resolveTokenComponents(background.status[kind].subtle),
      minimumRatio: 4.5,
    },
    {
      pairName: `fg.status.${kind} on bg.status.${kind}.muted`,
      foreground: resolveTokenComponents(foreground.status[kind]),
      background: resolveTokenComponents(background.status[kind].muted),
      minimumRatio: 4.5,
    },
    {
      pairName: `fg.inverse on bg.status.${kind}.default`,
      foreground: resolveTokenComponents(foreground.inverse),
      background: resolveTokenComponents(background.status[kind].default),
      minimumRatio: 4.5,
    },
    {
      pairName: `fg.inverse on bg.status.${kind}.emphasized`,
      foreground: resolveTokenComponents(foreground.inverse),
      background: resolveTokenComponents(background.status[kind].emphasized),
      minimumRatio: 4.5,
    },
  ]);

  return [...baseRequirements, ...statusRequirements];
};

it("すべてのテーマ・モードでトークンキー構造が完全に一致すること", () => {
  const [baseline, ...rest] = themeVariants.map((entry) => ({
    label: entry.label,
    keys: collectLeafEntries(entry.variant)
      .map((leaf) => leaf.path)
      .toSorted((first, second) => first.localeCompare(second)),
  }));

  expect(baseline).toBeDefined();
  rest.forEach((target) => {
    expect(target.keys, target.label).toEqual(baseline?.keys);
  });
});

it.each(themeVariants)(
  "$label の全エイリアスが Primitives の実在トークンへ解決でき、$type が一致すること",
  ({ label, variant }) => {
    const leaves = collectLeafEntries(variant);
    expect(leaves.length).toBeGreaterThan(0);

    leaves.forEach((leaf) => {
      expect(typeof leaf.$value, `${label}:${leaf.path}`).toBe("string");
      const alias = String(leaf.$value);
      expect(alias.startsWith("{") && alias.endsWith("}"), `${label}:${leaf.path}`).toBe(true);

      const resolved = resolvePath(Primitives, alias.slice(1, -1).split("."));
      expect(isLeafToken(resolved), `${label}:${leaf.path} -> ${alias}`).toBe(true);
      if (isLeafToken(resolved)) expect(resolved.$type, `${label}:${leaf.path}`).toBe(leaf.$type);
    });
  },
);

it.each(themeVariants)(
  "$label で背景の階層差と境界線ステップが重複なく区別されていること",
  ({ variant }) => {
    const { bg: background } = variant.color;

    expect(background.surface.$value).not.toBe(background.subtle.$value);
    expect(background.subtle.$value).not.toBe(background.muted.$value);
    expect(background.muted.$value).not.toBe(background.emphasized.$value);

    expect(variant.borderWidth.none.$value).not.toBe(variant.borderWidth.default.$value);
    expect(variant.borderWidth.default.$value).not.toBe(variant.borderWidth.thick.$value);
  },
);

it.each(themeVariants)(
  "$label で accent と status の意味トークンが衝突していないこと",
  ({ variant }) => {
    const { bg: background, fg: foreground } = variant.color;

    statusKinds.forEach((kind) => {
      expect(background.accent.default.$value, `bg.accent vs status.${kind}`).not.toBe(
        background.status[kind].default.$value,
      );
      expect(foreground.accent.$value, `fg.accent vs status.${kind}`).not.toBe(
        foreground.status[kind].$value,
      );
    });
  },
);

it.each(themeVariants)(
  "$label の主要テキスト・ステータス・フォーカス色のコントラスト比が WCAG 2.1 AA を満たすこと",
  ({ label, variant }) => {
    const requirements = buildContrastRequirements(variant);

    requirements.forEach(({ pairName, foreground, background, minimumRatio }) => {
      const actualRatio = computeContrastRatio(foreground, background);
      expect(actualRatio, `${label}: ${pairName}`).toBeGreaterThanOrEqual(minimumRatio);
    });
  },
);
