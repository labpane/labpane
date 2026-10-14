import type { ReactNode } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button, CopyButton } from "@labpane/ui";
import { setDark, useDark } from "./theme";

export const links = {
  github: "https://github.com/labpane/labpane",
  os: "https://www.npmjs.com/package/@labpane/os",
  ui: "https://www.npmjs.com/package/@labpane/ui",
};

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ? `logo ${className}` : "logo"}
    >
      <rect x="3" y="2.5" width="9" height="6" rx="2" className="logo-back" />
      <rect
        x="2"
        y="5.5"
        width="20"
        height="16"
        rx="3.5"
        className="logo-back"
      />
      <rect
        x="4.5"
        y="8.5"
        width="8"
        height="10.5"
        rx="1.5"
        className="logo-pane"
      />
      <rect
        x="14"
        y="8.5"
        width="5.5"
        height="10.5"
        rx="1.5"
        className="logo-pane logo-pane-second"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const dark = useDark();
  const Icon = dark ? SunIcon : MoonIcon;
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Dark theme"
      aria-pressed={dark}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setDark(!dark)}
    >
      <Icon />
    </Button>
  );
}

export function SiteHeader({
  page,
  children,
}: {
  page: "home" | "palette";
  children?: ReactNode;
}) {
  const home = page === "home" ? "./" : "../";
  return (
    <header className="site-header">
      <div className="container site-header-row">
        <a className="brand" href={home} aria-label="Labpane home">
          <Logo />
          <span>Labpane</span>
        </a>
        <nav aria-label="Main" className="site-nav">
          {children}
          <a
            href={page === "home" ? "palette/" : "./"}
            aria-current={page === "palette" ? "page" : undefined}
          >
            Palette
          </a>
          <a href={links.github}>GitHub</a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function SiteFooter({ page }: { page: "home" | "palette" }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer-row">
        <p>
          <Logo /> Labpane is open source under the MIT License.
        </p>
        <nav aria-label="Footer" className="site-footer-links">
          {page === "palette" && <a href="../">Home</a>}
          {page === "home" && <a href="palette/">Palette</a>}
          <a href={links.github}>GitHub</a>
          <a href={links.os}>@labpane/os on npm</a>
          <a href={links.ui}>@labpane/ui on npm</a>
        </nav>
      </div>
    </footer>
  );
}

export function Command({ children }: { children: string }) {
  return (
    <div className="command">
      <code>
        <span aria-hidden="true" className="command-prompt">
          $
        </span>
        {children}
      </code>
      <CopyButton value={children} label={`Copy “${children}”`} />
    </div>
  );
}

const token =
  /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|((?<![\w$])<\/?[A-Za-z][\w.]*)|\b(import|from|export|function|const|let|return|type|async|await|new|true|false|null|undefined)\b|(--[\w-]+)/gm;
const kinds = ["comment", "string", "tag", "keyword", "property"];

function highlight(code: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(token)) {
    const at = match.index;
    if (at > last) parts.push(code.slice(last, at));
    const kind = kinds[match.slice(1).findIndex((group) => group != null)];
    parts.push(
      <span key={at} className={`tok-${kind}`}>
        {match[0]}
      </span>,
    );
    last = at + match[0].length;
  }
  parts.push(code.slice(last));
  return parts;
}

export function Code({ code, title }: { code: string; title: string }) {
  const text = code.trim();
  return (
    <figure className="code">
      <figcaption>
        <span>{title}</span>
        <CopyButton value={text} label={`Copy ${title}`} />
      </figcaption>
      <pre tabIndex={0} aria-label={title}>
        <code>{highlight(text)}</code>
      </pre>
    </figure>
  );
}
