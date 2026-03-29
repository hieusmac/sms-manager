import type React from "react";
import { useCallback, useRef, useState } from "react";
import { clearDrivers, saveDrivers } from "../lib/storage";
import type { Driver } from "../types";

type CSVUploadProps = {
	onUpload: (drivers: Driver[]) => void;
};

function normalizeHeaderValue(value: string): string {
	return value
		.replace(/^\uFEFF/, "")
		.trim()
		.replace(/\s+/g, " ")
		.toLowerCase();
}

function parseCsvLine(line: string): string[] {
	const cells: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i += 1) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i += 1;
				continue;
			}

			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			cells.push(current);
			current = "";
			continue;
		}

		current += char;
	}

	cells.push(current);
	return cells.map((c) => c.trim());
}

function parseDriversCsv(text: string): Driver[] {
	const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const lines = normalized
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	if (lines.length === 0) {
		throw new Error("CSV is empty");
	}

	const headerLine = lines[0];
	if (!headerLine) {
		throw new Error("CSV is empty");
	}

	const headerCells = parseCsvLine(headerLine);
	const headerIndexByName = new Map<string, number>();

	headerCells.forEach((cell, index) => {
		headerIndexByName.set(normalizeHeaderValue(cell), index);
	});

	const truckRegoIndex = headerIndexByName.get("truck rego");
	const firstNameIndex = headerIndexByName.get("first name");
	const phoneNumberIndex = headerIndexByName.get("phone number");

	if (
		truckRegoIndex === undefined ||
		firstNameIndex === undefined ||
		phoneNumberIndex === undefined
	) {
		const missing: string[] = [];
		if (truckRegoIndex === undefined) missing.push("Truck Rego");
		if (firstNameIndex === undefined) missing.push("First Name");
		if (phoneNumberIndex === undefined) missing.push("Phone Number");

		throw new Error(`Missing required column(s): ${missing.join(", ")}`);
	}

	const truckIndex = truckRegoIndex;
	const firstIndex = firstNameIndex;
	const phoneIndex = phoneNumberIndex;

	const drivers: Driver[] = [];

	for (const line of lines.slice(1)) {
		const cells = parseCsvLine(line);

		const truckRego = (cells[truckIndex] ?? "").trim();
		const firstName = (cells[firstIndex] ?? "").trim();
		const phoneNumber = (cells[phoneIndex] ?? "").trim();

		if (!truckRego && !firstName && !phoneNumber) {
			continue;
		}

		drivers.push({
			id: crypto.randomUUID(),
			truckRego,
			firstName,
			phoneNumber,
			message: "",
			enabled: true,
		});
	}

	return drivers;
}

export default function CSVUpload({ onUpload }: CSVUploadProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);

	const handleClearAll = useCallback(() => {
		clearDrivers();
		onUpload([]);
		setError(null);
		setFileName(null);
		setIsParsing(false);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, [onUpload]);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];

			setError(null);

			if (!file) {
				setFileName(null);
				return;
			}

			if (!file.name.toLowerCase().endsWith(".csv")) {
				setFileName(file.name);
				setError("Please upload a .csv file");
				return;
			}

			setFileName(file.name);
			setIsParsing(true);

			const reader = new FileReader();

			reader.onload = () => {
				try {
					const csvText = String(reader.result ?? "");
					const drivers = parseDriversCsv(csvText);

					saveDrivers(drivers);
					onUpload(drivers);
					setError(null);
				} catch (err) {
					const message =
						err instanceof Error ? err.message : "Invalid CSV file";
					setError(message);
				} finally {
					setIsParsing(false);
				}
			};

			reader.onerror = () => {
				setError("Failed to read file");
				setIsParsing(false);
			};

			reader.readAsText(file);
		},
		[onUpload],
	);

	return (
		<div className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-slate-100">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<label className="flex flex-1 flex-col gap-1">
					<span className="text-xs font-medium text-slate-300">
						Upload drivers CSV
					</span>
					<input
						ref={inputRef}
						type="file"
						accept=".csv,text/csv"
						onChange={handleFileChange}
						className="block w-full cursor-pointer rounded-md border border-slate-800 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-100 hover:file:bg-slate-700"
						disabled={isParsing}
					/>
				</label>

				<button
					type="button"
					onClick={handleClearAll}
					className="h-9 shrink-0 rounded-md border border-slate-800 bg-slate-900 px-3 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50"
					disabled={isParsing}
				>
					Clear All
				</button>
			</div>

			<div className="mt-2 flex flex-col gap-1">
				{fileName && (
					<div className="text-xs text-slate-400">
						Selected: <span className="text-slate-200">{fileName}</span>
					</div>
				)}

				{error && <div className="text-xs text-red-400">{error}</div>}
			</div>
		</div>
	);
}
