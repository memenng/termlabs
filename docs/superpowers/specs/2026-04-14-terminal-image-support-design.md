# Terminal Image Support — Design Spec

**Date:** 2026-04-14
**Status:** Approved
**Approach:** `@xterm/addon-image` (Approach A)

## Goal

Add inline image rendering to TermLabs terminal, supporting iTerm2 Inline Images Protocol (IIP) and Sixel graphics. This brings TermLabs to parity with modern terminals (iTerm2, Kitty, WezTerm) for image display.

## Architecture

### Section 1: Frontend — Addon Integration

Install and load `@xterm/addon-image` in the terminal rendering pipeline.

**Changes:**
- Install `@xterm/addon-image` package
- In `useTerminal.ts`, import and load `ImageAddon` after WebGL addon
- Addon load order: FitAddon → SearchAddon → WebglAddon → ImageAddon (ImageAddon requires renderer context from WebGL)

**ImageAddon configuration:**
- `sixelSupport: true` — Sixel graphics support (free bonus)
- `iip: true` — iTerm2 Inline Images Protocol
- `sixelPaletteLimit: 256` — Standard Sixel palette
- `storageLimit: 128` — Max images in scroll buffer to prevent memory bloat

### Section 2: Backend — No Changes Needed

After analysis, the Rust backend does NOT need changes. Both iTerm2 IIP (base64 payload) and Sixel (ASCII 0x3F-0x7E) protocols encode image data as ASCII-safe text. `String::from_utf8_lossy` passes them through without corruption. The addon handles reassembling escape sequences across multiple `terminal.write()` calls.

**Note:** Requires upgrading all xterm packages to beta channel (`6.1.0-beta.197`) since `@xterm/addon-image` stable (0.9.0) was built for xterm v5.

### Section 3: Testing & Verification

Manual verification (no unit tests needed — visual behavior):

1. `imgcat image.png` or `viu image.png` — image renders inline
2. `img2sixel image.png` — Sixel rendering works
3. Edge cases:
   - Large images (>1MB) render without freeze
   - Images scroll with buffer
   - Multiple consecutive images
   - Terminal resize with images present
   - Split view with images in both terminals

## Files Modified

- `package.json` — upgrade xterm packages to beta channel, add `@xterm/addon-image`
- `src/hooks/useTerminal.ts` — import and load ImageAddon

## Out of Scope

- Kitty Graphics Protocol (future enhancement)
- Image caching/persistence across sessions
- Image export/save functionality
