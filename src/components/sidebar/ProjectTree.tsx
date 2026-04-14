import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconFolder,
  IconFolderOpen,
  IconPlus,
  IconTrash,
  IconTerminal2,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useProjectStore, type Project } from "../../stores/projectStore";
import { useTabStore } from "../../stores/tabStore";
import { ptyWrite } from "../../lib/ipc";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  project: Project | null;
}

export function ProjectTree() {
  const { projects, fetchProjects, addProject, removeProject } =
    useProjectStore();
  const { tabs, addTab } = useTabStore();
  const [expanded, setExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    project: null,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAddProject = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") {
      const name = selected.split("/").pop() || selected;
      await addProject(name, selected);
    }
  }, [addProject]);

  const handleOpenTerminal = useCallback(
    async (project: Project) => {
      // cd to the project directory in the active terminal
      const state = useTabStore.getState();
      const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
      if (activeTab) {
        const escapedPath = project.path.replace(/'/g, "'\\''");
        try {
          await ptyWrite(activeTab.terminalId, `cd '${escapedPath}'\n`);
          return;
        } catch {
          // Write failed (terminal busy with running program) — open new tab instead
        }
      }
      addTab({ label: project.name, cwd: project.path });
    },
    [addTab]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, project: Project) => {
      e.preventDefault();
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, project });
    },
    []
  );

  const handleRemove = useCallback(() => {
    if (contextMenu.project) {
      removeProject(contextMenu.project.id);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [contextMenu.project, removeProject]);

  const handleOpenFromMenu = useCallback(() => {
    if (contextMenu.project) {
      // Right-click "Open in Terminal" always opens a new tab
      addTab({ label: contextMenu.project.name, cwd: contextMenu.project.path });
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [contextMenu.project, addTab]);

  const projectHasActiveTerminal = useCallback(
    (project: Project) => {
      return tabs.some((tab) => tab.cwd === project.path);
    },
    [tabs]
  );

  return (
    <div className="select-none">
      {/* Section header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-text-secondary uppercase tracking-wider hover:text-text-primary"
      >
        <div className="flex items-center gap-1">
          {expanded ? (
            <IconChevronDown size={12} />
          ) : (
            <IconChevronRight size={12} />
          )}
          <span>Projects</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddProject();
          }}
          className="text-text-secondary hover:text-text-primary p-0.5 rounded hover:bg-bg-tertiary/50"
          title="Add project folder"
        >
          <IconPlus size={14} />
        </button>
      </button>

      {/* Project list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-xs text-text-secondary italic">
                No projects yet
              </div>
            ) : (
              projects.map((project) => {
                const isActive = projectHasActiveTerminal(project);
                return (
                  <button
                    key={project.id}
                    onClick={() => handleOpenTerminal(project)}
                    onContextMenu={(e) => handleContextMenu(e, project)}
                    className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 rounded-md mx-1 transition-colors text-left"
                    title={project.path}
                  >
                    {isActive ? (
                      <IconFolderOpen
                        size={16}
                        className="shrink-0 text-accent"
                      />
                    ) : (
                      <IconFolder size={16} className="shrink-0" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu */}
      {contextMenu.visible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-bg-secondary border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleOpenFromMenu}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
          >
            <IconTerminal2 size={14} />
            <span>Open in Terminal</span>
          </button>
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-bg-tertiary/50"
          >
            <IconTrash size={14} />
            <span>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
}
