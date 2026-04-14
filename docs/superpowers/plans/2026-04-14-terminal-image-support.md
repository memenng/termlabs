# Terminal Image Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline image rendering (iTerm2 IIP + Sixel) to TermLabs terminal via `@xterm/addon-image`.

**Architecture:** Install `@xterm/addon-image` and upgrade xterm packages to the beta channel for v6 compatibility. Load the addon in `useTerminal.ts` after the WebGL addon. No Rust backend changes needed — both image protocols use ASCII-safe encodings that pass through `String::from_utf8_lossy` without corruption.

**Tech Stack:** `@xterm/addon-image@0.10.0-beta.197`, `@xterm/xterm@6.1.0-beta.197`, matching beta addons

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Upgrade xterm packages to beta, add addon-image |
| `src/hooks/useTerminal.ts` | Modify | Import and load ImageAddon |

---

### Task 1: Upgrade xterm packages to beta channel

The stable `@xterm/addon-image@0.9.0` was built for xterm v5. The v6-compatible version (`0.10.0-beta`) requires `@xterm/xterm@^6.1.0-beta`. All xterm addons must be upgraded together to matching beta versions.

**Files:**
- Modify: `package.json` — dependencies section

- [ ] **Step 1: Upgrade all xterm packages**

Run:
```bash
npm install @xterm/xterm@6.1.0-beta.197 @xterm/addon-fit@0.12.0-beta.197 @xterm/addon-search@0.17.0-beta.197 @xterm/addon-webgl@0.20.0-beta.196 @xterm/addon-image@0.10.0-beta.197
```

Note: webgl is beta.196 (not .197) — that's the latest available for that addon.

Expected: All packages install without peer dependency warnings.

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run typecheck
```

Expected: PASS — no type errors. The xterm v6 beta API is compatible with existing usage (Terminal, FitAddon, WebglAddon, SearchAddon constructors unchanged).

- [ ] **Step 3: Verify app starts**

Run:
```bash
npm run tauri dev
```

Expected: App starts normally, terminal renders and works as before. No regressions from the xterm upgrade.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade xterm packages to beta channel for image addon compatibility"
```

---

### Task 2: Load ImageAddon in useTerminal

Add the `ImageAddon` import and load it in the terminal initialization sequence after the WebGL addon.

**Files:**
- Modify: `src/hooks/useTerminal.ts:1-5` (imports) and `src/hooks/useTerminal.ts:77-82` (after WebGL addon load)

- [ ] **Step 1: Add ImageAddon import**

Add to the imports at the top of `src/hooks/useTerminal.ts`:

```typescript
import { ImageAddon } from "@xterm/addon-image";
```

The full import block becomes:

```typescript
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { SearchAddon } from "@xterm/addon-search";
import { ImageAddon } from "@xterm/addon-image";
import { Channel } from "@tauri-apps/api/core";
import { ptySpawn, ptySpawnSsh, ptyWrite, ptyResize } from "../lib/ipc";
import type { PtyEvent } from "../lib/ipc";
import { useTabStore, type SshConfig } from "../stores/tabStore";
import "@xterm/xterm/css/xterm.css";
import "../styles/terminal.css";
```

- [ ] **Step 2: Load ImageAddon after WebGL addon**

Replace the WebGL addon loading block (lines 77-82):

```typescript
    try {
      const webglAddon = new WebglAddon();
      terminal.loadAddon(webglAddon);
    } catch {
      // WebGL not available, fall back to canvas renderer
    }
```

With:

```typescript
    try {
      const webglAddon = new WebglAddon();
      terminal.loadAddon(webglAddon);
    } catch {
      // WebGL not available, fall back to canvas renderer
    }

    const imageAddon = new ImageAddon({
      sixelSupport: true,
      sixelScrolling: true,
      sixelPaletteLimit: 256,
      iipSupport: true,
      storageLimit: 128,
      showPlaceholder: true,
    });
    terminal.loadAddon(imageAddon);
```

ImageAddon is loaded OUTSIDE the try/catch — it works with both WebGL and canvas renderers.

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npm run typecheck
```

Expected: PASS

- [ ] **Step 4: Verify app starts with image addon loaded**

Run:
```bash
npm run tauri dev
```

Expected: App starts normally, terminal works. No visible changes yet (just addon loaded).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTerminal.ts
git commit -m "feat: add inline image support (iTerm2 IIP + Sixel) via xterm addon-image"
```

---

### Task 3: Manual Verification

Test image rendering with CLI tools.

- [ ] **Step 1: Install test tools**

```bash
brew install viu
```

`viu` supports both iTerm2 IIP and Sixel protocols.

- [ ] **Step 2: Test iTerm2 inline image**

In TermLabs terminal, run:

```bash
viu /path/to/any/image.png
```

Expected: Image renders inline in the terminal. If `viu` doesn't auto-detect iTerm2 support, try:

```bash
viu -t /path/to/any/image.png
```

(`-t` forces iTerm2 protocol)

- [ ] **Step 3: Test Sixel rendering**

```bash
viu -s /path/to/any/image.png
```

(`-s` forces Sixel protocol)

Expected: Image renders inline using Sixel graphics.

- [ ] **Step 4: Test edge cases**

- Large image (>1MB): should render without freezing the UI
- Scroll past image: image stays in scroll buffer
- Multiple images in sequence: `ls *.png | xargs -I{} viu {}`
- Terminal resize while image is visible: image reflows correctly
- Split view: images render in both terminal panes

- [ ] **Step 5: Update design spec with findings**

If the Rust backend binary-safe change turned out NOT to be needed (as expected), update the design spec to reflect this simplification.
