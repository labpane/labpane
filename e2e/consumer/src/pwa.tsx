import { useWindowControlsOverlay } from "@labpane/os/pwa";
import { Demo } from "./workspace";

export function PwaDemo() {
  const overlay = useWindowControlsOverlay(
    !new URLSearchParams(location.search).has("no-overlay"),
  );
  return (
    <Demo
      windowControlsOverlay={overlay}
      leading={<span data-window-drag>Labpane</span>}
      trailing={
        <button
          onClick={(event) => {
            event.currentTarget.textContent = "Clicked";
          }}
        >
          Account
        </button>
      }
      slots={(open) => ({
        toolbar: () => (
          <button onClick={() => open("settings")}>Add settings</button>
        ),
      })}
    />
  );
}
