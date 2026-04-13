import { useTabStore, type LayoutMode } from "../../stores/tabStore";
import { TerminalPane } from "./TerminalPane";
import { cn } from "../../lib/cn";

function getSlotStyle(
  layout: LayoutMode,
  slotIndex: number,
  totalSlots: number
): React.CSSProperties {
  if (layout === "single") {
    return { position: "absolute", inset: 0 };
  }

  if (layout === "split-h") {
    const width = totalSlots > 1 ? 50 : 100;
    return {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: slotIndex === 0 ? "0%" : "50%",
      width: `${width}%`,
    };
  }

  if (layout === "split-v") {
    const height = totalSlots > 1 ? 50 : 100;
    return {
      position: "absolute",
      left: 0,
      right: 0,
      top: slotIndex === 0 ? "0%" : "50%",
      height: `${height}%`,
    };
  }

  // grid (2x2)
  const col = slotIndex % 2;
  const row = Math.floor(slotIndex / 2);
  return {
    position: "absolute",
    left: `${col * 50}%`,
    top: `${row * 50}%`,
    width: "50%",
    height: "50%",
  };
}

const HIDDEN_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

export function TerminalTab() {
  const { tabs, visibleTabIds, layout, activeTabId, setActiveTab } = useTabStore();

  if (tabs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary flex-1">
        <p>Press + to open a new terminal</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      {tabs.map((tab) => {
        const slotIndex = visibleTabIds.indexOf(tab.id);
        const isVisible =
          layout === "single"
            ? tab.id === activeTabId
            : slotIndex !== -1;
        const isActive = tab.id === activeTabId;
        const showLabel = isVisible && layout !== "single";
        const style = isVisible
          ? getSlotStyle(layout, layout === "single" ? 0 : slotIndex, visibleTabIds.length)
          : HIDDEN_STYLE;

        return (
          <div
            key={tab.id}
            onClick={isVisible ? () => setActiveTab(tab.id) : undefined}
            style={style}
            className={cn(
              "overflow-hidden",
              showLabel && "border border-border",
              showLabel && isActive && "border-accent",
            )}
          >
            {/* Identical structure for all tabs — only CSS changes */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 z-10 flex items-center px-2 py-0.5 bg-bg-secondary/80 text-[10px] text-text-secondary",
                !showLabel && "hidden"
              )}
            >
              <span className="truncate">{tab.label}</span>
            </div>
            <div className={cn("h-full w-full", showLabel && "pt-5")}>
              <TerminalPane id={tab.terminalId} cwd={tab.cwd} shell={tab.shell} sshConfig={tab.sshConfig} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
