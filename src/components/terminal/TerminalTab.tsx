import { useTabStore } from "../../stores/tabStore";
import { SplitContainer } from "./SplitContainer";
import type { SplitNode } from "../../hooks/useSplitPane";

export function TerminalTab() {
  const { tabs, activeTabId } = useTabStore();

  return (
    <div className="relative flex-1 overflow-hidden">
      {tabs.map((tab) => (
        <div key={tab.id} className={tab.id === activeTabId ? "h-full w-full" : "hidden"}>
          <SplitContainer
            node={tab.splitRoot}
            onSplit={(targetId, direction) =>
              useTabStore.getState().splitTerminal(tab.id, targetId, direction)
            }
            onClose={(terminalId) =>
              useTabStore.getState().closeTerminal(tab.id, terminalId)
            }
            onResizeSizes={(targetNode: SplitNode, newSizes: number[]) =>
              useTabStore.getState().updateSplitSizes(tab.id, targetNode, newSizes)
            }
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
