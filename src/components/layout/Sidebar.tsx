import { motion, AnimatePresence } from "motion/react";
import {
  IconFolder,
  IconServer,
  IconSettings,
  IconInfoCircle,
  IconLayoutSidebar,
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

  const handleSshConnect = (conn: SshConnection) => {
    addTab({ label: conn.name, shellType: "ssh" });
  };

  return (
    <>
      {/* Toggle button — always visible in the toolbar area */}
      <button
        onClick={toggle}
        className="fixed top-[10px] left-[76px] z-30 flex items-center justify-center h-7 w-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
        title={open ? "Hide sidebar" : "Show sidebar"}
      >
        <IconLayoutSidebar size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col h-full bg-bg-secondary/50 overflow-hidden shrink-0"
          >
            {/* Spacer for macOS traffic lights */}
            <div className="h-[52px] shrink-0" />

            {/* Navigation tabs */}
            <div className="flex items-center gap-0.5 px-3 mb-2">
              <button
                onClick={() => onNavigate("projects")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeView === "projects"
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
                )}
              >
                <IconFolder size={14} />
                Projects
              </button>
              <button
                onClick={() => onNavigate("ssh")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeView === "ssh"
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
                )}
              >
                <IconServer size={14} />
                SSH
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-1">
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

            {/* Footer */}
            <div className="flex items-center gap-1 px-3 py-2 border-t border-border/50">
              <button
                onClick={() => onNavigate("settings")}
                className="flex items-center justify-center h-7 w-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
                title="Settings"
              >
                <IconSettings size={16} />
              </button>
              <button
                onClick={() => onNavigate("about")}
                className="flex items-center justify-center h-7 w-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
                title="About"
              >
                <IconInfoCircle size={16} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
