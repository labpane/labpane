import { useId, useState, type ComponentProps } from "react";
import {
  CopyIcon,
  PinIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
} from "lucide-react";
import {
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  FileInput,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  Kbd,
  Label,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@labpane/ui";
import { Labelled, Section, Specimen } from "./section";

export function Textareas() {
  const count = useId();
  return (
    <Section
      id="textarea"
      intro={
        <>
          <code>Textarea</code> grows with its content. <code>Label</code> is
          the plain label <code>FieldLabel</code> builds on; pair it with any
          control through <code>htmlFor</code>.
        </>
      }
    >
      <Specimen label="Textarea states">
        <div className="specimen-grid">
          <Labelled label="Placeholder">
            {(id) => <Textarea id={id} placeholder="Describe the method" />}
          </Labelled>
          <Labelled label="With a value">
            {(id) => (
              <Textarea
                id={id}
                defaultValue="Samples were stored at 4 C and processed within 24 hours of collection."
              />
            )}
          </Labelled>
          <Labelled label="Disabled">
            {(id) => (
              <Textarea id={id} defaultValue="Archived protocol" disabled />
            )}
          </Labelled>
          <Labelled label="aria-invalid">
            {(id) => <Textarea id={id} defaultValue="tbd" aria-invalid />}
          </Labelled>
        </div>
      </Specimen>
      <Specimen label="Label with htmlFor">
        <div className="label-row">
          <Label htmlFor={count}>Sample count</Label>
          <Input id={count} type="number" defaultValue={24} min={0} />
        </div>
      </Specimen>
    </Section>
  );
}

function Instruments({ id, ...props }: ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect id={id} defaultValue="hplc" {...props}>
      <NativeSelectOptGroup label="Chromatography">
        <NativeSelectOption value="hplc">HPLC</NativeSelectOption>
        <NativeSelectOption value="gc">Gas chromatography</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Spectroscopy">
        <NativeSelectOption value="nmr">NMR</NativeSelectOption>
        <NativeSelectOption value="ms" disabled>
          Mass spectrometry (booked)
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}

export function NativeSelects() {
  return (
    <Section
      id="native-select"
      intro={
        <>
          The browser's own <code>select</code>, styled to match, with{" "}
          <code>NativeSelectOption</code> and <code>NativeSelectOptGroup</code>.
        </>
      }
    >
      <Specimen label="States and sizes">
        <div className="specimen-grid">
          <Labelled label="With NativeSelectOptGroup">
            {(id) => <Instruments id={id} />}
          </Labelled>
          <Labelled label='size="sm"'>
            {(id) => <Instruments id={id} size="sm" />}
          </Labelled>
          <Labelled label="Disabled">
            {(id) => <Instruments id={id} disabled />}
          </Labelled>
          <Labelled label="aria-invalid">
            {(id) => <Instruments id={id} aria-invalid />}
          </Labelled>
        </div>
      </Specimen>
    </Section>
  );
}

function SwitchRow({
  label,
  ...props
}: { label: string } & ComponentProps<typeof Switch>) {
  const id = useId();
  return (
    <div className="check">
      <Switch id={id} {...props} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

export function Switches() {
  const [on, setOn] = useState(true);
  return (
    <Section id="switch">
      <Specimen label="States and sizes">
        <SwitchRow label="Off" />
        <SwitchRow label="On" checked={on} onCheckedChange={setOn} />
        <SwitchRow label='size="sm"' size="sm" defaultChecked />
        <SwitchRow label="Disabled" disabled />
        <SwitchRow label="Disabled and on" disabled defaultChecked />
        <SwitchRow label="aria-invalid" aria-invalid />
      </Specimen>
    </Section>
  );
}

export function Toggles() {
  const [pinned, setPinned] = useState(true);
  const [density, setDensity] = useState("comfortable");
  const [statistics, setStatistics] = useState(["mean"]);
  return (
    <Section
      id="toggle"
      intro={
        <>
          <code>Toggle</code> is a pressed or unpressed button.{" "}
          <code>ToggleGroup</code> holds <code>ToggleGroupItem</code>s that pick
          one value or several; <code>spacing</code> separates them.
        </>
      }
    >
      <Specimen label='Toggle with variant="outline", sizes, and states'>
        <Toggle aria-label="Pin" pressed={pinned} onPressedChange={setPinned}>
          <PinIcon />
        </Toggle>
        <Toggle variant="outline">
          <StarIcon />
          Favourite
        </Toggle>
        <Toggle variant="outline" size="sm">
          Small
        </Toggle>
        <Toggle variant="outline" size="lg">
          Large
        </Toggle>
        <Toggle variant="outline" disabled>
          Disabled
        </Toggle>
        <span className="muted" role="status">
          {pinned ? "Pinned" : "Not pinned"}
        </span>
      </Specimen>
      <Specimen label='ToggleGroup type="single" with variant="outline"'>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Row density"
          value={density}
          onValueChange={(value) => value && setDensity(value)}
        >
          <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
          <ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem>
          <ToggleGroupItem value="spacious">Spacious</ToggleGroupItem>
        </ToggleGroup>
        <span className="muted" role="status">
          Density: {density}
        </span>
      </Specimen>
      <Specimen label='ToggleGroup type="multiple" with spacing={1}'>
        <ToggleGroup
          type="multiple"
          spacing={1}
          size="sm"
          aria-label="Statistics to show"
          value={statistics}
          onValueChange={setStatistics}
        >
          <ToggleGroupItem value="mean">Mean</ToggleGroupItem>
          <ToggleGroupItem value="median">Median</ToggleGroupItem>
          <ToggleGroupItem value="range">Range</ToggleGroupItem>
        </ToggleGroup>
        <span className="muted" role="status">
          {statistics.length ? statistics.join(", ") : "Nothing selected"}
        </span>
      </Specimen>
    </Section>
  );
}

export function InputGroups() {
  const [posted, setPosted] = useState("");
  return (
    <Section
      id="input-group"
      intro={
        <>
          <code>InputGroup</code> wraps an <code>InputGroupInput</code> or{" "}
          <code>InputGroupTextarea</code> with addons at either end or above and
          below. <code>InputGroupText</code> and <code>InputGroupButton</code>{" "}
          go inside an addon.
        </>
      }
    >
      <div className="specimen-grid">
        <Specimen
          label="InputGroupAddon at both ends with InputGroupText"
          stack
        >
          <Labelled label="Invoice amount">
            {(id) => (
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id={id} type="number" defaultValue="1250" />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>USD</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            )}
          </Labelled>
        </Specimen>
        <Specimen label="An icon and a Kbd as addons" stack>
          <Labelled label="Find a dataset">
            {(id) => (
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput id={id} placeholder="Reef transects" />
                <InputGroupAddon align="inline-end">
                  <Kbd>/</Kbd>
                </InputGroupAddon>
              </InputGroup>
            )}
          </Labelled>
        </Specimen>
        <Specimen label="InputGroupButton" stack>
          <Labelled label="Share link">
            {(id) => (
              <InputGroup>
                <InputGroupInput
                  id={id}
                  readOnly
                  defaultValue="https://lab.example.org/d/reef-2026"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label="Copy link">
                    <CopyIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            )}
          </Labelled>
        </Specimen>
        <Specimen label="aria-invalid and disabled" stack>
          <Labelled label="Grant code">
            {(id) => (
              <InputGroup>
                <InputGroupInput id={id} defaultValue="G-" aria-invalid />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>Required</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            )}
          </Labelled>
          <Labelled label="Archived">
            {(id) => (
              <InputGroup data-disabled="true">
                <InputGroupInput id={id} defaultValue="2019 survey" disabled />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>Read only</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            )}
          </Labelled>
        </Specimen>
      </div>
      <Specimen label='InputGroupTextarea with align="block-start" and "block-end" addons'>
        <div className="specimen-grid specimen-grid-wide">
          <Labelled label="Abstract">
            {(id) => (
              <InputGroup>
                <InputGroupAddon align="block-start">
                  <InputGroupText>Shown on the project page</InputGroupText>
                </InputGroupAddon>
                <InputGroupTextarea
                  id={id}
                  rows={3}
                  placeholder="Summarise the aims in two or three sentences"
                />
              </InputGroup>
            )}
          </Labelled>
          <Labelled label="Add a note">
            {(id) => (
              <form
                className="specimen-stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPosted("Note posted");
                }}
              >
                <InputGroup>
                  <InputGroupTextarea
                    id={id}
                    rows={3}
                    placeholder="What changed in this run?"
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText>Markdown is supported</InputGroupText>
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="sm"
                      className="push-end"
                    >
                      <SendIcon />
                      Post
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <span className="muted" role="status">
                  {posted}
                </span>
              </form>
            )}
          </Labelled>
        </div>
      </Specimen>
    </Section>
  );
}

export function SearchInputs() {
  const [query, setQuery] = useState("");
  return (
    <Section
      id="search-input"
      intro={
        <>
          <code>SearchInput</code> is an <code>InputGroup</code> with a search
          icon and a clear button that appears once there is text.{" "}
          <code>FileInput</code> keeps the chosen file name beside its button.
        </>
      }
    >
      <div className="specimen-grid">
        <Specimen label="SearchInput, controlled, with onClear" stack>
          <SearchInput
            aria-label="Search samples"
            placeholder="Search samples"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
          />
          <span className="muted" role="status">
            {query ? `Searching for "${query}"` : "Type to search"}
          </span>
        </Specimen>
        <Specimen label="Uncontrolled, with a defaultValue" stack>
          <SearchInput
            aria-label="Search runs"
            defaultValue="yield"
            clearLabel="Clear the search"
          />
        </Specimen>
      </div>
      <Specimen label="FileInput">
        <FileInput aria-label="Data file" accept=".csv,.tsv" />
        <FileInput
          aria-label="Protocol"
          chooseLabel="Attach protocol"
          emptyLabel="No protocol attached"
        />
        <FileInput aria-label="Archived file" disabled />
      </Specimen>
    </Section>
  );
}

const errors = [
  { message: "Enter a value above 0." },
  { message: "Use nanograms per microlitre." },
  { message: "Enter a value above 0." },
];

export function FieldSets() {
  const name = useId();
  const length = useId();
  const notify = useId();
  const concentration = useId();
  const shareIds = [useId(), useId(), useId()];
  return (
    <Section
      id="field-set"
      intro={
        <>
          <code>FieldSet</code> and <code>FieldLegend</code> group fields;{" "}
          <code>FieldGroup</code> spaces them. <code>FieldDescription</code>{" "}
          explains a field, <code>FieldSeparator</code> divides, and{" "}
          <code>FieldContent</code> with <code>FieldTitle</code> puts text
          beside a control.
        </>
      }
    >
      <div className="specimen-grid specimen-grid-wide">
        <Specimen
          label="FieldSet, FieldLegend, FieldGroup, FieldDescription, FieldSeparator, FieldContent"
          stack
        >
          <FieldSet>
            <FieldLegend>Sequencing request</FieldLegend>
            <FieldDescription>
              The facility confirms each request within one working day.
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={name}>Sample name</FieldLabel>
                <Input id={name} placeholder="Use the barcode on the tube" />
                <FieldDescription>
                  Letters, digits, and dashes.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor={length}>Read length</FieldLabel>
                <Select defaultValue="150">
                  <SelectTrigger id={length}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="75">75 bases</SelectItem>
                    <SelectItem value="150">150 bases</SelectItem>
                    <SelectItem value="300">300 bases</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <FieldSeparator>Optional</FieldSeparator>
              <Field orientation="horizontal">
                <Checkbox id={notify} defaultChecked />
                <FieldContent>
                  <FieldLabel htmlFor={notify}>
                    Email me when results are ready
                  </FieldLabel>
                  <FieldDescription>
                    Sent to the address on your profile.
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Priority processing</FieldTitle>
                  <FieldDescription>
                    Results within 48 hours at the priority rate.
                  </FieldDescription>
                </FieldContent>
                <Switch aria-label="Priority processing" />
              </Field>
            </FieldGroup>
          </FieldSet>
        </Specimen>
        <div className="specimen-stack">
          <Specimen label="FieldError with errors, duplicates removed" stack>
            <Field data-invalid>
              <FieldLabel htmlFor={concentration}>Concentration</FieldLabel>
              <Input id={concentration} defaultValue="-3 mg" aria-invalid />
              <FieldError errors={errors} />
            </Field>
          </Specimen>
          <Specimen
            label='FieldLegend variant="label" over a checkbox group'
            stack
          >
            <FieldSet>
              <FieldLegend variant="label">Share with</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                {["Lab members", "Collaborators", "Funders"].map(
                  (group, index) => (
                    <Field key={group} orientation="horizontal">
                      <Checkbox
                        id={shareIds[index]}
                        defaultChecked={index === 0}
                      />
                      <FieldLabel htmlFor={shareIds[index]}>{group}</FieldLabel>
                    </Field>
                  ),
                )}
              </FieldGroup>
            </FieldSet>
          </Specimen>
        </div>
      </div>
    </Section>
  );
}
