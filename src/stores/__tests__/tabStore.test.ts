import { describe, it, expect, beforeEach } from "vitest";
import { useTabStore } from "../tabStore";

describe("tabStore", () => {
  beforeEach(() => {
    useTabStore.setState({ tabs: [], activeTabId: null });
  });

  it("adds a tab and sets it active", () => {
    const id = useTabStore.getState().addTab({ label: "Test" });
    const state = useTabStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].label).toBe("Test");
    expect(state.activeTabId).toBe(id);
  });

  it("removes a tab and selects adjacent", () => {
    const id1 = useTabStore.getState().addTab({ label: "Tab 1" });
    const id2 = useTabStore.getState().addTab({ label: "Tab 2" });
    useTabStore.getState().setActiveTab(id1);
    useTabStore.getState().removeTab(id1);
    const state = useTabStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBe(id2);
  });

  it("reorders tabs", () => {
    useTabStore.getState().addTab({ label: "A" });
    useTabStore.getState().addTab({ label: "B" });
    useTabStore.getState().addTab({ label: "C" });
    useTabStore.getState().reorderTabs(0, 2);
    const labels = useTabStore.getState().tabs.map((t) => t.label);
    expect(labels).toEqual(["B", "C", "A"]);
  });

  it("duplicates a tab", () => {
    const id = useTabStore.getState().addTab({ label: "Original" });
    useTabStore.getState().duplicateTab(id);
    const state = useTabStore.getState();
    expect(state.tabs).toHaveLength(2);
    expect(state.tabs[1].label).toBe("Original (copy)");
  });
});
