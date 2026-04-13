import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { SearchAddon } from "@xterm/addon-search";
import { Channel } from "@tauri-apps/api/core";
import { ptySpawn, ptySpawnSsh, ptyWrite, ptyResize } from "../lib/ipc";
import type { PtyEvent } from "../lib/ipc";
import { useTabStore, type SshConfig } from "../stores/tabStore";
import "@xterm/xterm/css/xterm.css";
import "../styles/terminal.css";

interface UseTerminalOptions {
  id: string;
  cwd?: string;
  shell?: string;
  sshConfig?: SshConfig;
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

    if (options.sshConfig) {
      ptySpawnSsh({
        id,
        rows: terminal.rows,
        cols: terminal.cols,
        hostname: options.sshConfig.hostname,
        port: options.sshConfig.port,
        username: options.sshConfig.username,
        keyPath: options.sshConfig.keyPath,
        onData: channel,
      });
    } else {
      ptySpawn({
        id,
        rows: terminal.rows,
        cols: terminal.cols,
        cwd: options.cwd,
        shell: options.shell,
        onData: channel,
      });
    }

    const titleDisposable = terminal.onTitleChange((title) => {
      const label = title.split("/").pop() || title.split(":").pop()?.trim() || title;
      useTabStore.getState().renameByTerminalId(id, label);
    });

    const dataDisposable = terminal.onData((data) => {
      ptyWrite(id, data);
    });

    const resizeDisposable = terminal.onResize(({ rows, cols }) => {
      if (rows > 0 && cols > 0) {
        ptyResize(id, rows, cols);
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Don't resize when container is hidden (0x0) — prevents PTY from dying
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          fitAddon.fit();
        }
      }
    });
    resizeObserver.observe(container);

    cleanupRef.current = () => {
      resizeObserver.disconnect();
      titleDisposable.dispose();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      terminal.dispose();
      // Do NOT call ptyClose here — the PTY lifecycle is managed by the store.
      // When React remounts during split, the new ptySpawn will replace the old
      // session in the Rust backend. Calling ptyClose here causes a race condition
      // where the PTY is closed just before the new spawn tries to use it.
      terminalRef.current = null;
      fitAddonRef.current = null;
      searchAddonRef.current = null;
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [options.id, options.cwd, options.shell, options.sshConfig]);

  const search = (query: string) => {
    searchAddonRef.current?.findNext(query);
  };

  const searchNext = (query: string) => {
    searchAddonRef.current?.findNext(query);
  };

  const searchPrevious = (query: string) => {
    searchAddonRef.current?.findPrevious(query);
  };

  const clearSearch = () => {
    searchAddonRef.current?.clearDecorations();
  };

  const focus = () => {
    terminalRef.current?.focus();
  };

  const fit = () => {
    fitAddonRef.current?.fit();
  };

  return { containerRef, search, searchNext, searchPrevious, clearSearch, focus, fit, terminal: terminalRef };
}
