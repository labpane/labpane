import "@labpane/os/styles.css";
import "@labpane/ui/styles.css";
import "../site.css";
import "./desktop.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DesktopPage } from "./desktop";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesktopPage />
  </StrictMode>,
);
