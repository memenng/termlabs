import { useTabStore } from "../../stores/tabStore";
import { TerminalPane } from "./TerminalPane";
import { cn } from "../../lib/cn";

export function TerminalTab() {
  const { tabs, visibleTabIds, layout, activeTabId, setActiveTab } = useTabStore();

  if (tabs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary flex-1">
        <p>Press + to open a new terminal</p>
      </div>
    );
  }

  // Layout CSS classes
  const containerClass = cn(
    "flex-1 overflow-hidden",
    layout === "split-h" && "flex flex-row",
    layout === "split-v" && "flex flex-col",
    layout === "grid" && "grid grid-cols-2 grid-rows-2",
    layout === "single" && "relative",
  );

  return (
    <div className={containerClass}>
      {layout === "single" ? (
        // Single mode: render all tabs, show only active
        tabs.map((tab) => (
          <div
            key={tab.id}
            className={tab.id === activeTabId ? "h-full w-full" : "hidden"}
          >
            <TerminalPane id={tab.terminalId} cwd={tab.cwd} shell={tab.shell} />
          </div>
        ))
      ) : (
        // Split/Grid mode: render visible tabs side by side
        visibleTabIds.map((tabId) => {
          const tab = tabs.find((t) => t.id === tabId);
          if (!tab) return null;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "overflow-hidden border border-border relative",
                tab.id === activeTabId && "border-accent",
                layout === "split-h" && "flex-1",
                layout === "split-v" && "flex-1",
              )}
            >
              {/* Tab label overlay */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-2 py-0.5 bg-bg-secondary/80 text-[10px] text-text-secondary">
                <span className="truncate">{tab.label}</span>
              </div>
              <div className="h-full w-full pt-5">
                <TerminalPane id={tab.terminalId} cwd={tab.cwd} shell={tab.shell} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
