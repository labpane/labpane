import { useState } from "react";
import {
  CheckIcon,
  EllipsisIcon,
  FileSearchIcon,
  FlaskConicalIcon,
  PaperclipIcon,
  PlusIcon,
  SlashIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmailIdentity,
  EmailMessage,
  EmailThread,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Kbd,
  KbdGroup,
  NavTab,
  NavTabs,
  Separator,
  Stat,
  StatDetail,
  StatLabel,
  StatValue,
  Stats,
  Step,
  Steps,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@labpane/ui";
import { Section, Specimen } from "./section";

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1d9db4"/><circle cx="32" cy="25" r="12" fill="#e8f6f8"/><path d="M8 64c2-16 12-25 24-25s22 9 24 25z" fill="#e8f6f8"/></svg>',
)}`;

const members = [
  { initials: "MO", name: "Mara Okafor" },
  { initials: "JL", name: "Jonas Lindqvist" },
  { initials: "PR", name: "Priya Raman" },
];

export function Avatars() {
  return (
    <Section
      id="avatar"
      intro={
        <>
          <code>Avatar</code> shows an <code>AvatarImage</code> once it loads
          and an <code>AvatarFallback</code> until then.{" "}
          <code>AvatarBadge</code> marks a status; <code>AvatarGroup</code>{" "}
          overlaps several, with <code>AvatarGroupCount</code> for the rest.
        </>
      }
    >
      <Specimen label='size="sm" | "default" | "lg" with AvatarFallback'>
        <Avatar size="sm">
          <AvatarFallback>MO</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
      </Specimen>
      <Specimen label="AvatarImage with a fallback">
        <Avatar>
          <AvatarImage src={portrait} alt="Mara Okafor" />
          <AvatarFallback>MO</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src={portrait} alt="Mara Okafor" />
          <AvatarFallback>MO</AvatarFallback>
        </Avatar>
      </Specimen>
      <Specimen label="AvatarBadge, plain and with an icon">
        <Avatar>
          <AvatarFallback>JL</AvatarFallback>
          <AvatarBadge aria-label="Online" />
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src={portrait} alt="Mara Okafor" />
          <AvatarFallback>MO</AvatarFallback>
          <AvatarBadge aria-label="Verified">
            <CheckIcon />
          </AvatarBadge>
        </Avatar>
      </Specimen>
      <Specimen label="AvatarGroup with AvatarGroupCount">
        <AvatarGroup aria-label="Lab members">
          {members.map((member) => (
            <Avatar key={member.initials}>
              <AvatarFallback title={member.name}>
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+4</AvatarGroupCount>
        </AvatarGroup>
        <AvatarGroup aria-label="Reviewers">
          {members.slice(0, 2).map((member) => (
            <Avatar key={member.initials} size="sm">
              <AvatarFallback title={member.name}>
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>
            <PlusIcon />
          </AvatarGroupCount>
        </AvatarGroup>
      </Specimen>
    </Section>
  );
}

export function Breadcrumbs() {
  return (
    <Section
      id="breadcrumb"
      intro={
        <>
          A <code>nav</code> of <code>BreadcrumbItem</code>s in a{" "}
          <code>BreadcrumbList</code>: <code>BreadcrumbLink</code> for the
          parents, <code>BreadcrumbPage</code> for the current page.
        </>
      }
    >
      <Specimen label="Breadcrumb with BreadcrumbSeparator" stack>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#breadcrumb">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#breadcrumb">Coastal survey</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Run 043</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Specimen>
      <Specimen label="BreadcrumbEllipsis and a custom separator" stack>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#breadcrumb">Archive</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#breadcrumb">Datasets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>reef-transects-2026</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Specimen>
    </Section>
  );
}

export function Cards() {
  return (
    <Section
      id="card"
      intro={
        <>
          <code>CardHeader</code> holds a <code>CardTitle</code>,{" "}
          <code>CardDescription</code>, and an optional <code>CardAction</code>{" "}
          at the end; <code>CardContent</code> and <code>CardFooter</code>{" "}
          follow. <code>bordered</code> draws a line under the header or over
          the footer.
        </>
      }
    >
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label="Card with CardAction" stack>
          <Card>
            <CardHeader>
              <CardTitle>Reef transects 2026</CardTitle>
              <CardDescription>412 samples across five sites</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="More">
                  <EllipsisIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p>
                Quarterly transects of coral cover and fish counts, with water
                chemistry from the lagoon logger.
              </p>
            </CardContent>
            <CardFooter className="card-footer">
              <Badge variant="success">Published</Badge>
              <span className="muted">Updated yesterday</span>
            </CardFooter>
          </Card>
        </Specimen>
        <Specimen label='bordered header and footer, CardTitle as="h3"' stack>
          <Card>
            <CardHeader bordered>
              <CardTitle as="h3">Invoice INV-1042</CardTitle>
              <CardDescription>
                Marine Institute, due 2 Nov 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="card-lines">
                <dt>Sequencer time</dt>
                <dd>$950.00</dd>
                <dt>Consumables</dt>
                <dd>$300.00</dd>
              </dl>
            </CardContent>
            <CardFooter bordered className="card-footer">
              <Button variant="secondary" size="sm">
                Download PDF
              </Button>
              <Button size="sm">Mark as paid</Button>
            </CardFooter>
          </Card>
        </Specimen>
      </div>
    </Section>
  );
}

export function Empties() {
  return (
    <Section
      id="empty"
      intro={
        <>
          An empty state: <code>EmptyHeader</code> with an{" "}
          <code>EmptyMedia</code>, <code>EmptyTitle</code>, and{" "}
          <code>EmptyDescription</code>, then <code>EmptyContent</code> for what
          to do next.
        </>
      }
    >
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label='EmptyMedia variant="icon"' stack>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FlaskConicalIcon />
              </EmptyMedia>
              <EmptyTitle>No experiments yet</EmptyTitle>
              <EmptyDescription>
                Create an experiment to start recording runs, or{" "}
                <a href="#empty">import one</a> from a file.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>
                <PlusIcon />
                New experiment
              </Button>
            </EmptyContent>
          </Empty>
        </Specimen>
        <Specimen label='EmptyMedia variant="default"' stack>
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <FileSearchIcon className="empty-icon" />
              </EmptyMedia>
              <EmptyTitle>No samples match</EmptyTitle>
              <EmptyDescription>
                Nothing in the archive matches "kelp 2019". Check the spelling
                or widen the date range.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="secondary" size="sm">
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        </Specimen>
      </div>
    </Section>
  );
}

export function StatsDemo() {
  return (
    <Section
      id="stats"
      intro={
        <>
          A description list of <code>Stat</code>s, each with a{" "}
          <code>StatLabel</code>, a <code>StatValue</code>, and an optional{" "}
          <code>StatDetail</code>.
        </>
      }
    >
      <Specimen label="Stats" stack>
        <Stats>
          <Stat>
            <StatLabel>Samples</StatLabel>
            <StatValue>1,284</StatValue>
            <StatDetail>96 added this week</StatDetail>
          </Stat>
          <Stat>
            <StatLabel>Mean yield</StatLabel>
            <StatValue>78.4%</StatValue>
            <StatDetail>Across six runs</StatDetail>
          </Stat>
          <Stat>
            <StatLabel>Open invoices</StatLabel>
            <StatValue>3</StatValue>
            <StatDetail>$4,920 outstanding</StatDetail>
          </Stat>
          <Stat>
            <StatLabel>Storage</StatLabel>
            <StatValue>3.2 TB</StatValue>
            <StatDetail>64% of the quota</StatDetail>
          </Stat>
        </Stats>
      </Specimen>
    </Section>
  );
}

export function KbdDemo() {
  return (
    <Section
      id="kbd"
      intro={
        <>
          <code>Kbd</code> is a key; <code>KbdGroup</code> is a chord.{" "}
          <code>Separator</code> is a line, horizontal or vertical, decorative
          unless told otherwise.
        </>
      }
    >
      <Specimen label="Kbd and KbdGroup">
        <Kbd>Esc</Kbd>
        <Kbd>Enter</Kbd>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span className="muted">+</span>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>Shift</Kbd>
          <span className="muted">+</span>
          <Kbd>F10</Kbd>
        </KbdGroup>
      </Specimen>
      <div className="specimen-grid">
        <Specimen label="Separator, horizontal" stack>
          <div className="separator-stack">
            <p>Run 043 finished with a final yield of 78.4%.</p>
            <Separator />
            <p className="muted">Run 044 is queued for tomorrow.</p>
          </div>
        </Specimen>
        <Specimen label='orientation="vertical" and decorative={false}' stack>
          <div className="separator-row">
            <span>Samples</span>
            <Separator orientation="vertical" decorative={false} />
            <span>Figures</span>
            <Separator orientation="vertical" decorative={false} />
            <span>Notes</span>
          </div>
        </Specimen>
      </div>
    </Section>
  );
}

function RunTabs({ variant }: { variant?: "default" | "line" }) {
  return (
    <Tabs defaultValue="summary">
      <TabsList variant={variant}>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="samples">Samples</TabsTrigger>
        <TabsTrigger value="notes" disabled>
          Notes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <p className="muted">
          Six runs, mean yield 78.4%, no outliers flagged.
        </p>
      </TabsContent>
      <TabsContent value="samples">
        <p className="muted">412 samples, 18 awaiting review.</p>
      </TabsContent>
    </Tabs>
  );
}

export function TabsDemo() {
  return (
    <Section
      id="tabs"
      intro={
        <>
          <code>Tabs</code> with a <code>TabsList</code> of{" "}
          <code>TabsTrigger</code>s and one <code>TabsContent</code> per value.
          The list comes filled or as a line.
        </>
      }
    >
      <div className="specimen-grid">
        <Specimen label='TabsList variant="default"' stack>
          <RunTabs />
        </Specimen>
        <Specimen label='TabsList variant="line"' stack>
          <RunTabs variant="line" />
        </Specimen>
        <Specimen label='orientation="vertical"' stack>
          <Tabs defaultValue="chemistry" orientation="vertical">
            <TabsList variant="line">
              <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
              <TabsTrigger value="biology">Biology</TabsTrigger>
              <TabsTrigger value="physics">Physics</TabsTrigger>
            </TabsList>
            <TabsContent value="chemistry">
              <p className="muted">Water chemistry from the lagoon logger.</p>
            </TabsContent>
            <TabsContent value="biology">
              <p className="muted">Coral cover and fish counts.</p>
            </TabsContent>
            <TabsContent value="physics">
              <p className="muted">Temperature and current profiles.</p>
            </TabsContent>
          </Tabs>
        </Specimen>
      </div>
    </Section>
  );
}

const pages = ["Summary", "Samples", "Figures", "History"];
const steps = [
  "Describe the dataset",
  "Upload files",
  "Review metadata",
  "Publish",
];

export function NavTabsDemo() {
  const [page, setPage] = useState(pages[0]);
  const [step, setStep] = useState(1);
  return (
    <Section
      id="nav-tabs"
      intro={
        <>
          <code>NavTabs</code> are links styled as tabs, with arrow keys moving
          between them. <code>Steps</code> list the stages of a process;{" "}
          <code>Step</code> takes an <code>index</code> and whether it is{" "}
          <code>active</code>.
        </>
      }
    >
      <Specimen label="NavTabs with an active NavTab" stack>
        <NavTabs aria-label="Dataset pages">
          {pages.map((name) => (
            <NavTab
              key={name}
              href="#nav-tabs"
              active={name === page}
              onClick={(event) => {
                event.preventDefault();
                setPage(name);
              }}
            >
              {name}
            </NavTab>
          ))}
        </NavTabs>
        <span className="muted" role="status">
          Showing {page}
        </span>
      </Specimen>
      <Specimen label="Steps" stack>
        <Steps aria-label="Submission" className="steps-sample">
          {steps.map((label, index) => (
            <Step
              key={label}
              index={index + 1}
              active={index === step}
              onClick={() => setStep(index)}
            >
              {label}
            </Step>
          ))}
        </Steps>
      </Specimen>
    </Section>
  );
}

export function EmailThreads() {
  return (
    <Section
      id="email"
      intro={
        <>
          <code>EmailThread</code> lists <code>EmailMessage</code>s down a line,
          each with a sender, an optional recipient or attribution, a date, a
          badge, a tone, and attachments. <code>EmailIdentity</code> formats a
          name with its address.
        </>
      }
    >
      <Specimen label="EmailIdentity">
        <EmailIdentity name="Mara Okafor" address="mara@lab.example.org" />
        <EmailIdentity address="noreply@instruments.example.org" />
        <EmailIdentity />
      </Specimen>
      <Specimen
        label='EmailThread with tone="default" | "muted" | "warning"'
        stack
      >
        <EmailThread className="email-sample">
          <EmailMessage
            sender={{ name: "Mara Okafor", address: "mara@lab.example.org" }}
            recipient={{ name: "Lab members", address: "lab@lab.example.org" }}
            dateTime="2026-03-02T09:14:00Z"
            dateLabel="2 Mar, 09:14"
            badge={<Badge variant="info">Announcement</Badge>}
            body={
              "Hello all,\n\nThe revised sampling protocol is attached. From Monday, every tube gets a barcode before it leaves the boat.\n\nMara"
            }
            attachments={
              <>
                <Badge variant="outline">
                  <PaperclipIcon />
                  protocol-v3.pdf
                </Badge>
                <Badge variant="outline">
                  <PaperclipIcon />
                  barcode-sheet.csv
                </Badge>
              </>
            }
          />
          <EmailMessage
            sender={{
              name: "Jonas Lindqvist",
              address: "jonas@lab.example.org",
            }}
            attribution="via the lab-notices list"
            tone="muted"
            dateTime="2026-03-02T10:02:00Z"
            dateLabel="2 Mar, 10:02"
            body="Thanks Mara. I have printed labels for the next two trips; they are in the dry lab by the door."
          />
          <EmailMessage
            sender={{ address: "noreply@instruments.example.org" }}
            tone="warning"
            dateTime="2026-03-03T06:30:00Z"
            dateLabel="3 Mar, 06:30"
            badge={<Badge variant="warning">Automated</Badge>}
            body="The lagoon logger reported a low battery at 06:28. Readings continue for roughly 36 hours."
          />
        </EmailThread>
      </Specimen>
    </Section>
  );
}
