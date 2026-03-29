import { Send } from "lucide-react";

import { Button } from "./ui/button";

interface SendAllButtonProps {
	onClick: () => void;
	disabled: boolean;
	isRunning: boolean;
	sentCount: number;
	totalCount: number;
}

export function SendAllButton({
	onClick,
	disabled,
	isRunning,
	sentCount,
	totalCount,
}: SendAllButtonProps) {
	return (
		<Button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="fixed bottom-6 right-20 z-50 flex items-center gap-2 shadow-lg"
		>
			<Send className="size-4" />
			{isRunning ? `Sending ${sentCount}/${totalCount}` : "Send All"}
		</Button>
	);
}
