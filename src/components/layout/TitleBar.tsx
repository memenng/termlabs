import { getCurrentWindow } from "@tauri-apps/api/window";
import { IconMinus, IconSquare, IconX } from "@tabler/icons-react";

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-8 bg-bg-secondary border-b border-border px-3 select-none shrink-0"
    >
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <span className="text-accent font-bold text-xs">&#9670; TermLabs</span>
      </div>

      <div className="flex items-center gap-0.5">
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
