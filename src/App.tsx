import { TerminalPane } from "./components/terminal/TerminalPane";

function App() {
  return (
    <div data-theme="dark" className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans">
      <TerminalPane id="main" />
    </div>
  );
}

export default App;
