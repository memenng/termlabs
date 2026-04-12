# TermLabs — Design Specification

> Multi-terminal desktop app with tabs, split panes, project manager, and SSH manager.

## Overview

TermLabs is a cross-platform terminal emulator built with **Tauri v2** (Rust backend + React frontend). It provides a modern, visually polished terminal experience with browser-style tabs, flexible split panes, a project/SSH navigation sidebar, and full SSH key management.

**Target platforms:** macOS, Linux, Windows

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Tauri v2 (Rust + WebView) |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Aceternity UI |
| Animation | Motion (`motion/react`) |
| Terminal | xterm.js + WebGL addon |
| State | Zustand |
| Build tool | Vite |
| Fonts | Satoshi (UI), JetBrains Mono (terminal) |

## Layout

```
┌──────────┬────────────────────────────────────────────┐
│          │  [Tab 1] [Tab 2] [Tab 3]  [+]        ─ □ x│
│ SIDEBAR  ├────────────────────┬───────────────────────│
│          │                    │                       │
│ Projects │   Terminal 1       │   Terminal 2          │
│ SSH      │                    │                       │
│ Settings │                    │                       │
│ About    ├────────────────────┴───────────────────────│
│          │                                            │
│          │   Terminal 3 (full width)                   │
│          │                                            │
└──────────┴────────────────────────────────────────────┘
```

Three main areas:

1. **Sidebar (left)** — collapsible navigation pane
2. **Tab bar (top)** — browser-style terminal tabs
3. **Terminal area (center)** — split-able terminal panes

## Feature Details

### 1. Tab Bar

- Animated tabs with Motion — smooth transition on switch
- Drag to reorder tabs
- Right-click context menu: rename, duplicate, close
- `+` button for new tab
- Each tab has a color indicator based on shell type
- Close button on hover

### 2. Terminal Panes

- **Split modes:** horizontal and vertical via drag divider
- **Drag tab to split:** drag a tab into the terminal area to create a split
- **Free drag-and-drop:** drag tab to any position, resize freely (like VS Code panels)
- **Default grid-based** with ability to drag for rearrange
- Double-click divider to reset equal size
- xterm.js with WebGL renderer for performance
- Per-pane controls: shell selector, clear, search

### 3. Sidebar — Navigation Pane

**Structure:**

```
┌─────────────────────┐
│  ◆ TermLabs          │
│                      │
│  ▾ 📁 Projects       │
│    ├── termLabs      │
│    ├── myAPI         │
│    └── frontend-app  │
│                      │
│  ▾ 🌐 SSH Connections│
│    ├── production    │
│    │   ● online      │
│    ├── staging       │
│    │   ○ offline     │
│    └── dev-server    │
│        ● online      │
│                      │
│  ──────────────────  │
│  ⚙ Settings          │
│  ℹ About             │
└─────────────────────┘
```

- Collapsible with smooth animation (Aceternity Sidebar component)
- Hover to expand, click to pin open
- Tree structure with Projects & SSH Connections as groups
- Icons using Tabler Icons (Aceternity standard)

#### Projects

- Add folder via button or drag from Finder/Explorer
- Click folder → open new terminal tab at that folder
- Right-click → Open in terminal / Remove from list / Open in file manager
- Icon changes color when terminal is active in that folder

#### SSH Connections

- Status indicator: green dot = online, gray = offline (periodic ping check)
- Click → connect in new tab
- Right-click → Edit / Duplicate / Delete / Test connection
- Group by label (production, staging, dev)
- Import from `~/.ssh/config` with one button
- SSH key management:
  - Generate keys (Ed25519, RSA)
  - Import existing keys
  - Assign keys to connections
  - Key file browser
  - Port forwarding setup
  - SFTP file browser

### 4. Settings

- Theme toggle (dark default + light mode)
- Font size, font family
- Default shell per OS
- Keyboard shortcuts customization
- Terminal behavior: scroll buffer size, cursor style (block/underline/bar), bell on/off

### 5. About

- App name, logo, version (semver: e.g. v1.0.0)
- Build info: Tauri version, OS, architecture
- Links: GitHub repo, changelog, license
- Check for updates button (Tauri updater plugin)
- Credits & acknowledgements

## Backend Architecture (Rust)

### Module Structure

```
src-tauri/
├── src/
│   ├── main.rs              # Entry point
│   ├── pty/
│   │   ├── manager.rs       # PTY session lifecycle
│   │   └── handler.rs       # I/O stream handling
│   ├── ssh/
│   │   ├── connection.rs    # SSH session management
│   │   ├── config.rs        # Parse ~/.ssh/config
│   │   ├── keys.rs          # Key generation, import, storage
│   │   └── sftp.rs          # SFTP file operations
│   ├── config/
│   │   ├── app.rs           # App settings (theme, font, shortcuts)
│   │   └── projects.rs      # Saved projects list
│   ├── commands/             # Tauri IPC commands
│   │   ├── terminal.rs      # spawn, write, resize, close
│   │   ├── ssh.rs           # connect, disconnect, test, keys
│   │   ├── config.rs        # get/set settings
│   │   └── projects.rs      # add/remove/list projects
│   └── updater.rs           # Check for updates (Tauri updater plugin)
├── tests/
│   ├── pty_test.rs          # PTY spawn, write, resize, close
│   ├── ssh_test.rs          # SSH connect, auth, key management
│   ├── config_test.rs       # Settings read/write/migrate
│   └── integration/
│       ├── terminal_flow.rs # Full terminal lifecycle
│       └── ssh_flow.rs      # Full SSH connect → command → disconnect
├── Cargo.toml
└── tauri.conf.json
```

### Key Rust Crates

| Crate | Purpose |
|-------|---------|
| `portable-pty` | Cross-platform PTY spawning |
| `ssh2` | SSH2 protocol (libssh2 binding) |
| `russh-keys` | SSH key generation & parsing |
| `serde` / `serde_json` | Config serialization |
| `tauri-plugin-store` | Persistent key-value storage |
| `tauri-plugin-updater` | Auto-update support |
| `tokio` | Async runtime for SSH & PTY I/O |

### IPC Flow (Frontend ↔ Backend)

```
React                    Tauri IPC                 Rust
──────                   ─────────                 ────
User types          →    invoke("pty_write")    →  PTY write bytes
Terminal output     ←    event("pty_data")      ←  PTY read stream
Click SSH connect   →    invoke("ssh_connect")  →  SSH2 session
SSH output          ←    event("ssh_data")      ←  SSH channel stream
Resize terminal     →    invoke("pty_resize")   →  PTY resize signal
```

### Data Storage

- **App config:** `~/.config/termlabs/settings.json` (via Tauri path API per platform)
- **SSH connections:** `~/.config/termlabs/ssh_connections.json` (encrypted credentials)
- **Projects list:** `~/.config/termlabs/projects.json`

## Frontend Architecture (React)

### File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Main layout container
│   │   ├── Sidebar.tsx          # Aceternity Sidebar
│   │   ├── TabBar.tsx           # Animated tab bar
│   │   └── TitleBar.tsx         # Custom window title bar
│   ├── terminal/
│   │   ├── TerminalPane.tsx     # Single xterm.js instance
│   │   ├── SplitContainer.tsx   # Recursive split layout
│   │   └── TerminalTab.tsx      # Tab content wrapper
│   ├── sidebar/
│   │   ├── ProjectTree.tsx      # Project folder tree
│   │   ├── SSHTree.tsx          # SSH connections tree
│   │   ├── SSHForm.tsx          # Add/edit SSH connection
│   │   ├── KeyManager.tsx       # SSH key management UI
│   │   └── SFTPBrowser.tsx      # SFTP file browser panel
│   ├── settings/
│   │   ├── SettingsModal.tsx    # Settings overlay
│   │   ├── ThemeToggle.tsx      # Dark/light switch
│   │   └── ShortcutEditor.tsx   # Keybinding customization
│   ├── about/
│   │   └── AboutModal.tsx       # Version, credits, update check
│   └── ui/
│       └── ...                  # Aceternity components
├── hooks/
│   ├── useTerminal.ts           # xterm.js lifecycle hook
│   ├── usePTY.ts                # Tauri IPC for PTY
│   ├── useSSH.ts                # Tauri IPC for SSH
│   ├── useSplitPane.ts          # Split state management
│   └── useTheme.ts              # Theme state
├── stores/
│   ├── tabStore.ts              # Tab state (zustand)
│   ├── sidebarStore.ts          # Sidebar state
│   └── settingsStore.ts         # App settings
├── lib/
│   ├── keybindings.ts           # Shortcut registry
│   └── ipc.ts                   # Typed Tauri invoke wrappers
├── styles/
│   ├── app.css                  # Tailwind v4 entry (@import "tailwindcss")
│   ├── terminal.css             # xterm.js theme overrides
│   └── fonts.css                # Satoshi + JetBrains Mono
├── App.tsx
└── main.tsx
```

### Motion Animations

| Element | Animation |
|---------|-----------|
| Sidebar expand/collapse | `layout` animation |
| Tab switch | `AnimatePresence` + fade/slide |
| Split pane resize | Smooth divider drag |
| Modal open/close (Settings, About) | Scale + fade |
| SSH status indicator | Pulse animation for online |
| Context menu | Scale from origin point |

## Build & Test

### Rust (Backend)

| Step | Command | Description |
|------|---------|-------------|
| Dev mode | `cargo tauri dev` | Hot reload frontend + Rust rebuild |
| Lint | `cargo clippy -- -D warnings` | Zero warnings policy |
| Format | `cargo fmt --check` | Consistent formatting |
| Unit test | `cargo test` | All unit tests |
| Integration test | `cargo test --test '*'` | Tests in `tests/` folder |
| Build release | `cargo tauri build` | Produce installer per OS |

### Frontend

| Step | Command | Description |
|------|---------|-------------|
| Dev mode | `npm run dev` | Vite dev server |
| Lint | `eslint . --ext .ts,.tsx` | ESLint + TypeScript |
| Format | `prettier --check .` | Consistent formatting |
| Unit test | `vitest` | Component & utility tests |
| E2E test | `vitest --workspace e2e` | Terminal interaction tests |
| Type check | `tsc --noEmit` | TypeScript strict mode |
| Build | `npm run build` | Production bundle |

### CI/CD (GitHub Actions)

```yaml
on: [push, pull_request]
jobs:
  check:
    steps:
      - cargo fmt --check
      - cargo clippy -- -D warnings
      - cargo test
      - npm run lint
      - tsc --noEmit
      - vitest run
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    steps:
      - cargo tauri build
```

### Release

- Semantic versioning (v1.0.0)
- Build artifacts per platform:
  - macOS: `.dmg`
  - Windows: `.msi` / `.exe`
  - Linux: `.deb` / `.AppImage`
- Auto-update via Tauri updater plugin

## Design Language

- **Theme:** Dark default with light mode toggle
- **UI style:** Aceternity UI — glassmorphism, subtle gradients, smooth animations
- **Font UI:** Satoshi
- **Font terminal:** JetBrains Mono
- **Icons:** Tabler Icons (Aceternity standard)
- **Animations:** Motion (`motion/react`) — all transitions smooth and intentional
- **Colors:** Dark theme with accent colors for active states, subtle borders
