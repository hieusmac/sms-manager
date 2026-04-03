import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadCredentials, saveCredentials } from "../lib/storage";
import type { GatewayCredentials } from "../types";

type InlineStatus =
	| { kind: "idle" }
	| { kind: "success"; message: string }
	| { kind: "error"; message: string };

const EMPTY_CREDS: GatewayCredentials = {
	login: "",
	password: "",
	serverUrl: "",
};

function isNonEmpty(value: string): boolean {
	return value.trim().length > 0;
}

export default function SettingsPage() {
	const [form, setForm] = useState<GatewayCredentials>(EMPTY_CREDS);
	const [status, setStatus] = useState<InlineStatus>({ kind: "idle" });
	const [isTesting, setIsTesting] = useState(false);

	useEffect(() => {
		const stored = loadCredentials();
		if (stored) {
			setForm(stored);
		}
	}, []);

	const canSubmit = useMemo(() => {
		return (
			isNonEmpty(form.login) &&
			isNonEmpty(form.password) &&
			isNonEmpty(form.serverUrl)
		);
	}, [form.login, form.password, form.serverUrl]);

	function updateField<K extends keyof GatewayCredentials>(
		key: K,
		value: GatewayCredentials[K],
	) {
		setForm((prev) => ({ ...prev, [key]: value }));
		setStatus({ kind: "idle" });
	}

	function onSave() {
		if (!canSubmit) {
			setStatus({
				kind: "error",
				message: "Please fill in Login, Password, and Server URL.",
			});
			return;
		}

		saveCredentials({
			login: form.login.trim(),
			password: form.password,
			serverUrl: form.serverUrl.trim(),
		});
		setStatus({ kind: "success", message: "Saved settings." });
	}

	async function onTestConnection() {
		if (!canSubmit) {
			setStatus({
				kind: "error",
				message:
					"Please fill in Login, Password, and Server URL before testing.",
			});
			return;
		}

		setIsTesting(true);
		setStatus({ kind: "idle" });
		try {
			const response = await fetch("/api/sms/test", {
				method: "POST",
				headers: {
					"X-Gateway-Login": form.login.trim(),
					"X-Gateway-Password": form.password,
					"X-Gateway-URL": form.serverUrl.trim(),
				},
			});

			let payload: unknown = null;
			try {
				payload = (await response.json()) as unknown;
			} catch {
				payload = null;
			}

			const success =
				typeof payload === "object" &&
				payload !== null &&
				"success" in payload &&
				(payload as { success: unknown }).success === true;
			const errorMessage =
				typeof payload === "object" &&
				payload !== null &&
				"error" in payload &&
				typeof (payload as { error: unknown }).error === "string"
					? (payload as { error: string }).error
					: null;

			if (!response.ok || !success) {
				setStatus({
					kind: "error",
					message: errorMessage ?? "Connection test failed.",
				});
				return;
			}

			setStatus({ kind: "success", message: "Connection OK." });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Connection test failed.";
			setStatus({ kind: "error", message });
		} finally {
			setIsTesting(false);
		}
	}

	return (
		<div className="w-full px-4 py-10">
			<Card className="mx-auto w-full max-w-md py-4 shadow-md">
				<CardHeader className="px-5 pb-4">
					<CardTitle className="text-base tracking-tight">Settings</CardTitle>
				</CardHeader>
				<CardContent className="px-5">
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="settings-login">Login</Label>
							<Input
								id="settings-login"
								autoComplete="username"
								value={form.login}
								onChange={(e) => updateField("login", e.target.value)}
								placeholder="gateway login"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="settings-password">Password</Label>
							<Input
								id="settings-password"
								type="password"
								autoComplete="current-password"
								value={form.password}
								onChange={(e) => updateField("password", e.target.value)}
								placeholder="••••••••"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="settings-server-url">Server URL</Label>
							<Input
								id="settings-server-url"
								autoComplete="url"
								value={form.serverUrl}
								onChange={(e) => updateField("serverUrl", e.target.value)}
								placeholder="http://192.168.0.10:8080"
							/>
						</div>

						<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
							<Button type="button" onClick={onSave} className="sm:flex-1">
								Save
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={onTestConnection}
								disabled={isTesting}
								className="sm:flex-1"
							>
								{isTesting ? "Testing…" : "Test Connection"}
							</Button>
						</div>

						{status.kind !== "idle" ? (
							<p
								className={[
									"text-sm",
									status.kind === "success"
										? "text-emerald-400"
										: "text-destructive",
								].join(" ")}
							>
								{status.message}
							</p>
						) : null}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
