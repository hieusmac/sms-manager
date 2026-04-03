# SMS Bulk Sender App

## TL;DR

> **Quick Summary**: Build a bulk SMS sender for truck transport company with driver table, CSV import, per-driver messaging, and integration with android-sms-gateway via Bun backend.
> 
> **Deliverables**:
> - Main page with driver table (switch, rego, name, phone, editable message, send button, progress bar)
> - Global "Set All Messages" input above table
> - Floating "Send All" button (sends to enabled drivers only)
> - Right-side navbar with Main/Settings navigation
> - Settings page with gateway credentials form + Test Connection
> - CSV upload to populate driver table
> - Bun backend API routes for SMS sending/status
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 7.5 → Task 8 → Task 9 → F1-F4

---

## Context

### Original Request
Build a bulk SMS sending app for truck transport company. Main page has table with driver rows (switch, driver info, send button, progress bar). Floating "Send All" button. Right-side navbar with Main/Settings pages. Settings has login form (username, password, local server URL). Backend integrates android-sms-gateway/client-ts. Modern, concise, compact, sleek design with React, Tailwind CSS, shadcn/ui, TypeScript.

### Interview Summary
**Key Discussions**:
- **Data source**: CSV upload (columns: Truck Rego, First Name, Phone Number)
- **Message handling**: Global "Set All Messages" input pre-fills all rows, each row still editable
- **Send All scope**: Only drivers with switch ON
- **Progress bar**: Delivery status (Pending → Sent → Delivered/Failed)
- **Send All behavior**: Parallel with concurrency limit (max 5)
- **Persistence**: localStorage for both drivers and credentials
- **Automated tests**: SKIP

**Research Findings**:
- **android-sms-gateway**: No CORS support — must proxy through Bun backend
- **API**: `send({ message, phoneNumbers })` → `{ id, state, recipients }`
- **Status polling**: `getState(messageId)` → Pending/Processed/Sent/Delivered/Failed
- **Existing codebase**: Bun + React 19 + Tailwind 4 + shadcn/ui (missing: switch, progress, table)

### Metis Review
**Identified Gaps** (addressed):
- No router — use state-based routing (2 pages only)
- Body CSS breaks sidebar — fix in Task 1
- Template artifacts — clean up in Task 1
- Concurrency — limit to 5 parallel sends
- Status polling — single loop, not N intervals
- Credentials validation — disable Send when no credentials

---

## Work Objectives

### Core Objective
Deliver a working bulk SMS sender app where users can upload drivers via CSV, edit messages per-driver, and send SMS messages individually or in bulk through the android-sms-gateway API.

### Concrete Deliverables
- `src/App.tsx` — Main app with state-based routing
- `src/pages/MainPage.tsx` — Driver table with all controls
- `src/pages/SettingsPage.tsx` — Gateway credentials form
- `src/components/Navbar.tsx` — Right-side navigation
- `src/components/DriverTable.tsx` — Table component with driver rows
- `src/components/DriverRow.tsx` — Individual row with switch, info, message, send, progress
- `src/components/CSVUpload.tsx` — File upload and parsing
- `src/components/SendAllButton.tsx` — Floating action button
- `src/types.ts` — Shared TypeScript types
- `src/lib/storage.ts` — localStorage utilities
- `src/lib/sms.ts` — Frontend SMS API client
- `src/index.ts` — Bun server with SMS API routes

### Definition of Done
- [ ] `bun dev` starts without errors
- [ ] `curl -X POST http://localhost:4000/api/sms/send ...` returns JSON with `id` and `state`
- [ ] CSV upload populates table and persists in localStorage
- [ ] Settings form saves/loads credentials from localStorage
- [ ] Send button on row sends SMS and updates progress bar
- [ ] Send All sends to enabled drivers with concurrency limit

### Must Have
- Switch toggle per row to enable/disable driver
- Editable message field per row
- "Set All Messages" global input
- Progress bar showing: Pending=0%, Processed=25%, Sent=50%, Delivered=100%, Failed=red
- Send All only processes enabled (switch ON) drivers
- Concurrency limit of 5 for Send All
- Test Connection button in Settings
- Disable Send/Send All when no credentials configured
- Dark mode theme (modern/sleek aesthetic)

### Must NOT Have (Guardrails)
- ❌ Message templates with variable interpolation ({name}, {rego})
- ❌ Message history or send logs
- ❌ Database or backend storage (localStorage only)
- ❌ App-level authentication (only gateway credentials)
- ❌ User management or multi-user support
- ❌ CSV export or reporting
- ❌ Retry logic for failed sends
- ❌ Scheduled/delayed sending
- ❌ Driver groups or categorization
- ❌ Webhook integration (polling only)
- ❌ Automated tests
- ❌ Dark/light mode toggle (dark only)
- ❌ Mobile responsive breakpoints

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (user choice)
- **Framework**: N/A

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation):
├── Task 1: Clean template + install dependencies [quick]
├── Task 2: Define types in src/types.ts [quick]
└── Task 3: Create localStorage utilities [quick]

Wave 2 (Pages + Backend — can parallelize):
├── Task 4: Settings page + credential form [visual-engineering]
├── Task 5: Backend SMS API routes [unspecified-high]
└── Task 6: Navbar component [quick]

Wave 3 (Main Page — depends on 2-6):
├── Task 7: CSV upload component [unspecified-high]
├── Task 7.5: Mock SMS gateway for QA [quick]
├── Task 8: Driver table + row components [visual-engineering]
└── Task 9: Send All button + concurrency [deep]

Wave FINAL (Verification):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Full QA scenarios [unspecified-high]
└── F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay

Critical Path: 1 → 3 → 5 → 7.5 → 8 → 9 → F1-F4 → user okay
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 3 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 2, 3, 4, 5, 6 |
| 2 | 1 | 4, 5, 7, 8, 9 |
| 3 | 1 | 4, 7, 8, 9 |
| 4 | 2, 3 | 9 |
| 5 | 2 | 8, 9 |
| 6 | 1 | 8 |
| 7 | 2, 3 | 8 |
| 7.5 | — | 8, 9, F3 |
| 8 | 2, 3, 5, 6, 7, 7.5 | 9 |
| 9 | 4, 5, 8 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1, T2, T3 → all `quick`
- **Wave 2**: 3 tasks — T4 → `visual-engineering`, T5 → `unspecified-high`, T6 → `quick`
- **Wave 3**: 4 tasks — T7 → `unspecified-high`, T7.5 → `quick`, T8 → `visual-engineering`, T9 → `deep`
- **FINAL**: 4 tasks — F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Clean Template + Install Dependencies

  **What to do**:
  - Delete template artifacts: `src/APITester.tsx`, `src/components/message-holder.tsx`, `src/logo.svg`, `src/react.svg`
  - Update `src/index.html`:
    - Line 6: Remove `<link rel="icon" type="image/svg+xml" href="./logo.svg" />` or replace with generic favicon
    - Line 7: Change `<title>Bun + React</title>` to `<title>SMS Manager</title>`
  - Update `src/index.css`:
    - Line 9: Change `grid place-items-center` to full-width layout (`flex flex-col` or remove grid)
    - Lines 13-25: Delete the entire `body::before` pseudo-element with logo.svg background
    - Lines 27-43: Delete `@keyframes slide` and `@keyframes spin` animations
  - Remove placeholder API routes from `src/index.ts` (keep server shell)
  - Update `src/App.tsx` to empty shell with state-based routing and `dark` class on root element
  - Run `bun add android-sms-gateway` to install SMS client
  - Run `bunx shadcn@latest add switch progress table` to add missing UI components

  **Must NOT do**:
  - Do not add any business logic yet
  - Do not create page components yet (just routing shell)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File deletions, package installs, simple edits — no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (first task)
  - **Blocks**: Tasks 2, 3, 4, 5, 6
  - **Blocked By**: None

  **References**:
  - `src/index.ts:10-23` — Current placeholder routes to remove
  - `src/App.tsx` — Template landing page to replace
  - `src/index.html:6-7` — Logo favicon and title to update
  - `src/index.css:9` — Body styles to fix (change `grid place-items-center`)
  - `src/index.css:13-43` — Background animation and keyframes to delete
  - `package.json` — Add android-sms-gateway dependency

  **Acceptance Criteria**:
  - [ ] `ls src/` shows NO `APITester.tsx`, `logo.svg`, `react.svg`
  - [ ] `ls src/components/` shows NO `message-holder.tsx`
  - [ ] `grep "android-sms-gateway" package.json` shows dependency
  - [ ] `ls src/components/ui/` shows `switch.tsx`, `progress.tsx`, `table.tsx`
  - [ ] `grep "logo.svg" src/index.html src/index.css` returns empty (no references)
  - [ ] `grep "SMS Manager" src/index.html` returns the title line
  - [ ] `bun dev` starts without errors

  **QA Scenarios**:
  ```
  Scenario: App loads with clean slate
    Tool: Bash (curl)
    Preconditions: bun dev running
    Steps:
      1. curl http://localhost:4000 -s -o /tmp/app-response.html
      2. grep -c "Bun + React" /tmp/app-response.html (expect 0)
      3. grep -c "SMS Manager" /tmp/app-response.html (expect 1)
      4. Check bun dev terminal for errors
    Expected Result: Title is "SMS Manager", no "Bun + React" text, no 404/500 errors
    Failure Indicators: "Bun + React" text present, missing title, server errors
    Evidence: .sisyphus/evidence/task-1-clean-load.txt

  Scenario: Dependencies installed correctly
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep "android-sms-gateway" package.json
      2. ls src/components/ui/switch.tsx src/components/ui/progress.tsx src/components/ui/table.tsx
      3. Verify all 3 files exist (exit code 0)
    Expected Result: Dependency in package.json, all 3 UI files exist
    Failure Indicators: Missing dependency or UI files
    Evidence: .sisyphus/evidence/task-1-deps.txt

  Scenario: No broken asset references
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -r "logo.svg" src/index.html src/index.css (expect no matches)
      2. grep -r "react.svg" src/ (expect no matches)
    Expected Result: No references to deleted assets
    Failure Indicators: Any grep match found
    Evidence: .sisyphus/evidence/task-1-no-broken-refs.txt
  ```

  **Commit**: YES
  - Message: `chore: clean template and install dependencies`
  - Files: `package.json`, `src/index.ts`, `src/App.tsx`, `src/index.css`, `src/index.html`, deleted files

- [x] 2. Define Shared Types

  **What to do**:
  - Create `src/types.ts` with TypeScript interfaces:
    - `Driver`: `{ id: string, truckRego: string, firstName: string, phoneNumber: string, message: string, enabled: boolean }`
    - `SMSStatus`: `'idle' | 'pending' | 'processed' | 'sent' | 'delivered' | 'failed'`
    - `DriverWithStatus`: `Driver & { status: SMSStatus, messageId?: string, error?: string }`
    - `GatewayCredentials`: `{ login: string, password: string, serverUrl: string }`
    - `SendSMSRequest`: `{ phoneNumber: string, message: string }`
    - `SendSMSResponse`: `{ id: string, state: string, recipients: Array<{ phoneNumber: string, state: string, error?: string }> }`

  **Must NOT do**:
  - Do not add any functions or logic — types only
  - Do not import from external packages in this file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file with type definitions only
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:
  - android-sms-gateway API: `MessageState` = `{ id, state, recipients }`, `ProcessState` = Pending|Processed|Sent|Delivered|Failed

  **Acceptance Criteria**:
  - [ ] `cat src/types.ts` shows all 6 type definitions
  - [ ] `bunx tsc --noEmit src/types.ts` passes with no errors

  **QA Scenarios**:
  ```
  Scenario: Types compile without errors
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. bunx tsc --noEmit src/types.ts
      2. Check exit code is 0
    Expected Result: No TypeScript errors
    Failure Indicators: Type errors in output
    Evidence: .sisyphus/evidence/task-2-types-check.txt
  ```

  **Commit**: NO (groups with Task 3)

- [x] 3. Create localStorage Utilities

  **What to do**:
  - Create `src/lib/storage.ts` with functions:
    - `STORAGE_KEYS = { DRIVERS: 'sms-manager-drivers', CREDENTIALS: 'sms-manager-credentials' }`
    - `saveDrivers(drivers: Driver[]): void`
    - `loadDrivers(): Driver[]`
    - `saveCredentials(creds: GatewayCredentials): void`
    - `loadCredentials(): GatewayCredentials | null`
    - `clearDrivers(): void`
  - All functions use `localStorage.getItem/setItem` with JSON.stringify/parse
  - Handle JSON parse errors gracefully (return empty array or null)

  **Must NOT do**:
  - Do not add validation logic
  - Do not add encryption for credentials

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple localStorage wrapper functions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:
  - `src/types.ts` — Import `Driver`, `GatewayCredentials` types

  **Acceptance Criteria**:
  - [ ] `cat src/lib/storage.ts` shows all 6 functions
  - [ ] `bunx tsc --noEmit src/lib/storage.ts` passes

  **QA Scenarios**:
  ```
  Scenario: Storage utilities compile
    Tool: Bash
    Preconditions: Task 2 complete
    Steps:
      1. bunx tsc --noEmit src/lib/storage.ts
    Expected Result: No errors
    Evidence: .sisyphus/evidence/task-3-storage-check.txt
  ```

  **Commit**: YES
  - Message: `feat: add types and localStorage utilities`
  - Files: `src/types.ts`, `src/lib/storage.ts`

- [x] 4. Settings Page + Credential Form

  **What to do**:
  - Create `src/pages/SettingsPage.tsx` with:
    - Form with 3 inputs: Username, Password, Server URL
    - Password input uses `type="password"`
    - "Save" button saves to localStorage via `saveCredentials()`
    - "Test Connection" button calls `POST /api/sms/test` to verify credentials
    - Show success/error toast on save and test
    - Load existing credentials on mount via `loadCredentials()`
  - Style: Card container, dark theme, compact layout using shadcn/ui components

  **Must NOT do**:
  - Do not add encryption
  - Do not add "remember me" checkbox (always persists)
  - Do not validate URL format beyond non-empty

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with styling, user interactions, toast feedback
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 2, 3

  **References**:
  - `src/APITester.tsx:39-79` — Form pattern with shadcn/ui Input, Button, Label
  - `src/components/ui/input.tsx` — Input component API
  - `src/components/ui/button.tsx` — Button component API
  - `src/components/ui/card.tsx` — Card wrapper pattern
  - `src/lib/storage.ts` — `saveCredentials`, `loadCredentials` functions

  **Acceptance Criteria**:
  - [ ] File exists at `src/pages/SettingsPage.tsx`
  - [ ] Form has 3 labeled inputs (username, password, server URL)
  - [ ] Save button persists to localStorage
  - [ ] Test Connection button exists (API route in Task 5)

  **QA Scenarios**:
  ```
  Scenario: Settings form saves credentials
    Tool: Playwright
    Preconditions: App running, navigate to Settings page
    Steps:
      1. Navigate to Settings page (click navbar link)
      2. Fill username input with "testuser"
      3. Fill password input with "testpass"
      4. Fill server URL input with "http://localhost:8080"
      5. Click "Save" button
      6. Open browser DevTools Console
      7. Run: JSON.parse(localStorage.getItem('sms-manager-credentials'))
    Expected Result: Object with login="testuser", password="testpass", serverUrl="http://localhost:8080"
    Failure Indicators: localStorage empty or wrong values
    Evidence: .sisyphus/evidence/task-4-settings-save.png

  Scenario: Settings form loads existing credentials
    Tool: Playwright
    Preconditions: localStorage has credentials from previous scenario
    Steps:
      1. Refresh page
      2. Navigate to Settings page
      3. Check input values
    Expected Result: All 3 inputs pre-filled with saved values
    Evidence: .sisyphus/evidence/task-4-settings-load.png
  ```

  **Commit**: NO (groups with Task 6)

- [x] 5. Backend SMS API Routes

  **What to do**:
  - Update `src/index.ts` to add 3 API routes:
    - `POST /api/sms/send` — Send single SMS
      - Read credentials from headers: `X-Gateway-Login`, `X-Gateway-Password`, `X-Gateway-URL`
      - Read body: `{ phoneNumber: string, message: string }`
      - Create `new Client(login, password, undefined, serverUrl)` per request
      - Call `client.send({ message, phoneNumbers: [phoneNumber], withDeliveryReport: true })`
      - Return `{ id, state, recipients }` or `{ error: string }`
    - `GET /api/sms/status/:messageId` — Check message status
      - Read credentials from headers
      - Call `client.getState(messageId)`
      - Return `{ id, state, recipients }`
    - `POST /api/sms/test` — Test connection
      - Read credentials from headers
      - Create client, call `client.getHealth()` or try a lightweight operation
      - Return `{ success: true }` or `{ success: false, error: string }`
  - Import from `android-sms-gateway` package

  **Must NOT do**:
  - Do not store Client instance globally (create per-request)
  - Do not add retry logic
  - Do not log credentials

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Backend API integration with external library, error handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 2

  **References**:
  - `src/index.ts:4-31` — Existing Bun.serve() route pattern
  - android-sms-gateway API: `new Client(login, password, httpClient?, baseUrl?)`, `client.send()`, `client.getState()`
  - `src/types.ts` — `SendSMSRequest`, `SendSMSResponse` types

  **Acceptance Criteria**:
  - [ ] `POST /api/sms/send` accepts JSON body and returns JSON response
  - [ ] `GET /api/sms/status/:messageId` returns status JSON
  - [ ] `POST /api/sms/test` returns `{ success: boolean }`
  - [ ] All routes read credentials from X-Gateway-* headers

  **QA Scenarios**:
  ```
  Scenario: Send SMS API route responds
    Tool: Bash (curl)
    Preconditions: bun dev running
    Steps:
      1. curl -X POST http://localhost:4000/api/sms/send \
           -H "Content-Type: application/json" \
           -H "X-Gateway-Login: test" \
           -H "X-Gateway-Password: test" \
           -H "X-Gateway-URL: http://localhost:8080" \
           -d '{"phoneNumber":"+1234567890","message":"Hello"}'
      2. Check response is valid JSON with id or error field
    Expected Result: JSON response with structure { id, state, recipients } or { error }
    Failure Indicators: Non-JSON response, 500 error without body
    Evidence: .sisyphus/evidence/task-5-send-api.txt

  Scenario: Status API route responds
    Tool: Bash (curl)
    Preconditions: bun dev running
    Steps:
      1. curl http://localhost:4000/api/sms/status/test-id \
           -H "X-Gateway-Login: test" \
           -H "X-Gateway-Password: test" \
           -H "X-Gateway-URL: http://localhost:8080"
    Expected Result: JSON response with state field or error
    Evidence: .sisyphus/evidence/task-5-status-api.txt

  Scenario: Test connection API route responds
    Tool: Bash (curl)
    Preconditions: bun dev running
    Steps:
      1. curl -X POST http://localhost:4000/api/sms/test \
           -H "X-Gateway-Login: test" \
           -H "X-Gateway-Password: test" \
           -H "X-Gateway-URL: http://localhost:8080"
    Expected Result: JSON { success: true } or { success: false, error: "..." }
    Evidence: .sisyphus/evidence/task-5-test-api.txt
  ```

  **Commit**: YES
  - Message: `feat: add SMS backend API routes`
  - Files: `src/index.ts`

- [x] 6. Navbar Component

  **What to do**:
  - Create `src/components/Navbar.tsx`:
    - Positioned on the RIGHT side of the screen
    - Vertical list with 2 navigation items: "Main" and "Settings"
    - Compact, sleek design with icons (use lucide-react)
    - Accept `currentPage` prop and `onNavigate` callback
    - Highlight active page
  - Style: Dark background, minimal width (~60-80px), fixed position

  **Must NOT do**:
  - Do not use react-router (state-based routing)
  - Do not add dropdown menus or nested navigation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple static component with props
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:
  - `lucide-react` — Icons: `Home`, `Settings` from package already installed
  - `src/components/ui/button.tsx` — Button with `variant="ghost"` for nav items

  **Acceptance Criteria**:
  - [ ] File exists at `src/components/Navbar.tsx`
  - [ ] Renders 2 navigation items with icons
  - [ ] Accepts `currentPage` and `onNavigate` props
  - [ ] Active page is visually highlighted

  **QA Scenarios**:
  ```
  Scenario: Navbar renders with correct items
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to http://localhost:4000
      2. Look for navbar on right side
      3. Verify "Main" and "Settings" items visible
      4. Click "Settings"
      5. Verify page changes and Settings is highlighted
    Expected Result: Navigation works, active state visible
    Evidence: .sisyphus/evidence/task-6-navbar.png
  ```

  **Commit**: YES
  - Message: `feat: add navbar and settings page`
  - Files: `src/components/Navbar.tsx`, `src/pages/SettingsPage.tsx`

- [x] 7. CSV Upload Component

  **What to do**:
  - Create `src/components/CSVUpload.tsx`:
    - File input accepting `.csv` files only
    - Parse CSV with columns: `Truck Rego, First Name, Phone Number` (header row expected)
    - Convert to `Driver[]` array, generating UUID for each driver's `id`
    - Set `enabled: true` and `message: ''` as defaults
    - Save to localStorage via `saveDrivers()`
    - Call `onUpload(drivers)` callback to parent
    - Show file name after selection
    - "Clear All" button to clear drivers from storage
  - Handle errors: invalid CSV format, missing columns

  **Must NOT do**:
  - Do not support Excel (.xlsx) files
  - Do not merge with existing drivers (replace all)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: File parsing, data transformation, error handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7.5)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 2, 3

  **References**:
  - Web API: `FileReader.readAsText()` for reading CSV content
  - `src/types.ts` — `Driver` type
  - `src/lib/storage.ts` — `saveDrivers()`, `clearDrivers()` functions

  **Acceptance Criteria**:
  - [ ] File exists at `src/components/CSVUpload.tsx`
  - [ ] Accepts CSV file and parses to Driver array
  - [ ] Saves parsed drivers to localStorage
  - [ ] Calls onUpload callback with drivers

  **QA Scenarios**:
  ```
  Scenario: CSV upload parses and saves drivers
    Tool: Playwright
    Preconditions: App running, test CSV file created with content:
      Truck Rego,First Name,Phone Number
      ABC123,John,+61412345678
      XYZ789,Jane,+61498765432
    Steps:
      1. Navigate to Main page
      2. Click file upload input
      3. Select test CSV file
      4. Open DevTools Console
      5. Run: JSON.parse(localStorage.getItem('sms-manager-drivers'))
    Expected Result: Array with 2 drivers, each having truckRego, firstName, phoneNumber, id, enabled=true, message=""
    Evidence: .sisyphus/evidence/task-7-csv-upload.png

  Scenario: Invalid CSV shows error
    Tool: Playwright
    Preconditions: CSV file with wrong columns
    Steps:
      1. Upload CSV with missing "Phone Number" column
    Expected Result: Error message displayed, no drivers saved
    Evidence: .sisyphus/evidence/task-7-csv-error.png
  ```

  **Commit**: NO (groups with Task 8)

- [x] 7.5. Mock SMS Gateway for QA

  **What to do**:
  - Create `scripts/mock-gateway.ts` — A simple Bun HTTP server that mocks android-sms-gateway API:
    - `POST /message` — Accept send request, return `{ id: "mock-{uuid}", state: "Pending", recipients: [{ phoneNumber, state: "Pending" }] }`
    - `GET /message/:id` — Return message status, simulate state progression:
      - First call: `state: "Pending"`
      - After 500ms: `state: "Processed"`
      - After 1000ms: `state: "Sent"`
      - After 1500ms: `state: "Delivered"` (or `"Failed"` for phone numbers containing "FAIL")
    - Store message states in memory (Map)
    - Listen on port 8080
  - Add npm script in `package.json`: `"mock-gateway": "bun run scripts/mock-gateway.ts"`
  - Document usage: Run `bun run mock-gateway` in separate terminal before QA

  **Must NOT do**:
  - Do not add complex validation
  - Do not persist to disk
  - Do not add authentication (accept any credentials)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple mock server, no business logic complexity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Tasks 8, 9, F3
  - **Blocked By**: None

  **References**:
  - android-sms-gateway REST API endpoints: `POST /message`, `GET /message/:id`
  - Bun.serve() pattern from `src/index.ts`

  **Acceptance Criteria**:
  - [ ] File exists at `scripts/mock-gateway.ts`
  - [ ] `bun run mock-gateway` starts server on port 8080
  - [ ] `curl -X POST http://localhost:8080/message -d '{"message":"test","phoneNumbers":["+1234"]}' -H "Content-Type: application/json"` returns JSON with id and Pending state
  - [ ] Subsequent GET requests show state progression

  **QA Scenarios**:
  ```
  Scenario: Mock gateway accepts send request
    Tool: Bash (curl)
    Preconditions: bun run mock-gateway running in separate terminal
    Steps:
      1. curl -X POST http://localhost:8080/message \
           -H "Content-Type: application/json" \
           -d '{"message":"Hello","phoneNumbers":["+61412345678"]}'
      2. Parse response JSON
    Expected Result: { "id": "mock-...", "state": "Pending", "recipients": [{"phoneNumber": "+61412345678", "state": "Pending"}] }
    Evidence: .sisyphus/evidence/task-7.5-mock-send.txt

  Scenario: Mock gateway returns progressive states
    Tool: Bash (curl)
    Preconditions: Mock gateway running, previous send returned id "mock-abc123"
    Steps:
      1. curl http://localhost:8080/message/mock-abc123 (immediately) → expect Pending
      2. sleep 0.6 && curl http://localhost:8080/message/mock-abc123 → expect Processed
      3. sleep 0.6 && curl http://localhost:8080/message/mock-abc123 → expect Sent
      4. sleep 0.6 && curl http://localhost:8080/message/mock-abc123 → expect Delivered
    Expected Result: State progresses: Pending → Processed → Sent → Delivered
    Evidence: .sisyphus/evidence/task-7.5-mock-states.txt

  Scenario: Mock gateway simulates failure
    Tool: Bash (curl)
    Preconditions: Mock gateway running
    Steps:
      1. curl -X POST http://localhost:8080/message \
           -d '{"message":"test","phoneNumbers":["+FAIL123"]}' -H "Content-Type: application/json"
      2. Wait 2s, then GET the message status
    Expected Result: Final state is "Failed" for phone numbers containing "FAIL"
    Evidence: .sisyphus/evidence/task-7.5-mock-failure.txt
  ```

  **Commit**: YES
  - Message: `chore: add mock SMS gateway for QA testing`
  - Files: `scripts/mock-gateway.ts`, `package.json`

- [x] 8. Driver Table + Row Components

  **What to do**:
  - Create `src/pages/MainPage.tsx`:
    - Load drivers from localStorage on mount
    - Render CSVUpload component at top
    - "Set All Messages" input that updates all driver messages
    - Render DriverTable component
    - Integrate with SendAllButton (Task 9)
  - Create `src/components/DriverTable.tsx`:
    - Use shadcn/ui Table component
    - Columns: Switch | Truck Rego | First Name | Phone | Message | Send | Progress
    - Render DriverRow for each driver
  - Create `src/components/DriverRow.tsx`:
    - Switch toggle (updates driver.enabled in state and localStorage)
    - Display: truckRego, firstName, phoneNumber (read-only)
    - Editable Textarea for message
    - "Send" Button (disabled if credentials missing or already sending)
    - Progress bar showing status:
      - idle: hidden or 0%
      - pending: 0%, blue
      - processed: 25%, blue
      - sent: 50%, blue
      - delivered: 100%, green
      - failed: 100%, red with error text
  - Create `src/lib/sms.ts`:
    - `sendSMS(phoneNumber, message, credentials): Promise<SendSMSResponse>`
    - `checkStatus(messageId, credentials): Promise<SendSMSResponse>`
    - Both call backend API routes with credentials in headers
  - Implement single-driver send flow:
    - Click Send → call sendSMS → update status to pending → start polling checkStatus → update progress bar

  **Must NOT do**:
  - Do not implement Send All yet (Task 9)
  - Do not add inline editing of phone/name

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex table UI with multiple interactive components, status visualization
  - **Skills**: [`playwright`]
    - `playwright`: For verifying table interactions and status updates

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after 7, 7.5)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 2, 3, 5, 6, 7, 7.5

  **References**:
  - `src/components/ui/table.tsx` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
  - `src/components/ui/switch.tsx` — Switch component
  - `src/components/ui/progress.tsx` — Progress component
  - `src/components/ui/textarea.tsx` — Textarea for message
  - `src/types.ts` — `Driver`, `DriverWithStatus`, `SMSStatus`
  - `src/lib/storage.ts` — `loadDrivers()`, `saveDrivers()`
  - `scripts/mock-gateway.ts` — Mock SMS gateway for QA testing

  **Acceptance Criteria**:
  - [ ] Main page renders driver table with all columns
  - [ ] Switch toggles driver.enabled and persists to localStorage
  - [ ] Message textarea is editable per-row
  - [ ] "Set All Messages" input updates all drivers
  - [ ] Send button calls API and updates progress bar
  - [ ] Progress bar reflects status (colors per state)

  **QA Scenarios**:
  ```
  Scenario: Table renders with uploaded drivers
    Tool: Playwright
    Preconditions: CSV uploaded with 2 drivers
    Steps:
      1. Navigate to Main page
      2. Verify table shows 2 rows
      3. Each row has: switch, rego, name, phone, message input, send button, progress bar
    Expected Result: All elements visible and populated with driver data
    Evidence: .sisyphus/evidence/task-8-table-render.png

  Scenario: Switch toggle persists
    Tool: Playwright
    Preconditions: Drivers loaded
    Steps:
      1. Toggle first driver's switch OFF
      2. Refresh page
      3. Check switch state
    Expected Result: Switch still OFF after refresh
    Evidence: .sisyphus/evidence/task-8-switch-persist.png

  Scenario: Set All Messages updates all rows
    Tool: Playwright
    Preconditions: 2 drivers loaded
    Steps:
      1. Type "Hello drivers" in "Set All Messages" input
      2. Press Enter or click Apply
      3. Verify both driver message fields show "Hello drivers"
    Expected Result: All message fields updated
    Evidence: .sisyphus/evidence/task-8-set-all.png

  Scenario: Single driver send updates progress
    Tool: Playwright
    Preconditions: Driver loaded, credentials saved pointing to mock gateway (localhost:8080), mock gateway running
    Steps:
      1. Start mock gateway: bun run mock-gateway (in separate terminal)
      2. Enter message for driver
      3. Click Send button
      4. Observe progress bar animation
      5. Wait up to 3s for state progression
    Expected Result: Progress bar animates: Pending(0%) → Processed(25%) → Sent(50%) → Delivered(100% green)
    Failure Indicators: Progress stays at 0%, error displayed, no progression
    Evidence: .sisyphus/evidence/task-8-single-send.png
  ```

  **Commit**: YES
  - Message: `feat: add main page with driver table and CSV upload`
  - Files: `src/pages/MainPage.tsx`, `src/components/DriverTable.tsx`, `src/components/DriverRow.tsx`, `src/components/CSVUpload.tsx`, `src/lib/sms.ts`

- [x] 9. Send All Button + Concurrency Control

  **What to do**:
  - Create `src/components/SendAllButton.tsx`:
    - Floating action button positioned bottom-right
    - Icon: paper plane or send icon from lucide-react
    - Disabled when: no credentials, no enabled drivers, or already sending
    - Shows "Sending X/Y" during send operation
  - Implement Send All logic in MainPage:
    - Filter drivers where `enabled === true`
    - Use concurrency limiter (max 5 parallel) NOT `Promise.all()` on everything
    - Each driver gets independent send + status polling
    - Update individual progress bars as each completes
  - Create `src/lib/queue.ts`:
    - `runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]>`
    - Simple queue that runs at most `limit` concurrent promises
  - Disable individual Send buttons while Send All is running
  - Check for credentials before enabling Send/Send All buttons

  **Must NOT do**:
  - Do not add cancel/stop functionality
  - Do not add batch progress bar (individual rows show their own)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Concurrency control logic, state coordination across components
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (last implementation task)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 4, 5, 8

  **References**:
  - `src/pages/MainPage.tsx` — Integrate SendAllButton and send logic
  - `src/lib/sms.ts` — `sendSMS`, `checkStatus` functions
  - `src/lib/storage.ts` — `loadCredentials()` to check if configured
  - `lucide-react` — `Send` icon

  **Acceptance Criteria**:
  - [ ] Floating Send All button visible bottom-right
  - [ ] Button disabled when no credentials configured
  - [ ] Send All only sends to enabled drivers
  - [ ] Maximum 5 concurrent sends at a time
  - [ ] Individual progress bars update during Send All

  **QA Scenarios**:
  ```
  Scenario: Send All button disabled without credentials
    Tool: Playwright
    Preconditions: No credentials in localStorage
    Steps:
      1. Navigate to Main page
      2. Upload CSV with drivers
      3. Check Send All button state (inspect disabled attribute or cursor-not-allowed class)
    Expected Result: Button is disabled or shows "Configure settings first"
    Evidence: .sisyphus/evidence/task-9-disabled.png

  Scenario: Send All sends to enabled drivers only
    Tool: Playwright
    Preconditions: 3 drivers loaded, credentials saved (pointing to mock gateway at localhost:8080), driver 2 disabled
    Steps:
      1. Toggle driver 2 switch OFF
      2. Click Send All
      3. Observe which drivers show progress (progress bar changes from idle)
      4. Wait for completion
    Expected Result: Driver 1 and 3 show progress and reach Delivered, driver 2 stays idle
    Evidence: .sisyphus/evidence/task-9-enabled-only.png

  Scenario: Concurrency limit respected (non-mutating)
    Tool: Bash + Mock Gateway logs
    Preconditions: 10 drivers loaded, credentials saved, mock gateway running with request logging
    Steps:
      1. Modify mock-gateway.ts to log timestamps on each POST /message request (if not already)
      2. Restart mock gateway
      3. Clear localStorage and load fresh 10 drivers
      4. Use Playwright to click Send All
      5. Read mock gateway stdout/log file
      6. Count POST requests within each 100ms window
    Expected Result: No more than 5 POST requests arrive within any 100ms window (proving concurrency limit)
    Failure Indicators: More than 5 simultaneous requests logged
    Evidence: .sisyphus/evidence/task-9-concurrency.txt (mock gateway request log)
    Note: This tests concurrency by observing request patterns at the mock gateway, NOT by modifying production code
  ```

  **Commit**: YES
  - Message: `feat: add send all with concurrency control`
  - Files: `src/components/SendAllButton.tsx`, `src/lib/queue.ts`, `src/pages/MainPage.tsx`

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `bunx biome check src/`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  **Precondition**: Start mock gateway (`bun run mock-gateway`) before running any send-flow scenarios.
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty CSV, invalid phone, no credentials. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit # | After Task | Message | Files |
|----------|------------|---------|-------|
| 1 | 1 | `chore: clean template and install dependencies` | package.json, src/index.ts, src/App.tsx, src/index.css, src/index.html, deleted files |
| 2 | 3 | `feat: add types and localStorage utilities` | src/types.ts, src/lib/storage.ts |
| 3 | 6 | `feat: add navbar and settings page` | src/components/Navbar.tsx, src/pages/SettingsPage.tsx |
| 4 | 5 | `feat: add SMS backend API routes` | src/index.ts |
| 5 | 7.5 | `chore: add mock SMS gateway for QA testing` | scripts/mock-gateway.ts, package.json |
| 6 | 8 | `feat: add main page with driver table and CSV upload` | src/pages/MainPage.tsx, src/components/*.tsx, src/lib/sms.ts |
| 7 | 9 | `feat: add send all with concurrency control` | src/components/SendAllButton.tsx, src/lib/queue.ts, src/pages/MainPage.tsx |

---

## Success Criteria

### Verification Commands
```bash
# App starts
bun dev  # Expected: Server running at http://localhost:4000

# API responds
curl -X POST http://localhost:4000/api/sms/send \
  -H "Content-Type: application/json" \
  -H "X-Gateway-Login: test" \
  -H "X-Gateway-Password: test" \
  -H "X-Gateway-URL: http://localhost:8080" \
  -d '{"phoneNumber":"+1234567890","message":"test"}'
# Expected: {"id":"...","state":"Pending","recipients":[...]}
```

### Final Checklist
- [ ] All "Must Have" features present and working
- [ ] All "Must NOT Have" patterns absent from codebase
- [ ] CSV upload → table population → Send → progress update flow works
- [ ] Settings save/load from localStorage
- [ ] Dark mode theme applied throughout
