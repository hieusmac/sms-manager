# sms-manager

A small Bun + React app (with Tailwind + UI primitives) that lets you manage and send SMS messages via an Android SMS gateway. The backend is a Bun server that acts as a proxy to `android-sms-gateway` and exposes a tiny HTTP API used by the frontend.

## Features

- Send single SMS messages via an Android SMS gateway
- Query message delivery status
- CSV upload support for bulk driver lists (example CSV included)
- Mock gateway for local testing

## Quick start

Requirements:
- Bun (recommended recent version)

Install dependencies:
```bash
bun install
```

Start development server (hot reload enabled):
```bash
bun dev
```

Start for production:
```bash
NODE_ENV=production bun src/index.ts
```

Run the mock gateway:
```bash
bun run mock-gateway
```

## API

All API endpoints expect the following HTTP headers with gateway credentials:

- `X-Gateway-Login`
- `X-Gateway-Password`
- `X-Gateway-URL`

### Endpoints:

- `POST /api/sms/send`  
  Body (JSON): `{ "phoneNumber": "<number>", "message": "<text>" }`  
  Returns: JSON with `id`, `state`, and `recipients` info.

- `GET /api/sms/status/:messageId`  
  Returns: JSON with `id`, `state`, and `recipients` info.

- `POST /api/sms/test`  
  Returns: `{ success: true }` if gateway reachable (the implementation checks for expected 404 behavior when probing a `__test__` id).

Example curl (send):
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -H "X-Gateway-Login: mylogin" \
  -H "X-Gateway-Password: mypassword" \
  -H "X-Gateway-URL: http://localhost:8080" \
  -d '{"phoneNumber": "myphonenumber", "message": "Hello from SMS Manager"}'
```

## Project layout

- `src/index.ts` — Bun server and API handlers
- `src/types.ts` — TypeScript types used across the project
- `src/index.html` — HTML entry that loads the frontend
- `src/frontend.tsx`, `src/App.tsx`, `src/components/*` — React frontend
- `scripts/mock-gateway.ts` — simple mock gateway for local development
- `examples/data/driver.csv` — sample CSV data

## Development notes

- Gateway credentials are passed per-request via headers — this keeps the server stateless with regard to gateway credentials.
- To switch to persistent credentials or env-configured credentials, modify `src/index.ts` to read from environment or a config store.
- No automated tests are included; consider adding unit tests for the HTTP handlers and frontend behavior.

## Contributing

- Open issues or send PRs.
- Keep changes small and focused. Update types in `src/types.ts` if API shapes change.

## License

MIT EOF
