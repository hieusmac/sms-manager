import Client, { type HttpClient } from "android-sms-gateway";
import { serve } from "bun";
import index from "./index.html";

import type {
	GatewayCredentials,
	SendSMSRequest,
	SendSMSResponse,
} from "./types";

const CORS_HEADERS: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type, X-Gateway-Login, X-Gateway-Password, X-Gateway-URL",
};

function createFetchHttpClient() {
	const requestJson = async <T>(
		method: string,
		url: string,
		body: unknown,
		headers?: Record<string, string>,
	): Promise<T> => {
		const res = await fetch(url, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
		});

		const raw = await res.text();
		const parsed = raw.length ? (JSON.parse(raw) as unknown) : null;

		if (!res.ok) {
			const details =
				typeof parsed === "object" && parsed
					? `: ${raw}`
					: raw
						? `: ${raw}`
						: "";
			throw new Error(
				`Gateway request failed: HTTP ${res.status} ${res.statusText}${details}`,
			);
		}

		return parsed as T;
	};

	return {
		async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
			return requestJson<T>("GET", url, undefined, headers);
		},
		async post<T>(
			url: string,
			body: unknown,
			headers?: Record<string, string>,
		): Promise<T> {
			return requestJson<T>("POST", url, body, headers);
		},
		async put<T>(
			url: string,
			body: unknown,
			headers?: Record<string, string>,
		): Promise<T> {
			return requestJson<T>("PUT", url, body, headers);
		},
		async patch<T>(
			url: string,
			body: unknown,
			headers?: Record<string, string>,
		): Promise<T> {
			return requestJson<T>("PATCH", url, body, headers);
		},
		async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
			return requestJson<T>("DELETE", url, undefined, headers);
		},
	};
}

function corsResponse(status: number = 204) {
	return new Response(null, { status, headers: CORS_HEADERS });
}

function jsonResponse(data: unknown, status: number = 200) {
	return Response.json(data, { status, headers: CORS_HEADERS });
}

function getGatewayCredentialsFromHeaders(
	req: Request,
): GatewayCredentials | { error: string } {
	const login = req.headers.get("X-Gateway-Login")?.trim();
	const password = req.headers.get("X-Gateway-Password")?.trim();
	const serverUrl = req.headers.get("X-Gateway-URL")?.trim();

	if (!login || !password || !serverUrl) {
		return {
			error:
				"Missing gateway credentials headers. Required: X-Gateway-Login, X-Gateway-Password, X-Gateway-URL",
		};
	}

	return { login, password, serverUrl };
}

function getMessageIdFromRequest(req: Request): string | null {
	const anyReq = req as unknown as { params?: { messageId?: string } };
	if (anyReq.params?.messageId) return anyReq.params.messageId;
	const url = new URL(req.url);
	const parts = url.pathname.split("/").filter(Boolean);
	return parts.at(-1) ?? null;
}

const server = serve({
	routes: {
		"/api/sms/send": {
			async POST(req) {
				if (req.method === "OPTIONS") return corsResponse();

				const creds = getGatewayCredentialsFromHeaders(req);
				if ("error" in creds) return jsonResponse({ error: creds.error }, 400);

				let body: SendSMSRequest;
				try {
					body = (await req.json()) as SendSMSRequest;
				} catch {
					return jsonResponse({ error: "Invalid JSON body" }, 400);
				}

				const phoneNumber = body?.phoneNumber?.trim?.();
				const message = body?.message?.trim?.();

				if (!phoneNumber || !message) {
					return jsonResponse(
						{
							error:
								"Request body must include non-empty phoneNumber and message",
						},
						400,
					);
				}

				try {
					const client = new Client(
						creds.login,
						creds.password,
						undefined as unknown as HttpClient,
						creds.serverUrl,
					);
					(client as unknown as { httpClient: HttpClient }).httpClient = createFetchHttpClient();
					const result = (await client.send({
						message,
						phoneNumbers: [phoneNumber],
						withDeliveryReport: true,
					})) as unknown as SendSMSResponse;

					return jsonResponse({
						id: result.id,
						state: result.state,
						recipients: result.recipients,
					});
				} catch (e) {
					const message = e instanceof Error ? e.message : String(e);
					return jsonResponse({ error: message }, 500);
				}
			},
			OPTIONS() {
				return corsResponse();
			},
		},

		"/api/sms/status/:messageId": {
			async GET(req) {
				if (req.method === "OPTIONS") return corsResponse();

				const creds = getGatewayCredentialsFromHeaders(req);
				if ("error" in creds) return jsonResponse({ error: creds.error }, 400);

				const messageId = getMessageIdFromRequest(req);
				if (!messageId)
					return jsonResponse({ error: "Missing messageId in route" }, 400);

				try {
					const client = new Client(
						creds.login,
						creds.password,
						undefined as unknown as HttpClient,
						creds.serverUrl,
					);
					(client as unknown as { httpClient: HttpClient }).httpClient = createFetchHttpClient();
					const result = (await client.getState(
						messageId,
					)) as unknown as SendSMSResponse;
					return jsonResponse({
						id: result.id,
						state: result.state,
						recipients: result.recipients,
					});
				} catch (e) {
					const message = e instanceof Error ? e.message : String(e);
					return jsonResponse({ error: message }, 500);
				}
			},
			OPTIONS() {
				return corsResponse();
			},
		},

		"/api/sms/test": {
			async POST(req) {
				if (req.method === "OPTIONS") return corsResponse();

				const creds = getGatewayCredentialsFromHeaders(req);
				if ("error" in creds)
					return jsonResponse({ success: false, error: creds.error }, 400);

				try {
					const client = new Client(
						creds.login,
						creds.password,
						undefined as unknown as HttpClient,
						creds.serverUrl,
					);
					(client as unknown as { httpClient: HttpClient }).httpClient = createFetchHttpClient();

					try {
						await client.getState("__test__");
					} catch (e) {
						const msg = e instanceof Error ? e.message : String(e);
						if (/(\b404\b|not\s+found|message\s+not\s+found)/i.test(msg)) {
							return jsonResponse({ success: true });
						}
						throw e;
					}

					return jsonResponse({ success: true });
				} catch (e) {
					const message = e instanceof Error ? e.message : String(e);
					return jsonResponse({ success: false, error: message }, 200);
				}
			},
			OPTIONS() {
				return corsResponse();
			},
		},

		// Serve index.html for all unmatched routes.
		"/*": index,
	},

	development: process.env.NODE_ENV !== "production" && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
