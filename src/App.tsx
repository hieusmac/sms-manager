import { useState } from "react";

import { Navbar } from "./components/Navbar";
import { MainPage } from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";

import "./index.css";

export function App() {
	const [currentPage, setCurrentPage] = useState<"main" | "settings">("main");
	const [isSendAllRunning, setIsSendAllRunning] = useState(false);

	return (
		<div className="dark min-h-screen bg-background text-foreground">
			<Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
			<main className="pr-16">
				{currentPage === "main" ? (
					<MainPage
						isSendAllRunning={isSendAllRunning}
						onSendAllStateChange={setIsSendAllRunning}
					/>
				) : (
					<SettingsPage />
				)}
			</main>
		</div>
	);
}

export default App;
