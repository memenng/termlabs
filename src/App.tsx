import { useEffect, useState } from "react";
import { TabBar } from "./components/layout/TabBar";
import { Sidebar } from "./components/layout/Sidebar";
import { TerminalTab } from "./components/terminal/TerminalTab";
import { useTabStore } from "./stores/tabStore";

function App() {
  const { tabs, addTab } = useTabStore();
  const [activeView, setActiveView] = useState("projects");

  useEffect(() => {
    if (tabs.length === 0) {
      addTab({ label: "Terminal 1" });
    }
  }, []);

  return (
    <div data-theme="dark" className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans">
      <Sidebar onNavigate={setActiveView} activeView={activeView} />
      <div className="flex flex-col flex-1 min-w-0">
        <TabBar />
        <TerminalTab />
      </div>
    </div>
  );
}

export default App;
