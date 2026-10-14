import { useState, type ReactNode } from "react";
import { useTabSize } from "./context.js";
import { WorkspaceTabs, type WorkspaceTabsProps } from "./tabs.js";

export function WorkspaceToolbar({
  active,
  leading,
  reserve,
  end,
  onActivate,
  ...tabProps
}: Omit<WorkspaceTabsProps, "active" | "dragBoundary"> & {
  leading?: ReactNode;
  reserve?: number;
  end?: ReactNode;
  active?: string;
  onActivate: () => void;
}) {
  const { height } = useTabSize();
  const [header, setHeader] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setHeader}
      style={{ height }}
      className="lab-toolbar"
      data-leading={leading ? "" : undefined}
      onPointerDownCapture={onActivate}
      onFocusCapture={onActivate}
    >
      {leading}
      <div className="lab-toolbar-tabs">
        <WorkspaceTabs
          {...tabProps}
          dragBoundary={header}
          active={active ?? ""}
        />
      </div>
      <div className="lab-toolbar-end">
        {end}
        {tabProps.items.find((tab) => tab.key === active)?.actions}
      </div>
      {!!reserve && (
        <div className="lab-toolbar-trailing" style={{ width: reserve }} />
      )}
    </div>
  );
}
