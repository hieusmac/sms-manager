import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CSVUpload from "../components/CSVUpload";
import { DriverTable } from "../components/DriverTable";
import { SendAllButton } from "../components/SendAllButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { runWithConcurrency } from "../lib/queue";
import { checkStatus, sendSMS } from "../lib/sms";
import { loadCredentials, loadDrivers, saveDrivers } from "../lib/storage";
import type { Driver, DriverWithStatus, SMSStatus } from "../types";

interface MainPageProps {
	isSendAllRunning: boolean;
	onSendAllStateChange?: (running: boolean) => void;
}

function mapGatewayStateToStatus(state: string): SMSStatus {
	switch (state) {
		case "Pending":
			return "pending";
		case "Processed":
			return "processed";
		case "Sent":
			return "sent";
		case "Delivered":
			return "delivered";
		case "Failed":
			return "failed";
		default:
			return "pending";
	}
}

function toDriverWithStatus(driver: Driver): DriverWithStatus {
	return { ...driver, status: "idle" };
}

export function MainPage({
	isSendAllRunning,
	onSendAllStateChange,
}: MainPageProps) {
	const [drivers, setDrivers] = useState<DriverWithStatus[]>([]);
	const [globalMessage, setGlobalMessage] = useState("");
	const [isSendAllRunningLocal, setIsSendAllRunningLocal] = useState(false);
	const [sendAllSentCount, setSendAllSentCount] = useState(0);
	const [sendAllTotalCount, setSendAllTotalCount] = useState(0);
	const pollingIntervalsRef = useRef<
		Map<string, ReturnType<typeof setInterval>>
	>(new Map());
	const driversRef = useRef<DriverWithStatus[]>([]);

	useEffect(() => {
		const storedDrivers = loadDrivers();
		setDrivers(storedDrivers.map(toDriverWithStatus));

		return () => {
			pollingIntervalsRef.current.forEach((intervalId) => {
				clearInterval(intervalId);
			});
			pollingIntervalsRef.current.clear();
		};
	}, []);

	useEffect(() => {
		driversRef.current = drivers;
	}, [drivers]);

	const hasCredentials = loadCredentials() !== null;

	const sendableDrivers = useMemo(() => {
		return drivers.filter(
			(d) =>
				d.enabled &&
				d.status !== "pending" &&
				d.status !== "processed" &&
				d.status !== "sent",
		);
	}, [drivers]);

	const persistDrivers = useCallback((next: DriverWithStatus[]) => {
		saveDrivers(
			next.map(({ status, messageId, error, ...driver }) => ({
				...driver,
			})),
		);
	}, []);

	const handleUpload = useCallback((uploaded: Driver[]) => {
		const next = uploaded.map(toDriverWithStatus);
		setDrivers(next);

		pollingIntervalsRef.current.forEach((intervalId) =>
			clearInterval(intervalId),
		);
		pollingIntervalsRef.current.clear();
	}, []);

	const handleToggleEnabled = useCallback(
		(id: string, enabled: boolean) => {
			setDrivers((prev) => {
				const next = prev.map((d) => (d.id === id ? { ...d, enabled } : d));
				persistDrivers(next);
				return next;
			});
		},
		[persistDrivers],
	);

	const handleMessageChange = useCallback(
		(id: string, message: string) => {
			setDrivers((prev) => {
				const next = prev.map((d) => (d.id === id ? { ...d, message } : d));
				persistDrivers(next);
				return next;
			});
		},
		[persistDrivers],
	);

	const handleApplyGlobalMessage = useCallback(() => {
		setDrivers((prev) => {
			const next = prev.map((d) => ({ ...d, message: globalMessage }));
			persistDrivers(next);
			return next;
		});
	}, [globalMessage, persistDrivers]);

	const clearPolling = useCallback((driverId: string) => {
		const existing = pollingIntervalsRef.current.get(driverId);
		if (existing) {
			clearInterval(existing);
			pollingIntervalsRef.current.delete(driverId);
		}
	}, []);

	const startPolling = useCallback(
		(
			driverId: string,
			messageId: string,
			credentials: NonNullable<ReturnType<typeof loadCredentials>>,
		) => {
			clearPolling(driverId);

			const intervalId = setInterval(async () => {
				try {
					const statusResult = await checkStatus(messageId, credentials);
					const status = mapGatewayStateToStatus(statusResult.state);

					setDrivers((prev) =>
						prev.map((d) =>
							d.id === driverId
								? {
										...d,
										status,
										error:
											status === "failed"
												? d.error ||
													statusResult.recipients?.[0]?.error ||
													"Failed"
												: undefined,
									}
								: d,
						),
					);

					if (status === "delivered" || status === "failed") {
						clearPolling(driverId);
					}
				} catch (err) {
					const message = err instanceof Error ? err.message : "Request failed";
					setDrivers((prev) =>
						prev.map((d) =>
							d.id === driverId
								? { ...d, status: "failed", error: message }
								: d,
						),
					);
					clearPolling(driverId);
				}
			}, 1500);

			pollingIntervalsRef.current.set(driverId, intervalId);
		},
		[clearPolling],
	);

	const handleSend = useCallback(
		async (driverId: string) => {
			const driver = driversRef.current.find((d) => d.id === driverId);
			if (!driver) return;

			const credentials = loadCredentials();
			if (!credentials) return;

			setDrivers((prev) =>
				prev.map((d) =>
					d.id === driverId ? { ...d, status: "pending", error: undefined } : d,
				),
			);

			try {
				const result = await sendSMS(
					driver.phoneNumber,
					driver.message,
					credentials,
				);

				setDrivers((prev) =>
					prev.map((d) =>
						d.id === driverId
							? {
									...d,
									messageId: result.id,
								}
							: d,
					),
				);

				startPolling(driverId, result.id, credentials);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Request failed";
				setDrivers((prev) =>
					prev.map((d) =>
						d.id === driverId ? { ...d, status: "failed", error: message } : d,
					),
				);
			}
		},
		[startPolling],
	);

	const handleSendAll = useCallback(async () => {
		if (isSendAllRunningLocal) return;

		const credentials = loadCredentials();
		if (!credentials) return;

		if (sendableDrivers.length === 0) return;

		setIsSendAllRunningLocal(true);
		setSendAllSentCount(0);
		setSendAllTotalCount(sendableDrivers.length);
		onSendAllStateChange?.(true);

		try {
			const tasks = sendableDrivers.map((driver) => async () => {
				await handleSend(driver.id);
				setSendAllSentCount((c) => c + 1);
			});
			await runWithConcurrency(tasks, 5);
		} finally {
			setIsSendAllRunningLocal(false);
			onSendAllStateChange?.(false);
		}
	}, [
		handleSend,
		isSendAllRunningLocal,
		onSendAllStateChange,
		sendableDrivers,
	]);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
			<CSVUpload onUpload={handleUpload} />

			<div className="flex w-full flex-col gap-2 rounded-md border border-slate-800 bg-slate-950 p-3 sm:flex-row sm:items-center">
				<div className="text-sm font-medium text-slate-200">
					Set All Messages
				</div>
				<div className="flex flex-1 gap-2">
					<Input
						type="text"
						value={globalMessage}
						onChange={(e) => setGlobalMessage(e.target.value)}
						placeholder="Global message"
					/>
					<Button type="button" onClick={handleApplyGlobalMessage}>
						Apply
					</Button>
				</div>
			</div>

			<DriverTable
				drivers={drivers}
				onToggleEnabled={handleToggleEnabled}
				onMessageChange={handleMessageChange}
				onSend={handleSend}
				isSendAllRunning={isSendAllRunning}
				hasCredentials={hasCredentials}
			/>

			<SendAllButton
				onClick={handleSendAll}
				disabled={
					!hasCredentials ||
					sendableDrivers.length === 0 ||
					isSendAllRunningLocal
				}
				isRunning={isSendAllRunningLocal}
				sentCount={sendAllSentCount}
				totalCount={sendAllTotalCount}
			/>
		</div>
	);
}
