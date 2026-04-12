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
