import { create } from "zustand";

export interface Tab {
  id: string;
  label: string;
  cwd?: string;
  shell?: string;
  shellType: "bash" | "zsh" | "powershell" | "cmd" | "ssh" | "custom";
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab?: Partial<Tab>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, label: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  duplicateTab: (id: string) => string;
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

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (partial) => {
    const id = generateId();
    const tab: Tab = {
      id,
      label: partial?.label ?? `Terminal ${get().tabs.length + 1}`,
      cwd: partial?.cwd,
      shell: partial?.shell,
      shellType: partial?.shellType ?? detectShellType(partial?.shell),
    };
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: id,
    }));
    return id;
  },

  removeTab: (id) => {
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
      return { tabs: newTabs, activeTabId: newActive };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

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
}));
