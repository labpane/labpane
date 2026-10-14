import { useId, useState } from "react";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ThemeStyle,
  type Theme,
} from "@labpane/ui";

const themes: { id: string; name: string; hint: string; theme?: Theme }[] = [
  { id: "default", name: "Default", hint: "The packages' own tokens" },
  {
    id: "crimson",
    name: "Crimson",
    hint: "A warm primary and tighter corners",
    theme: {
      light: {
        primary: "#9f1239",
        "primary-foreground": "#ffffff",
        link: "#9f1239",
        ring: "#e11d48",
        accent: "#fde7ec",
        "accent-foreground": "#4c0519",
        "sidebar-primary": "#9f1239",
        "chart-1": "#9f1239",
        "chart-2": "#e11d48",
      },
      dark: {
        primary: "#fb7185",
        "primary-foreground": "#4c0519",
        link: "#fda4af",
        ring: "#fb7185",
        accent: "#4a1f29",
        "accent-foreground": "#ffe4e6",
        "sidebar-primary": "#fb7185",
        "chart-1": "#fb7185",
        "chart-2": "#f43f5e",
      },
      radius: "0.5rem",
      radiusDialog: "0.75rem",
    },
  },
  {
    id: "forest",
    name: "Forest",
    hint: "A green primary and rounder corners",
    theme: {
      light: {
        primary: "#166534",
        "primary-foreground": "#ffffff",
        link: "#15803d",
        ring: "#22c55e",
        accent: "#dcfce7",
        "accent-foreground": "#14532d",
        "sidebar-primary": "#166534",
        "chart-1": "#166534",
        "chart-2": "#22c55e",
      },
      dark: {
        primary: "#4ade80",
        "primary-foreground": "#052e16",
        link: "#86efac",
        ring: "#4ade80",
        accent: "#1f3d2a",
        "accent-foreground": "#dcfce7",
        "sidebar-primary": "#4ade80",
        "chart-1": "#4ade80",
        "chart-2": "#22c55e",
      },
      radius: "1rem",
      radiusDialog: "1.5rem",
    },
  },
];

export function ThemeSwitcher() {
  const id = useId();
  const [current, setCurrent] = useState(themes[0]!.id);
  const picked = themes.find((item) => item.id === current);
  return (
    <div className="palette-theme">
      <Label htmlFor={id}>Theme</Label>
      <div className="palette-theme-select">
        <Select value={current} onValueChange={setCurrent}>
          <SelectTrigger id={id} size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themes.map((item) => (
              <SelectItem key={item.id} value={item.id} hint={item.hint}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span className="muted">
        Applied with <code>ThemeStyle</code>, so every token of both packages
        follows it.
      </span>
      {picked?.theme && <ThemeStyle theme={picked.theme} />}
    </div>
  );
}
