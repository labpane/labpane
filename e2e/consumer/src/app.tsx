import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ActionMenu,
  DiscardDialog,
  OptionMenu,
  type MenuOption,
} from "@labpane/ui";
import { Demo } from "./workspace";

const options: MenuOption[] = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Notes" },
  { id: "report", label: "Report" },
  { id: "settings", label: "Settings", group: "More" },
];

export function App() {
  const opened = useRef<string | undefined>(undefined);
  const [discard, setDiscard] = useState<{
    label: string;
    resolve: (discard: boolean) => void;
  }>();
  const settle = (result: boolean) => {
    discard?.resolve(result);
    setDiscard(undefined);
  };
  return (
    <>
      <Demo
        header={
          <Dialog.Root>
            <Dialog.Trigger className="rounded border px-2 py-1">
              About
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/20" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6">
                <Dialog.Title>About</Dialog.Title>
                <Dialog.Description>A host app dialog.</Dialog.Description>
                <Dialog.Close className="mt-4 rounded border px-3 py-1">
                  Done
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        }
        leading={
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="mx-1 rounded px-2 py-1 text-sm hover:bg-black/10">
              App
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                className="z-50 rounded border bg-white p-1 text-sm shadow"
              >
                <DropdownMenu.Item className="rounded px-2 py-1 data-[highlighted]:bg-black/10">
                  Help
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        }
        slots={(open) => ({
          toolbar: (pane) => (
            <OptionMenu
              options={options}
              onSelect={(id) => {
                opened.current = open(id);
              }}
              onCloseAutoFocus={(event) => {
                if (!opened.current) return;
                event.preventDefault();
                pane.focus(opened.current);
                opened.current = undefined;
              }}
              trigger={
                <button
                  type="button"
                  aria-label="Open a tab"
                  className="rounded px-2 py-1 hover:bg-black/10"
                >
                  +
                </button>
              }
            />
          ),
          menu: (target, actions, restoreFocus) => (
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
          ),
          confirmClose: (tab) =>
            new Promise<boolean>((resolve) =>
              setDiscard({ label: tab.label, resolve }),
            ),
        })}
      />
      <DiscardDialog
        label={discard?.label}
        onCancel={() => settle(false)}
        onConfirm={() => settle(true)}
        onCloseAutoFocus={(event) => event.preventDefault()}
      />
    </>
  );
}
