import type { DriverWithStatus } from "../types";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { TableCell, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";

interface DriverRowProps {
	driver: DriverWithStatus;
	onToggleEnabled: (id: string, enabled: boolean) => void;
	onMessageChange: (id: string, message: string) => void;
	onSend: (id: string) => void;
	isSendAllRunning: boolean;
	hasCredentials: boolean;
}

function getProgressValue(status: DriverWithStatus["status"]): number | null {
	switch (status) {
		case "idle":
			return null;
		case "pending":
			return 0;
		case "processed":
			return 25;
		case "sent":
			return 50;
		case "delivered":
			return 100;
		case "failed":
			return 100;
		default:
			return null;
	}
}

function getProgressClassName(status: DriverWithStatus["status"]): string {
	if (status === "delivered") {
		return "[&>div]:bg-green-500";
	}

	if (status === "failed") {
		return "[&>div]:bg-red-500";
	}

	return "[&>div]:bg-blue-500";
}

export function DriverRow({
	driver,
	onToggleEnabled,
	onMessageChange,
	onSend,
	isSendAllRunning,
	hasCredentials,
}: DriverRowProps) {
	const disableSend =
		!hasCredentials ||
		!driver.enabled ||
		["pending", "processed", "sent"].includes(driver.status) ||
		isSendAllRunning;

	const progressValue = getProgressValue(driver.status);

	return (
		<TableRow>
			<TableCell className="w-12">
				<Switch
					checked={driver.enabled}
					onCheckedChange={() => onToggleEnabled(driver.id, !driver.enabled)}
					aria-label={`Enable ${driver.firstName} (${driver.truckRego})`}
				/>
			</TableCell>

			<TableCell className="whitespace-nowrap font-mono text-xs text-slate-200">
				{driver.truckRego}
			</TableCell>

			<TableCell className="whitespace-nowrap text-slate-100">
				{driver.firstName}
			</TableCell>

			<TableCell className="whitespace-nowrap font-mono text-xs text-slate-200">
				{driver.phoneNumber}
			</TableCell>

			<TableCell className="min-w-[260px]">
				<Textarea
					rows={2}
					value={driver.message}
					onChange={(e) => onMessageChange(driver.id, e.target.value)}
					placeholder="Message"
				/>
			</TableCell>

			<TableCell className="w-28">
				<Button
					type="button"
					onClick={() => onSend(driver.id)}
					disabled={disableSend}
					variant="secondary"
					className="w-full"
				>
					Send
				</Button>
			</TableCell>

			<TableCell className="w-56">
				{progressValue === null ? null : (
					<div className="flex flex-col gap-1">
						<Progress
							value={progressValue}
							className={getProgressClassName(driver.status)}
						/>
						{driver.status === "failed" && driver.error ? (
							<p className="text-xs text-red-400">{driver.error}</p>
						) : null}
					</div>
				)}
			</TableCell>
		</TableRow>
	);
}
