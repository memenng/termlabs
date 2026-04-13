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
    <div className="h-screen w-screen bg-transparent text-text-primary font-sans overflow-hidden flex flex-col">
      {/* Drag region for traffic lights */}
      <div data-tauri-drag-region className="h-[52px] shrink-0" />

      {/* Main layout: floating panels inside window */}
      <div className="flex flex-1 min-h-0 gap-[1px] px-2 pb-2">
        {/* Sidebar panel — rounded floating card */}
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

        {/* Content panel — rounded floating card */}
        <div className="flex flex-col flex-1 min-w-0 bg-bg-primary rounded-xl overflow-hidden">
          <TabBar />
          <TerminalTab />
        </div>
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
