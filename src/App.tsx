import { useEffect } from "react";
import { TabBar } from "./components/layout/TabBar";
import { TerminalTab } from "./components/terminal/TerminalTab";
import { useTabStore } from "./stores/tabStore";

function App() {
  const { tabs, addTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      addTab({ label: "Terminal 1" });
    }
  }, []);

  return (
    <div data-theme="dark" className="flex flex-col h-screen w-screen bg-bg-primary text-text-primary font-sans">
      <TabBar />
      <TerminalTab />
    </div>
  );
}

export default App;
