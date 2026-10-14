import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  MenuContent,
  Page,
  SelectField,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  column,
} from "@labpane/ui";

const rows = [
  { name: "alpha", size: 3 },
  { name: "beta", size: 1 },
];

export function AdminPage() {
  const [name, setName] = useState("");
  const [plugin, setPlugin] = useState("janus");
  const [deleted, setDeleted] = useState(false);
  return (
    <main className="p-6">
      <h2 className="text-xl">Host heading</h2>
      <button type="button" className="p-4">
        Host button
      </button>
      <Page
        title="Admin"
        actions={
          <>
            <Button>Save</Button>
            <Button className="h-8">Compact</Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="secondary">More</Button>
              </DropdownMenu.Trigger>
              <MenuContent>
                <DropdownMenu.Item className="rounded px-2 py-1">
                  Archive
                </DropdownMenu.Item>
              </MenuContent>
            </DropdownMenu.Root>
            <ConfirmDialog
              trigger={<Button variant="destructive">Delete</Button>}
              title="Delete"
              name="alpha"
              confirmLabel="Delete"
              onConfirm={async () => setDeleted(true)}
            />
          </>
        }
      >
        <Badge>{deleted ? "Deleted" : "Active"}</Badge>
        <TextField label="Name" value={name} onChange={setName} />
        <SelectField
          label="Plugin"
          value={plugin}
          onChange={setPlugin}
          options={[
            { id: "janus", name: "Janus" },
            { id: "livekit", name: "LiveKit" },
          ]}
        />
        <label className="flex items-center gap-2">
          <Checkbox aria-label="Enabled" /> Enabled
        </label>
        <label className="flex items-center gap-2">
          <Switch aria-label="Notify" /> Notify
        </label>
        <Tabs defaultValue="rooms">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
          </TabsList>
          <TabsContent value="log">Nothing logged yet.</TabsContent>
          <TabsContent value="rooms">
            <Table
              label="Rooms"
              rows={rows}
              rowKey={(row) => row.name}
              columns={[
                column(
                  "name",
                  "Name",
                  (row: (typeof rows)[number]) => row.name,
                ),
                column(
                  "size",
                  "Size",
                  (row: (typeof rows)[number]) => row.size,
                ),
              ]}
            />
          </TabsContent>
        </Tabs>
      </Page>
    </main>
  );
}
