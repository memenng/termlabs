import { useTabStore } from "../../stores/tabStore";
import { TerminalPane } from "./TerminalPane";

export function TerminalTab() {
  const { tabs, activeTabId, removeTab } = useTabStore();

  return (
    <div className="relative flex-1 overflow-hidden">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={tab.id === activeTabId ? "h-full w-full" : "hidden"}
        >
          <TerminalPane
            id={tab.id}
            cwd={tab.cwd}
            shell={tab.shell}
            onExit={(id) => removeTab(id)}
          />
        </div>
      ))}
      {tabs.length === 0 && (
        <div className="flex h-full items-center justify-center text-text-secondary">
          <p>Press + to open a new terminal</p>
        </div>
      )}
    </div>
  );
}
