import "@labpane/os/styles.css";
import "@labpane/ui/styles.css";
import "../site.css";
import "./palette.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Palette } from "./palette";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Palette />
  </StrictMode>,
);
