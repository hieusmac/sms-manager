# Issues

## [2026-03-29] Environment Notes
- `bun` was not available on PATH, so commands were executed via `npx bun` instead.
- `npx bunx shadcn@latest add ...` did not resolve cleanly; `npx --yes shadcn@latest add ...` completed successfully.
