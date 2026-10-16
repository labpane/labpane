import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@labpane/os/styles.css";
import "@labpane/ui/styles.css";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
