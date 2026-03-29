import { useState } from "react";
import "./index.css";

export function App() {
  const [currentPage, setCurrentPage] = useState<"main" | "settings">("main");

  return (
    <div className="dark min-h-screen flex flex-col">
      <div className="flex gap-2 p-4">
        <button type="button" onClick={() => setCurrentPage("main")}>Main</button>
        <button type="button" onClick={() => setCurrentPage("settings")}>Settings</button>
      </div>
      <main className="flex flex-1 items-center justify-center">
        {currentPage === "main" ? <div>Main Page Placeholder</div> : <div>Settings Placeholder</div>}
      </main>
    </div>
  );
}

export default App;
