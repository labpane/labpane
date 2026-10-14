# @labpane/ui

Pages, forms, dialogs, menus, tables, navigation, charts, and an optional terminal for React, built on Radix. It pairs with [`@labpane/os`](../os) but works on its own.

```sh
npm install @labpane/ui @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip
```

```tsx
import "@labpane/ui/styles.css";
import { Button, Page } from "@labpane/ui";

export function Settings() {
  return (
    <Page title="Settings" actions={<Button>Save</Button>}>
      …
    </Page>
  );
}
```

Radix and React are peer dependencies, so your app keeps one copy of each. The stylesheet is built with Tailwind 4 but needs no Tailwind in your app: every class is prefixed `labui:`, nothing is global, and it builds in Tailwind 3 PostCSS pipelines too.

## Components

|            |                                                                                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages      | `Page`, `PageHeader` and its parts, `PageActions`, `Back`, `Topbar`, `Breadcrumb` and its parts, `TableScreen`, `BrowserLayout` and its parts, `SidePanel`, `SettingsSection`, `SettingsRow`, `SettingsFooter` |
| Navigation | `Sidebar` and its parts, `Rail`, `RailItem`, `NavTabs`, `NavTab`, `Tabs` and its parts, `Steps`, `Step`, `Command` and its parts                                                                               |
| Controls   | `Button`, `Badge`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Toggle`, `ToggleGroup`, `Select` and its parts, `NativeSelect`, `SearchInput`, `FileInput`, `InputGroup` and its parts, `CopyButton`, `Kbd`     |
| Forms      | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldGroup`, `Label`, `TextField`, `SelectField`, `AddButton`                                                                            |
| Display    | `Alert`, `Card` and its parts, `Avatar` and its parts, `Stats`, `Stat`, `Empty` and its parts, `Separator`, `Skeleton`, `Spinner`, `Tooltip`, `EmailThread`, `EmailMessage`                                    |
| Dialogs    | `Dialog` and its parts, `Sheet` and its parts, `ConfirmDialog`, `DiscardDialog`                                                                                                                                |
| Menus      | `DropdownMenu` and its parts, `OptionMenu`, `ActionMenu`, `MenuContent`                                                                                                                                        |
| Tables     | `Table`, `TableStack`, `column`, `mono`, `num`                                                                                                                                                                 |
| Charts     | `TimeSeriesChart`, `HistogramChart`, `HistogramSparkline`, `FlameGraph`, `TimingTracks`, `ChartFrame`                                                                                                          |
| Workspace  | `AppMenu` with `AppMenuSection`; `useTabActive` and `useTabVisible` read the tab state that `@labpane/os` provides                                                                                             |

`cn()` merges class names and lets your own Tailwind classes override the `labui:` defaults they conflict with.

Tailwind 4 apps can also write their own `labui:` classes on the same theme by importing ui's Tailwind source instead of the built stylesheet:

```css
@import "@labpane/ui/tailwind.css";
@source "./src";
```

## With @labpane/os

Fill the workspace's slots with ui's menus and dialog:

```tsx
<Workspace
  {...workspaceProps}
  toolbar={(pane) => (
    <OptionMenu
      options={[{ id: "reports", label: "Reports" }]}
      onSelect={openTab}
      trigger={
        <Button size="icon-sm" aria-label="Open a tab">
          +
        </Button>
      }
    />
  )}
  menu={(target, actions, restoreFocus) => (
    <ActionMenu
      actions={actions}
      onCloseAutoFocus={
        restoreFocus &&
        ((event) => {
          event.preventDefault();
          restoreFocus();
        })
      }
    >
      {target}
    </ActionMenu>
  )}
  confirmClose={(tab) => askToDiscard(tab.label)}
/>
```

`askToDiscard` returns a promise that a `DiscardDialog` resolves with the user's choice. Action menu items can hold `items` for a submenu, or `checked` for a check mark.

## Terminal

`@labpane/ui/terminal` is a separate entry point, so apps that don't import it never load the terminal. It needs [`@wterm/dom`](https://wterm.dev):

```sh
npm install @wterm/dom
```

```tsx
import "@wterm/dom/css";
import { Terminal } from "@labpane/ui/terminal";

<Terminal connect={() => "/pty"} expandable />;
```

`connect` returns the URL of a WebSocket that streams the terminal: binary frames carry input and output, text frames carry error messages, and resizes arrive as JSON `{ cols, rows }`. Instead of `connect`, `shell` runs an in-browser shell such as `BashShell` from `@wterm/just-bash`. `core` swaps in another terminal engine, such as `GhosttyCore` from `@wterm/ghostty`, and `theme` picks one of `terminalThemes` or `"auto"`.

## Theming

Set these on `:root`, or on any ancestor. Add a `dark` class to an ancestor for the dark defaults.

```css
:root {
  --labui-primary: #05697a;
  --labui-radius: 0.75rem;
  --labui-font-sans: inherit;
}
```

A theme can also be an object. `themeCss(theme)` returns the CSS for both packages' tokens and `<ThemeStyle theme={theme} />` renders it; keys left out keep the defaults.

```tsx
<ThemeStyle
  theme={{
    light: { primary: "#a3242f" },
    dark: { primary: "#f0808c" },
    radius: "0.5rem",
  }}
/>
```

Colors: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, and `warning`, each with a `-foreground` pair where it applies, plus `link`, `border`, `input`, `input-background`, `ring`, `overlay`, and `destructive-muted`. Fonts: `font-sans`, `font-mono`, and `font-display`. Sizes: `radius`, `radius-dialog`, `control-height`, `control-height-sm`, `control-px`, and `row-py`. Each is a `--labui-` variable.

## License

MIT
