type RecipientState = "Pending" | "Processed" | "Sent" | "Delivered" | "Failed";

type Recipient = {
  phoneNumber: string;
  state: RecipientState;
};

type MessageRecord = {
  message: string;
  state: RecipientState;
  recipients: Recipient[];
  createdAt: number;
};

const messages = new Map<string, MessageRecord>();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data: unknown, status = 200) {
  return withCors(
    Response.json(data, {
      status,
    }),
  );
}

function logRequest(req: Request) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${new URL(req.url).pathname}`);
}

function stateForElapsed(elapsed: number): RecipientState {
  if (elapsed < 500) return "Pending";
  if (elapsed < 1000) return "Processed";
  if (elapsed < 1500) return "Sent";
  return "Delivered";
}

function buildRecipients(phoneNumbers: string[], elapsed: number): Recipient[] {
  const progressed = stateForElapsed(elapsed);
  if (progressed !== "Delivered") {
    return phoneNumbers.map((phoneNumber) => ({ phoneNumber, state: progressed }));
  }

  return phoneNumbers.map((phoneNumber) => ({
    phoneNumber,
    state: phoneNumber.includes("FAIL") ? "Failed" : "Delivered",
  }));
}

Bun.serve({
  port: 8080,
  fetch(req) {
    logRequest(req);

    if (req.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/message") {
      return (async () => {
        const body = await req.json();
        const message = typeof body?.message === "string" ? body.message : "";
        const phoneNumbers = Array.isArray(body?.phoneNumbers)
          ? body.phoneNumbers.filter((value: unknown): value is string => typeof value === "string")
          : [];

        const id = `mock-${crypto.randomUUID()}`;
        messages.set(id, {
          message,
          state: "Pending",
          recipients: phoneNumbers.map((phoneNumber: unknown) => ({ phoneNumber, state: "Pending" })),
          createdAt: Date.now(),
        });

        return json({
          id,
          state: "Pending",
          recipients: phoneNumbers.map((phoneNumber: unknown) => ({ phoneNumber, state: "Pending" })),
        });
      })().catch(() => json({ error: "Invalid JSON" }, 400));
    }

    if (req.method === "GET" && url.pathname.startsWith("/message/")) {
      const id = url.pathname.slice("/message/".length);
      const record = messages.get(id);

      if (!record) {
        return json({ error: "Message not found" }, 404);
      }

      const elapsed = Date.now() - record.createdAt;
      const recipients = buildRecipients(record.recipients.map((recipient) => recipient.phoneNumber), elapsed);
      const overallState = elapsed < 500 ? "Pending" : elapsed < 1000 ? "Processed" : elapsed < 1500 ? "Sent" : recipients.some((recipient) => recipient.state === "Failed") ? "Failed" : "Delivered";

      messages.set(id, {
        ...record,
        state: overallState,
        recipients,
      });

      return json({
        id,
        message: record.message,
        state: overallState,
        recipients,
      });
    }

    return withCors(new Response("Not Found", { status: 404 }));
  },
});

console.log("Mock SMS gateway running on http://localhost:8080");
