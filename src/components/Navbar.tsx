import { Home, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

type NavbarPage = "main" | "settings";

interface NavbarProps {
	currentPage: NavbarPage;
	onNavigate: (page: NavbarPage) => void;
}

const navItems = [
	{ page: "main" as const, label: "Main", icon: Home },
	{ page: "settings" as const, label: "Settings", icon: Settings },
];

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
	return (
		<nav className="fixed right-0 top-0 z-40 flex h-full w-16 flex-col items-stretch border-l border-border bg-card/95 py-4 shadow-lg backdrop-blur">
			<div className="flex flex-1 flex-col gap-2 px-2">
				{navItems.map(({ page, label, icon: Icon }) => {
					const isActive = currentPage === page;

					return (
						<Button
							key={page}
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => onNavigate(page)}
							aria-current={isActive ? "page" : undefined}
							className={[
								"h-auto w-full flex-1 flex-col gap-1 rounded-md px-1 py-3 text-xs transition-colors",
								isActive
									? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
							].join(" ")}
						>
							<Icon className="size-5" />
							<span className="leading-none">{label}</span>
						</Button>
					);
				})}
			</div>
		</nav>
	);
}

export default Navbar;
