import "@wterm/dom/css";
import { useState } from "react";
import { Terminal } from "@labpane/ui/terminal";
import { GhosttyCore } from "@wterm/ghostty";
import wasmPath from "@wterm/ghostty/ghostty-vt.wasm?url";
import { BashShell } from "@wterm/just-bash";

const core = () => GhosttyCore.load({ wasmPath });
const shell = () =>
  new BashShell({
    greeting: "Fixture shell",
    files: { "/home/user/hello.txt": "hello from just-bash\n" },
  });

export function TerminalPage() {
  const [theme, setTheme] = useState<"auto" | "monokai">("auto");
  return (
    <main className="flex h-screen flex-col">
      <button type="button" onClick={() => setTheme("monokai")}>
        Monokai
      </button>
      <div className="min-h-0 flex-1">
        <Terminal shell={shell} core={core} theme={theme} expandable />
      </div>
    </main>
  );
}
