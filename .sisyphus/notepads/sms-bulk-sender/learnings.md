# Learnings

## [2026-03-29] Session Start
- Stack: Bun + React 19 + Tailwind 4 + shadcn/ui
- android-sms-gateway has NO CORS → all calls must proxy through Bun backend
- API: `new Client(login, password, undefined, baseUrl)`, `client.send()`, `client.getState()`
- State-based routing ONLY (no react-router) — 2 pages: Main + Settings
- Dark mode ONLY — no toggle
- localStorage only — no DB
- Concurrency limit: 5 parallel sends for Send All
- shadcn missing components: switch, progress, table — install via `bunx shadcn@latest add`
- Template cleanup required: remove APITester.tsx, message-holder.tsx, logo.svg, react.svg
- body CSS has `grid place-items-center` + logo background animation — must remove
- Bun CLI may not be on PATH in this environment; `npx bun ...` worked as a fallback for install/dev commands.
- shadcn install created `src/components/ui/switch.tsx`, `progress.tsx`, and `table.tsx` plus existing ui primitives.
