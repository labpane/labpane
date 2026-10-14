import "@wterm/dom/css";
import { Terminal, type TerminalShell } from "@labpane/ui/terminal";

function shell(): TerminalShell {
  let write: (text: string) => void = () => {};
  let line = "";
  const prompt = () => write("\x1b[36mpalette\x1b[0m $ ");
  const commands: Record<string, (args: string[]) => string> = {
    help: () => "Commands: help, echo <text>, date, clear",
    echo: (args) => args.join(" "),
    date: () => new Date().toString(),
  };
  return {
    attach(output) {
      write = output;
      write(
        "A small shell that runs in this page. Type \x1b[1mhelp\x1b[0m.\r\n",
      );
      prompt();
    },
    handleInput(data) {
      if (data.startsWith("\x1b")) return;
      for (const char of data) {
        if (char === "\r") {
          write("\r\n");
          const [name = "", ...args] = line.trim().split(/\s+/);
          line = "";
          if (name === "clear") write("\x1b[2J\x1b[H");
          else if (name)
            write(
              (commands[name]?.(args) ?? `${name}: command not found`) + "\r\n",
            );
          prompt();
        } else if (char === "\x7f") {
          if (!line) continue;
          line = line.slice(0, -1);
          write("\b \b");
        } else if (char >= " ") {
          line += char;
          write(char);
        }
      }
    },
  };
}

export default function TerminalDemo() {
  return (
    <div className="terminal-frame">
      <Terminal shell={shell} expandable />
    </div>
  );
}
