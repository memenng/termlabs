import { describe, it, expect } from "vitest";
import { createLeaf, splitNode, removeNode } from "../useSplitPane";

describe("useSplitPane", () => {
  it("creates a leaf node", () => {
    const leaf = createLeaf("t1");
    expect(leaf).toEqual({ type: "leaf", terminalId: "t1" });
  });

  it("splits a leaf into a branch", () => {
    const leaf = createLeaf("t1");
    const result = splitNode(leaf, "t1", "horizontal", "t2");
    expect(result.type).toBe("branch");
    if (result.type === "branch") {
      expect(result.children).toHaveLength(2);
      expect(result.sizes).toEqual([50, 50]);
      expect(result.direction).toBe("horizontal");
    }
  });

  it("removes a node and collapses branch", () => {
    const leaf = createLeaf("t1");
    const branch = splitNode(leaf, "t1", "horizontal", "t2");
    const result = removeNode(branch, "t1");
    expect(result).toEqual({ type: "leaf", terminalId: "t2" });
  });

  it("returns null when removing only node", () => {
    const leaf = createLeaf("t1");
    const result = removeNode(leaf, "t1");
    expect(result).toBeNull();
  });
});
