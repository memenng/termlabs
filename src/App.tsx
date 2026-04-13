import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { TabBar } from "./components/layout/TabBar";
import { Sidebar } from "./components/layout/Sidebar";
import { TerminalTab } from "./components/terminal/TerminalTab";
import { SettingsModal } from "./components/settings/SettingsModal";
import { AboutModal } from "./components/about/AboutModal";
import { SSHForm } from "./components/sidebar/SSHForm";
import { KeyManager } from "./components/sidebar/KeyManager";
import { useTabStore } from "./stores/tabStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useTheme } from "./hooks/useTheme";
import type { SshConnection } from "./stores/sshStore";

type ModalType = "settings" | "about" | "ssh-form" | "key-manager" | null;

function App() {
  const { tabs, addTab } = useTabStore();
  const { fetchSettings } = useSettingsStore();
  const [activeView, setActiveView] = useState<"projects" | "ssh">("projects");
  const [modal, setModal] = useState<ModalType>(null);
  const [editingSshConnection, setEditingSshConnection] =
    useState<SshConnection | null>(null);

  useTheme();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (tabs.length === 0) {
      addTab({ label: "Terminal 1" });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey) return;

      const state = useTabStore.getState();

      switch (e.key) {
        case "t": {
          e.preventDefault();
          if (state.tabs.length < 4) {
            state.addTab();
          }
          break;
        }
        case "w": {
          e.preventDefault();
          if (state.activeTabId) {
            state.removeTab(state.activeTabId);
          }
          break;
        }
        case "1":
        case "2":
        case "3":
        case "4": {
          const idx = Number(e.key) - 1;
          if (state.tabs[idx]) {
            e.preventDefault();
            state.setActiveTab(state.tabs[idx].id);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (view: "projects" | "ssh" | "settings" | "about") => {
    if (view === "settings") setModal("settings");
    else if (view === "about") setModal("about");
    else setActiveView(view);
  };

  const closeModal = () => {
    setModal(null);
    setEditingSshConnection(null);
  };

  return (
    <div className="h-screen w-screen bg-bg-secondary text-text-primary font-sans overflow-hidden flex gap-[1px] p-2 pt-0">
      {/* Sidebar panel — extends to top, traffic lights sit inside */}
      <Sidebar
        onNavigate={handleNavigate}
        activeView={activeView}
        onSshAdd={() => {
          setEditingSshConnection(null);
          setModal("ssh-form");
        }}
        onSshEdit={(conn) => {
          setEditingSshConnection(conn);
          setModal("ssh-form");
        }}
        onKeyManager={() => setModal("key-manager")}
      />

      {/* Content panel — extends to top */}
      <div className="flex flex-col flex-1 min-w-0 bg-bg-primary rounded-b-xl overflow-hidden">
        {/* Top area: drag region + tab bar, aligned with traffic lights */}
        <div
          data-tauri-drag-region
          className="shrink-0 flex items-end pt-[38px] px-1"
        >
          <TabBar />
        </div>

        {/* Terminal area */}
        <TerminalTab />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === "settings" && (
          <SettingsModal open={true} onClose={closeModal} />
        )}
        {modal === "about" && (
          <AboutModal open={true} onClose={closeModal} />
        )}
        {modal === "ssh-form" && (
          <SSHForm
            open={true}
            onClose={closeModal}
            editConnection={editingSshConnection}
          />
        )}
        {modal === "key-manager" && (
          <KeyManager open={true} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
