import { useRef, useCallback } from "react";
import type { SplitNode } from "../../hooks/useSplitPane";
import { TerminalPane } from "./TerminalPane";

interface SplitContainerProps {
  node: SplitNode;
  onSplit: (targetId: string, direction: "horizontal" | "vertical") => void;
  onClose: (terminalId: string) => void;
  onResizeSizes: (node: SplitNode, newSizes: number[]) => void;
}

export function SplitContainer({ node, onSplit, onClose, onResizeSizes }: SplitContainerProps) {
  if (node.type === "leaf") {
    return (
      <div className="h-full w-full relative group/pane">
        <TerminalPane id={node.terminalId} onExit={() => onClose(node.terminalId)} />
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/pane:opacity-100 transition-opacity z-10">
          <button
            onClick={() => onSplit(node.terminalId, "horizontal")}
            className="px-1.5 py-0.5 text-[10px] bg-bg-tertiary/80 text-text-secondary hover:text-text-primary rounded border border-border"
            title="Split horizontal"
          >
            ⬌
          </button>
          <button
            onClick={() => onSplit(node.terminalId, "vertical")}
            className="px-1.5 py-0.5 text-[10px] bg-bg-tertiary/80 text-text-secondary hover:text-text-primary rounded border border-border"
            title="Split vertical"
          >
            ⬍
          </button>
        </div>
      </div>
    );
  }

  const isHorizontal = node.direction === "horizontal";

  return (
    <div className="h-full w-full flex" style={{ flexDirection: isHorizontal ? "row" : "column" }}>
      {node.children.map((child, i) => (
        <SplitPanel
          key={child.type === "leaf" ? child.terminalId : `branch-${i}`}
          node={node}
          child={child}
          index={i}
          isHorizontal={isHorizontal}
          onSplit={onSplit}
          onClose={onClose}
          onResizeSizes={onResizeSizes}
        />
      ))}
    </div>
  );
}

function SplitPanel({
  node,
  child,
  index,
  isHorizontal,
  onSplit,
  onClose,
  onResizeSizes,
}: {
  node: SplitNode & { type: "branch" };
  child: SplitNode;
  index: number;
  isHorizontal: boolean;
  onSplit: SplitContainerProps["onSplit"];
  onClose: SplitContainerProps["onClose"];
  onResizeSizes: SplitContainerProps["onResizeSizes"];
}) {
  const dividerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startPos = isHorizontal ? e.clientX : e.clientY;
      const parentEl = dividerRef.current?.parentElement?.parentElement;
      if (!parentEl) return;

      const parentSize = isHorizontal ? parentEl.clientWidth : parentEl.clientHeight;
      const startSizes = [...node.sizes];

      const handleMouseMove = (moveE: MouseEvent) => {
        const currentPos = isHorizontal ? moveE.clientX : moveE.clientY;
        const delta = ((currentPos - startPos) / parentSize) * 100;
        const newSizes = [...startSizes];
        newSizes[index - 1] = Math.max(10, startSizes[index - 1] + delta);
        newSizes[index] = Math.max(10, startSizes[index] - delta);
        onResizeSizes(node, newSizes);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [node, index, isHorizontal, onResizeSizes]
  );

  return (
    <>
      {index > 0 && (
        <div
          ref={dividerRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => {
            const equalSize = 100 / node.children.length;
            onResizeSizes(node, node.children.map(() => equalSize));
          }}
          className={`shrink-0 bg-border hover:bg-accent transition-colors ${
            isHorizontal ? "w-[3px] cursor-col-resize" : "h-[3px] cursor-row-resize"
          }`}
        />
      )}
      <div
        style={{ [isHorizontal ? "width" : "height"]: `${node.sizes[index]}%` }}
        className="overflow-hidden"
      >
        <SplitContainer node={child} onSplit={onSplit} onClose={onClose} onResizeSizes={onResizeSizes} />
      </div>
    </>
  );
}
