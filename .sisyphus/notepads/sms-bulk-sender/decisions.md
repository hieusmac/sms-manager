# Decisions

## [2026-03-29] Architecture Decisions
- No react-router: state-based routing with useState for currentPage
- Credentials in headers: X-Gateway-Login, X-Gateway-Password, X-Gateway-URL
- Client per request (not singleton) to support header-based credentials
- CSV replaces all drivers (destructive, no merge)
- Progress bar: idle=hidden, pending=0% blue, processed=25% blue, sent=50% blue, delivered=100% green, failed=100% red
- Polling for status (not webhooks)
- runWithConcurrency() in src/lib/queue.ts for Send All
- Mock gateway listens on port 8080, main app on 4000
