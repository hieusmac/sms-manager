import type { GatewayCredentials, SendSMSResponse } from "../types";

function buildGatewayHeaders(credentials: GatewayCredentials): HeadersInit {
	return {
		"Content-Type": "application/json",
		"X-Gateway-Login": credentials.login,
		"X-Gateway-Password": credentials.password,
		"X-Gateway-URL": credentials.serverUrl,
	};
}

export async function sendSMS(
	phoneNumber: string,
	message: string,
	credentials: GatewayCredentials,
): Promise<SendSMSResponse> {
	const response = await fetch("/api/sms/send", {
		method: "POST",
		headers: buildGatewayHeaders(credentials),
		body: JSON.stringify({ phoneNumber, message }),
	});

	const json = (await response.json()) as { error?: string } & SendSMSResponse;

	if (!response.ok || json.error) {
		throw new Error(json.error || "Request failed");
	}

	return json;
}

export async function checkStatus(
	messageId: string,
	credentials: GatewayCredentials,
): Promise<SendSMSResponse> {
	const response = await fetch(`/api/sms/status/${messageId}`, {
		method: "GET",
		headers: buildGatewayHeaders(credentials),
	});

	const json = (await response.json()) as { error?: string } & SendSMSResponse;

	if (!response.ok || json.error) {
		throw new Error(json.error || "Request failed");
	}

	return json;
}
