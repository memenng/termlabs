# TermLabs

Cross-platform terminal emulator built with Tauri v2.

## Tech Stack

- **Framework:** Tauri v2 (Rust backend + React frontend)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, config in `src/styles/app.css` via `@theme`)
- **UI Components:** Aceternity UI style (custom-built with Tabler Icons)
- **Animation:** Motion (`motion/react`) — NOT framer-motion
- **Terminal:** xterm.js + WebGL addon + FitAddon + SearchAddon
- **State:** Zustand
- **Fonts:** Satoshi (UI), JetBrains Mono (terminal)
- **Icons:** @tabler/icons-react

## Architecture

**Heavy Rust backend** — all PTY management, SSH, config persistence in Rust. React frontend is purely UI/rendering.

```
src-tauri/src/
  pty/          # PTY session management (portable-pty)
  ssh/          # SSH connections, config parser, key management (ssh2)
  config/       # App settings, project list persistence
  commands/     # Tauri IPC command handlers

src/
  components/   # React components (layout, terminal, sidebar, settings, about)
  stores/       # Zustand stores (tabStore, sidebarStore, projectStore, sshStore, settingsStore)
  hooks/        # Custom hooks (useTerminal, useTheme)
  lib/          # Utilities (cn, ipc wrappers)
  styles/       # Tailwind entry, fonts, terminal CSS
```

## Key Patterns

### PTY Lifecycle
- PTY sessions are managed in Rust via `PtyManager` with generation counter to prevent race conditions
- Frontend communicates via Tauri IPC commands + Channel API for streaming
- PTY is NOT closed on React component unmount — only on explicit tab/terminal close via store actions
- Each `PtySession` has a `generation` field; reader threads check generation before removing sessions

### Terminal Rendering
- `useTerminal` hook manages xterm.js lifecycle via `useEffect` (not ref callback)
- ResizeObserver skips `fit()` when container is hidden (0x0) to prevent PTY death
- PTY resize ignores 0x0 (guarded in both frontend and Rust backend)
- React StrictMode is disabled — incompatible with native PTY resource management

### Layout System
- Each tab = 1 terminal with its own PTY
- Layout modes: `single` | `split-h` | `split-v` | `grid` (max 4 visible)
- Split view shows EXISTING tabs side by side (does NOT create new terminals)
- Layout buttons in TabBar (right side)

### Sidebar
- Aceternity-style collapsible sidebar (hover to expand, click pin to keep open)
- ProjectTree: click folder = `cd` in active terminal; right-click = open new tab
- SSHTree: grouped connections with status indicators

## Commands

```bash
# Development
npm run tauri dev          # Run app (Vite + Rust hot reload)
npm run build              # Frontend build (tsc + vite)
npm run dev                # Vite dev server only

# Testing
npx vitest run             # Run all tests
npm run typecheck           # TypeScript check (tsc --noEmit)

# Rust
cd src-tauri && cargo build           # Build backend
cd src-tauri && cargo clippy          # Lint
cd src-tauri && cargo fmt --check     # Format check
cd src-tauri && cargo test            # Rust tests

# Linting
npm run lint               # ESLint
npm run format             # Prettier write
npm run format:check       # Prettier check

# Release
cargo tauri build          # Build installer (per platform)
```

## Build Outputs
- macOS: `.dmg`
- Windows: `.msi` / `.exe`
- Linux: `.deb` / `.AppImage`

## Config Locations
- App settings: `~/.config/termlabs/settings.json` (via Tauri path API)
- SSH connections: `~/.config/termlabs/ssh_connections.json`
- Projects list: `~/.config/termlabs/projects.json`

## Known Issues / TODOs
- SFTP file browser not yet implemented
- SSH terminal session (connect via SSH in tab) not yet wired up
- Keyboard shortcuts customization UI exists but not wired to terminal
- Auto-updater not configured (needs Tauri updater endpoint)
