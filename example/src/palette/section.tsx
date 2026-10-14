import { useId, type ReactNode } from "react";
import { Field, FieldLabel } from "@labpane/ui";

export const sections = [
  ["colors", "Colors"],
  ["button", "Button"],
  ["badge", "Badge"],
  ["alert", "Alert"],
  ["input", "Input"],
  ["textarea", "Textarea and Label"],
  ["native-select", "NativeSelect"],
  ["checkbox", "Checkbox"],
  ["switch", "Switch"],
  ["toggle", "Toggle and ToggleGroup"],
  ["select", "Select"],
  ["input-group", "InputGroup"],
  ["search-input", "SearchInput and FileInput"],
  ["field", "Field"],
  ["field-set", "FieldSet and FieldGroup"],
  ["form-fields", "TextField and SelectField"],
  ["feedback", "Spinner and Skeleton"],
  ["copy", "CopyButton"],
  ["kbd", "Kbd and Separator"],
  ["avatar", "Avatar"],
  ["breadcrumb", "Breadcrumb"],
  ["card", "Card"],
  ["empty", "Empty"],
  ["stats", "Stats"],
  ["tabs", "Tabs"],
  ["nav-tabs", "NavTabs and Steps"],
  ["page", "Page"],
  ["dialog", "Dialog"],
  ["confirm", "ConfirmDialog and DiscardDialog"],
  ["sheet", "Sheet"],
  ["tooltip", "Tooltip"],
  ["menus", "Menus"],
  ["dropdown-menu", "DropdownMenu"],
  ["command", "Command"],
  ["table", "Table"],
  ["table-screen", "TableScreen"],
  ["email", "EmailThread"],
  ["sidebar", "Sidebar"],
  ["rail", "Rail and Topbar"],
  ["settings", "Settings"],
  ["side-panel", "SidePanel"],
  ["browser-layout", "BrowserLayout"],
  ["time-series", "TimeSeriesChart"],
  ["histogram", "HistogramChart"],
  ["flame-graph", "FlameGraph"],
  ["timing-tracks", "TimingTracks and ChartFrame"],
  ["app-menu", "AppMenu"],
  ["terminal", "Terminal"],
] as const;

export type Id = (typeof sections)[number][0];

export function Section({
  id,
  intro,
  children,
}: {
  id: Id;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const title = sections.find(([key]) => key === id)![1];
  return (
    <section
      id={id}
      className="palette-section"
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`}>{title}</h2>
      {intro && <p className="palette-intro">{intro}</p>}
      {children}
    </section>
  );
}

export function Specimen({
  label,
  children,
  stack,
}: {
  label: ReactNode;
  children: ReactNode;
  stack?: boolean;
}) {
  return (
    <div className="specimen">
      <div className="specimen-label">{label}</div>
      <div className={stack ? "specimen-body specimen-stack" : "specimen-body"}>
        {children}
      </div>
    </div>
  );
}

export function Labelled({
  label,
  children,
}: {
  label: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children(id)}
    </Field>
  );
}
