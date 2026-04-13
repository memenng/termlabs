import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconFolder,
  IconServer,
  IconSettings,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useTabStore } from "../../stores/tabStore";
import { cn } from "../../lib/cn";
import { ProjectTree } from "../sidebar/ProjectTree";
import { SSHTree } from "../sidebar/SSHTree";
import type { SshConnection } from "../../stores/sshStore";

interface SidebarProps {
  onNavigate: (view: "projects" | "ssh" | "settings" | "about") => void;
  activeView: string;
  onSshAdd: () => void;
  onSshEdit: (conn: SshConnection) => void;
  onKeyManager: () => void;
}

export function Sidebar({ onNavigate, activeView, onSshAdd, onSshEdit, onKeyManager }: SidebarProps) {
  const { open, toggle } = useSidebarStore();
  const { addTab } = useTabStore();

  // Keyboard shortcut: Cmd+B to toggle sidebar (like Apple Notes)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  const handleSshConnect = (conn: SshConnection) => {
    addTab({ label: conn.name, shellType: "ssh" });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="sidebar-glass glass-border flex flex-col h-full overflow-hidden shrink-0 relative z-10"
        >
          {/* Traffic light spacer + drag region */}
          <div data-tauri-drag-region className="h-[52px] shrink-0" />

          {/* Section switcher */}
          <div className="flex items-center gap-1 px-4 mb-3">
            <button
              onClick={() => onNavigate("projects")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide uppercase transition-all duration-150",
                activeView === "projects"
                  ? "bg-white/[0.08] text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <IconFolder size={13} stroke={1.8} />
              Projects
            </button>
            <button
              onClick={() => onNavigate("ssh")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide uppercase transition-all duration-150",
                activeView === "ssh"
                  ? "bg-white/[0.08] text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <IconServer size={13} stroke={1.8} />
              SSH
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-border mb-2" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-2">
            {activeView === "projects" && <ProjectTree />}
            {activeView === "ssh" && (
              <SSHTree
                onConnect={handleSshConnect}
                onAdd={onSshAdd}
                onEdit={onSshEdit}
                onKeyManager={onKeyManager}
              />
            )}
          </div>

          {/* Footer — settings & about */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate("settings")}
                className="flex items-center justify-center h-7 w-7 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/[0.05] transition-all duration-150"
                title="Settings"
              >
                <IconSettings size={15} stroke={1.6} />
              </button>
              <button
                onClick={() => onNavigate("about")}
                className="flex items-center justify-center h-7 w-7 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/[0.05] transition-all duration-150"
                title="About"
              >
                <IconInfoCircle size={15} stroke={1.6} />
              </button>
              <span className="ml-auto text-[10px] text-text-tertiary tracking-wider">
                ⌘B
              </span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
