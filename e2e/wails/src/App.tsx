import { useState } from "react";
import {
  Workspace,
  desktopSlots,
  useWindowFrame,
  type Layout,
  type WorkspaceTab,
  type WindowHost,
} from "@labpane/os";
import { ActionMenu, Button, OptionMenu } from "@labpane/ui";
import { WelcomePage, SettingsPage } from "./pages";

const initial: WorkspaceTab[] = [
  { key: "welcome", label: "Welcome" },
  { key: "settings", label: "Settings" },
];

export function App({ host }: { host?: WindowHost }) {
  useWindowFrame(host);
  const [tabs, setTabs] = useState(initial);
  const [active, setActive] = useState<string | undefined>("welcome");
  const [projectName, setProjectName] = useState("Labpane");
  const [theme, setTheme] = useState("light");
  const [layout, setLayout] = useState<Layout>({
    id: "main",
    tabs: initial.map((tab) => tab.key),
    active: "welcome",
  });
  const open = (key: string) => {
    const tab = initial.find((item) => item.key === key)!;
    setTabs((current) =>
      current.some((item) => item.key === key) ? current : [...current, tab],
    );
    setActive(key);
  };

  return (
    <main className={`app ${theme === "dark" ? "dark" : ""}`}>
      <Workspace
        titleBar={!!host}
        tabs={tabs}
        active={active}
        layout={layout}
        onLayoutChange={setLayout}
        onSelect={setActive}
        onClose={(key, next) => {
          setTabs((current) => current.filter((tab) => tab.key !== key));
          setActive((current) => (current === key ? next : current));
        }}
        {...desktopSlots(
          host,
          <strong className="brand" data-window-drag>
            {projectName}
          </strong>,
        )}
        toolbar={() => (
          <OptionMenu
            options={initial.map((tab) => ({ id: tab.key, label: tab.label }))}
            onSelect={open}
            trigger={
              <Button size="sm" variant="ghost">
                Open page
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
        empty={() => (
          <Button onClick={() => open("welcome")}>Open welcome page</Button>
        )}
      >
        {(tab) =>
          tab.key === "settings" ? (
            <SettingsPage
              name={projectName}
              onNameChange={setProjectName}
              theme={theme}
              onThemeChange={setTheme}
            />
          ) : (
            <WelcomePage onOpenSettings={() => open("settings")} />
          )
        }
      </Workspace>
    </main>
  );
}
