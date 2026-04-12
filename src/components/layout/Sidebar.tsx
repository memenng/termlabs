import { motion } from "motion/react";
import {
  IconFolder,
  IconServer,
  IconSettings,
  IconInfoCircle,
  IconPin,
  IconPinFilled,
} from "@tabler/icons-react";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useTabStore } from "../../stores/tabStore";
import { cn } from "../../lib/cn";
import { ProjectTree } from "../sidebar/ProjectTree";
import { SSHTree } from "../sidebar/SSHTree";
import type { SshConnection } from "../../stores/sshStore";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function SidebarItem({ icon, label, onClick, active }: SidebarItemProps) {
  const { open } = useSidebarStore();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors text-left",
        active
          ? "bg-bg-tertiary text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
      )}
    >
      <span className="shrink-0">{icon}</span>
      {open && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="text-sm truncate whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </button>
  );
}

interface SidebarProps {
  onNavigate: (view: "projects" | "ssh" | "settings" | "about") => void;
  activeView: string;
  onSshAdd: () => void;
  onSshEdit: (conn: SshConnection) => void;
  onKeyManager: () => void;
}

export function Sidebar({ onNavigate, activeView, onSshAdd, onSshEdit, onKeyManager }: SidebarProps) {
  const { open, pinned, setOpen, togglePin } = useSidebarStore();
  const { addTab } = useTabStore();

  const handleSshConnect = (conn: SshConnection) => {
    addTab({
      label: conn.name,
      shellType: "ssh",
    });
  };

  return (
    <motion.aside
      onMouseEnter={() => !pinned && setOpen(true)}
      onMouseLeave={() => !pinned && setOpen(false)}
      animate={{ width: open ? 220 : 56 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full bg-bg-secondary border-r border-border py-3 overflow-hidden shrink-0"
    >
      <div className="flex items-center gap-2 px-3 mb-4">
        <span className="text-accent font-bold text-lg shrink-0">&#9670;</span>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between flex-1"
          >
            <span className="font-semibold text-sm">TermLabs</span>
            <button
              onClick={togglePin}
              className="text-text-secondary hover:text-text-primary"
            >
              {pinned ? <IconPinFilled size={14} /> : <IconPin size={14} />}
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-2">
        <SidebarItem
          icon={<IconFolder size={20} />}
          label="Projects"
          onClick={() => onNavigate("projects")}
          active={activeView === "projects"}
        />
        <SidebarItem
          icon={<IconServer size={20} />}
          label="SSH Connections"
          onClick={() => onNavigate("ssh")}
          active={activeView === "ssh"}
        />
      </div>

      {/* Tree panels when sidebar is open */}
      {open && (
        <div className="flex-1 overflow-y-auto mt-2 border-t border-border pt-2">
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
      )}

      <div className="flex flex-col gap-1 px-2 border-t border-border pt-2 mt-2">
        <SidebarItem
          icon={<IconSettings size={20} />}
          label="Settings"
          onClick={() => onNavigate("settings")}
          active={false}
        />
        <SidebarItem
          icon={<IconInfoCircle size={20} />}
          label="About"
          onClick={() => onNavigate("about")}
          active={false}
        />
      </div>
    </motion.aside>
  );
}
