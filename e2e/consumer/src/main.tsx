import "@labpane/os/styles.css";
import "./index.css";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

const page = new URLSearchParams(location.search).get("page");
const content: Promise<ReactNode> =
  page === "os"
    ? import("./workspace").then(({ Demo }) => <Demo />)
    : page === "pwa"
      ? import("./pwa").then(({ PwaDemo }) => <PwaDemo />)
      : page === "desktop"
        ? import("./desktop").then(({ DesktopDemo }) => <DesktopDemo />)
        : page === "ui"
          ? Promise.all([
              import("@labpane/ui/styles.css"),
              import("./ui"),
            ]).then(([, { AdminPage }]) => <AdminPage />)
          : page === "terminal"
            ? Promise.all([
                import("@labpane/ui/styles.css"),
                import("./terminal"),
              ]).then(([, { TerminalPage }]) => <TerminalPage />)
            : Promise.all([
                import("@labpane/ui/styles.css"),
                import("./app"),
              ]).then(([, { App }]) => <App />);

content.then((node) =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>{node}</StrictMode>,
  ),
);
