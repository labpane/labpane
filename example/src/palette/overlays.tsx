import { useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  DatabaseIcon,
  DownloadIcon,
  FlaskConicalIcon,
  PencilIcon,
  ReceiptIcon,
  SettingsIcon,
  TrashIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Kbd,
  KbdGroup,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@labpane/ui";
import { Section, Specimen } from "./section";

export function Tooltips() {
  return (
    <Section
      id="tooltip"
      intro={
        <>
          <code>Tooltip</code> with a <code>TooltipTrigger</code> and{" "}
          <code>TooltipContent</code>, inside a <code>TooltipProvider</code>{" "}
          that sets the delay once for a whole page.
        </>
      }
    >
      <TooltipProvider>
        <Specimen label="Tooltip on a button, an icon button, and with a Kbd">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">Save</Button>
            </TooltipTrigger>
            <TooltipContent>Save the notebook</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Settings">
                <SettingsIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Command palette</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Open the command palette <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
            </TooltipContent>
          </Tooltip>
        </Specimen>
      </TooltipProvider>
    </Section>
  );
}

const sides = ["right", "left", "top", "bottom"] as const;

function SampleSheet({
  side,
  showCloseButton,
  children,
}: {
  side: (typeof sides)[number];
  showCloseButton?: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side={side} showCloseButton={showCloseButton}>
        <SheetHeader>
          <SheetTitle>Sample details</SheetTitle>
          <SheetDescription>
            Sample S-0042 from the north reef, collected on 2 March.
          </SheetDescription>
        </SheetHeader>
        <dl className="sheet-lines">
          <dt>Depth</dt>
          <dd>12.5 m</dd>
          <dt>Temperature</dt>
          <dd>27.1 C</dd>
          <dt>Salinity</dt>
          <dd>35.2 PSU</dd>
        </dl>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function Sheets() {
  return (
    <Section
      id="sheet"
      intro={
        <>
          A panel that slides in from an edge: <code>SheetContent</code> with a{" "}
          <code>SheetHeader</code>, <code>SheetTitle</code>,{" "}
          <code>SheetDescription</code>, <code>SheetFooter</code>, and{" "}
          <code>SheetClose</code>. Escape or the overlay closes it.
        </>
      }
    >
      <Specimen label='side="right" | "left" | "top" | "bottom"'>
        {sides.map((side) => (
          <SampleSheet key={side} side={side}>
            <Button variant="secondary">
              {side[0]!.toUpperCase() + side.slice(1)}
            </Button>
          </SampleSheet>
        ))}
      </Specimen>
      <Specimen label="showCloseButton={false}">
        <SampleSheet side="bottom" showCloseButton={false}>
          <Button variant="ghost">Without a close button</Button>
        </SampleSheet>
      </Specimen>
    </Section>
  );
}

export function DropdownMenus() {
  const [pinned, setPinned] = useState(true);
  const [watching, setWatching] = useState(false);
  const [sort, setSort] = useState("date");
  const [last, setLast] = useState("");
  return (
    <Section
      id="dropdown-menu"
      intro={
        <>
          The parts behind <code>OptionMenu</code>: a{" "}
          <code>DropdownMenuTrigger</code>, then{" "}
          <code>DropdownMenuContent</code> with labels, groups, items with
          shortcuts, checkbox and radio items, separators, and a submenu.
        </>
      }
    >
      <Specimen label="DropdownMenu with every kind of item">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              Dataset
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>reef-transects-2026</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setLast("Download")}>
                <DownloadIcon />
                Download
                <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLast("Rename")}>
                <PencilIcon />
                Rename
                <DropdownMenuShortcut>F2</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={pinned}
              onCheckedChange={setPinned}
            >
              Pinned
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={watching}
              onCheckedChange={setWatching}
            >
              Watch for changes
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel inset>Sort samples by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
              <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">
                Date collected
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="depth">Depth</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset>Share with</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setLast("Share: lab")}>
                  <UsersIcon />
                  Lab members
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setLast("Share: collaborators")}
                >
                  Collaborators
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLast("Share: link")}>
                  Anyone with the link
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setLast("Delete")}
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="muted" role="status">
          {[
            pinned ? "pinned" : "not pinned",
            watching ? "watching" : "not watching",
            `sorted by ${sort}`,
            last && `chose ${last}`,
          ]
            .filter(Boolean)
            .join(", ")}
        </span>
      </Specimen>
    </Section>
  );
}

const commands = {
  Pages: [
    { label: "Datasets", icon: <DatabaseIcon /> },
    { label: "Invoices", icon: <ReceiptIcon /> },
    { label: "Lab members", icon: <UsersIcon /> },
  ],
  Actions: [
    { label: "New experiment", icon: <FlaskConicalIcon />, shortcut: "Ctrl+N" },
    { label: "Import samples", icon: <UploadIcon />, shortcut: "Ctrl+I" },
    { label: "Export report", icon: <DownloadIcon /> },
  ],
};

function CommandItems({ onPick }: { onPick: (label: string) => void }) {
  return (
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      {Object.entries(commands).map(([heading, items], index) => (
        <div key={heading}>
          {index > 0 && <CommandSeparator />}
          <CommandGroup heading={heading}>
            {items.map((item) => (
              <CommandItem key={item.label} onSelect={() => onPick(item.label)}>
                {item.icon}
                {item.label}
                {"shortcut" in item && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </div>
      ))}
    </CommandList>
  );
}

export function Commands() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("");
  return (
    <Section
      id="command"
      intro={
        <>
          A filtering list: <code>Command</code> with a{" "}
          <code>CommandInput</code>, <code>CommandList</code>,{" "}
          <code>CommandGroup</code>s of <code>CommandItem</code>s,{" "}
          <code>CommandSeparator</code>, <code>CommandShortcut</code>, and a{" "}
          <code>CommandEmpty</code> message. <code>CommandDialog</code> puts one
          in a dialog.
        </>
      }
    >
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label="Command, inline" stack>
          <div className="command-frame">
            {/* No initial selection: cmdk scrolls the selected item into view,
                which would pull the whole document down to this example. */}
            <Command defaultValue="__unselected__">
              <CommandInput
                aria-label="Search pages and actions"
                placeholder="Search pages and actions"
              />
              <CommandItems onPick={setPicked} />
            </Command>
          </div>
        </Specimen>
        <Specimen label="CommandDialog">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Open the command palette
          </Button>
          <KbdGroup aria-hidden="true">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title="Command palette"
            description="Search pages and actions"
          >
            <CommandInput placeholder="Type a command or search" />
            <CommandItems
              onPick={(label) => {
                setPicked(label);
                setOpen(false);
              }}
            />
          </CommandDialog>
        </Specimen>
      </div>
      <span className="muted" role="status">
        {picked && `Chosen: ${picked}`}
      </span>
    </Section>
  );
}
