import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CircleAlertIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
  InfoIcon,
  PlusIcon,
  SaveIcon,
  SettingsIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useFullscreen } from "@labpane/os";
import {
  ActionMenu,
  AddButton,
  Alert,
  AlertDescription,
  AlertTitle,
  AppMenu,
  Back,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  CopyButton,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DiscardDialog,
  Field,
  FieldError,
  FieldLabel,
  Input,
  MenuContent,
  OptionMenu,
  Page,
  PageActions,
  PageHeader,
  Select,
  SelectContent,
  SelectField,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Table,
  TextField,
  column,
  mono,
  num,
  type MenuAction,
} from "@labpane/ui";
import { Logo, SiteFooter, SiteHeader } from "../site";
import { setDark, useDark } from "../theme";
import { ColourTokens, OtherTokens } from "./tokens";

const TerminalDemo = lazy(() => import("./terminal-demo"));

const sections = [
  ["colors", "Colours"],
  ["button", "Button"],
  ["badge", "Badge"],
  ["alert", "Alert"],
  ["input", "Input"],
  ["checkbox", "Checkbox"],
  ["select", "Select"],
  ["field", "Field"],
  ["form-fields", "TextField and SelectField"],
  ["feedback", "Spinner and Skeleton"],
  ["copy", "CopyButton"],
  ["page", "Page"],
  ["dialog", "Dialog"],
  ["confirm", "ConfirmDialog and DiscardDialog"],
  ["menus", "Menus"],
  ["table", "Table"],
  ["app-menu", "AppMenu"],
  ["terminal", "Terminal"],
] as const;

type Id = (typeof sections)[number][0];

function Section({
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

function Specimen({
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

function Labelled({
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

function Buttons() {
  const variants = [
    "default",
    "secondary",
    "destructive",
    "ghost",
    "link",
  ] as const;
  return (
    <Section
      id="button"
      intro={
        <>
          Five variants and four sizes. <code>asChild</code> renders the styles
          on your own element, such as a link.
        </>
      }
    >
      {variants.map((variant) => (
        <Specimen key={variant} label={`variant="${variant}"`}>
          <Button variant={variant}>Button</Button>
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant} size="icon-sm" aria-label="Settings">
            <SettingsIcon />
          </Button>
          <Button variant={variant} size="icon-xs" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </Specimen>
      ))}
      <Specimen label="With an icon, busy, and asChild">
        <Button>
          <SaveIcon />
          Save
        </Button>
        <Button variant="secondary" disabled>
          <Spinner />
          Saving
        </Button>
        <Button variant="destructive">
          <TrashIcon />
          Delete
        </Button>
        <Button variant="secondary" asChild>
          <a href="../">
            <DownloadIcon />A link styled as a button
          </a>
        </Button>
      </Specimen>
      <Specimen label='size="default" | "sm" | "icon-sm" | "icon-xs"'>
        <Button>Default</Button>
        <Button size="sm">Small</Button>
        <Button size="icon-sm" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button size="icon-xs" aria-label="Add">
          <PlusIcon />
        </Button>
      </Specimen>
    </Section>
  );
}

function Badges() {
  return (
    <Section id="badge">
      <Specimen label='variant="default" | "success" | "warning" | "destructive"'>
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Specimen>
      <Specimen label="With an icon">
        <Badge variant="success">
          <InfoIcon />
          Connected
        </Badge>
        <Badge variant="warning">
          <TriangleAlertIcon />
          Unsaved
        </Badge>
        <Badge variant="destructive">
          <CircleAlertIcon />
          Failed
        </Badge>
      </Specimen>
    </Section>
  );
}

function Alerts() {
  return (
    <Section
      id="alert"
      intro={
        <>
          <code>Alert</code> with <code>AlertTitle</code> and{" "}
          <code>AlertDescription</code>; an icon as the first child gets its own
          column.
        </>
      }
    >
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label="No variant" stack>
          <Alert>
            <InfoIcon />
            <AlertTitle>Workspace saved</AlertTitle>
            <AlertDescription>
              Your tabs and layout are stored.
            </AlertDescription>
          </Alert>
        </Specimen>
        <Specimen label='variant="warning"' stack>
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>Unsaved changes</AlertTitle>
            <AlertDescription>
              Two tabs have changes that haven’t been saved.
            </AlertDescription>
          </Alert>
        </Specimen>
        <Specimen label='variant="destructive"' stack>
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Couldn’t connect</AlertTitle>
            <AlertDescription>
              Check the address and try again.
            </AlertDescription>
          </Alert>
        </Specimen>
        <Specimen label="Title only, without an icon" stack>
          <Alert>
            <AlertTitle>A short, single-line alert</AlertTitle>
          </Alert>
        </Specimen>
      </div>
    </Section>
  );
}

function Inputs() {
  return (
    <Section id="input">
      <Specimen label="States and types">
        <div className="specimen-grid">
          <Labelled label="Placeholder">
            {(id) => <Input id={id} placeholder="Search tabs" />}
          </Labelled>
          <Labelled label="With a value">
            {(id) => <Input id={id} defaultValue="Quarterly report" />}
          </Labelled>
          <Labelled label="Disabled">
            {(id) => <Input id={id} defaultValue="Read only" disabled />}
          </Labelled>
          <Labelled label="aria-invalid">
            {(id) => <Input id={id} defaultValue="not-an-email" aria-invalid />}
          </Labelled>
          <Labelled label='type="search"'>
            {(id) => <Input id={id} type="search" placeholder="Filter" />}
          </Labelled>
          <Labelled label='type="date"'>
            {(id) => <Input id={id} type="date" defaultValue="2026-01-15" />}
          </Labelled>
          <Labelled label='type="number"'>
            {(id) => <Input id={id} type="number" defaultValue={42} />}
          </Labelled>
          <Labelled label='type="file"'>
            {(id) => <Input id={id} type="file" />}
          </Labelled>
        </div>
      </Specimen>
    </Section>
  );
}

function CheckboxRow({
  label,
  ...props
}: { label: string } & ComponentProps<typeof Checkbox>) {
  const id = useId();
  return (
    <div className="check">
      <Checkbox id={id} {...props} />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </div>
  );
}

function Checkboxes() {
  const [checked, setChecked] = useState(true);
  return (
    <Section id="checkbox">
      <Specimen label="States">
        <CheckboxRow label="Unchecked" />
        <CheckboxRow
          label="Checked"
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
        />
        <CheckboxRow label="Disabled" disabled />
        <CheckboxRow label="Disabled and checked" disabled defaultChecked />
        <CheckboxRow label="aria-invalid" aria-invalid />
      </Specimen>
    </Section>
  );
}

const fruit = [
  { id: "apple", name: "Apple" },
  { id: "pear", name: "Pear" },
  { id: "plum", name: "Plum" },
];

function Selects() {
  return (
    <Section
      id="select"
      intro={
        <>
          <code>Select</code> with <code>SelectTrigger</code>,{" "}
          <code>SelectValue</code>, <code>SelectContent</code>, and{" "}
          <code>SelectItem</code>.
        </>
      }
    >
      <Specimen label="States and sizes">
        <div className="specimen-grid">
          <Labelled label="Placeholder">
            {(id) => (
              <Select>
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Pick a fruit" />
                </SelectTrigger>
                <SelectContent>
                  {fruit.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Labelled>
          <Labelled label="With a value and a disabled item">
            {(id) => (
              <Select defaultValue="pear">
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fruit.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      disabled={item.id === "plum"}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Labelled>
          <Labelled label='size="sm"'>
            {(id) => (
              <Select defaultValue="apple">
                <SelectTrigger id={id} size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fruit.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Labelled>
          <Labelled label="Disabled">
            {(id) => (
              <Select defaultValue="apple" disabled>
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apple">Apple</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Labelled>
          <Labelled label="aria-invalid">
            {(id) => (
              <Select>
                <SelectTrigger id={id} aria-invalid>
                  <SelectValue placeholder="Required" />
                </SelectTrigger>
                <SelectContent>
                  {fruit.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Labelled>
          <Labelled label="No items">
            {(id) => (
              <Select>
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Nothing to pick" />
                </SelectTrigger>
                <SelectContent />
              </Select>
            )}
          </Labelled>
        </div>
      </Specimen>
    </Section>
  );
}

function Fields() {
  const name = useId();
  const email = useId();
  const error = useId();
  return (
    <Section
      id="field"
      intro={
        <>
          <code>Field</code>, <code>FieldLabel</code>, and{" "}
          <code>FieldError</code> lay out any control with its label.
        </>
      }
    >
      <div className="specimen-grid">
        <Specimen label="Field" stack>
          <Field>
            <FieldLabel htmlFor={name}>Name</FieldLabel>
            <Input id={name} placeholder="Ada Lovelace" />
          </Field>
        </Specimen>
        <Specimen label="data-invalid with FieldError" stack>
          <Field data-invalid>
            <FieldLabel htmlFor={email}>Email</FieldLabel>
            <Input
              id={email}
              defaultValue="ada@"
              aria-invalid
              aria-describedby={error}
            />
            <FieldError id={error}>Enter a complete email address.</FieldError>
          </Field>
        </Specimen>
        <Specimen label='orientation="horizontal"' stack>
          <HorizontalField />
        </Specimen>
      </div>
    </Section>
  );
}

function HorizontalField() {
  const id = useId();
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} defaultChecked />
      <FieldLabel htmlFor={id}>Reopen tabs on start</FieldLabel>
    </Field>
  );
}

function FormFields() {
  const [title, setTitle] = useState("Weekly notes");
  const [empty, setEmpty] = useState("");
  const [plan, setPlan] = useState("team");
  const [owner, setOwner] = useState("ada");
  const [people, setPeople] = useState([
    { id: "ada", name: "Ada" },
    { id: "grace", name: "Grace" },
  ]);
  return (
    <Section
      id="form-fields"
      intro={
        <>
          Ready-made fields with their labels wired up, and{" "}
          <code>AddButton</code> for adding to a list.
        </>
      }
    >
      <div className="specimen-grid">
        <Specimen label="TextField" stack>
          <TextField label="Title" value={title} onChange={setTitle} />
        </Specimen>
        <Specimen label="TextField with aria-invalid" stack>
          <TextField
            label="Required"
            value={empty}
            onChange={setEmpty}
            placeholder="Can’t be empty"
            aria-invalid={!empty}
          />
        </Specimen>
        <Specimen label="SelectField with a disabled option" stack>
          <SelectField
            label="Plan"
            value={plan}
            onChange={setPlan}
            options={[
              { id: "solo", name: "Solo" },
              { id: "team", name: "Team" },
              { id: "legacy", name: "Legacy", disabled: true },
            ]}
          />
        </Specimen>
        <Specimen label="SelectField with an AddButton beside it" stack>
          <SelectField
            label="Owner"
            value={owner}
            onChange={setOwner}
            options={people}
          >
            <AddButton
              onClick={() => {
                const id = `person-${people.length + 1}`;
                setPeople([
                  ...people,
                  { id, name: `Person ${people.length + 1}` },
                ]);
                setOwner(id);
              }}
            >
              Add
            </AddButton>
          </SelectField>
        </Specimen>
      </div>
    </Section>
  );
}

function Feedback() {
  return (
    <Section id="feedback">
      <Specimen label="Spinner">
        <Spinner />
        <Spinner style={{ width: 24, height: 24 }} />
        <span className="inline-status">
          <Spinner /> Loading tabs
        </span>
      </Specimen>
      <Specimen label="Skeleton" stack>
        <div className="skeleton-card" aria-hidden="true">
          <Skeleton style={{ width: 40, height: 40, borderRadius: 999 }} />
          <div className="skeleton-lines">
            <Skeleton style={{ height: 12, width: "60%" }} />
            <Skeleton style={{ height: 12, width: "90%" }} />
            <Skeleton style={{ height: 12, width: "75%" }} />
          </div>
        </div>
      </Specimen>
    </Section>
  );
}

function Copy() {
  return (
    <Section
      id="copy"
      intro="Copies its value to the clipboard and shows a check mark."
    >
      <Specimen label="CopyButton">
        <span className="copy-sample">
          <code>npm install @labpane/ui</code>
          <CopyButton value="npm install @labpane/ui" label="Copy command" />
        </span>
      </Specimen>
    </Section>
  );
}

function Pages() {
  return (
    <Section
      id="page"
      intro={
        <>
          <code>Page</code> stacks a <code>PageHeader</code> (an <code>h1</code>{" "}
          and its <code>PageActions</code>) above your content.{" "}
          <code>Back</code> is a link back to a parent page.
        </>
      }
    >
      <Specimen label="Back, Page with title and actions" stack>
        <div className="page-sample">
          <Back href="#page" label="Projects" />
          <Page
            title="Settings"
            actions={
              <>
                <Button variant="secondary">Cancel</Button>
                <Button>Save</Button>
              </>
            }
          >
            <p className="muted">Page content goes here, below the header.</p>
          </Page>
        </div>
      </Specimen>
      <Specimen label="PageHeader with actions" stack>
        <div className="page-sample">
          <PageHeader
            title="Reports"
            actions={
              <>
                <Button variant="ghost">Export</Button>
                <Button variant="secondary">Share</Button>
              </>
            }
          />
        </div>
      </Specimen>
      <Specimen label="PageActions in a header of your own" stack>
        <div className="page-sample">
          <div className="custom-header">
            <span className="custom-header-title">3 tabs selected</span>
            <PageActions>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Close tabs</Button>
            </PageActions>
          </div>
        </div>
      </Specimen>
    </Section>
  );
}

function Dialogs() {
  const [name, setName] = useState("Layout");
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState(false);
  return (
    <Section
      id="dialog"
      intro={
        <>
          <code>Dialog</code> with <code>DialogTrigger</code>,{" "}
          <code>DialogContent</code>, <code>DialogHeader</code>,{" "}
          <code>DialogTitle</code>, <code>DialogDescription</code>,{" "}
          <code>DialogFooter</code>, and <code>DialogClose</code>.
        </>
      }
    >
      <Specimen label="Dialog">
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (next) setDraft(name);
            setOpen(next);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="secondary">Rename “{name}”</Button>
          </DialogTrigger>
          <DialogContent>
            <form
              className="dialog-form"
              onSubmit={(event) => {
                event.preventDefault();
                setName(draft.trim() || name);
                setOpen(false);
              }}
            >
              <DialogHeader>
                <DialogTitle>Rename tab</DialogTitle>
                <DialogDescription>
                  The new name shows on the tab and in its menus.
                </DialogDescription>
              </DialogHeader>
              <TextField label="Name" value={draft} onChange={setDraft} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Rename</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">Without a close button</Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Keyboard shortcuts</DialogTitle>
              <DialogDescription>
                Press Escape or use the button below to close this dialog.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Specimen>
    </Section>
  );
}

function Confirms() {
  const [deleted, setDeleted] = useState<string[]>([]);
  const [discard, setDiscard] = useState<string>();
  const [result, setResult] = useState("");
  return (
    <Section
      id="confirm"
      intro={
        <>
          <code>ConfirmDialog</code> guards a destructive action, optionally
          until the name is typed. <code>DiscardDialog</code> asks before a tab
          with unsaved changes closes; it’s what a workspace’s{" "}
          <code>confirmClose</code> can show.
        </>
      }
    >
      <Specimen label="ConfirmDialog">
        <ConfirmDialog
          trigger={<Button variant="destructive">Delete project</Button>}
          title="Delete"
          name="atlas"
          confirmLabel="Delete"
          onConfirm={async () => {
            await new Promise((resolve) => setTimeout(resolve, 600));
            setDeleted((list) => [...list, "atlas"]);
          }}
        />
        <ConfirmDialog
          trigger={
            <Button variant="secondary">Delete with typeToConfirm</Button>
          }
          title="Delete"
          name="orion"
          confirmLabel="Delete"
          typeToConfirm
          onConfirm={async () => setDeleted((list) => [...list, "orion"])}
        />
        <ConfirmDialog
          trigger={<Button variant="ghost">A confirm that fails</Button>}
          title="Archive"
          name="vega"
          confirmLabel="Archive"
          onConfirm={async () => {
            throw new Error("The server refused: this is a demo error.");
          }}
        />
        <span className="muted" role="status">
          {deleted.length ? `Deleted: ${deleted.join(", ")}` : ""}
        </span>
      </Specimen>
      <Specimen label="DiscardDialog">
        <Button variant="secondary" onClick={() => setDiscard("Notes")}>
          Close “Notes”
        </Button>
        <span className="muted" role="status">
          {result}
        </span>
        <DiscardDialog
          label={discard}
          onCancel={() => {
            setDiscard(undefined);
            setResult("Kept the tab");
          }}
          onConfirm={() => {
            setDiscard(undefined);
            setResult("Discarded the changes");
          }}
        />
      </Specimen>
    </Section>
  );
}

function Menus() {
  const [picked, setPicked] = useState("");
  const [wrap, setWrap] = useState(true);
  const [grid, setGrid] = useState(false);
  const [last, setLast] = useState("");
  const actions: MenuAction[] = [
    { label: "Open", onSelect: () => setLast("Open") },
    { label: "Rename", onSelect: () => setLast("Rename") },
    {
      label: "Duplicate",
      onSelect: () => setLast("Duplicate"),
      disabled: true,
    },
    null,
    {
      label: "View",
      items: [
        { label: "Wrap lines", checked: wrap, onSelect: () => setWrap(!wrap) },
        { label: "Show grid", checked: grid, onSelect: () => setGrid(!grid) },
      ],
    },
    null,
    { label: "Delete", onSelect: () => setLast("Delete") },
  ];
  return (
    <Section
      id="menus"
      intro={
        <>
          <code>OptionMenu</code> picks from a list, with groups as submenus.{" "}
          <code>ActionMenu</code> is a context menu with submenus, check marks,
          separators, and disabled items. <code>MenuContent</code> is the panel
          for your own Radix dropdown items.
        </>
      }
    >
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label="OptionMenu">
          <OptionMenu
            trigger={
              <Button variant="secondary">
                <PlusIcon />
                New
              </Button>
            }
            options={[
              { id: "file", label: "File", icon: <FileIcon /> },
              { id: "folder", label: "Folder", icon: <FolderIcon /> },
              { id: "report", label: "Report", group: "From a template" },
              { id: "notes", label: "Notes", group: "From a template" },
            ]}
            onSelect={setPicked}
          />
          <span className="muted" role="status">
            {picked && `Picked: ${picked}`}
          </span>
        </Specimen>
        <Specimen label="MenuContent">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost">Account</Button>
            </DropdownMenu.Trigger>
            <MenuContent>
              <DropdownMenu.Label className="menu-label">
                Signed in as ada
              </DropdownMenu.Label>
              <DropdownMenu.Item className="menu-item">
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item">
                Preferences
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="menu-separator" />
              <DropdownMenu.Item className="menu-item">
                Sign out
              </DropdownMenu.Item>
            </MenuContent>
          </DropdownMenu.Root>
        </Specimen>
      </div>
      <Specimen label="ActionMenu">
        <ActionMenu actions={actions}>
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- opens its menu from the keyboard */}
          <div className="context-target" tabIndex={0}>
            Right-click here, or focus and press Shift+F10
          </div>
        </ActionMenu>
        <span className="muted" role="status">
          {last && `Chose: ${last}`}
        </span>
      </Specimen>
    </Section>
  );
}

type Row = { name: string; tabs: number; size: number; path: string };
const rows: Row[] = [
  { name: "Inbox", tabs: 4, size: 12.5, path: "/inbox" },
  { name: "Reports", tabs: 12, size: 3.25, path: "/reports" },
  { name: "Settings", tabs: 1, size: 0.75, path: "/settings" },
  { name: "Terminal", tabs: 2, size: 48, path: "/terminal" },
];
const columns = [
  { ...column<Row>("name", "Name", (row) => row.name), rowHeader: true },
  mono<Row>("path", "Path", (row) => row.path),
  num<Row>("tabs", "Tabs", (row) => row.tabs),
  num<Row>("size", "Size", (row) => row.size, 2, "MB"),
];

function Tables() {
  const [opened, setOpened] = useState("");
  return (
    <Section
      id="table"
      intro={
        <>
          Sortable columns built with <code>column</code>, <code>mono</code>,
          and <code>num</code>. Click a header to sort.
        </>
      }
    >
      <Specimen label="Sortable, with defaultSort and onRowActivate" stack>
        <Table
          label="Workspaces"
          rows={rows}
          rowKey={(row) => row.name}
          columns={columns}
          defaultSort={{ column: "tabs", direction: "desc" }}
          onRowActivate={(row) => setOpened(row.name)}
          rowLabel={(row) => `Open ${row.name}`}
        />
        <span className="muted" role="status">
          {opened && `Opened: ${opened}`}
        </span>
      </Specimen>
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label="loading" stack>
          <Table
            label="Loading workspaces"
            rows={[]}
            rowKey={(row) => row.name}
            columns={columns}
            loading
          />
        </Specimen>
        <Specimen label="Empty" stack>
          <Table
            label="No workspaces"
            rows={[]}
            rowKey={(row) => row.name}
            columns={columns}
            empty="No workspaces yet."
          />
        </Specimen>
      </div>
    </Section>
  );
}

function AppMenus() {
  const dark = useDark();
  const [size, setSize] = useState(100);
  const [fullscreen, setFullscreen] = useFullscreen();
  return (
    <Section
      id="app-menu"
      intro={
        <>
          The logo menu for a workspace’s <code>leading</code> slot: theme,
          size, and full screen. Right-click the size button to reset it.
        </>
      }
    >
      <Specimen label="AppMenu">
        <AppMenu
          name="Labpane"
          logo={<Logo />}
          dark={dark}
          onThemeChange={setDark}
          size={size}
          onSizeChange={setSize}
          onSizeReset={() => setSize(100)}
          fullscreen={fullscreen}
          onFullscreenChange={setFullscreen}
        />
        <span className="muted">Size: {Math.round(size)}</span>
      </Specimen>
    </Section>
  );
}

function useCurrentSection() {
  const [current, setCurrent] = useState<string>(sections[0][0]);
  useEffect(() => {
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          visible.set(entry.target.id, entry.isIntersecting);
        const first = sections.find(([id]) => visible.get(id));
        if (first) setCurrent(first[0]);
      },
      { rootMargin: "-56px 0px -60% 0px" },
    );
    for (const [id] of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
  return current;
}

export function Palette() {
  const current = useCurrentSection();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader page="palette" />
      <div className="container palette-layout">
        <nav className="palette-toc" aria-label="Sections">
          <p className="palette-toc-title">On this page</p>
          <ul>
            {sections.map(([id, title]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={id === current ? "location" : undefined}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="palette-main">
          <header className="palette-header">
            <h1>Palette</h1>
            <p>
              Every component <code>@labpane/ui</code> exports, in each variant,
              size, and state, and the colour tokens of both packages. Switch
              the theme at the top to compare light and dark.
            </p>
            <details className="palette-jump">
              <summary>Jump to a section</summary>
              <nav aria-label="Sections">
                <ul>
                  {sections.map(([id, title]) => (
                    <li key={id}>
                      <a href={`#${id}`}>{title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </header>

          <Section
            id="colors"
            intro={
              <>
                Defaults read from the packages’ stylesheets. Each swatch shows
                the light value on the left and the dark value on the right.
              </>
            }
          >
            <h3 className="palette-subheading">
              <code>@labpane/ui</code>: <code>--labui-*</code>
            </h3>
            <ColourTokens prefix="--labui-" label="@labpane/ui" />
            <h3 className="palette-subheading">
              <code>@labpane/os</code>: <code>--lab-*</code>
            </h3>
            <ColourTokens prefix="--lab-" label="@labpane/os" />
            <h3 className="palette-subheading">Fonts and sizes</h3>
            <OtherTokens />
          </Section>

          <Buttons />
          <Badges />
          <Alerts />
          <Inputs />
          <Checkboxes />
          <Selects />
          <Fields />
          <FormFields />
          <Feedback />
          <Copy />
          <Pages />
          <Dialogs />
          <Confirms />
          <Menus />
          <Tables />
          <AppMenus />

          <Section
            id="terminal"
            intro={
              <>
                <code>Terminal</code> comes from the separate{" "}
                <code>@labpane/ui/terminal</code> entry point and needs{" "}
                <code>@wterm/dom</code>. This one runs a small shell in the
                page; its theme follows the page.
              </>
            }
          >
            <Suspense
              fallback={
                <p className="inline-status">
                  <Spinner /> Loading the terminal
                </p>
              }
            >
              <TerminalDemo />
            </Suspense>
          </Section>
        </main>
      </div>
      <SiteFooter page="palette" />
    </>
  );
}
