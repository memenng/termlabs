import { create } from "zustand";
import { ptyClose } from "../lib/ipc";

export type LayoutMode = "single" | "split-h" | "split-v" | "grid";

export interface Tab {
  id: string;
  terminalId: string;
  label: string;
  cwd?: string;
  shell?: string;
  shellType: "bash" | "zsh" | "powershell" | "cmd" | "ssh" | "custom";
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  layout: LayoutMode;
  visibleTabIds: string[]; // tab ids shown in split view (max 4)
  addTab: (tab?: Partial<Tab>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, label: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  duplicateTab: (id: string) => string;
  setLayout: (layout: LayoutMode) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

function detectShellType(shell?: string): Tab["shellType"] {
  if (!shell) return "bash";
  const name = shell.toLowerCase();
  if (name.includes("zsh")) return "zsh";
  if (name.includes("powershell") || name.includes("pwsh")) return "powershell";
  if (name.includes("cmd")) return "cmd";
  return "bash";
}

function maxSlots(layout: LayoutMode): number {
  switch (layout) {
    case "single": return 1;
    case "split-h":
    case "split-v": return 2;
    case "grid": return 4;
  }
}

function computeVisibleTabs(tabs: Tab[], activeTabId: string | null, layout: LayoutMode): string[] {
  const slots = maxSlots(layout);
  if (slots === 1) {
    return activeTabId ? [activeTabId] : [];
  }

  // Start with active tab, then fill remaining slots with other tabs in order
  const result: string[] = [];
  if (activeTabId) result.push(activeTabId);

  for (const tab of tabs) {
    if (result.length >= slots) break;
    if (!result.includes(tab.id)) {
      result.push(tab.id);
    }
  }

  return result;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  layout: "single" as LayoutMode,
  visibleTabIds: [],

  addTab: (partial) => {
    const id = generateId();
    const terminalId = generateId();
    const tab: Tab = {
      id,
      terminalId,
      label: partial?.label ?? `Terminal ${get().tabs.length + 1}`,
      cwd: partial?.cwd,
      shell: partial?.shell,
      shellType: partial?.shellType ?? detectShellType(partial?.shell),
    };
    set((state) => {
      const newTabs = [...state.tabs, tab];
      const newLayout = state.layout;
      return {
        tabs: newTabs,
        activeTabId: id,
        visibleTabIds: computeVisibleTabs(newTabs, id, newLayout),
      };
    });
    return id;
  },

  removeTab: (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (tab) {
      ptyClose(tab.terminalId).catch(() => {});
    }
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === id);
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActive = state.activeTabId;
      if (state.activeTabId === id) {
        if (newTabs.length === 0) {
          newActive = null;
        } else {
          newActive = newTabs[Math.min(idx, newTabs.length - 1)].id;
        }
      }
      return {
        tabs: newTabs,
        activeTabId: newActive,
        visibleTabIds: computeVisibleTabs(newTabs, newActive, state.layout),
      };
    });
  },

  setActiveTab: (id) => {
    set((state) => ({
      activeTabId: id,
      visibleTabIds: computeVisibleTabs(state.tabs, id, state.layout),
    }));
  },

  renameTab: (id, label) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, label } : t)),
    }));
  },

  reorderTabs: (fromIndex, toIndex) => {
    set((state) => {
      const newTabs = [...state.tabs];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return { tabs: newTabs };
    });
  },

  duplicateTab: (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return "";
    return get().addTab({ label: `${tab.label} (copy)`, cwd: tab.cwd, shell: tab.shell, shellType: tab.shellType });
  },

  setLayout: (layout) => {
    set((state) => ({
      layout,
      visibleTabIds: computeVisibleTabs(state.tabs, state.activeTabId, layout),
    }));
  },
}));
