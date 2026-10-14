import * as React from "react";

export const themeColors = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "link",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "destructive-muted",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "info",
  "info-foreground",
  "border",
  "input",
  "input-background",
  "ring",
  "overlay",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

export type ThemeColor = (typeof themeColors)[number];
export type ThemeColors = Partial<Record<ThemeColor, string>>;

export type Theme = {
  light?: ThemeColors;
  dark?: ThemeColors;
  fonts?: { sans?: string; mono?: string; display?: string };
  radius?: string;
  radiusDialog?: string;
};

// Tokens that @labpane/os reads under its own prefix
const osTokens: ThemeColor[] = [
  "background",
  "foreground",
  "card",
  "muted-foreground",
  "accent",
  "border",
  "ring",
];

function declarations(colors: ThemeColors) {
  return Object.entries(colors).flatMap(([name, value]) => [
    `--labui-${name}:${value}`,
    ...(osTokens.includes(name as ThemeColor)
      ? [`--lab-${name}:${value}`]
      : []),
  ]);
}

function block(selector: string, lines: string[]) {
  return lines.length ? `${selector}{${lines.join(";")}}` : "";
}

export function themeCss(theme: Theme, selector = ":root") {
  const { fonts = {}, radius, radiusDialog } = theme;
  const light = [
    ...declarations(theme.light ?? {}),
    ...(fonts.sans
      ? [`--labui-font-sans:${fonts.sans}`, `--lab-font-sans:${fonts.sans}`]
      : []),
    ...(fonts.mono ? [`--labui-font-mono:${fonts.mono}`] : []),
    ...(fonts.display ? [`--labui-font-display:${fonts.display}`] : []),
    ...(radius ? [`--labui-radius:${radius}`] : []),
    ...(radiusDialog ? [`--labui-radius-dialog:${radiusDialog}`] : []),
  ];
  const dark =
    selector === ":root" ? ".dark" : `${selector}.dark, ${selector} .dark`;
  return [block(selector, light), block(dark, declarations(theme.dark ?? {}))]
    .filter(Boolean)
    .join("\n");
}

export function ThemeStyle({
  theme,
  selector,
}: {
  theme: Theme;
  selector?: string;
}) {
  return React.createElement(
    "style",
    { "data-slot": "theme" },
    themeCss(theme, selector),
  );
}
