import { useId, useState, type ReactNode } from "react";
import { densityPresets, useUnsavedChanges, type Layout } from "@labpane/os";
import {
  Badge,
  Button,
  Checkbox,
  CopyButton,
  FieldLabel,
  Page,
  PageActions,
  SelectField,
  Table,
  TextField,
  column,
} from "@labpane/ui";
import { setDark, useDark } from "../theme";

function DemoPage({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Page className="demo-page">
      <header className="demo-page-header">
        <h3>{title}</h3>
        <PageActions>{actions}</PageActions>
      </header>
      {children}
    </Page>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="check">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange && ((value) => onChange(value === true))}
      />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </div>
  );
}

const tries = [
  "Drag a tab along the tab bar to reorder it",
  "Drag a tab to the side or bottom of a pane to split it",
  "Drag the gap between two panes to resize them",
  "Right-click a tab, or press Shift+F10, for its actions",
  "Close a tab, then open another with the + button",
  "Open the logo menu to switch the theme or the size",
];
const touchTries = [
  "Tap a tab to open it; swipe the tab bar to see more",
  "Use the down arrow to choose from all open tabs",
  "Touch and hold a tab for its actions, including moving and splitting",
  "Close a tab with its ×, then open another with the + button",
  "Open the logo menu to switch the theme or the size",
];

export function WelcomePage() {
  return (
    <DemoPage title="Welcome">
      <p className="demo-text">
        This is <code>@labpane/os</code> running live, and every tab holds a
        page built with <code>@labpane/ui</code>.
      </p>
      <h4 className="demo-subheading">Things to try</h4>
      <ul className="demo-list pointer-help">
        {tries.map((text) => (
          <li key={text}>
            <Check label={text} />
          </li>
        ))}
      </ul>
      <ul className="demo-list touch-help">
        {touchTries.map((text) => (
          <li key={text}>
            <Check label={text} />
          </li>
        ))}
      </ul>
    </DemoPage>
  );
}

export function LayoutPage({
  layout,
  onReset,
}: {
  layout: Layout;
  onReset: () => void;
}) {
  const json = JSON.stringify(layout, null, 2);
  return (
    <DemoPage
      title="Layout"
      actions={
        <Button variant="secondary" size="sm" onClick={onReset}>
          Reset demo
        </Button>
      }
    >
      <p className="demo-text">
        The workspace owns no state. This page keeps the tabs, the active tab,
        and this <code>layout</code>; move a tab or a divider and watch it
        change.
      </p>
      <div className="demo-json">
        <CopyButton value={json} label="Copy layout" />
        <pre tabIndex={0} aria-label="Current layout">
          {json}
        </pre>
      </div>
    </DemoPage>
  );
}

const saved = { title: "Release checklist", status: "draft", pinned: false };

export function DraftPage({ title }: { title: string }) {
  const [stored, setStored] = useState(saved);
  const [draft, setDraft] = useState(saved);
  const dirty = JSON.stringify(stored) !== JSON.stringify(draft);
  useUnsavedChanges(dirty);
  return (
    <DemoPage
      title={title}
      actions={
        <>
          {dirty && <Badge variant="warning">Unsaved</Badge>}
          <Button
            variant="secondary"
            size="sm"
            disabled={!dirty}
            onClick={() => setDraft(stored)}
          >
            Revert
          </Button>
          <Button size="sm" disabled={!dirty} onClick={() => setStored(draft)}>
            Save
          </Button>
        </>
      }
    >
      <p className="demo-text">
        Change a field, then close this tab: the workspace asks before it
        discards unsaved changes.
      </p>
      <div className="demo-form">
        <TextField
          label="Title"
          value={draft.title}
          onChange={(value) => setDraft({ ...draft, title: value })}
        />
        <SelectField
          label="Status"
          value={draft.status}
          onChange={(value) => setDraft({ ...draft, status: value })}
          options={[
            { id: "draft", name: "Draft" },
            { id: "review", name: "In review" },
            { id: "done", name: "Done" },
          ]}
        />
        <Check
          label="Pin to the top"
          checked={draft.pinned}
          onChange={(pinned) => setDraft({ ...draft, pinned })}
        />
      </div>
    </DemoPage>
  );
}

type Shortcut = { keys: string[]; action: string };
const shortcuts: Shortcut[] = [
  { keys: ["←", "→"], action: "Move between tabs" },
  { keys: ["Home", "End"], action: "Jump to the first or last tab" },
  { keys: ["Space"], action: "Select the focused tab" },
  { keys: ["Alt+←", "Alt+→"], action: "Move the focused tab" },
  {
    keys: ["Alt+Shift+←", "Alt+Shift+→", "Alt+Shift+↓"],
    action: "Split the focused tab into a new pane on that side",
  },
  { keys: ["Delete"], action: "Close the focused tab" },
  { keys: ["Shift+F10"], action: "Open the focused tab’s actions" },
  { keys: ["F6", "Shift+F6"], action: "Move to the next or previous pane" },
  {
    keys: ["←", "→", "↑", "↓"],
    action:
      "Resize the panes beside a focused divider; add Shift for bigger steps",
  },
];

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="keys">
      {keys.map((combo) => (
        <span key={combo} className="keys-combo">
          {combo.split("+").flatMap((key, index) => {
            const kbd = <kbd key={key}>{key}</kbd>;
            return index ? ["+", kbd] : [kbd];
          })}
        </span>
      ))}
    </span>
  );
}

export function KeyboardPage() {
  return (
    <DemoPage title="Keyboard">
      <p className="demo-text">
        Focus a tab with Tab, then use these keys. The table is{" "}
        <code>@labpane/ui</code>’s sortable <code>Table</code>.
      </p>
      <Table
        label="Keyboard shortcuts"
        rows={shortcuts}
        rowKey={(row) => row.action}
        columns={[
          column(
            "keys",
            "Keys",
            (row: Shortcut) => row.keys.join(" "),
            (row) => <Keys keys={row.keys} />,
          ),
          column("action", "Action", (row: Shortcut) => row.action),
        ]}
      />
    </DemoPage>
  );
}

const sizes = Object.entries(densityPresets).map(([id, preset]) => ({
  id,
  name: id[0]!.toUpperCase() + id.slice(1),
  value: preset.value,
}));

export function SettingsPage({
  density,
  onDensityChange,
  icons,
  onIconsChange,
}: {
  density: number;
  onDensityChange: (density: number) => void;
  icons: boolean;
  onIconsChange: (icons: boolean) => void;
}) {
  const dark = useDark();
  const size = sizes.find((size) => size.value === density)?.id ?? "custom";
  return (
    <DemoPage title="Settings">
      <p className="demo-text">
        These change the workspace around this page. The logo menu has the same
        theme switch and a slider for every size in between.
      </p>
      <div className="demo-form">
        <SelectField
          label="Size"
          value={size}
          onChange={(id) =>
            onDensityChange(sizes.find((size) => size.id === id)!.value)
          }
          options={
            size === "custom"
              ? [
                  ...sizes,
                  {
                    id: "custom",
                    name: `Custom (${Math.round(density)})`,
                    disabled: true,
                  },
                ]
              : sizes
          }
        />
        <SelectField
          label="Theme"
          value={dark ? "dark" : "light"}
          onChange={(theme) => setDark(theme === "dark")}
          options={[
            { id: "light", name: "Light" },
            { id: "dark", name: "Dark" },
          ]}
        />
        <Check
          label="Show tab icons"
          checked={icons}
          onChange={onIconsChange}
        />
      </div>
    </DemoPage>
  );
}
