import { useTerminal } from "../../hooks/useTerminal";

interface TerminalPaneProps {
  id: string;
  cwd?: string;
  shell?: string;
  onExit?: (id: string) => void;
}

export function TerminalPane({ id, cwd, shell, onExit }: TerminalPaneProps) {
  const { containerRef } = useTerminal({ id, cwd, shell, onExit });

  return (
    <div ref={containerRef} className="h-full w-full bg-bg-primary" />
  );
}
