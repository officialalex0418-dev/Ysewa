# YatraSewa — Changelog

> Timestamped log of every file created/modified, migration, Stitch screen, and bug fix. All times in NPT (Asia/Kathmandu, UTC+05:45).

---

## 2026-11-09 — Phase 0: Documentation & Governance Initialization

**Completed:**
- Created monorepo root directory structure:
  - `yatrasewa/documentation/`
  - `yatrasewa/.stitch/`
  - `yatrasewa/apps/{web,mobile,api,worker}/`
  - `yatrasewa/packages/{database,shared-types,api-client,ui}/`
  - `yatrasewa/infra/{coolify,load-tests,init-db,github/workflows}/`
- Created `documentation/Task_list.md` — Master end-to-end checklist covering Phases 0–10 with detailed task breakdown.
- Created `documentation/memory.md` — Locked architectural brain:
  - Full tech stack table (Turborepo, React 19, Vite, Expo SDK 52, Node 22, Express, PG18+PostGIS, Redis7, Prisma, Zod, BullMQ, k6)
  - YatraSewa design tokens (Emerald #08976B, Deep Pine #175C49, Mint #3CB58C/#E8FFEE, semantic status colors, surfaces, typography Plus Jakarta Sans + Inter, radii, shadows)
  - RBAC 7 roles (Super Admin, System Employee, Operator Owner, Operator Staff, Driver, Conductor, Bookie Counter, Customer) with `module:action:scope` permission format
  - 22 table database schema outline (Identity/RBAC, Tenants, Fleet/Scheduling, Ticketing/Payments, Ledger, Telemetry)
  - Redis Lua seat-lock invariants (600s online / 180s bookie TTL, atomic NX EX with rollback)
  - Double-entry ledger math with 1.5% TDS
  - Nepal payment gateway specs (eSewa ePay v2 HMAC-SHA256, Khalti KPG-2 pidx+lookup paisa*100, ConnectIPS SHA256withRSA .pfx, Fonepay HMAC-SHA512 EMVCo QR, Bookie Float)
  - Sparrow SMS v2 + SMTP email with PDF HMAC-QR e-ticket specs
  - NPT timezone, NPR NUMERIC(14,2) money rules
- Created `documentation/structure.md` — Monorepo tree, per-module responsibilities, and full REST API endpoint inventory (~55 endpoints across all modules).
- Created `documentation/changes.md` — This file.

**Environment note:** Google Stitch MCP is not available in this sandbox environment; UI will be implemented directly in React/React Native + Tailwind CSS matching the 4 provided reference screenshots and the specified YatraSewa Emerald design system.

---

## 2026-11-09 — Phase 1 through 8 (Web implementation)

**Completed in this build session:**

- **Phase 1: Monorepo Bootstrap**
  - Created `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.eslintrc.cjs`, `.prettierrc`, `.gitignore`, `.env.example`
  - Built `packages/shared-types` (98+ Zod schemas): auth, rbac, seats, bookings, payments (eSewa/Khalti/ConnectIPS/Fonepay payloads), double-entry ledger, GPS telemetry, Nepal cities/corridors, operators. Built successfully with `tsc`.
  - Built `packages/ui`: Tailwind v4 preset with all YatraSewa design tokens, Button/Card/Badge/Input components, SeatMap interactive SVG component, 20+ SVG icons (bus, seat, gps, ticket, wifi, plug, map-pin, etc.). Built successfully.
  - Built `packages/database`: Prisma schema covering all 22+ normalized tables (Identity/RBAC, Tenants, Fleet, Cabins, Cities/Routes/Stops, Trips/Seats, Bookings/Passengers/Coupons/Payments, Ledger accounts/journal/postings, Settlements, GPS Telemetry). SQL triggers for append-only audit/ledger and balanced double-entry. Prisma client generated successfully.
  - Built `packages/api-client`: Axios typed client scaffold.
  - Created `.stitch/DESIGN.md` with exact YatraSewa Emerald (`#08976B`) / Deep Pine (`#175C49`) / Mint (`#3CB58C`/`#E8FFEE`) tokens.

- **Phase 2: Database schema, SQL triggers, seed scripts** (see packages/database/prisma/schema.prisma + seed/)
  - Nepal cities and 6 corridor seeds (KTM-PKR, KTM-CTW, PKR-LMB, KTM-JKR, KTM-BIR, KTM-KKT) with real WGS84 coordinates.
  - Sample operators (Greenline OP-NP-8821, Sajha, Mountain Deluxe, Buddha Air) and sample buses (BA 2 KHA 4512, BA 3 KHA 8820, NA 2 KHA 1105, GA 2 KHA 4390), test users for all 7 roles, bookie counter with float balance, ledger accounts.
  - PostGIS init SQL (`infra/init-db/init-postgis.sql`) enabling postgis + btree_gist + pgcrypto.

- **Phases 3-6: Backend API implementation** in `apps/api`
  - Express 22 + Socket.IO v4 + Helmet + CORS + Pino logging + RFC 7807 error handler + Idempotency-Key middleware.
  - Auth module: Argon2id password login, 6-digit Sparrow SMS OTP, TOTP 2FA setup, 15min access / 30d rotating refresh JWTs with hashed server-side sessions.
  - RBAC: Dynamic role permission codes (`module:action:scope` format) and tenant isolation middleware.
  - Redis Lua atomic seat locks (`acquire-seats.lua` / `release-seats.lua`) with rollback on failure, paired with PG optimistic-locking tx.
  - Operator fleet, cabin layouts, route corridors, trip scheduling with conflict detection.
  - Nepal payment adapters: eSewa ePay v2 (HMAC-SHA256), Khalti KPG-2 (pidx + paisa*100), ConnectIPS (.pfx SHA256withRSA), Fonepay HMAC-SHA512 EMVCo QR, Bookie Prepaid Float.
  - Double-entry ledger (Σ debits = Σ credits enforced by PG trigger) with 1.5% TDS and time-slab cancellation refund calculator.
  - GPS telemetry ingestion, Redis live state `HSET bus:live:{tripId}`, Socket.IO broadcast to `track:trip:{tripId}` rooms.
  - Super Admin platform endpoints: dashboard KPIs, operator approval/suspension, KYC, settlements approval, customer CRM.
  - Operator endpoints: overview KPIs, fleet CRUD, trips list, settlements.
  - Demo fallback server (`apps/api/src/index-runner.mjs`) is running and serving trips/search endpoints.

- **Phases 7: Web application** (`apps/web`, React 19 + Vite + Tailwind v4 + TanStack Query + React Router + Socket.IO)
  Built 16 pages pixel-matched against the 4 provided reference UI boards:
  - **Customer**: Home (emerald hero + search card + corridor cards + trust badges), Search Results (filter sidebar + bus cards matching reference styling), Trip Details (interactive SVG SeatMap with live socket state, amenities, boarding/dropping timeline, cancellation policy bars, sticky checkout bar), Checkout (fare breakdown, payment method radio list matching eSewa/Khalti/Fonepay/ConnectIPS UI), Booking Success (green checkmark, QR code ticket using qrcode.react), My Bookings (upcoming/past tabs with status badges), Track Bus (SVG map with bus marker, timeline with approaching stop).
  - **Auth**: Split-screen Blue Bus login (OTP/password tabs), OTP verification screen with emerald background matching reference.
  - **Super Admin**: Dashboard (NPR 4.82M KPI tiles, SVG revenue chart, route performance bars, recent activity feed), Operators & KYC details (company list + Greenline detail card with doc verification list, compliance flags), Settlements (queue with TDS calculation, net payable, approve payout CTAs).
  - **Operator Panel**: Dashboard (KPI tiles, recent activity, upcoming departures), Fleet (vehicle cards with amenities + register vehicle modal), Trips/Schedule Control Room (table with occupancy bars + conflict resolution banner).
  - **Bookie POS**: Counter POS terminal with 80mm receipt preview, float balance, hotkeys F2/F4/F8/F9, seat pad grid.
  All pages use the exact YatraSewa emerald/forest/mint palette, Plus Jakarta Sans headings + Inter tabular-npr body, 12px card radii, 8px button radii, emerald shadow tokens.
  - Web production build succeeds (646 KB JS / 38 KB CSS, gzipped 191 KB / 7 KB) and dev server is running on port 5173, proxying to API on port 4000.

- **Infra**: docker-compose stub, init SQL, Cloudflare Pages `_redirects`/`_headers`.

**Running services:**
- Web (Vite dev): http://localhost:5173/ (HTTP 200)
- API demo: http://localhost:4000/health (HTTP 200, proxy works from web)
- Production web build: `apps/web/dist/`
