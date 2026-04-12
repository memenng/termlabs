import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useTabStore, type Tab } from "../../stores/tabStore";
import { cn } from "../../lib/cn";

const SHELL_COLORS: Record<Tab["shellType"], string> = {
  bash: "#22c55e",
  zsh: "#3b82f6",
  powershell: "#a855f7",
  cmd: "#eab308",
  ssh: "#ef4444",
  custom: "#6366f1",
};

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, addTab, removeTab } = useTabStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      useTabStore.getState().reorderTabs(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  return (
    <div className="flex h-10 items-center bg-bg-secondary border-b border-border px-2 gap-1 select-none">
      <AnimatePresence mode="popLayout">
        {tabs.map((tab, idx) => (
          <motion.button
            key={tab.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
              tab.id === activeTabId
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
            )}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: SHELL_COLORS[tab.shellType] }}
            />
            <span className="truncate max-w-[120px]">{tab.label}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-danger"
            >
              <IconX size={12} />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      <button
        onClick={() => addTab()}
        className="flex items-center justify-center h-7 w-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors ml-1"
      >
        <IconPlus size={14} />
      </button>

      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 text-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                const name = prompt("Tab name:");
                if (name) useTabStore.getState().renameTab(contextMenu.tabId, name);
                setContextMenu(null);
              }}
            >
              Rename
            </button>
            <button
              className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                useTabStore.getState().duplicateTab(contextMenu.tabId);
                setContextMenu(null);
              }}
            >
              Duplicate
            </button>
            <button
              className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-danger"
              onClick={() => {
                removeTab(contextMenu.tabId);
                setContextMenu(null);
              }}
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
