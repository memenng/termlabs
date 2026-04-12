import { create } from "zustand";
import type { SplitNode, SplitDirection } from "../hooks/useSplitPane";
import { createLeaf, splitNode, removeNode, getAllLeafIds } from "../hooks/useSplitPane";
import { ptyClose } from "../lib/ipc";

export interface Tab {
  id: string;
  label: string;
  cwd?: string;
  shell?: string;
  shellType: "bash" | "zsh" | "powershell" | "cmd" | "ssh" | "custom";
  splitRoot: SplitNode;
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
  splitTerminal: (tabId: string, targetTerminalId: string, direction: SplitDirection) => void;
  closeTerminal: (tabId: string, terminalId: string) => void;
  updateSplitSizes: (tabId: string, targetNode: SplitNode, newSizes: number[]) => void;
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

function updateSizesInTree(root: SplitNode, targetNode: SplitNode, newSizes: number[]): SplitNode {
  if (root === targetNode && root.type === "branch") {
    return { ...root, sizes: newSizes };
  }
  if (root.type === "branch") {
    return {
      ...root,
      children: root.children.map((child) => updateSizesInTree(child, targetNode, newSizes)),
    };
  }
  return root;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (partial) => {
    const id = generateId();
    const terminalId = generateId();
    const tab: Tab = {
      id,
      label: partial?.label ?? `Terminal ${get().tabs.length + 1}`,
      cwd: partial?.cwd,
      shell: partial?.shell,
      shellType: partial?.shellType ?? detectShellType(partial?.shell),
      splitRoot: createLeaf(terminalId),
    };
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: id,
    }));
    return id;
  },

  removeTab: (id) => {
    // Close all PTY sessions in this tab before removing
    const tab = get().tabs.find((t) => t.id === id);
    if (tab) {
      getAllLeafIds(tab.splitRoot).forEach((tid) => ptyClose(tid));
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

  splitTerminal: (tabId, targetTerminalId, direction) => {
    const newTerminalId = generateId();
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, splitRoot: splitNode(tab.splitRoot, targetTerminalId, direction, newTerminalId) }
          : tab
      ),
    }));
  },

  closeTerminal: (tabId, terminalId) => {
    // Explicitly close this PTY session
    ptyClose(terminalId);
    set((state) => {
      const tab = state.tabs.find((t) => t.id === tabId);
      if (!tab) return state;

      const newRoot = removeNode(tab.splitRoot, terminalId);
      if (!newRoot) {
        // Last terminal closed — remove the tab
        const idx = state.tabs.findIndex((t) => t.id === tabId);
        const newTabs = state.tabs.filter((t) => t.id !== tabId);
        let newActive = state.activeTabId;
        if (state.activeTabId === tabId) {
          if (newTabs.length === 0) {
            newActive = null;
          } else {
            newActive = newTabs[Math.min(idx, newTabs.length - 1)].id;
          }
        }
        return { tabs: newTabs, activeTabId: newActive };
      }

      return {
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, splitRoot: newRoot } : t
        ),
      };
    });
  },

  updateSplitSizes: (tabId, targetNode, newSizes) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, splitRoot: updateSizesInTree(tab.splitRoot, targetNode, newSizes) }
          : tab
      ),
    }));
  },
}));
