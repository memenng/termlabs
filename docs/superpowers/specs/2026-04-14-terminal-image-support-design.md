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

### Section 2: Backend — Binary-safe PTY Data Streaming

Current PTY reader uses `String::from_utf8_lossy` which corrupts binary data in image escape sequences. Fix to binary-safe streaming.

**Changes in `src-tauri/src/pty/manager.rs`:**
- Replace `String::from_utf8_lossy` with base64 encoding of raw bytes before sending via Channel
- Update `PtyEvent::Data` to carry base64-encoded string

**Changes in `src/lib/ipc.ts`:**
- Update `PtyEvent` type — data field now contains base64-encoded string

**Changes in `src/hooks/useTerminal.ts`:**
- Decode base64 string back to `Uint8Array` on receive
- Use `terminal.write(Uint8Array)` instead of `terminal.write(string)` — xterm.js v6 natively supports binary write

**New data flow:**
```
PTY read (raw bytes)
  → base64 encode (Rust)
  → Channel send as string
  → base64 decode (JS)
  → terminal.write(Uint8Array)
```

Side benefit: fixes occasional corruption of emoji and special characters from `from_utf8_lossy`.

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

- `package.json` — add `@xterm/addon-image` dependency
- `src/hooks/useTerminal.ts` — load ImageAddon, switch to binary write
- `src/lib/ipc.ts` — update PtyEvent type for base64 data
- `src-tauri/src/pty/manager.rs` — base64 encode PTY output

## Out of Scope

- Kitty Graphics Protocol (future enhancement)
- Image caching/persistence across sessions
- Image export/save functionality
