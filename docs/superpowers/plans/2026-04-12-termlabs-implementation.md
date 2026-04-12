# TermLabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform terminal emulator with browser-style tabs, split panes, project sidebar, and SSH manager using Tauri v2.

**Architecture:** Tauri v2 with heavy Rust backend (PTY, SSH, config management) and React frontend (UI rendering, animations). Communication via Tauri IPC commands and Channel-based event streaming for terminal I/O.

**Tech Stack:** Tauri v2, React 19, TypeScript, Tailwind CSS v4, Aceternity UI, Motion (motion/react), xterm.js, Zustand, Vite, Satoshi + JetBrains Mono fonts, portable-pty, ssh2, tokio

---

## Phase 1: Project Scaffolding & Core Terminal

### Task 1: Scaffold Tauri v2 + React + TypeScript Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `index.html`

- [ ] **Step 1: Create Tauri project with React template**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
npm create tauri-app@latest . -- --template react-ts --manager npm
```

When prompted:
- Project name: `termlabs`
- Identifier: `com.termlabs.app`
- Frontend: TypeScript / JavaScript
- Package manager: npm
- UI Template: React
- UI Flavor: TypeScript

- [ ] **Step 2: Install frontend dependencies**

```bash
npm install
```

- [ ] **Step 3: Verify the scaffold runs**

```bash
npm run tauri dev
```

Expected: A Tauri window opens showing the default React Vite splash screen. Close it after confirming.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Tauri v2 + React + TypeScript project"
```

---

### Task 2: Configure Tailwind CSS v4 + Fonts

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Create: `src/styles/app.css`
- Create: `src/styles/fonts.css`
- Modify: `src/main.tsx`
- Modify: `index.html`

- [ ] **Step 1: Install Tailwind CSS v4 and Vite plugin**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Add Tailwind Vite plugin to `vite.config.ts`**

Replace the contents of `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
```

- [ ] **Step 3: Create `src/styles/fonts.css`**

```css
/* Satoshi — UI font */
@font-face {
  font-family: "Satoshi";
  src: url("https://cdn.fontshare.com/wf/ZFHXAYXQCBGSTXR7I2FX3AWNSFCG55PO/KWRXR5XBUD3VN6J3JGFOFGPC3TYA7WFU/NHJNQWTLX63EWOMVQ42MZCJ7M6LXHKAO.woff2")
    format("woff2");
  font-weight: 300 900;
  font-display: swap;
}

/* JetBrains Mono — Terminal font */
@font-face {
  font-family: "JetBrains Mono";
  src: url("https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/fonts/webfonts/JetBrainsMono-Regular.woff2")
    format("woff2");
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "JetBrains Mono";
  src: url("https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/fonts/webfonts/JetBrainsMono-Bold.woff2")
    format("woff2");
  font-weight: 700;
  font-display: swap;
}
```

- [ ] **Step 4: Create `src/styles/app.css`**

```css
@import "tailwindcss";
@import "./fonts.css";

@theme {
  --font-sans: "Satoshi", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #111118;
  --color-bg-tertiary: #1a1a24;
  --color-border: #2a2a3a;
  --color-text-primary: #e4e4ed;
  --color-text-secondary: #8888a0;
  --color-accent: #6366f1;
  --color-accent-hover: #818cf8;
  --color-success: #22c55e;
  --color-danger: #ef4444;
}

/* Light theme overrides */
@media (prefers-color-scheme: light) {
  :root[data-theme="light"] {
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f5f5f7;
    --color-bg-tertiary: #e8e8ed;
    --color-border: #d1d1d8;
    --color-text-primary: #1a1a2e;
    --color-text-secondary: #6b6b80;
  }
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: var(--font-sans);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

[data-theme="dark"] {
  color-scheme: dark;
}
```

- [ ] **Step 5: Update `src/main.tsx` to import styles**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Update `src/App.tsx` with a minimal dark shell**

```tsx
function App() {
  return (
    <div
      data-theme="dark"
      className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans"
    >
      <p className="m-auto text-2xl font-bold">TermLabs</p>
    </div>
  );
}

export default App;
```

- [ ] **Step 7: Run to verify Tailwind + fonts work**

```bash
npm run tauri dev
```

Expected: Window shows "TermLabs" centered, dark background (#0a0a0f), Satoshi font, indigo-ish text feel.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: configure Tailwind CSS v4, Satoshi + JetBrains Mono fonts"
```

---

### Task 3: Install Aceternity UI + Motion + Zustand + xterm.js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Motion**

```bash
npm install motion
```

- [ ] **Step 2: Install Zustand**

```bash
npm install zustand
```

- [ ] **Step 3: Install xterm.js and addons**

```bash
npm install @xterm/xterm @xterm/addon-fit @xterm/addon-webgl @xterm/addon-search
```

- [ ] **Step 4: Install Tabler Icons (used by Aceternity)**

```bash
npm install @tabler/icons-react
```

- [ ] **Step 5: Install utility deps**

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 6: Create `src/lib/cn.ts` utility**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Verify build succeeds**

```bash
npm run build
```

Expected: Build completes with no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: install Motion, Zustand, xterm.js, Tabler Icons, utilities"
```

---

### Task 4: Rust PTY Manager Backend

**Files:**
- Create: `src-tauri/src/pty/mod.rs`
- Create: `src-tauri/src/pty/manager.rs`
- Create: `src-tauri/src/pty/handler.rs`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Add Rust dependencies to `src-tauri/Cargo.toml`**

Add under `[dependencies]`:

```toml
portable-pty = "0.8"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
uuid = { version = "1", features = ["v4"] }
parking_lot = "0.12"
```

- [ ] **Step 2: Create `src-tauri/src/pty/mod.rs`**

```rust
pub mod handler;
pub mod manager;
```

- [ ] **Step 3: Create `src-tauri/src/pty/manager.rs`**

```rust
use parking_lot::Mutex;
use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::collections::HashMap;
use std::io::{BufReader, Read, Write};
use std::sync::Arc;
use std::thread;
use tauri::ipc::Channel;

pub struct PtySession {
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
}

pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn spawn(
        &self,
        id: String,
        rows: u16,
        cols: u16,
        cwd: Option<String>,
        shell: Option<String>,
        on_data: Channel<PtyEvent>,
    ) -> Result<(), String> {
        let pty_system = native_pty_system();
        let size = PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        };

        let pair = pty_system
            .openpty(size)
            .map_err(|e| format!("Failed to open PTY: {e}"))?;

        let shell_cmd = shell.unwrap_or_else(|| {
            if cfg!(target_os = "windows") {
                "powershell.exe".to_string()
            } else {
                std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
            }
        });

        let mut cmd = CommandBuilder::new(&shell_cmd);
        if let Some(dir) = cwd {
            cmd.cwd(dir);
        }

        pair.slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {e}"))?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone reader: {e}"))?;
        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take writer: {e}"))?;

        let session = PtySession {
            master: Arc::new(Mutex::new(pair.master)),
            writer: Arc::new(Mutex::new(writer)),
        };

        self.sessions.lock().insert(id.clone(), session);

        let sessions = self.sessions.clone();
        let pty_id = id.clone();
        thread::spawn(move || {
            let mut buf_reader = BufReader::new(reader);
            let mut buf = [0u8; 4096];
            loop {
                match buf_reader.read(&mut buf) {
                    Ok(0) => {
                        let _ = on_data.send(PtyEvent::Exit { id: pty_id.clone() });
                        sessions.lock().remove(&pty_id);
                        break;
                    }
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        let _ = on_data.send(PtyEvent::Data {
                            id: pty_id.clone(),
                            data,
                        });
                    }
                    Err(_) => {
                        let _ = on_data.send(PtyEvent::Exit { id: pty_id.clone() });
                        sessions.lock().remove(&pty_id);
                        break;
                    }
                }
            }
        });

        Ok(())
    }

    pub fn write(&self, id: &str, data: &[u8]) -> Result<(), String> {
        let sessions = self.sessions.lock();
        let session = sessions.get(id).ok_or("Session not found")?;
        session
            .writer
            .lock()
            .write_all(data)
            .map_err(|e| format!("Write failed: {e}"))
    }

    pub fn resize(&self, id: &str, rows: u16, cols: u16) -> Result<(), String> {
        let sessions = self.sessions.lock();
        let session = sessions.get(id).ok_or("Session not found")?;
        session
            .master
            .lock()
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Resize failed: {e}"))
    }

    pub fn close(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock();
        sessions.remove(id).ok_or("Session not found".to_string())?;
        Ok(())
    }
}

#[derive(Clone, serde::Serialize)]
#[serde(tag = "event", content = "data")]
pub enum PtyEvent {
    Data { id: String, data: String },
    Exit { id: String },
}
```

- [ ] **Step 4: Create `src-tauri/src/pty/handler.rs`**

```rust
use crate::pty::manager::{PtyEvent, PtyManager};
use tauri::ipc::Channel;
use tauri::State;

#[tauri::command]
pub fn pty_spawn(
    manager: State<'_, PtyManager>,
    id: String,
    rows: u16,
    cols: u16,
    cwd: Option<String>,
    shell: Option<String>,
    on_data: Channel<PtyEvent>,
) -> Result<(), String> {
    manager.spawn(id, rows, cols, cwd, shell, on_data)
}

#[tauri::command]
pub fn pty_write(manager: State<'_, PtyManager>, id: String, data: String) -> Result<(), String> {
    manager.write(&id, data.as_bytes())
}

#[tauri::command]
pub fn pty_resize(
    manager: State<'_, PtyManager>,
    id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    manager.resize(&id, rows, cols)
}

#[tauri::command]
pub fn pty_close(manager: State<'_, PtyManager>, id: String) -> Result<(), String> {
    manager.close(&id)
}
```

- [ ] **Step 5: Update `src-tauri/src/lib.rs` to register PTY commands**

```rust
mod pty;

use pty::handler::{pty_close, pty_resize, pty_spawn, pty_write};
use pty::manager::PtyManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(PtyManager::new())
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_write,
            pty_resize,
            pty_close,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 6: Verify Rust compiles**

```bash
cd src-tauri && cargo build
```

Expected: Build succeeds with no errors. Warnings from unused imports are acceptable at this point.

- [ ] **Step 7: Commit**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
git add -A
git commit -m "feat: implement Rust PTY manager with spawn, write, resize, close"
```

---

### Task 5: Frontend IPC Layer + useTerminal Hook

**Files:**
- Create: `src/lib/ipc.ts`
- Create: `src/hooks/useTerminal.ts`
- Create: `src/styles/terminal.css`

- [ ] **Step 1: Create `src/lib/ipc.ts`**

```typescript
import { invoke, Channel } from "@tauri-apps/api/core";

export type PtyEvent =
  | { event: "Data"; data: { id: string; data: string } }
  | { event: "Exit"; data: { id: string } };

export function ptySpawn(opts: {
  id: string;
  rows: number;
  cols: number;
  cwd?: string;
  shell?: string;
  onData: Channel<PtyEvent>;
}): Promise<void> {
  return invoke("pty_spawn", {
    id: opts.id,
    rows: opts.rows,
    cols: opts.cols,
    cwd: opts.cwd ?? null,
    shell: opts.shell ?? null,
    onData: opts.onData,
  });
}

export function ptyWrite(id: string, data: string): Promise<void> {
  return invoke("pty_write", { id, data });
}

export function ptyResize(id: string, rows: number, cols: number): Promise<void> {
  return invoke("pty_resize", { id, rows, cols });
}

export function ptyClose(id: string): Promise<void> {
  return invoke("pty_close", { id });
}
```

- [ ] **Step 2: Create `src/styles/terminal.css`**

```css
.xterm {
  height: 100%;
  width: 100%;
  padding: 8px;
}

.xterm-viewport {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.xterm-viewport::-webkit-scrollbar {
  width: 6px;
}

.xterm-viewport::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 3px;
}
```

- [ ] **Step 3: Create `src/hooks/useTerminal.ts`**

```typescript
import { useEffect, useRef, useCallback } from "react";
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
  const termRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const spawnedRef = useRef(false);

  const attach = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container || terminalRef.current) return;
      termRef.current = container;

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
          options.onExit?.(message.data.id);
        }
      };

      if (!spawnedRef.current) {
        spawnedRef.current = true;
        ptySpawn({
          id: options.id,
          rows: terminal.rows,
          cols: terminal.cols,
          cwd: options.cwd,
          shell: options.shell,
          onData: channel,
        });
      }

      terminal.onData((data) => {
        ptyWrite(options.id, data);
      });

      terminal.onResize(({ rows, cols }) => {
        ptyResize(options.id, rows, cols);
      });

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        terminal.dispose();
        ptyClose(options.id);
        terminalRef.current = null;
        fitAddonRef.current = null;
      };
    },
    [options.id, options.cwd, options.shell, options.onExit]
  );

  const search = useCallback((query: string) => {
    searchAddonRef.current?.findNext(query);
  }, []);

  const fit = useCallback(() => {
    fitAddonRef.current?.fit();
  }, []);

  return { attach, search, fit, terminal: terminalRef };
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: No TypeScript or build errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add IPC layer and useTerminal hook with xterm.js"
```

---

### Task 6: Single Terminal Rendering — End-to-End

**Files:**
- Create: `src/components/terminal/TerminalPane.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/terminal/TerminalPane.tsx`**

```tsx
import { useTerminal } from "../../hooks/useTerminal";

interface TerminalPaneProps {
  id: string;
  cwd?: string;
  shell?: string;
  onExit?: (id: string) => void;
}

export function TerminalPane({ id, cwd, shell, onExit }: TerminalPaneProps) {
  const { attach } = useTerminal({ id, cwd, shell, onExit });

  return (
    <div
      ref={attach}
      className="h-full w-full bg-bg-primary"
    />
  );
}
```

- [ ] **Step 2: Update `src/App.tsx` to render a single terminal**

```tsx
import { TerminalPane } from "./components/terminal/TerminalPane";

function App() {
  return (
    <div
      data-theme="dark"
      className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans"
    >
      <TerminalPane id="main" />
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Run and test the terminal**

```bash
npm run tauri dev
```

Expected: A full-screen terminal appears. Type `echo hello` — see output. Type `ls` — see directory listing. Terminal is fully interactive.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: render working terminal with PTY backend end-to-end"
```

---

## Phase 2: Tab System

### Task 7: Tab Store (Zustand)

**Files:**
- Create: `src/stores/tabStore.ts`

- [ ] **Step 1: Create `src/stores/tabStore.ts`**

```typescript
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
```

- [ ] **Step 2: Write test for tab store**

Create `src/stores/__tests__/tabStore.test.ts`:

```typescript
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
```

- [ ] **Step 3: Install vitest and run test**

```bash
npm install -D vitest
npx vitest run src/stores/__tests__/tabStore.test.ts
```

Expected: All 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement tab store with Zustand + tests"
```

---

### Task 8: Animated Tab Bar Component

**Files:**
- Create: `src/components/layout/TabBar.tsx`

- [ ] **Step 1: Create `src/components/layout/TabBar.tsx`**

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useTabStore, type Tab } from "../../stores/tabStore";
import { cn } from "../../lib/cn";

const SHELL_COLORS: Record<Tab["shellType"], string> = {
  bash: "#22c55e",
  zsh: "#3b82f6",
  powershell: "#a855f7",
  cmd: "#eab308",
  ssh: "#ef4444",
  custom: "#6366f1",
};

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, addTab, removeTab } = useTabStore();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      useTabStore.getState().reorderTabs(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  return (
    <div className="flex h-10 items-center bg-bg-secondary border-b border-border px-2 gap-1 select-none">
      <AnimatePresence mode="popLayout">
        {tabs.map((tab, idx) => (
          <motion.button
            key={tab.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
              tab.id === activeTabId
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
            )}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: SHELL_COLORS[tab.shellType] }}
            />
            <span className="truncate max-w-[120px]">{tab.label}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-danger"
            >
              <IconX size={12} />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      <button
        onClick={() => addTab()}
        className="flex items-center justify-center h-7 w-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors ml-1"
      >
        <IconPlus size={14} />
      </button>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 text-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                const name = prompt("Tab name:");
                if (name) useTabStore.getState().renameTab(contextMenu.tabId, name);
                setContextMenu(null);
              }}
            >
              Rename
            </button>
            <button
              className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                useTabStore.getState().duplicateTab(contextMenu.tabId);
                setContextMenu(null);
              }}
            >
              Duplicate
            </button>
            <button
              className="w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-danger"
              onClick={() => {
                removeTab(contextMenu.tabId);
                setContextMenu(null);
              }}
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: animated TabBar with drag reorder, context menu, shell colors"
```

---

### Task 9: Wire Tabs to Terminal Panes

**Files:**
- Create: `src/components/terminal/TerminalTab.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/terminal/TerminalTab.tsx`**

```tsx
import { AnimatePresence, motion } from "motion/react";
import { useTabStore } from "../../stores/tabStore";
import { TerminalPane } from "./TerminalPane";

export function TerminalTab() {
  const { tabs, activeTabId, removeTab } = useTabStore();

  return (
    <div className="relative flex-1 overflow-hidden">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={tab.id === activeTabId ? "h-full w-full" : "hidden"}
        >
          <TerminalPane
            id={tab.id}
            cwd={tab.cwd}
            shell={tab.shell}
            onExit={(id) => removeTab(id)}
          />
        </div>
      ))}
      {tabs.length === 0 && (
        <div className="flex h-full items-center justify-center text-text-secondary">
          <p>Press + to open a new terminal</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `src/App.tsx`**

```tsx
import { useEffect } from "react";
import { TabBar } from "./components/layout/TabBar";
import { TerminalTab } from "./components/terminal/TerminalTab";
import { useTabStore } from "./stores/tabStore";

function App() {
  const { tabs, addTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      addTab({ label: "Terminal 1" });
    }
  }, []);

  return (
    <div
      data-theme="dark"
      className="flex flex-col h-screen w-screen bg-bg-primary text-text-primary font-sans"
    >
      <TabBar />
      <TerminalTab />
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Run and test**

```bash
npm run tauri dev
```

Expected: App opens with one tab "Terminal 1". Click `+` to add tabs. Click tabs to switch. Right-click for context menu. Each tab has its own terminal session.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire tab system to terminal panes with tab switching"
```

---

## Phase 3: Split Panes

### Task 10: Split Pane Container

**Files:**
- Create: `src/components/terminal/SplitContainer.tsx`
- Create: `src/hooks/useSplitPane.ts`

- [ ] **Step 1: Create `src/hooks/useSplitPane.ts`**

```typescript
export type SplitDirection = "horizontal" | "vertical";

export interface SplitLeaf {
  type: "leaf";
  terminalId: string;
}

export interface SplitBranch {
  type: "branch";
  direction: SplitDirection;
  children: SplitNode[];
  sizes: number[]; // percentages, sum = 100
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

  // Normalize sizes
  const total = newSizes.reduce((a, b) => a + b, 0);
  const normalized = newSizes.map((s) => (s / total) * 100);

  return { ...root, children: newChildren, sizes: normalized };
}

export function updateSize(
  root: SplitNode,
  parentDirection: SplitDirection,
  index: number,
  newSizes: number[]
): SplitNode {
  if (root.type === "branch" && root.direction === parentDirection) {
    return { ...root, sizes: newSizes };
  }
  return root;
}
```

- [ ] **Step 2: Create `src/components/terminal/SplitContainer.tsx`**

```tsx
import { useRef, useCallback } from "react";
import type { SplitNode } from "../../hooks/useSplitPane";
import { TerminalPane } from "./TerminalPane";

interface SplitContainerProps {
  node: SplitNode;
  onSplit: (targetId: string, direction: "horizontal" | "vertical") => void;
  onClose: (terminalId: string) => void;
  onResizeSizes: (node: SplitNode, newSizes: number[]) => void;
}

export function SplitContainer({
  node,
  onSplit,
  onClose,
  onResizeSizes,
}: SplitContainerProps) {
  if (node.type === "leaf") {
    return (
      <div className="h-full w-full relative group/pane">
        <TerminalPane
          id={node.terminalId}
          onExit={() => onClose(node.terminalId)}
        />
        {/* Split buttons on hover */}
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
    <div
      className="h-full w-full flex"
      style={{ flexDirection: isHorizontal ? "row" : "column" }}
    >
      {node.children.map((child, i) => (
        <SplitPanel
          key={
            child.type === "leaf"
              ? child.terminalId
              : `branch-${i}`
          }
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

      const parentSize = isHorizontal
        ? parentEl.clientWidth
        : parentEl.clientHeight;

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
            onResizeSizes(
              node,
              node.children.map(() => equalSize)
            );
          }}
          className={`shrink-0 bg-border hover:bg-accent transition-colors ${
            isHorizontal
              ? "w-[3px] cursor-col-resize"
              : "h-[3px] cursor-row-resize"
          }`}
        />
      )}
      <div
        style={{
          [isHorizontal ? "width" : "height"]: `${node.sizes[index]}%`,
        }}
        className="overflow-hidden"
      >
        <SplitContainer
          node={child}
          onSplit={onSplit}
          onClose={onClose}
          onResizeSizes={onResizeSizes}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Write test for split pane logic**

Create `src/hooks/__tests__/useSplitPane.test.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```

Expected: All split pane tests + tab store tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: split pane container with drag resize and split logic"
```

---

### Task 11: Integrate Split Panes with Tab System

**Files:**
- Modify: `src/stores/tabStore.ts`
- Modify: `src/components/terminal/TerminalTab.tsx`

- [ ] **Step 1: Update `src/stores/tabStore.ts` to include split state**

Add split node tracking per tab. Add at the top of the file after existing imports:

```typescript
import { create } from "zustand";
import { type SplitNode, createLeaf, splitNode, removeNode } from "../hooks/useSplitPane";

export interface Tab {
  id: string;
  label: string;
  cwd?: string;
  shell?: string;
  shellType: "bash" | "zsh" | "powershell" | "cmd" | "ssh" | "custom";
  splitRoot: SplitNode;
}
```

Update `addTab` to initialize `splitRoot`:

In the `addTab` function, change the `tab` creation to:

```typescript
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
```

Add split and close actions to the store:

```typescript
  splitTerminal: (tabId: string, targetTerminalId: string, direction: "horizontal" | "vertical") => {
    const newTerminalId = generateId();
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? { ...t, splitRoot: splitNode(t.splitRoot, targetTerminalId, direction, newTerminalId) }
          : t
      ),
    }));
    return newTerminalId;
  },

  closeTerminal: (tabId: string, terminalId: string) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === tabId);
      if (!tab) return state;
      const newRoot = removeNode(tab.splitRoot, terminalId);
      if (!newRoot) {
        // Last terminal in tab — remove the tab
        const idx = state.tabs.findIndex((t) => t.id === tabId);
        const newTabs = state.tabs.filter((t) => t.id !== tabId);
        let newActive = state.activeTabId;
        if (state.activeTabId === tabId) {
          newActive = newTabs.length > 0 ? newTabs[Math.min(idx, newTabs.length - 1)].id : null;
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

  updateSplitSizes: (tabId: string, targetNode: SplitNode, newSizes: number[]) => {
    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id !== tabId) return t;
        const updateRecursive = (node: SplitNode): SplitNode => {
          if (node === targetNode && node.type === "branch") {
            return { ...node, sizes: newSizes };
          }
          if (node.type === "branch") {
            return { ...node, children: node.children.map(updateRecursive) };
          }
          return node;
        };
        return { ...t, splitRoot: updateRecursive(t.splitRoot) };
      }),
    }));
  },
```

Also update `duplicateTab`:

```typescript
  duplicateTab: (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return "";
    return get().addTab({ label: `${tab.label} (copy)`, cwd: tab.cwd, shell: tab.shell, shellType: tab.shellType });
  },
```

- [ ] **Step 2: Update `src/components/terminal/TerminalTab.tsx`**

```tsx
import { useTabStore } from "../../stores/tabStore";
import { SplitContainer } from "./SplitContainer";
import type { SplitNode } from "../../hooks/useSplitPane";

export function TerminalTab() {
  const { tabs, activeTabId } = useTabStore();

  return (
    <div className="relative flex-1 overflow-hidden">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={tab.id === activeTabId ? "h-full w-full" : "hidden"}
        >
          <SplitContainer
            node={tab.splitRoot}
            onSplit={(targetId, direction) =>
              useTabStore.getState().splitTerminal(tab.id, targetId, direction)
            }
            onClose={(terminalId) =>
              useTabStore.getState().closeTerminal(tab.id, terminalId)
            }
            onResizeSizes={(targetNode: SplitNode, newSizes: number[]) =>
              useTabStore.getState().updateSplitSizes(tab.id, targetNode, newSizes)
            }
          />
        </div>
      ))}
      {tabs.length === 0 && (
        <div className="flex h-full items-center justify-center text-text-secondary">
          <p>Press + to open a new terminal</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run and test**

```bash
npm run tauri dev
```

Expected: Terminal opens. Hover over a terminal pane — see split buttons (⬌ and ⬍) in top-right. Click ⬌ to split horizontally. Drag divider to resize. Double-click divider to reset equal sizes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: integrate split panes with tab system"
```

---

## Phase 4: Sidebar

### Task 12: Aceternity-Style Sidebar Shell

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/stores/sidebarStore.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/stores/sidebarStore.ts`**

```typescript
import { create } from "zustand";

interface SidebarState {
  open: boolean;
  pinned: boolean;
  setOpen: (open: boolean) => void;
  togglePin: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  pinned: false,
  setOpen: (open) => set({ open }),
  togglePin: () =>
    set((state) => ({ pinned: !state.pinned, open: !state.pinned })),
}));
```

- [ ] **Step 2: Create `src/components/layout/Sidebar.tsx`**

```tsx
import { motion } from "motion/react";
import {
  IconFolder,
  IconServer,
  IconSettings,
  IconInfoCircle,
  IconPin,
  IconPinFilled,
} from "@tabler/icons-react";
import { useSidebarStore } from "../../stores/sidebarStore";
import { cn } from "../../lib/cn";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function SidebarItem({ icon, label, onClick, active }: SidebarItemProps) {
  const { open } = useSidebarStore();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors text-left",
        active
          ? "bg-bg-tertiary text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
      )}
    >
      <span className="shrink-0">{icon}</span>
      {open && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="text-sm truncate whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </button>
  );
}

interface SidebarProps {
  onNavigate: (view: "projects" | "ssh" | "settings" | "about") => void;
  activeView: string;
}

export function Sidebar({ onNavigate, activeView }: SidebarProps) {
  const { open, pinned, setOpen, togglePin } = useSidebarStore();

  return (
    <motion.aside
      onMouseEnter={() => !pinned && setOpen(true)}
      onMouseLeave={() => !pinned && setOpen(false)}
      animate={{ width: open ? 220 : 56 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full bg-bg-secondary border-r border-border py-3 overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 mb-4">
        <span className="text-accent font-bold text-lg shrink-0">◆</span>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between flex-1"
          >
            <span className="font-semibold text-sm">TermLabs</span>
            <button
              onClick={togglePin}
              className="text-text-secondary hover:text-text-primary"
            >
              {pinned ? <IconPinFilled size={14} /> : <IconPin size={14} />}
            </button>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 px-2 flex-1">
        <SidebarItem
          icon={<IconFolder size={20} />}
          label="Projects"
          onClick={() => onNavigate("projects")}
          active={activeView === "projects"}
        />
        <SidebarItem
          icon={<IconServer size={20} />}
          label="SSH Connections"
          onClick={() => onNavigate("ssh")}
          active={activeView === "ssh"}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1 px-2 border-t border-border pt-2 mt-2">
        <SidebarItem
          icon={<IconSettings size={20} />}
          label="Settings"
          onClick={() => onNavigate("settings")}
          active={activeView === "settings"}
        />
        <SidebarItem
          icon={<IconInfoCircle size={20} />}
          label="About"
          onClick={() => onNavigate("about")}
          active={activeView === "about"}
        />
      </div>
    </motion.aside>
  );
}
```

- [ ] **Step 3: Update `src/App.tsx`**

```tsx
import { useEffect, useState } from "react";
import { TabBar } from "./components/layout/TabBar";
import { Sidebar } from "./components/layout/Sidebar";
import { TerminalTab } from "./components/terminal/TerminalTab";
import { useTabStore } from "./stores/tabStore";

function App() {
  const { tabs, addTab } = useTabStore();
  const [activeView, setActiveView] = useState("projects");

  useEffect(() => {
    if (tabs.length === 0) {
      addTab({ label: "Terminal 1" });
    }
  }, []);

  return (
    <div
      data-theme="dark"
      className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans"
    >
      <Sidebar onNavigate={setActiveView} activeView={activeView} />
      <div className="flex flex-col flex-1 min-w-0">
        <TabBar />
        <TerminalTab />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Run and test**

```bash
npm run tauri dev
```

Expected: Sidebar appears on left, collapsed by default. Hover to expand with smooth animation. Click pin to keep open. Icons for Projects, SSH, Settings, About visible. Terminal area fills remaining space.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Aceternity-style animated sidebar with pin/hover"
```

---

### Task 13: Project Manager in Sidebar

**Files:**
- Create: `src/stores/projectStore.ts`
- Create: `src/components/sidebar/ProjectTree.tsx`
- Create: `src-tauri/src/config/mod.rs`
- Create: `src-tauri/src/config/projects.rs`
- Create: `src-tauri/src/commands/mod.rs`
- Create: `src-tauri/src/commands/projects.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create Rust project config module `src-tauri/src/config/mod.rs`**

```rust
pub mod projects;
```

- [ ] **Step 2: Create `src-tauri/src/config/projects.rs`**

```rust
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
}

pub struct ProjectManager {
    projects: Mutex<Vec<Project>>,
    config_path: Mutex<Option<PathBuf>>,
}

impl ProjectManager {
    pub fn new() -> Self {
        Self {
            projects: Mutex::new(Vec::new()),
            config_path: Mutex::new(None),
        }
    }

    pub fn init(&self, config_dir: PathBuf) {
        let path = config_dir.join("projects.json");
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(projects) = serde_json::from_str::<Vec<Project>>(&data) {
                *self.projects.lock() = projects;
            }
        }
        *self.config_path.lock() = Some(path);
    }

    fn save(&self) {
        if let Some(path) = self.config_path.lock().as_ref() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let data = serde_json::to_string_pretty(&*self.projects.lock()).unwrap_or_default();
            let _ = fs::write(path, data);
        }
    }

    pub fn list(&self) -> Vec<Project> {
        self.projects.lock().clone()
    }

    pub fn add(&self, name: String, path: String) -> Project {
        let project = Project {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            path,
        };
        self.projects.lock().push(project.clone());
        self.save();
        project
    }

    pub fn remove(&self, id: &str) -> Result<(), String> {
        let mut projects = self.projects.lock();
        let idx = projects
            .iter()
            .position(|p| p.id == id)
            .ok_or("Project not found")?;
        projects.remove(idx);
        drop(projects);
        self.save();
        Ok(())
    }
}
```

- [ ] **Step 3: Create `src-tauri/src/commands/mod.rs`**

```rust
pub mod projects;
```

- [ ] **Step 4: Create `src-tauri/src/commands/projects.rs`**

```rust
use crate::config::projects::{Project, ProjectManager};
use tauri::State;

#[tauri::command]
pub fn project_list(manager: State<'_, ProjectManager>) -> Vec<Project> {
    manager.list()
}

#[tauri::command]
pub fn project_add(manager: State<'_, ProjectManager>, name: String, path: String) -> Project {
    manager.add(name, path)
}

#[tauri::command]
pub fn project_remove(manager: State<'_, ProjectManager>, id: String) -> Result<(), String> {
    manager.remove(&id)
}
```

- [ ] **Step 5: Update `src-tauri/src/lib.rs`**

```rust
mod commands;
mod config;
mod pty;

use commands::projects::{project_add, project_list, project_remove};
use config::projects::ProjectManager;
use pty::handler::{pty_close, pty_resize, pty_spawn, pty_write};
use pty::manager::PtyManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let project_manager = ProjectManager::new();

    tauri::Builder::default()
        .manage(PtyManager::new())
        .manage(project_manager)
        .setup(|app| {
            let config_dir = app
                .path()
                .app_config_dir()
                .expect("Failed to get config dir");
            let pm = app.state::<ProjectManager>();
            pm.init(config_dir);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_write,
            pty_resize,
            pty_close,
            project_list,
            project_add,
            project_remove,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Add `use tauri::Manager;` at top if needed for `app.path()`.

- [ ] **Step 6: Create `src/stores/projectStore.ts`**

```typescript
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface Project {
  id: string;
  name: string;
  path: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (name: string, path: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    const projects = await invoke<Project[]>("project_list");
    set({ projects, loading: false });
  },

  addProject: async (name, path) => {
    const project = await invoke<Project>("project_add", { name, path });
    set((state) => ({ projects: [...state.projects, project] }));
  },

  removeProject: async (id) => {
    await invoke("project_remove", { id });
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
  },
}));
```

- [ ] **Step 7: Create `src/components/sidebar/ProjectTree.tsx`**

```tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconFolder,
  IconFolderOpen,
  IconPlus,
  IconTrash,
  IconTerminal2,
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
} from "@tabler/icons-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useProjectStore } from "../../stores/projectStore";
import { useTabStore } from "../../stores/tabStore";
import { cn } from "../../lib/cn";

export function ProjectTree() {
  const { projects, fetchProjects, addProject, removeProject } =
    useProjectStore();
  const { addTab, tabs } = useTabStore();
  const [expanded, setExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    projectId: string;
    projectPath: string;
  } | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddFolder = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      const path = selected as string;
      const name = path.split("/").pop() ?? path.split("\\").pop() ?? path;
      await addProject(name, path);
    }
  };

  const openInTerminal = (path: string, name: string) => {
    addTab({ label: name, cwd: path });
  };

  const hasActiveTerminal = (path: string) =>
    tabs.some((t) => t.cwd === path);

  return (
    <div className="px-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary"
      >
        {expanded ? (
          <IconChevronDown size={12} />
        ) : (
          <IconChevronRight size={12} />
        )}
        Projects
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddFolder();
          }}
          className="ml-auto text-text-secondary hover:text-text-primary"
        >
          <IconPlus size={14} />
        </button>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => openInTerminal(project.path, project.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    projectId: project.id,
                    projectPath: project.path,
                  });
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md transition-colors",
                  hasActiveTerminal(project.path)
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
                )}
              >
                {hasActiveTerminal(project.path) ? (
                  <IconFolderOpen size={16} />
                ) : (
                  <IconFolder size={16} />
                )}
                <span className="truncate">{project.name}</span>
              </button>
            ))}

            {projects.length === 0 && (
              <p className="px-3 py-2 text-xs text-text-secondary">
                No projects yet
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 text-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                openInTerminal(contextMenu.projectPath, "Terminal");
                setContextMenu(null);
              }}
            >
              <IconTerminal2 size={14} /> Open in Terminal
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                // Open in system file manager — Tauri shell plugin
                setContextMenu(null);
              }}
            >
              <IconExternalLink size={14} /> Open in File Manager
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-danger"
              onClick={() => {
                removeProject(contextMenu.projectId);
                setContextMenu(null);
              }}
            >
              <IconTrash size={14} /> Remove
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Install Tauri dialog plugin**

```bash
npm install @tauri-apps/plugin-dialog
cd src-tauri && cargo add tauri-plugin-dialog
```

Add to `src-tauri/src/lib.rs` in the builder chain (before `.invoke_handler`):

```rust
.plugin(tauri_plugin_dialog::init())
```

- [ ] **Step 9: Verify build**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
npm run build && cd src-tauri && cargo build
```

Expected: Both frontend and backend build successfully.

- [ ] **Step 10: Commit**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
git add -A
git commit -m "feat: project manager with sidebar tree, add/remove, open in terminal"
```

---

### Task 14: SSH Connection Manager — Backend

**Files:**
- Create: `src-tauri/src/ssh/mod.rs`
- Create: `src-tauri/src/ssh/connection.rs`
- Create: `src-tauri/src/ssh/config.rs`
- Create: `src-tauri/src/ssh/keys.rs`
- Create: `src-tauri/src/commands/ssh.rs`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Add SSH dependencies to `src-tauri/Cargo.toml`**

```toml
ssh2 = "0.9"
```

- [ ] **Step 2: Create `src-tauri/src/ssh/mod.rs`**

```rust
pub mod config;
pub mod connection;
pub mod keys;
```

- [ ] **Step 3: Create `src-tauri/src/ssh/config.rs`**

Parse `~/.ssh/config` to import existing SSH hosts.

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SshHostConfig {
    pub host: String,
    pub hostname: Option<String>,
    pub user: Option<String>,
    pub port: Option<u16>,
    pub identity_file: Option<String>,
}

pub fn parse_ssh_config() -> Vec<SshHostConfig> {
    let home = dirs::home_dir().unwrap_or_default();
    let config_path = home.join(".ssh").join("config");
    parse_ssh_config_file(&config_path)
}

pub fn parse_ssh_config_file(path: &PathBuf) -> Vec<SshHostConfig> {
    let content = match fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return vec![],
    };

    let mut hosts: Vec<SshHostConfig> = vec![];
    let mut current: Option<SshHostConfig> = None;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let parts: Vec<&str> = trimmed.splitn(2, |c: char| c.is_whitespace() || c == '=').collect();
        if parts.len() < 2 {
            continue;
        }

        let key = parts[0].trim().to_lowercase();
        let value = parts[1].trim().to_string();

        match key.as_str() {
            "host" => {
                if let Some(h) = current.take() {
                    if !h.host.contains('*') {
                        hosts.push(h);
                    }
                }
                current = Some(SshHostConfig {
                    host: value,
                    hostname: None,
                    user: None,
                    port: None,
                    identity_file: None,
                });
            }
            "hostname" => {
                if let Some(ref mut h) = current {
                    h.hostname = Some(value);
                }
            }
            "user" => {
                if let Some(ref mut h) = current {
                    h.user = Some(value);
                }
            }
            "port" => {
                if let Some(ref mut h) = current {
                    h.port = value.parse().ok();
                }
            }
            "identityfile" => {
                if let Some(ref mut h) = current {
                    h.identity_file = Some(value);
                }
            }
            _ => {}
        }
    }

    if let Some(h) = current {
        if !h.host.contains('*') {
            hosts.push(h);
        }
    }

    hosts
}
```

Add `dirs = "5"` to `src-tauri/Cargo.toml` dependencies.

- [ ] **Step 4: Create `src-tauri/src/ssh/keys.rs`**

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SshKey {
    pub name: String,
    pub path: String,
    pub key_type: String,
    pub public_key: Option<String>,
}

pub fn list_keys() -> Vec<SshKey> {
    let home = dirs::home_dir().unwrap_or_default();
    let ssh_dir = home.join(".ssh");

    let mut keys = vec![];

    if let Ok(entries) = fs::read_dir(&ssh_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "pub") {
                continue;
            }
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();

            // Check if it's a private key file (has a matching .pub)
            let pub_path = path.with_extension("pub");
            if pub_path.exists() {
                let public_key = fs::read_to_string(&pub_path).ok();
                let key_type = public_key
                    .as_ref()
                    .and_then(|k| k.split_whitespace().next())
                    .unwrap_or("unknown")
                    .to_string();

                keys.push(SshKey {
                    name,
                    path: path.to_string_lossy().to_string(),
                    key_type,
                    public_key,
                });
            }
        }
    }

    keys
}

pub fn generate_key(
    name: &str,
    key_type: &str,
    passphrase: &str,
) -> Result<SshKey, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let key_path = home.join(".ssh").join(name);

    if key_path.exists() {
        return Err(format!("Key '{}' already exists", name));
    }

    let output = Command::new("ssh-keygen")
        .args([
            "-t",
            key_type,
            "-f",
            &key_path.to_string_lossy(),
            "-N",
            passphrase,
            "-C",
            &format!("termlabs-{}", name),
        ])
        .output()
        .map_err(|e| format!("Failed to run ssh-keygen: {e}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let pub_path = key_path.with_extension("pub");
    let public_key = fs::read_to_string(&pub_path).ok();
    let detected_type = public_key
        .as_ref()
        .and_then(|k| k.split_whitespace().next())
        .unwrap_or(key_type)
        .to_string();

    Ok(SshKey {
        name: name.to_string(),
        path: key_path.to_string_lossy().to_string(),
        key_type: detected_type,
        public_key,
    })
}
```

- [ ] **Step 5: Create `src-tauri/src/ssh/connection.rs`**

```rust
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SshConnection {
    pub id: String,
    pub label: String,
    pub group: String,
    pub hostname: String,
    pub port: u16,
    pub username: String,
    pub auth_method: AuthMethod,
    pub port_forwards: Vec<PortForward>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum AuthMethod {
    Password { password: String },
    Key { key_path: String },
    Agent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PortForward {
    pub local_port: u16,
    pub remote_host: String,
    pub remote_port: u16,
}

pub struct SshConnectionManager {
    connections: Mutex<Vec<SshConnection>>,
    config_path: Mutex<Option<PathBuf>>,
}

impl SshConnectionManager {
    pub fn new() -> Self {
        Self {
            connections: Mutex::new(Vec::new()),
            config_path: Mutex::new(None),
        }
    }

    pub fn init(&self, config_dir: PathBuf) {
        let path = config_dir.join("ssh_connections.json");
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(conns) = serde_json::from_str::<Vec<SshConnection>>(&data) {
                *self.connections.lock() = conns;
            }
        }
        *self.config_path.lock() = Some(path);
    }

    fn save(&self) {
        if let Some(path) = self.config_path.lock().as_ref() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let data =
                serde_json::to_string_pretty(&*self.connections.lock()).unwrap_or_default();
            let _ = fs::write(path, data);
        }
    }

    pub fn list(&self) -> Vec<SshConnection> {
        self.connections.lock().clone()
    }

    pub fn add(&self, conn: SshConnection) -> SshConnection {
        let mut conn = conn;
        conn.id = uuid::Uuid::new_v4().to_string();
        self.connections.lock().push(conn.clone());
        self.save();
        conn
    }

    pub fn update(&self, conn: SshConnection) -> Result<(), String> {
        let mut connections = self.connections.lock();
        let idx = connections
            .iter()
            .position(|c| c.id == conn.id)
            .ok_or("Connection not found")?;
        connections[idx] = conn;
        drop(connections);
        self.save();
        Ok(())
    }

    pub fn remove(&self, id: &str) -> Result<(), String> {
        let mut connections = self.connections.lock();
        let idx = connections
            .iter()
            .position(|c| c.id == id)
            .ok_or("Connection not found")?;
        connections.remove(idx);
        drop(connections);
        self.save();
        Ok(())
    }

    pub fn duplicate(&self, id: &str) -> Result<SshConnection, String> {
        let connections = self.connections.lock();
        let conn = connections
            .iter()
            .find(|c| c.id == id)
            .ok_or("Connection not found")?
            .clone();
        drop(connections);

        let mut new_conn = conn;
        new_conn.label = format!("{} (copy)", new_conn.label);
        Ok(self.add(new_conn))
    }

    pub fn test_connection(&self, id: &str) -> Result<bool, String> {
        let connections = self.connections.lock();
        let conn = connections
            .iter()
            .find(|c| c.id == id)
            .ok_or("Connection not found")?
            .clone();
        drop(connections);

        let tcp =
            std::net::TcpStream::connect_timeout(
                &format!("{}:{}", conn.hostname, conn.port)
                    .parse()
                    .map_err(|e| format!("Invalid address: {e}"))?,
                std::time::Duration::from_secs(5),
            )
            .map_err(|e| format!("TCP connect failed: {e}"))?;

        let mut sess = ssh2::Session::new().map_err(|e| format!("Session error: {e}"))?;
        sess.set_tcp_stream(tcp);
        sess.handshake()
            .map_err(|e| format!("Handshake failed: {e}"))?;

        match &conn.auth_method {
            AuthMethod::Password { password } => {
                sess.userauth_password(&conn.username, password)
                    .map_err(|e| format!("Auth failed: {e}"))?;
            }
            AuthMethod::Key { key_path } => {
                sess.userauth_pubkey_file(&conn.username, None, std::path::Path::new(key_path), None)
                    .map_err(|e| format!("Key auth failed: {e}"))?;
            }
            AuthMethod::Agent => {
                sess.userauth_agent(&conn.username)
                    .map_err(|e| format!("Agent auth failed: {e}"))?;
            }
        }

        Ok(sess.authenticated())
    }
}
```

- [ ] **Step 6: Create `src-tauri/src/commands/ssh.rs`**

```rust
use crate::ssh::config::{parse_ssh_config, SshHostConfig};
use crate::ssh::connection::{SshConnection, SshConnectionManager};
use crate::ssh::keys::{generate_key, list_keys, SshKey};
use tauri::State;

#[tauri::command]
pub fn ssh_list(manager: State<'_, SshConnectionManager>) -> Vec<SshConnection> {
    manager.list()
}

#[tauri::command]
pub fn ssh_add(
    manager: State<'_, SshConnectionManager>,
    conn: SshConnection,
) -> SshConnection {
    manager.add(conn)
}

#[tauri::command]
pub fn ssh_update(
    manager: State<'_, SshConnectionManager>,
    conn: SshConnection,
) -> Result<(), String> {
    manager.update(conn)
}

#[tauri::command]
pub fn ssh_remove(manager: State<'_, SshConnectionManager>, id: String) -> Result<(), String> {
    manager.remove(&id)
}

#[tauri::command]
pub fn ssh_duplicate(
    manager: State<'_, SshConnectionManager>,
    id: String,
) -> Result<SshConnection, String> {
    manager.duplicate(&id)
}

#[tauri::command]
pub fn ssh_test(manager: State<'_, SshConnectionManager>, id: String) -> Result<bool, String> {
    manager.test_connection(&id)
}

#[tauri::command]
pub fn ssh_import_config() -> Vec<SshHostConfig> {
    parse_ssh_config()
}

#[tauri::command]
pub fn ssh_key_list() -> Vec<SshKey> {
    list_keys()
}

#[tauri::command]
pub fn ssh_key_generate(
    name: String,
    key_type: String,
    passphrase: String,
) -> Result<SshKey, String> {
    generate_key(&name, &key_type, &passphrase)
}
```

- [ ] **Step 7: Update `src-tauri/src/commands/mod.rs`**

```rust
pub mod projects;
pub mod ssh;
```

- [ ] **Step 8: Update `src-tauri/src/lib.rs` to register SSH commands**

Add to imports:

```rust
use commands::ssh::{
    ssh_add, ssh_duplicate, ssh_import_config, ssh_key_generate, ssh_key_list,
    ssh_list, ssh_remove, ssh_test, ssh_update,
};
use ssh::connection::SshConnectionManager;
```

Add `mod ssh;` at top.

Add `.manage(SshConnectionManager::new())` and in `setup`:

```rust
let ssh_mgr = app.state::<SshConnectionManager>();
ssh_mgr.init(config_dir.clone());
```

Add to `invoke_handler`:

```rust
ssh_list, ssh_add, ssh_update, ssh_remove, ssh_duplicate,
ssh_test, ssh_import_config, ssh_key_list, ssh_key_generate,
```

- [ ] **Step 9: Verify Rust builds**

```bash
cd src-tauri && cargo build
```

Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
git add -A
git commit -m "feat: SSH connection manager backend with config import, key management"
```

---

### Task 15: SSH Connection Manager — Frontend

**Files:**
- Create: `src/stores/sshStore.ts`
- Create: `src/components/sidebar/SSHTree.tsx`
- Create: `src/components/sidebar/SSHForm.tsx`
- Create: `src/components/sidebar/KeyManager.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

This task is large — focus on the store and tree component first. SSHForm and KeyManager are secondary modals.

- [ ] **Step 1: Create `src/stores/sshStore.ts`**

```typescript
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface PortForward {
  local_port: number;
  remote_host: string;
  remote_port: number;
}

export interface SshConnection {
  id: string;
  label: string;
  group: string;
  hostname: string;
  port: number;
  username: string;
  auth_method:
    | { type: "Password"; password: string }
    | { type: "Key"; key_path: string }
    | { type: "Agent" };
  port_forwards: PortForward[];
}

export interface SshHostConfig {
  host: string;
  hostname: string | null;
  user: string | null;
  port: number | null;
  identity_file: string | null;
}

export interface SshKey {
  name: string;
  path: string;
  key_type: string;
  public_key: string | null;
}

interface SshState {
  connections: SshConnection[];
  keys: SshKey[];
  statuses: Record<string, "online" | "offline" | "checking">;
  fetchConnections: () => Promise<void>;
  addConnection: (conn: SshConnection) => Promise<void>;
  updateConnection: (conn: SshConnection) => Promise<void>;
  removeConnection: (id: string) => Promise<void>;
  duplicateConnection: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  importFromConfig: () => Promise<SshHostConfig[]>;
  fetchKeys: () => Promise<void>;
  generateKey: (name: string, keyType: string, passphrase: string) => Promise<SshKey>;
}

export const useSshStore = create<SshState>((set, get) => ({
  connections: [],
  keys: [],
  statuses: {},

  fetchConnections: async () => {
    const connections = await invoke<SshConnection[]>("ssh_list");
    set({ connections });
  },

  addConnection: async (conn) => {
    const result = await invoke<SshConnection>("ssh_add", { conn });
    set((s) => ({ connections: [...s.connections, result] }));
  },

  updateConnection: async (conn) => {
    await invoke("ssh_update", { conn });
    set((s) => ({
      connections: s.connections.map((c) => (c.id === conn.id ? conn : c)),
    }));
  },

  removeConnection: async (id) => {
    await invoke("ssh_remove", { id });
    set((s) => ({
      connections: s.connections.filter((c) => c.id !== id),
    }));
  },

  duplicateConnection: async (id) => {
    const result = await invoke<SshConnection>("ssh_duplicate", { id });
    set((s) => ({ connections: [...s.connections, result] }));
  },

  testConnection: async (id) => {
    set((s) => ({
      statuses: { ...s.statuses, [id]: "checking" },
    }));
    try {
      const ok = await invoke<boolean>("ssh_test", { id });
      set((s) => ({
        statuses: { ...s.statuses, [id]: ok ? "online" : "offline" },
      }));
      return ok;
    } catch {
      set((s) => ({
        statuses: { ...s.statuses, [id]: "offline" },
      }));
      return false;
    }
  },

  importFromConfig: async () => {
    return invoke<SshHostConfig[]>("ssh_import_config");
  },

  fetchKeys: async () => {
    const keys = await invoke<SshKey[]>("ssh_key_list");
    set({ keys });
  },

  generateKey: async (name, keyType, passphrase) => {
    const key = await invoke<SshKey>("ssh_key_generate", {
      name,
      keyType,
      passphrase,
    });
    set((s) => ({ keys: [...s.keys, key] }));
    return key;
  },
}));
```

- [ ] **Step 2: Create `src/components/sidebar/SSHTree.tsx`**

```tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconServer,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconTrash,
  IconCopy,
  IconPlugConnected,
  IconEdit,
} from "@tabler/icons-react";
import { useSshStore, type SshConnection } from "../../stores/sshStore";
import { cn } from "../../lib/cn";

interface SSHTreeProps {
  onOpenForm: (conn?: SshConnection) => void;
  onConnect: (conn: SshConnection) => void;
}

export function SSHTree({ onOpenForm, onConnect }: SSHTreeProps) {
  const {
    connections,
    statuses,
    fetchConnections,
    removeConnection,
    duplicateConnection,
    testConnection,
    importFromConfig,
  } = useSshStore();
  const [expanded, setExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    conn: SshConnection;
  } | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  // Group by group field
  const grouped = connections.reduce<Record<string, SshConnection[]>>(
    (acc, conn) => {
      const group = conn.group || "ungrouped";
      if (!acc[group]) acc[group] = [];
      acc[group].push(conn);
      return acc;
    },
    {}
  );

  const handleImport = async () => {
    const hosts = await importFromConfig();
    for (const host of hosts) {
      await useSshStore.getState().addConnection({
        id: "",
        label: host.host,
        group: "imported",
        hostname: host.hostname ?? host.host,
        port: host.port ?? 22,
        username: host.user ?? "root",
        auth_method: host.identity_file
          ? { type: "Key", key_path: host.identity_file }
          : { type: "Agent" },
        port_forwards: [],
      });
    }
    fetchConnections();
  };

  const statusDot = (id: string) => {
    const s = statuses[id];
    if (s === "online")
      return (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-2 w-2 rounded-full bg-success shrink-0"
        />
      );
    if (s === "checking")
      return <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse shrink-0" />;
    return <span className="h-2 w-2 rounded-full bg-text-secondary/30 shrink-0" />;
  };

  return (
    <div className="px-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary"
      >
        {expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
        SSH Connections
        <div className="ml-auto flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleImport();
            }}
            className="text-text-secondary hover:text-text-primary"
            title="Import from ~/.ssh/config"
          >
            <IconDownload size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenForm();
            }}
            className="text-text-secondary hover:text-text-primary"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {Object.entries(grouped).map(([group, conns]) => (
              <div key={group} className="mb-1">
                <span className="px-3 text-[10px] uppercase tracking-widest text-text-secondary/60">
                  {group}
                </span>
                {conns.map((conn) => (
                  <button
                    key={conn.id}
                    onClick={() => onConnect(conn)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, conn });
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
                  >
                    <IconServer size={14} />
                    <span className="truncate flex-1 text-left">{conn.label}</span>
                    {statusDot(conn.id)}
                  </button>
                ))}
              </div>
            ))}

            {connections.length === 0 && (
              <p className="px-3 py-2 text-xs text-text-secondary">
                No SSH connections yet
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-xl py-1 text-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                onOpenForm(contextMenu.conn);
                setContextMenu(null);
              }}
            >
              <IconEdit size={14} /> Edit
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                duplicateConnection(contextMenu.conn.id);
                setContextMenu(null);
              }}
            >
              <IconCopy size={14} /> Duplicate
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              onClick={() => {
                testConnection(contextMenu.conn.id);
                setContextMenu(null);
              }}
            >
              <IconPlugConnected size={14} /> Test Connection
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-bg-tertiary text-text-secondary hover:text-danger"
              onClick={() => {
                removeConnection(contextMenu.conn.id);
                setContextMenu(null);
              }}
            >
              <IconTrash size={14} /> Delete
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/sidebar/SSHForm.tsx`**

```tsx
import { useState } from "react";
import { motion } from "motion/react";
import { IconX } from "@tabler/icons-react";
import { useSshStore, type SshConnection } from "../../stores/sshStore";

interface SSHFormProps {
  connection?: SshConnection;
  onClose: () => void;
}

export function SSHForm({ connection, onClose }: SSHFormProps) {
  const { addConnection, updateConnection } = useSshStore();
  const isEdit = !!connection?.id;

  const [label, setLabel] = useState(connection?.label ?? "");
  const [group, setGroup] = useState(connection?.group ?? "");
  const [hostname, setHostname] = useState(connection?.hostname ?? "");
  const [port, setPort] = useState(connection?.port ?? 22);
  const [username, setUsername] = useState(connection?.username ?? "root");
  const [authType, setAuthType] = useState<"Password" | "Key" | "Agent">(
    connection?.auth_method?.type ?? "Key"
  );
  const [password, setPassword] = useState(
    connection?.auth_method?.type === "Password"
      ? connection.auth_method.password
      : ""
  );
  const [keyPath, setKeyPath] = useState(
    connection?.auth_method?.type === "Key"
      ? connection.auth_method.key_path
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let auth_method: SshConnection["auth_method"];
    if (authType === "Password") {
      auth_method = { type: "Password", password };
    } else if (authType === "Key") {
      auth_method = { type: "Key", key_path: keyPath };
    } else {
      auth_method = { type: "Agent" };
    }

    const conn: SshConnection = {
      id: connection?.id ?? "",
      label,
      group,
      hostname,
      port,
      username,
      auth_method,
      port_forwards: connection?.port_forwards ?? [],
    };

    if (isEdit) {
      await updateConnection(conn);
    } else {
      await addConnection(conn);
    }
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Connection" : "New SSH Connection"}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className={inputClass} placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} required />
          <input className={inputClass} placeholder="Group (e.g. production)" value={group} onChange={(e) => setGroup(e.target.value)} />
          <div className="flex gap-2">
            <input className={`${inputClass} flex-1`} placeholder="Hostname" value={hostname} onChange={(e) => setHostname(e.target.value)} required />
            <input className={`${inputClass} w-20`} placeholder="Port" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} />
          </div>
          <input className={inputClass} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />

          <select
            className={inputClass}
            value={authType}
            onChange={(e) => setAuthType(e.target.value as "Password" | "Key" | "Agent")}
          >
            <option value="Key">SSH Key</option>
            <option value="Password">Password</option>
            <option value="Agent">SSH Agent</option>
          </select>

          {authType === "Password" && (
            <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
          {authType === "Key" && (
            <input className={inputClass} placeholder="Key path (e.g. ~/.ssh/id_ed25519)" value={keyPath} onChange={(e) => setKeyPath(e.target.value)} />
          )}

          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isEdit ? "Save" : "Add Connection"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Create `src/components/sidebar/KeyManager.tsx`**

```tsx
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IconX, IconKey, IconPlus } from "@tabler/icons-react";
import { useSshStore, type SshKey } from "../../stores/sshStore";

interface KeyManagerProps {
  onClose: () => void;
}

export function KeyManager({ onClose }: KeyManagerProps) {
  const { keys, fetchKeys, generateKey } = useSshStore();
  const [showGenerate, setShowGenerate] = useState(false);
  const [name, setName] = useState("");
  const [keyType, setKeyType] = useState("ed25519");
  const [passphrase, setPassphrase] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await generateKey(name, keyType, passphrase);
      setShowGenerate(false);
      setName("");
      setPassphrase("");
    } finally {
      setGenerating(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[480px] max-h-[600px] bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">SSH Keys</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerate(!showGenerate)}
              className="text-text-secondary hover:text-text-primary"
            >
              <IconPlus size={18} />
            </button>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <IconX size={18} />
            </button>
          </div>
        </div>

        {showGenerate && (
          <form onSubmit={handleGenerate} className="flex flex-col gap-3 mb-4 p-3 bg-bg-tertiary rounded-lg">
            <input className={inputClass} placeholder="Key name (e.g. my-server)" value={name} onChange={(e) => setName(e.target.value)} required />
            <select className={inputClass} value={keyType} onChange={(e) => setKeyType(e.target.value)}>
              <option value="ed25519">Ed25519 (recommended)</option>
              <option value="rsa">RSA 4096</option>
            </select>
            <input className={inputClass} type="password" placeholder="Passphrase (optional)" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} />
            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Key"}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-2">
          {keys.map((key) => (
            <div
              key={key.path}
              className="flex items-start gap-3 p-3 bg-bg-tertiary/50 rounded-lg"
            >
              <IconKey size={18} className="text-accent shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{key.name}</p>
                <p className="text-xs text-text-secondary truncate">{key.path}</p>
                <p className="text-xs text-text-secondary">{key.key_type}</p>
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              No SSH keys found in ~/.ssh/
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 5: Update `src/components/layout/Sidebar.tsx` to include ProjectTree and SSHTree**

Add the tree components inside the navigation section of the Sidebar. Replace the static `SidebarItem` calls for Projects and SSH with the actual tree components when the sidebar is open, and keep icons-only when collapsed. This requires importing `ProjectTree`, `SSHTree` and conditionally rendering them. The exact integration depends on the sidebar `open` state — when open, render the full tree; when collapsed, show just the icon button.

Update the navigation section in `Sidebar.tsx`:

```tsx
// In the navigation div, replace the static SidebarItem calls:
<div className="flex flex-col gap-1 px-2 flex-1 overflow-y-auto">
  {open ? (
    <>
      <ProjectTree />
      <SSHTree
        onOpenForm={(conn) => onNavigate("ssh")}
        onConnect={(conn) => {
          // Will wire up SSH terminal connection later
        }}
      />
    </>
  ) : (
    <>
      <SidebarItem
        icon={<IconFolder size={20} />}
        label="Projects"
        onClick={() => onNavigate("projects")}
        active={activeView === "projects"}
      />
      <SidebarItem
        icon={<IconServer size={20} />}
        label="SSH"
        onClick={() => onNavigate("ssh")}
        active={activeView === "ssh"}
      />
    </>
  )}
</div>
```

Add imports for `ProjectTree` and `SSHTree` at the top of the file.

- [ ] **Step 6: Verify build**

```bash
npm run build && cd src-tauri && cargo build
```

Expected: Both builds succeed.

- [ ] **Step 7: Commit**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
git add -A
git commit -m "feat: SSH connection manager frontend with tree, form, key manager"
```

---

## Phase 5: Settings, About, Theme

### Task 16: Settings Store + Modal

**Files:**
- Create: `src/stores/settingsStore.ts`
- Create: `src/components/settings/SettingsModal.tsx`
- Create: `src/hooks/useTheme.ts`
- Create: `src-tauri/src/config/app.rs`
- Create: `src-tauri/src/commands/config.rs`
- Modify: `src-tauri/src/config/mod.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Create `src-tauri/src/config/app.rs`**

```rust
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub font_size: u16,
    pub font_family_ui: String,
    pub font_family_terminal: String,
    pub default_shell: Option<String>,
    pub cursor_style: String,
    pub cursor_blink: bool,
    pub scroll_buffer: u32,
    pub bell_enabled: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            font_size: 14,
            font_family_ui: "Satoshi".to_string(),
            font_family_terminal: "JetBrains Mono".to_string(),
            default_shell: None,
            cursor_style: "bar".to_string(),
            cursor_blink: true,
            scroll_buffer: 10000,
            bell_enabled: false,
        }
    }
}

pub struct AppConfigManager {
    settings: Mutex<AppSettings>,
    config_path: Mutex<Option<PathBuf>>,
}

impl AppConfigManager {
    pub fn new() -> Self {
        Self {
            settings: Mutex::new(AppSettings::default()),
            config_path: Mutex::new(None),
        }
    }

    pub fn init(&self, config_dir: PathBuf) {
        let path = config_dir.join("settings.json");
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(settings) = serde_json::from_str::<AppSettings>(&data) {
                *self.settings.lock() = settings;
            }
        }
        *self.config_path.lock() = Some(path);
    }

    fn save(&self) {
        if let Some(path) = self.config_path.lock().as_ref() {
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let data = serde_json::to_string_pretty(&*self.settings.lock()).unwrap_or_default();
            let _ = fs::write(path, data);
        }
    }

    pub fn get(&self) -> AppSettings {
        self.settings.lock().clone()
    }

    pub fn update(&self, settings: AppSettings) {
        *self.settings.lock() = settings;
        self.save();
    }
}
```

- [ ] **Step 2: Create `src-tauri/src/commands/config.rs`**

```rust
use crate::config::app::{AppConfigManager, AppSettings};
use tauri::State;

#[tauri::command]
pub fn config_get(manager: State<'_, AppConfigManager>) -> AppSettings {
    manager.get()
}

#[tauri::command]
pub fn config_update(manager: State<'_, AppConfigManager>, settings: AppSettings) {
    manager.update(settings);
}
```

- [ ] **Step 3: Update `src-tauri/src/config/mod.rs`**

```rust
pub mod app;
pub mod projects;
```

- [ ] **Step 4: Update `src-tauri/src/commands/mod.rs`**

```rust
pub mod config;
pub mod projects;
pub mod ssh;
```

- [ ] **Step 5: Register in `src-tauri/src/lib.rs`**

Add imports and `.manage(AppConfigManager::new())`, init in setup, and add `config_get, config_update` to invoke_handler.

- [ ] **Step 6: Create `src/hooks/useTheme.ts`**

```typescript
import { useEffect } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export function useTheme() {
  const theme = useSettingsStore((s) => s.settings?.theme ?? "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return theme;
}
```

- [ ] **Step 7: Create `src/stores/settingsStore.ts`**

```typescript
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface AppSettings {
  theme: string;
  font_size: number;
  font_family_ui: string;
  font_family_terminal: string;
  default_shell: string | null;
  cursor_style: string;
  cursor_blink: boolean;
  scroll_buffer: number;
  bell_enabled: boolean;
}

interface SettingsState {
  settings: AppSettings | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,

  fetchSettings: async () => {
    const settings = await invoke<AppSettings>("config_get");
    set({ settings });
  },

  updateSettings: async (settings) => {
    await invoke("config_update", { settings });
    set({ settings });
  },
}));
```

- [ ] **Step 8: Create `src/components/settings/SettingsModal.tsx`**

```tsx
import { useEffect } from "react";
import { motion } from "motion/react";
import { IconX, IconMoon, IconSun } from "@tabler/icons-react";
import { useSettingsStore, type AppSettings } from "../../stores/settingsStore";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  if (!settings) return null;

  const update = (partial: Partial<AppSettings>) => {
    updateSettings({ ...settings, ...partial });
  };

  const inputClass =
    "w-full px-3 py-2 bg-bg-primary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[480px] max-h-[600px] bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <IconX size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Theme */}
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ theme: "dark" })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                  settings.theme === "dark"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                <IconMoon size={16} /> Dark
              </button>
              <button
                onClick={() => update({ theme: "light" })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                  settings.theme === "light"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                <IconSun size={16} /> Light
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Terminal Font Size: {settings.font_size}px
            </label>
            <input
              type="range"
              min={10}
              max={24}
              value={settings.font_size}
              onChange={(e) => update({ font_size: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Cursor Style */}
          <div>
            <label className="text-sm font-medium mb-2 block">Cursor Style</label>
            <select
              className={inputClass}
              value={settings.cursor_style}
              onChange={(e) => update({ cursor_style: e.target.value })}
            >
              <option value="bar">Bar</option>
              <option value="block">Block</option>
              <option value="underline">Underline</option>
            </select>
          </div>

          {/* Cursor Blink */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cursor_blink}
              onChange={(e) => update({ cursor_blink: e.target.checked })}
              className="accent-accent"
            />
            <span className="text-sm">Cursor blink</span>
          </label>

          {/* Bell */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.bell_enabled}
              onChange={(e) => update({ bell_enabled: e.target.checked })}
              className="accent-accent"
            />
            <span className="text-sm">Terminal bell</span>
          </label>

          {/* Scroll Buffer */}
          <div>
            <label className="text-sm font-medium mb-2 block">Scroll Buffer Lines</label>
            <input
              className={inputClass}
              type="number"
              value={settings.scroll_buffer}
              onChange={(e) => update({ scroll_buffer: Number(e.target.value) })}
            />
          </div>

          {/* Default Shell */}
          <div>
            <label className="text-sm font-medium mb-2 block">Default Shell</label>
            <input
              className={inputClass}
              placeholder="Auto-detect (leave empty)"
              value={settings.default_shell ?? ""}
              onChange={(e) =>
                update({ default_shell: e.target.value || null })
              }
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 9: Verify build**

```bash
npm run build && cd src-tauri && cargo build
```

- [ ] **Step 10: Commit**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
git add -A
git commit -m "feat: settings store, modal, and theme toggle"
```

---

### Task 17: About Modal

**Files:**
- Create: `src/components/about/AboutModal.tsx`

- [ ] **Step 1: Create `src/components/about/AboutModal.tsx`**

```tsx
import { motion } from "motion/react";
import { IconX, IconBrandGithub, IconRefresh, IconFileText } from "@tabler/icons-react";
import { getVersion } from "@tauri-apps/api/app";
import { type as osType, version as osVersion, arch } from "@tauri-apps/api/os";
import { useEffect, useState } from "react";

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  const [version, setVersion] = useState("");
  const [os, setOs] = useState("");
  const [osVer, setOsVer] = useState("");
  const [architecture, setArchitecture] = useState("");

  useEffect(() => {
    getVersion().then(setVersion);
    osType().then(setOs);
    osVersion().then(setOsVer);
    arch().then(setArchitecture);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[380px] bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        >
          <IconX size={18} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <span className="text-5xl text-accent font-bold">◆</span>
        </div>

        <h2 className="text-xl font-bold mb-1">TermLabs</h2>
        <p className="text-text-secondary text-sm mb-4">
          v{version}
        </p>

        {/* Build Info */}
        <div className="bg-bg-tertiary/50 rounded-lg p-3 mb-4 text-sm text-text-secondary">
          <p>OS: {os} {osVer}</p>
          <p>Arch: {architecture}</p>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-4 mb-4">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <IconBrandGithub size={16} /> GitHub
          </a>
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <IconFileText size={16} /> Changelog
          </a>
        </div>

        {/* Update Check */}
        <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-bg-tertiary hover:bg-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
          <IconRefresh size={14} /> Check for Updates
        </button>

        {/* Credits */}
        <p className="text-xs text-text-secondary/50 mt-4">
          Built with Tauri, React, and Rust
        </p>
      </motion.div>
    </motion.div>
  );
}
```

Note: `@tauri-apps/api/os` may need `@tauri-apps/plugin-os`. Install if needed:

```bash
npm install @tauri-apps/plugin-os
cd src-tauri && cargo add tauri-plugin-os
```

Add `.plugin(tauri_plugin_os::init())` to the builder.

- [ ] **Step 2: Verify build**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: About modal with version, build info, update check"
```

---

### Task 18: Wire Settings, About, SSH Modals into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx` to manage modal state and wire everything**

```tsx
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { TabBar } from "./components/layout/TabBar";
import { Sidebar } from "./components/layout/Sidebar";
import { TerminalTab } from "./components/terminal/TerminalTab";
import { SettingsModal } from "./components/settings/SettingsModal";
import { AboutModal } from "./components/about/AboutModal";
import { SSHForm } from "./components/sidebar/SSHForm";
import { KeyManager } from "./components/sidebar/KeyManager";
import { useTabStore } from "./stores/tabStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useTheme } from "./hooks/useTheme";
import type { SshConnection } from "./stores/sshStore";

type ModalView = "settings" | "about" | "ssh-form" | "key-manager" | null;

function App() {
  const { tabs, addTab } = useTabStore();
  const { fetchSettings } = useSettingsStore();
  const theme = useTheme();
  const [activeView, setActiveView] = useState("projects");
  const [modal, setModal] = useState<ModalView>(null);
  const [editingConn, setEditingConn] = useState<SshConnection | undefined>();

  useEffect(() => {
    fetchSettings();
    if (tabs.length === 0) {
      addTab({ label: "Terminal 1" });
    }
  }, []);

  const handleNavigate = (view: string) => {
    if (view === "settings") {
      setModal("settings");
    } else if (view === "about") {
      setModal("about");
    } else {
      setActiveView(view);
    }
  };

  return (
    <div
      data-theme={theme}
      className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans"
    >
      <Sidebar onNavigate={handleNavigate} activeView={activeView} />
      <div className="flex flex-col flex-1 min-w-0">
        <TabBar />
        <TerminalTab />
      </div>

      <AnimatePresence>
        {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
        {modal === "about" && <AboutModal onClose={() => setModal(null)} />}
        {modal === "ssh-form" && (
          <SSHForm
            connection={editingConn}
            onClose={() => {
              setModal(null);
              setEditingConn(undefined);
            }}
          />
        )}
        {modal === "key-manager" && <KeyManager onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Run full integration test**

```bash
npm run tauri dev
```

Expected:
- Sidebar works with hover/pin
- Projects tree shows (empty, can add folders)
- SSH tree shows (empty, can add connections)
- Click Settings → SettingsModal opens with theme toggle, font size slider
- Click About → AboutModal shows version, OS info
- Multiple terminal tabs work with split panes
- Dark theme looks polished

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: wire all modals (Settings, About, SSH) into main app"
```

---

## Phase 6: Custom Title Bar

### Task 19: Custom Window Title Bar

**Files:**
- Create: `src/components/layout/TitleBar.tsx`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src-tauri/tauri.conf.json` to disable native decorations**

In the `windows` array, set:

```json
"decorations": false
```

- [ ] **Step 2: Create `src/components/layout/TitleBar.tsx`**

```tsx
import { getCurrentWindow } from "@tauri-apps/api/window";
import { IconMinus, IconSquare, IconX } from "@tabler/icons-react";

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-8 bg-bg-secondary border-b border-border px-3 select-none shrink-0"
    >
      {/* macOS-style traffic lights space — handled natively on macOS */}
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <span className="text-accent font-bold text-xs">◆ TermLabs</span>
      </div>

      {/* Windows/Linux controls */}
      <div className="flex items-center gap-0.5 macos:hidden">
        <button
          onClick={() => appWindow.minimize()}
          className="flex items-center justify-center h-6 w-8 text-text-secondary hover:bg-bg-tertiary rounded transition-colors"
        >
          <IconMinus size={12} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex items-center justify-center h-6 w-8 text-text-secondary hover:bg-bg-tertiary rounded transition-colors"
        >
          <IconSquare size={12} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex items-center justify-center h-6 w-8 text-text-secondary hover:bg-danger/80 hover:text-white rounded transition-colors"
        >
          <IconX size={12} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add TitleBar to `src/App.tsx`**

Add `<TitleBar />` as the first child inside the outermost div, before the Sidebar:

```tsx
import { TitleBar } from "./components/layout/TitleBar";

// In return:
<div data-theme={theme} className="flex flex-col h-screen w-screen bg-bg-primary text-text-primary font-sans">
  <TitleBar />
  <div className="flex flex-1 min-h-0">
    <Sidebar onNavigate={handleNavigate} activeView={activeView} />
    <div className="flex flex-col flex-1 min-w-0">
      <TabBar />
      <TerminalTab />
    </div>
  </div>
  {/* modals */}
</div>
```

- [ ] **Step 4: Run and verify**

```bash
npm run tauri dev
```

Expected: Custom title bar with drag-to-move. Window controls (minimize, maximize, close) work on Windows/Linux.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: custom window title bar with traffic light controls"
```

---

## Phase 7: CI/CD & Build

### Task 20: GitHub Actions CI Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libssh2-1-dev

      - name: Install frontend deps
        run: npm ci

      - name: Frontend lint
        run: npx eslint . --ext .ts,.tsx

      - name: Frontend typecheck
        run: npx tsc --noEmit

      - name: Frontend tests
        run: npx vitest run

      - name: Rust format check
        run: cd src-tauri && cargo fmt --check

      - name: Rust clippy
        run: cd src-tauri && cargo clippy -- -D warnings

      - name: Rust tests
        run: cd src-tauri && cargo test

  build:
    needs: check
    strategy:
      matrix:
        include:
          - os: macos-latest
            target: aarch64-apple-darwin
          - os: macos-latest
            target: x86_64-apple-darwin
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
          - os: windows-latest
            target: x86_64-pc-windows-msvc
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}

      - name: Install system dependencies (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libssh2-1-dev

      - name: Install frontend deps
        run: npm ci

      - name: Build Tauri
        run: npx tauri build --target ${{ matrix.target }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: termlabs-${{ matrix.target }}
          path: |
            src-tauri/target/${{ matrix.target }}/release/bundle/**/*
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
src-tauri/target/
.DS_Store
*.log
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions pipeline for lint, test, build (macOS/Linux/Windows)"
```

---

### Task 21: ESLint + Prettier + TypeScript Config

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Modify: `tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D eslint @eslint/js typescript-eslint prettier eslint-config-prettier
```

- [ ] **Step 2: Create `eslint.config.js`**

```javascript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: ["dist/", "src-tauri/"],
  }
);
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Run lint and format**

```bash
npm run lint && npm run format:check
```

Fix any issues found.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure ESLint, Prettier, TypeScript strict mode"
```

---

### Task 22: Final Integration Test

**Files:** None — this is a verification task.

- [ ] **Step 1: Run all checks**

```bash
npm run lint
npm run typecheck
npx vitest run
cd src-tauri && cargo fmt --check && cargo clippy -- -D warnings && cargo test
```

Expected: All pass with zero errors.

- [ ] **Step 2: Run the full app**

```bash
cd /Users/memen/Documents/mmnLabs/termLabs
npm run tauri dev
```

Verify all features:
- [ ] App opens with dark theme, custom title bar
- [ ] Sidebar collapses/expands on hover, pin works
- [ ] Add project folder via sidebar
- [ ] Click project → opens terminal in that folder
- [ ] Create multiple tabs with `+` button
- [ ] Switch between tabs
- [ ] Drag to reorder tabs
- [ ] Right-click tab → rename, duplicate, close
- [ ] Split terminal horizontal and vertical
- [ ] Drag divider to resize, double-click to equalize
- [ ] Settings modal: toggle theme, change font size
- [ ] About modal: shows version and OS info
- [ ] Add SSH connection via form
- [ ] Terminal is fully interactive (type commands, see output)

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration test fixes"
```
