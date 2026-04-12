# TermLabs — TODO

## Done
- [x] Tauri v2 + React + TypeScript + Vite scaffold
- [x] Tailwind CSS v4 + Satoshi + JetBrains Mono fonts
- [x] Motion, Zustand, xterm.js, Tabler Icons
- [x] Rust PTY manager (spawn, write, resize, close + generation counter)
- [x] Frontend IPC layer + useTerminal hook
- [x] Single terminal rendering E2E
- [x] Tab store (Zustand) + tests
- [x] Animated TabBar (drag reorder, context menu, shell colors)
- [x] Wire tabs to terminal panes
- [x] Layout mode (single / split-h / split-v / grid max 4)
- [x] Aceternity-style collapsible sidebar (hover + pin)
- [x] Project manager (add folder, cd on click, right-click new tab)
- [x] SSH backend (CRUD, ~/.ssh/config import, key management)
- [x] SSH frontend (tree, form, key manager modals)
- [x] Settings store + modal (theme, font, cursor, shell, bell)
- [x] About modal (version, OS, update check)
- [x] Custom window title bar
- [x] GitHub Actions CI (lint, test, build x4 platforms)
- [x] ESLint + Prettier config
- [x] CLAUDE.md

## Bug Fixes Needed
- [ ] Test tombol + (add tab) — verify terminal muncul dan persist saat switch
- [ ] Test layout split/grid — verify terminal tetap hidup di semua mode
- [ ] Test folder click cd — verify cd jalan di terminal aktif
- [ ] Test close tab (X) — verify PTY di-close properly

## Next Up
- [ ] Wire SSH terminal session (click SSH connection → open SSH tab)
- [ ] SFTP file browser panel
- [ ] Keyboard shortcuts (customizable, wired to terminal actions)
- [ ] Auto-updater (Tauri updater endpoint setup)
- [ ] Polish Aceternity UI design (glassmorphism, gradients, transitions)
- [ ] Font loading: bundle Satoshi + JetBrains Mono locally (offline support)
- [ ] Search in terminal (wire SearchAddon UI)
- [ ] Tab label auto-detect (show current dir / process name)

## Nice to Have
- [ ] Drag tab to reorder in split/grid view
- [ ] Terminal themes / color scheme picker
- [ ] Import/export settings
- [ ] Session restore on app restart
- [ ] Notification on long-running command finish
- [ ] Snippets / command palette
