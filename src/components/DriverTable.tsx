import type { DriverWithStatus } from "../types";
import { DriverRow } from "./DriverRow";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

interface DriverTableProps {
	drivers: DriverWithStatus[];
	onToggleEnabled: (id: string, enabled: boolean) => void;
	onMessageChange: (id: string, message: string) => void;
	onSend: (id: string) => void;
	isSendAllRunning: boolean;
	hasCredentials: boolean;
}

export function DriverTable({
	drivers,
	onToggleEnabled,
	onMessageChange,
	onSend,
	isSendAllRunning,
	hasCredentials,
}: DriverTableProps) {
	return (
		<div className="w-full overflow-hidden rounded-md border border-slate-800 bg-slate-950">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12">Switch</TableHead>
						<TableHead>Rego</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Phone</TableHead>
						<TableHead>Message</TableHead>
						<TableHead className="w-28">Send</TableHead>
						<TableHead className="w-56">Status</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{drivers.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={7}
								className="py-10 text-center text-sm text-slate-400"
							>
								Upload a CSV to add drivers.
							</TableCell>
						</TableRow>
					) : (
						drivers.map((driver) => (
							<DriverRow
								key={driver.id}
								driver={driver}
								onToggleEnabled={onToggleEnabled}
								onMessageChange={onMessageChange}
								onSend={onSend}
								isSendAllRunning={isSendAllRunning}
								hasCredentials={hasCredentials}
							/>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
