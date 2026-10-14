# @labpane/ui

Page layouts, forms, dialogs, menus, tables, and an optional terminal for React, built on Radix. It pairs with [`@labpane/os`](../os) but works on its own.

```sh
npm install @labpane/ui @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot
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

|           |                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Pages     | `Page`, `PageHeader`, `PageActions`, `Back`                                                                  |
| Controls  | `Button`, `Badge`, `Input`, `Checkbox`, `Select` and its parts, `Spinner`, `Skeleton`, `CopyButton`, `Alert` |
| Forms     | `Field`, `FieldLabel`, `FieldError`, `TextField`, `SelectField`, `AddButton`                                 |
| Dialogs   | `Dialog` and its parts, `ConfirmDialog`, `DiscardDialog`                                                     |
| Menus     | `OptionMenu`, `ActionMenu`, `MenuContent`                                                                    |
| Tables    | `Table`, `column`, `mono`, `num`                                                                             |
| Workspace | `AppMenu`: logo menu with theme, size, and full-screen controls                                              |

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

Colours: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, and `warning`, each with a `-foreground` pair where it applies, plus `link`, `border`, `input`, `input-background`, `ring`, `overlay`, and `destructive-muted`. Fonts: `font-sans`, `font-mono`, and `font-display`. Sizes: `radius`, `radius-dialog`, `control-height`, `control-height-sm`, `control-px`, and `row-py`. Each is a `--labui-` variable.

## License

MIT
