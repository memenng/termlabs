import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconServer,
  IconPlus,
  IconDownload,
  IconKey,
  IconChevronDown,
  IconChevronRight,
  IconTrash,
  IconCopy,
  IconEdit,
  IconPlugConnected,
  IconFolder,
} from "@tabler/icons-react";
import { useSshStore, type SshConnection } from "../../stores/sshStore";

interface SSHTreeProps {
  onConnect: (conn: SshConnection) => void;
  onAdd: () => void;
  onEdit: (conn: SshConnection) => void;
  onKeyManager: () => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  connection: SshConnection | null;
}

function StatusDot({ status }: { status: "online" | "offline" | "checking" }) {
  if (status === "online") {
    return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
    );
  }
  if (status === "checking") {
    return (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
      </span>
    );
  }
  return <span className="inline-flex rounded-full h-2 w-2 bg-neutral-500" />;
}

export function SSHTree({ onConnect, onAdd, onEdit, onKeyManager }: SSHTreeProps) {
  const { connections, statuses, fetchConnections, removeConnection, duplicateConnection, testConnection, importFromConfig } = useSshStore();
  const [expanded, setExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    connection: null,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, SshConnection[]> = {};
    for (const conn of connections) {
      const group = conn.group || "Ungrouped";
      if (!groups[group]) groups[group] = [];
      groups[group].push(conn);
    }
    return groups;
  }, [connections]);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, connection: SshConnection) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, connection });
  }, []);

  const handleImport = useCallback(async () => {
    await importFromConfig();
    await fetchConnections();
  }, [importFromConfig, fetchConnections]);

  const handleDelete = useCallback(() => {
    if (contextMenu.connection) {
      removeConnection(contextMenu.connection.id);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [contextMenu.connection, removeConnection]);

  const handleDuplicate = useCallback(() => {
    if (contextMenu.connection) {
      duplicateConnection(contextMenu.connection.id);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [contextMenu.connection, duplicateConnection]);

  const handleTest = useCallback(() => {
    if (contextMenu.connection) {
      testConnection(contextMenu.connection);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [contextMenu.connection, testConnection]);

  const handleEditFromMenu = useCallback(() => {
    if (contextMenu.connection) {
      onEdit(contextMenu.connection);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [contextMenu.connection, onEdit]);

  return (
    <div className="select-none">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-text-secondary uppercase tracking-wider hover:text-text-primary"
      >
        <div className="flex items-center gap-1">
          {expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
          <span>SSH Connections</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleImport(); }}
            className="text-text-secondary hover:text-text-primary p-0.5 rounded hover:bg-bg-tertiary/50"
            title="Import from ~/.ssh/config"
          >
            <IconDownload size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onKeyManager(); }}
            className="text-text-secondary hover:text-text-primary p-0.5 rounded hover:bg-bg-tertiary/50"
            title="Manage SSH keys"
          >
            <IconKey size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="text-text-secondary hover:text-text-primary p-0.5 rounded hover:bg-bg-tertiary/50"
            title="Add SSH connection"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {connections.length === 0 ? (
              <div className="px-4 py-2 text-xs text-text-secondary italic">
                No SSH connections yet
              </div>
            ) : (
              Object.entries(grouped).map(([group, conns]) => (
                <div key={group}>
                  {Object.keys(grouped).length > 1 && (
                    <button
                      onClick={() => toggleGroup(group)}
                      className="flex items-center gap-1 w-full px-4 py-1 text-xs text-text-secondary hover:text-text-primary"
                    >
                      {expandedGroups[group] === false ? (
                        <IconChevronRight size={10} />
                      ) : (
                        <IconChevronDown size={10} />
                      )}
                      <IconFolder size={12} />
                      <span>{group}</span>
                    </button>
                  )}
                  <AnimatePresence>
                    {expandedGroups[group] !== false && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="overflow-hidden"
                      >
                        {conns.map((conn) => (
                          <button
                            key={conn.id}
                            onClick={() => onConnect(conn)}
                            onContextMenu={(e) => handleContextMenu(e, conn)}
                            className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 rounded-md mx-1 transition-colors text-left"
                            title={`${conn.username}@${conn.host}:${conn.port}`}
                          >
                            <StatusDot status={statuses[conn.id] || "offline"} />
                            <IconServer size={14} className="shrink-0" />
                            <span className="truncate">{conn.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleEditFromMenu}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
          >
            <IconEdit size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
          >
            <IconCopy size={14} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleTest}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
          >
            <IconPlugConnected size={14} />
            <span>Test Connection</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-bg-tertiary/50"
          >
            <IconTrash size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
