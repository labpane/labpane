import { Badge, Button, Page, SelectField, TextField } from "@labpane/ui";

export function WelcomePage({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  return (
    <Page title="Your workspace" actions={<Badge>Ready to build</Badge>}>
      <p>
        Drag a tab to split your workspace. Resize the divider. Build a page of
        your own.
      </p>
      <p>
        This page is a tree of Labpane UI components. Edit{" "}
        <code>src/pages.tsx</code> to make it yours.
      </p>
      <div>
        <Button onClick={onOpenSettings}>Open settings</Button>
      </div>
    </Page>
  );
}

export function SettingsPage({
  name,
  onNameChange,
  theme,
  onThemeChange,
}: {
  name: string;
  onNameChange: (value: string) => void;
  theme: string;
  onThemeChange: (value: string) => void;
}) {
  return (
    <Page title="Settings" actions={<Badge>Session only</Badge>}>
      <TextField label="Workspace name" value={name} onChange={onNameChange} />
      <SelectField
        label="Theme"
        value={theme}
        onChange={onThemeChange}
        options={[
          { id: "light", name: "Light" },
          { id: "dark", name: "Dark" },
        ]}
      />
      <p>
        These settings live in React state. Connect them to your own storage
        when you are ready.
      </p>
    </Page>
  );
}
