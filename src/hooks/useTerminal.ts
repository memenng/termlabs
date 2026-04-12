import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { SearchAddon } from "@xterm/addon-search";
import { Channel } from "@tauri-apps/api/core";
import { ptySpawn, ptyWrite, ptyResize, ptyClose } from "../lib/ipc";
import type { PtyEvent } from "../lib/ipc";
import "@xterm/xterm/css/xterm.css";
import "../styles/terminal.css";

interface UseTerminalOptions {
  id: string;
  cwd?: string;
  shell?: string;
  onExit?: (id: string) => void;
}

export function useTerminal(options: UseTerminalOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Store latest onExit in a ref to avoid re-running effect
  const onExitRef = useRef(options.onExit);
  onExitRef.current = options.onExit;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const terminal = new Terminal({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "bar",
      theme: {
        background: "#0a0a0f",
        foreground: "#e4e4ed",
        cursor: "#6366f1",
        selectionBackground: "#6366f133",
        black: "#1a1a2e",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#e4e4ed",
        brightBlack: "#4a4a5a",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.open(container);

    try {
      const webglAddon = new WebglAddon();
      terminal.loadAddon(webglAddon);
    } catch {
      // WebGL not available, fall back to canvas renderer
    }

    fitAddon.fit();
    terminalRef.current = terminal;

    const channel = new Channel<PtyEvent>();
    channel.onmessage = (message) => {
      if (message.event === "Data") {
        terminal.write(message.data.data);
      } else if (message.event === "Exit") {
        onExitRef.current?.(message.data.id);
      }
    };

    const id = options.id;

    ptySpawn({
      id,
      rows: terminal.rows,
      cols: terminal.cols,
      cwd: options.cwd,
      shell: options.shell,
      onData: channel,
    });

    const dataDisposable = terminal.onData((data) => {
      ptyWrite(id, data);
    });

    const resizeDisposable = terminal.onResize(({ rows, cols }) => {
      ptyResize(id, rows, cols);
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(container);

    cleanupRef.current = () => {
      resizeObserver.disconnect();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      terminal.dispose();
      ptyClose(id);
      terminalRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [options.id, options.cwd, options.shell]);

  const search = (query: string) => {
    searchAddonRef.current?.findNext(query);
  };

  const fit = () => {
    fitAddonRef.current?.fit();
  };

  return { containerRef, search, fit, terminal: terminalRef };
}
