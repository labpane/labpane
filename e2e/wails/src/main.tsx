import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { readWailsHost } from "./desktop/wails";
import "@labpane/os/styles.css";
import "@labpane/ui/styles.css";
import "./style.css";
import "./desktop/wails.css";

const root = createRoot(document.getElementById("root")!);
readWailsHost().then(
  (host) =>
    root.render(
      <StrictMode>
        <App host={host} />
      </StrictMode>,
    ),
  (error: unknown) => {
    console.error("Could not connect the desktop window", error);
    // Keep the app usable if the host connection fails. Alt+F4/Cmd+Q still
    // belong to the OS even when custom caption controls cannot be connected.
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  },
);

// Only the fixture executable's explicit -test flag can start native checks.
const testBridge = (
  window as Window & {
    go?: { main?: { Desktop?: { TestMode: () => Promise<boolean> } } };
  }
).go?.main?.Desktop;
if (testBridge) {
  testBridge.TestMode().then(async (enabled) => {
    if (enabled) (await import("./native-test")).runNativeTest();
  });
}
