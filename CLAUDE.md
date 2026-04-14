# TermLabs

Cross-platform terminal emulator built with Tauri v2. Version 0.2.0.

## Tech Stack

- **Framework:** Tauri v2 (Rust backend + React frontend)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, config in `src/styles/app.css` via `@theme`)
- **UI Components:** Aceternity UI style (custom-built with Tabler Icons)
- **Animation:** Motion (`motion/react`) — NOT framer-motion
- **Terminal:** xterm.js + WebGL addon + FitAddon + SearchAddon
- **State:** Zustand
- **Fonts:** Satoshi (UI), JetBrains Mono (terminal) — bundled locally in `public/fonts/`
- **Icons:** @tabler/icons-react

## Architecture

**Heavy Rust backend** — all PTY management, SSH, config persistence in Rust. React frontend is purely UI/rendering.

```
src-tauri/src/
  pty/          # PTY session management (portable-pty) + SSH spawn
  ssh/          # SSH connections, config parser, key management (ssh2)
  config/       # App settings, project list persistence
  commands/     # Tauri IPC command handlers

src/
  components/   # React components (layout, terminal, sidebar, settings, about)
  stores/       # Zustand stores (tabStore, sidebarStore, projectStore, sshStore, settingsStore)
  hooks/        # Custom hooks (useTerminal, useTheme)
  lib/          # Utilities (cn, ipc wrappers)
  styles/       # Tailwind entry, fonts, terminal CSS
  public/       # Static assets (fonts, icons)
```

## Key Patterns

### PTY Lifecycle
- PTY sessions are managed in Rust via `PtyManager` with generation counter to prevent race conditions
- Frontend communicates via Tauri IPC commands + Channel API for streaming
- PTY is NOT closed on React component unmount — only on explicit tab/terminal close via store actions
- Each `PtySession` has a `generation` field; reader threads check generation before removing sessions
- SSH connections spawn via `pty_spawn_ssh` command (runs `ssh` CLI via PTY)
- `TERM=xterm-256color` set in PTY env for correct key mappings (backspace, etc.)

### Terminal Rendering
- `useTerminal` hook manages xterm.js lifecycle via `useEffect` (not ref callback)
- ALL TerminalPanes are always mounted — identical JSX structure, visibility via CSS only
- ResizeObserver skips `fit()` when container is hidden (0x0) to prevent PTY death
- PTY resize ignores 0x0 (guarded in both frontend and Rust backend)
- React StrictMode is disabled — incompatible with native PTY resource management
- `terminal.onTitleChange` auto-updates tab labels with current directory
- `macOptionIsMeta: true` for proper Option key behavior on macOS

### Layout System
- Each tab = 1 terminal with its own PTY (max 4 tabs)
- Layout modes: `single` | `split-h` | `split-v` | `grid`
- Split view shows EXISTING tabs side by side (does NOT create new terminals)
- Layout buttons pinned right in TabBar (shrink-0)
- Positions are persistent: tab order = layout position (no reorder on click)

### Sidebar
- Apple Notes style: floating glass panel with backdrop-blur
- Toggle via `Cmd+B` keyboard shortcut (no visible toggle button)
- ProjectTree: click folder = `cd` in active terminal; right-click = open new tab; auto-sort A-Z
- SSHTree: grouped connections with status indicators; click = open SSH tab

### Keyboard Shortcuts
- `Cmd+T` — new tab (max 4)
- `Cmd+W` — close active tab
- `Cmd+1-4` — switch to tab N
- `Cmd+B` — toggle sidebar
- `Cmd+F` — search in terminal

### Design
- macOS native title bar with `titleBarStyle: Overlay` (traffic lights in sidebar)
- Floating rounded panels (sidebar glass + content bg-primary)
- Dark theme default, Satoshi font UI, JetBrains Mono terminal
- Modals don't close on outside click — only via X button or Escape

## Commands

```bash
# Development
npm run tauri dev          # Run app (Vite + Rust hot reload)
npm run build              # Frontend build (tsc + vite)
npm run dev                # Vite dev server only

# Testing
npx vitest run             # Run all tests
npm run typecheck          # TypeScript check (tsc --noEmit)

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
npm run tauri build        # Build installer (per platform)
```

## Release Flow

```bash
# 1. Bump version in tauri.conf.json, package.json, Cargo.toml
# 2. Build with signing key
TAURI_SIGNING_PRIVATE_KEY="$(cat ~/.tauri/termlabs.key)" \
TAURI_SIGNING_PRIVATE_KEY_PASSWORD="" \
npm run tauri build

# 3. Create latest.json with signature from .sig file
# 4. Create GitHub Release
gh release create v0.x.0 \
  src-tauri/target/release/bundle/dmg/TermLabs_0.x.0_aarch64.dmg \
  src-tauri/target/release/bundle/macos/TermLabs.app.tar.gz \
  latest.json \
  --title "TermLabs v0.x.0" --notes "..."
```

- Signing key: `~/.tauri/termlabs.key` (KEEP SECRET)
- Public key: configured in `tauri.conf.json` plugins.updater.pubkey
- Updater endpoint: `https://github.com/memenng/termlabs/releases/latest/download/latest.json`
- Repo: `https://github.com/memenng/termlabs` (public)

## Install (macOS)

```bash
npm run tauri build
rm -rf /Applications/TermLabs.app
cp -R src-tauri/target/release/bundle/macos/TermLabs.app /Applications/
open /Applications/TermLabs.app
```

## Build Outputs
- macOS: `.dmg` + `.app` + `.tar.gz` (updater) + `.sig` (signature)
- Windows: `.msi` / `.exe`
- Linux: `.deb` / `.AppImage`

## Config Locations
- App settings: `~/.config/termlabs/settings.json` (via Tauri path API)
- SSH connections: `~/.config/termlabs/ssh_connections.json`
- Projects list: `~/.config/termlabs/projects.json`

## Nice to Have (Future)
- SFTP file browser
- Terminal color scheme picker
- Session restore on app restart
- Command snippets / palette
