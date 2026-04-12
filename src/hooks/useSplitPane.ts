export type SplitDirection = "horizontal" | "vertical";

export interface SplitLeaf {
  type: "leaf";
  terminalId: string;
}

export interface SplitBranch {
  type: "branch";
  direction: SplitDirection;
  children: SplitNode[];
  sizes: number[];
}

export type SplitNode = SplitLeaf | SplitBranch;

export function createLeaf(terminalId: string): SplitLeaf {
  return { type: "leaf", terminalId };
}

export function splitNode(
  root: SplitNode,
  targetId: string,
  direction: SplitDirection,
  newTerminalId: string
): SplitNode {
  if (root.type === "leaf") {
    if (root.terminalId === targetId) {
      return {
        type: "branch",
        direction,
        children: [root, createLeaf(newTerminalId)],
        sizes: [50, 50],
      };
    }
    return root;
  }

  return {
    ...root,
    children: root.children.map((child) =>
      splitNode(child, targetId, direction, newTerminalId)
    ),
  };
}

export function removeNode(root: SplitNode, targetId: string): SplitNode | null {
  if (root.type === "leaf") {
    return root.terminalId === targetId ? null : root;
  }

  const newChildren: SplitNode[] = [];
  const newSizes: number[] = [];

  for (let i = 0; i < root.children.length; i++) {
    const result = removeNode(root.children[i], targetId);
    if (result) {
      newChildren.push(result);
      newSizes.push(root.sizes[i]);
    }
  }

  if (newChildren.length === 0) return null;
  if (newChildren.length === 1) return newChildren[0];

  const total = newSizes.reduce((a, b) => a + b, 0);
  const normalized = newSizes.map((s) => (s / total) * 100);

  return { ...root, children: newChildren, sizes: normalized };
}
