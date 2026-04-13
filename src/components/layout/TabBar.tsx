import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconPlus,
  IconX,
  IconLayoutColumns,
  IconLayoutRows,
  IconLayoutGrid,
  IconSquare,
} from "@tabler/icons-react";
import { useTabStore, type Tab, type LayoutMode } from "../../stores/tabStore";
import { cn } from "../../lib/cn";

const SHELL_COLORS: Record<Tab["shellType"], string> = {
  bash: "#22c55e",
  zsh: "#3b82f6",
  powershell: "#a855f7",
  cmd: "#eab308",
  ssh: "#ef4444",
  custom: "#6366f1",
};

const LAYOUT_OPTIONS: { mode: LayoutMode; icon: typeof IconSquare; label: string }[] = [
  { mode: "single", icon: IconSquare, label: "Single" },
  { mode: "split-h", icon: IconLayoutColumns, label: "Split Horizontal" },
  { mode: "split-v", icon: IconLayoutRows, label: "Split Vertical" },
  { mode: "grid", icon: IconLayoutGrid, label: "Grid (4)" },
];

export function TabBar() {
  const { tabs, activeTabId, layout, setActiveTab, addTab, removeTab, setLayout } =
    useTabStore();
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
    <div className="flex h-10 w-full items-center border-b border-border px-2 gap-1 select-none overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
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
                "group relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer shrink-0",
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
          className="flex items-center justify-center h-7 w-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors shrink-0"
        >
          <IconPlus size={14} />
        </button>
      </div>

      {/* Layout buttons — always pinned right */}
      <div className="flex items-center gap-0.5 ml-2 border-l border-border pl-2 shrink-0">
        {LAYOUT_OPTIONS.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setLayout(mode)}
            title={label}
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              layout === mode
                ? "bg-accent/20 text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
            )}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
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
                if (name)
                  useTabStore.getState().renameTab(contextMenu.tabId, name);
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
