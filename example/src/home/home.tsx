import { Button } from "@labpane/ui";
import { Code, Command, SiteFooter, SiteHeader, links } from "../site";
import { Demo } from "./demo";

const osExample = `
import { useState } from "react";
import { Workspace, type Layout, type WorkspaceTab } from "@labpane/os";
import "@labpane/os/styles.css";

const initial: WorkspaceTab[] = [
  { key: "inbox", label: "Inbox" },
  { key: "reports", label: "Reports" },
];

export function App() {
  const [tabs, setTabs] = useState(initial);
  const [active, setActive] = useState<string | undefined>("inbox");
  const [layout, setLayout] = useState<Layout>({
    id: "main",
    tabs: initial.map((tab) => tab.key),
    active: "inbox",
  });

  return (
    <div style={{ height: "100vh" }}>
      <Workspace
        tabs={tabs}
        active={active}
        onSelect={setActive}
        onClose={(key, next) => {
          setTabs((tabs) => tabs.filter((tab) => tab.key !== key));
          setActive((current) => (current === key ? next : current));
        }}
        layout={layout}
        onLayoutChange={setLayout}
        empty={() => <p>No tabs open</p>}
      >
        {(tab) => <h1>{tab.label}</h1>}
      </Workspace>
    </div>
  );
}
`;

const uiExample = `
import "@labpane/ui/styles.css";
import { Button, Page } from "@labpane/ui";

export function Settings() {
  return (
    <Page title="Settings" actions={<Button>Save</Button>}>
      …
    </Page>
  );
}
`;

const themeExample = `
:root {
  --lab-background: #f4f1ea;
  --lab-ring: #1d9db4;
  --labui-primary: #05697a;
  --labui-radius: 0.75rem;
}
`;

const features = [
  {
    title: "Tabs, splits, and docking",
    text: "Reorder tabs, drag them into new panes, split left, right, or below, and resize the panes.",
  },
  {
    title: "Keyboard support",
    text: "Arrow keys switch tabs, Alt and the arrows reorder them, Alt+Shift and an arrow splits, Delete closes, and F6 moves between panes.",
  },
  {
    title: "Your state",
    text: "The workspace owns no state. Tabs, the active tab, and the layout are values you keep, in your router, store, or URL.",
  },
  {
    title: "Unsaved changes",
    text: "A tab with unsaved changes asks before it closes, and the page warns before it unloads.",
  },
  {
    title: "Scoped CSS",
    text: "Plain CSS with prefixed classes and no global rules. It builds in Tailwind 3, Tailwind 4, or no-Tailwind apps without touching the host page.",
  },
  {
    title: "Themes",
    text: "CSS variables with light and dark defaults and forced-colors support. A dark class on any ancestor switches to dark.",
  },
  {
    title: "Size",
    text: "One density value scales the tabs, gaps, and logo from dense to comfortable.",
  },
  {
    title: "Desktop windows",
    text: "Window controls and a window-frame hook make the workspace the title bar of a frameless Wails, Tauri, or Electron window.",
  },
  {
    title: "React 18.2 and later",
    text: "Works with React 18.2 and 19. React and Radix are peer dependencies, so your app keeps a single copy of each.",
  },
];

export function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader page="home">
        <a className="site-nav-section" href="#demo">
          Demo
        </a>
        <a className="site-nav-section" href="#packages">
          Packages
        </a>
      </SiteHeader>
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
          <h1 id="hero-title">Labpane</h1>
          <p className="hero-pitch">Browser-tab workspaces for React.</p>
          <p className="hero-lede">
            Tabs you can drag, split, and dock into resizable panes, plus an
            optional UI kit for building the pages that live in them.
          </p>
          <div className="hero-actions">
            <Command>npm install @labpane/os</Command>
            <Button asChild>
              <a href="#packages">Get started</a>
            </Button>
            <Button variant="secondary" asChild>
              <a href={links.github}>View on GitHub</a>
            </Button>
          </div>
        </section>

        <section
          id="demo"
          className="demo-section"
          aria-labelledby="demo-title"
        >
          <div className="container">
            <h2 id="demo-title" className="sr-only">
              Live demo
            </h2>
            <Demo />
            <p className="demo-caption">
              A live <code>@labpane/os</code> workspace with{" "}
              <code>@labpane/ui</code> pages in its tabs. Drag, split, close,
              and reopen tabs; nothing here is a screenshot.
            </p>
          </div>
        </section>

        <section className="container section" aria-labelledby="features-title">
          <h2 id="features-title">What it does</h2>
          <ul className="features">
            {features.map((feature) => (
              <li key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="packages"
          className="container section"
          aria-labelledby="packages-title"
        >
          <h2 id="packages-title">Two packages</h2>
          <p className="section-lede">
            Use <code>@labpane/os</code> on its own and bring your own
            components, or add <code>@labpane/ui</code> for a ready-made look.
          </p>

          <article className="package" aria-labelledby="os-title">
            <div className="package-about">
              <h3 id="os-title">@labpane/os</h3>
              <p>
                The workspace: tabs, split panes, docking, and keyboard
                navigation. It depends only on React and ships its own plain
                CSS.
              </p>
              <Command>npm install @labpane/os</Command>
              <ul className="package-links">
                <li>
                  <a href={links.os}>npm</a>
                </li>
                <li>
                  <a href={links.github}>Source and README</a>
                </li>
              </ul>
            </div>
            <Code title="App.tsx" code={osExample} />
          </article>

          <article className="package" aria-labelledby="ui-title">
            <div className="package-about">
              <h3 id="ui-title">@labpane/ui</h3>
              <p>
                Page layouts, forms, dialogs, menus, tables, and an optional
                terminal, built on Radix. It pairs with <code>@labpane/os</code>{" "}
                but works on its own, and needs no Tailwind in your app.
              </p>
              <Command>npm install @labpane/ui</Command>
              <p className="package-note">
                Radix and React are peer dependencies, so your app keeps one
                copy of each.
              </p>
              <ul className="package-links">
                <li>
                  <a href={links.ui}>npm</a>
                </li>
                <li>
                  <a href="palette/">Every component</a>
                </li>
              </ul>
            </div>
            <Code title="Settings.tsx" code={uiExample} />
          </article>

          <article className="package" aria-labelledby="theme-title">
            <div className="package-about">
              <h3 id="theme-title">Theming</h3>
              <p>
                Both packages read CSS variables: <code>--lab-*</code> for the
                workspace and <code>--labui-*</code> for the components. Set
                them on <code>:root</code> or any ancestor, and add a{" "}
                <code>dark</code> class for the dark defaults.
              </p>
              <ul className="package-links">
                <li>
                  <a href="palette/#colors">See every colour token</a>
                </li>
              </ul>
            </div>
            <Code title="styles.css" code={themeExample} />
          </article>
        </section>
      </main>
      <SiteFooter page="home" />
    </>
  );
}
