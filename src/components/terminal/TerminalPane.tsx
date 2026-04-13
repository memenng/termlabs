import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTerminal } from "../../hooks/useTerminal";

interface TerminalPaneProps {
  id: string;
  cwd?: string;
  shell?: string;
  onExit?: (id: string) => void;
}

export function TerminalPane({ id, cwd, shell, onExit }: TerminalPaneProps) {
  const { containerRef, search, clearSearch, focus } = useTerminal({ id, cwd, shell, onExit });
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setQuery("");
    clearSearch();
    focus();
  }, [clearSearch, focus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        // Focus input after animation
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      container?.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef]);

  useEffect(() => {
    if (query) {
      search(query);
    } else {
      clearSearch();
    }
  }, [query, search, clearSearch]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full bg-bg-primary" />

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 right-2 z-20 flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-1.5 shadow-lg"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  closeSearch();
                } else if (e.key === "Enter") {
                  search(query);
                }
              }}
              placeholder="Search..."
              className="w-48 bg-transparent text-sm text-text-primary placeholder:text-text-secondary outline-none"
              autoFocus
            />
            <button
              onClick={closeSearch}
              className="flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
