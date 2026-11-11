# YatraSewa — Master Product Development & Deployment Task List

**Project:** YatraSewa — Bus Ticket Booking, Live GPS Fleet Telemetry & Automated Commission Settlement for Nepal
**Architecture:** Turborepo Monorepo (pnpm workspaces)
**Stack:** React 19 + Vite (Web) | React Native + Expo (Mobile) | Node 22 + Express + Socket.IO (API) | PostgreSQL 18 + PostGIS 3.6 | Redis 7 | Prisma ORM
**Targets:** Cloudflare Pages (Web), iOS + Android via Expo EAS (Mobile), Kamatera VPS + Coolify (API/Workers)

---

## Phase 0: Documentation & Governance Initialization
- [x] Create `documentation/` directory structure
- [x] Create `documentation/structure.md` with full monorepo directory & module mapping
- [x] Create `documentation/memory.md` with persistent architecture, RBAC, ledger, and design token rules
- [x] Create `documentation/changes.md` with chronological changelog format
- [x] Create `documentation/Task_list.md` (this file) tracking all tasks from inception to production deployment

## Phase 1: Monorepo Bootstrap, Shared Packages & Design System
- [ ] Initialize Turborepo (`turbo.json`), `pnpm-workspace.yaml`, and root configs (tsconfig, eslint, prettier, gitignore)
- [ ] Author `.stitch/DESIGN.md` with YatraSewa Emerald (`#08976B`) and Deep Pine (`#175C49`) tokens
- [ ] Build `packages/shared-types` (Zod DTOs, RBAC scopes, Seat Matrix, Payment & Ledger schemas)
- [ ] Build `packages/ui` (Tailwind preset, design tokens, shared SVG icons, shadcn primitives)
- [ ] Run `pnpm install` and `pnpm turbo typecheck build` for shared packages

## Phase 2: PostgreSQL 18 + PostGIS Database & Nepal Corridor Seeds (`packages/database`)
- [ ] Implement 22 normalized tables in `packages/database/prisma/schema.prisma`
- [ ] Add PostGIS (`GEOGRAPHY(POINT,4326)`), GiST segment exclusion constraints, and immutable audit/ledger triggers
- [ ] Seed Nepal cities, highway corridors (KTM-PKR, KTM-CTN, PKR-LMB, KTM-JKR, KTM-BIR, KTM-KKT)
- [ ] Seed sample operators (Greenline Travels OP-NP-8821, Sajha Yatayat, Mountain Deluxe Express, Buddha Air Surface)
- [ ] Seed sample buses (`BA 2 KHA 4512`, `BA 3 KHA 8820`, etc.), routes, and test role accounts
- [ ] Run Prisma migrate and verify schema integrity

## Phase 3: Authentication, Dynamic RBAC & Multi-Tenant Isolation (`apps/api`)
- [ ] Scaffold Express.js API with Helmet, CORS, Pino logging, RFC 7807 errors, Idempotency-Key middleware
- [ ] Implement Argon2id login, 6-digit SMS OTP verification, TOTP 2FA for Super Admin/Staff
- [ ] Implement 15-min JWT access tokens, 30-day refresh rotation, Redis permission bitmap caching
- [ ] Implement Dynamic RBAC Role Builder and Prisma multi-tenant isolation middleware
- [ ] Write and pass Vitest integration tests (auth, OTP, 2FA, tenant isolation)

## Phase 4: Fleet, Visual Cabin Builder, Trips & Redis Lua Seat Locking (`apps/api`)
- [ ] Implement Operator KYC upload & verification workflow
- [ ] Implement Vehicle CRUD with document compliance tracking
- [ ] Implement reusable 2x2 Deluxe / 2x1 VIP / Sleeper cabin layout JSON builder
- [ ] Implement Route corridor geofence stops with PostGIS coordinates
- [ ] Implement Trip scheduling with crew assignment and schedule conflict detection
- [ ] Implement Redis Lua atomic seat lock scripts (`acquire-seats.lua`, `release-seats.lua`)
- [ ] Implement PostgreSQL optimistic locking (`version INT`) + PENDING_PAYMENT booking creation
- [ ] Implement Socket.IO `SEAT_STATE_CHANGED` broadcast to trip rooms
- [ ] Pass 50-way concurrency test (zero double-bookings)

## Phase 5: Nepal Payment Gateways, Double-Entry Ledger & T+1 Settlement (`apps/api`)
- [ ] Implement eSewa ePay v2 adapter (HMAC-SHA256 signing + status lookup)
- [ ] Implement Khalti KPG-2 adapter (pidx initiation + server lookup, paisa *100 conversion)
- [ ] Implement ConnectIPS adapter (SHA256withRSA .pfx signing + validatetxn)
- [ ] Implement Fonepay Dynamic QR adapter (HMAC-SHA512 EMVCo QR + webhook listener)
- [ ] Implement Bookie Prepaid Float Wallet with credit-limit enforcement
- [ ] Implement Immutable Double-Entry Ledger (Platform Escrow, Bookie Float, Operator Payable, Commission Revenue, TDS Payable)
- [ ] Implement 1.5% statutory TDS calculation
- [ ] Implement time-slab cancellation refund calculator
- [ ] Implement BullMQ daily 02:00 NPT T+1 NCHL settlement batch worker
- [ ] Pass ledger invariant tests (Σ Debits = Σ Credits)

## Phase 6: Real-Time GPS Telemetry, PostGIS Geofencing & Notifications (`apps/api` + `apps/worker`)
- [ ] Implement Socket.IO `telemetry:ping` ingestion from Driver/Conductor apps
- [ ] Implement Redis `HSET bus:live:{tripId}` state + Socket.IO broadcast to `track:trip:{tripId}`
- [ ] Implement PostGIS `ST_DWithin` 1.5 km boarding geofence detector
- [ ] Implement 30-second BullMQ batch flusher to partitioned `trip_gps_telemetry`
- [ ] Implement offline batch replay endpoint for mountain highway reconnects
- [ ] Implement Sparrow SMS API v2 dispatcher (OTP, PNR, geofence alerts) with failover
- [ ] Implement transactional SMTP HTML email + vector PDF QR e-ticket generation
- [ ] Test WebSocket GPS streaming, geofence triggers, PDF/QR generation

## Phase 7: Web Application Implementation (`apps/web` + `packages/api-client`)
- [ ] Build `packages/api-client` (Axios interceptors, JWT rotation, Idempotency-Key, TanStack Query hooks, Socket.IO hooks)
- [ ] Build Auth Web Suite (Split-Screen Blue Bus Login, OTP/2FA, Password Reset)
- [ ] Build Customer Web Portal (Search, Filter, Interactive SVG Seat Map, 10-min Countdown, Multi-Gateway Checkout, QR E-Ticket, Live GPS Map, Self-Service Cancellation)
- [ ] Build Super Admin Web Console (Dashboard NPR 4.82M KPIs, Companies Registry, KYC Verifier, Commission Rules, NCHL Settlements, RBAC Employee Matrix, CRM, Reports, Audit Logs)
- [ ] Build Operator Company Panel (Overview, Fleet + Add Vehicle, Drag-Drop Seat Canvas Builder, Route Geofence Builder, Trip Schedules + Conflict Banner, Staff Roster, Live Fleet Map, Settlements Ledger)
- [ ] Build Bookie Counter POS (Hotkey grid F2/F4/F8/F9, Float Passbook, WebUSB 80mm thermal printing)
- [ ] Build `apps/web` with Vite production build and pass Playwright/component tests

## Phase 8: iOS & Android Mobile App Implementation (`apps/mobile`)
- [ ] Expo Router setup with NativeWind/tailwind, expo-sqlite, expo-location, expo-camera
- [ ] Build Customer Mobile App (Emerald Splash, OTP, Home Search, Available Buses, Details, 2x2 Seat Picker, Summary, Payment Methods eSewa/Khalti/Fonepay/ConnectIPS deep links, My Bookings, QR Pass, Live GPS, Support)
- [ ] Build Super Admin Mobile App (Platform Reports, Commission Settings, Customers/Disputes, RBAC Employees & 2FA, Company KYC, Companies Registry, Dashboard, NCHL Payout Approval)
- [ ] Build Operator Mobile App (Fleet Status, Add Vehicle & Telematics, Settlements Rs.4,37,850, Dispatch & Conflict Resolver, Mobile Seat Canvas, Route Builder)
- [ ] Build Conductor & Driver Mobile App (Live Cabin Monitor 68%, Trip Manifest 32/18, Offline HMAC QR Scanner, En-Route Walk-In POS, Driver Highway GPS HUD 5s background, Bluetooth ESC/POS)
- [ ] Build Bookie Mobile POS (Quick-Book & Float Passbook)
- [ ] Implement expo-sqlite offline manifest cache + 4G reconnect outbox sync
- [ ] Pass TypeScript compilation and React Native Testing Library suites

## Phase 9: End-to-End Verification, Load Testing & Bug-Fix Loop
- [ ] Stand up full local stack (PostgreSQL+PostGIS, Redis, API, Worker, Web)
- [ ] Execute full E2E user journey: Super Admin onboards Operator → Operator creates Cabin/Bus/Route/Trip → Customer books A1,A2 via eSewa → Bookie books B1 via Float + prints receipt → Driver starts trip & streams GPS → Conductor scans QR offline & issues C1 walk-in → Trip completes → T+1 Settlement reconciles NPR commissions & TDS
- [ ] Run `infra/load-tests/k6-seat-lock-race.js` — verify zero double-bookings, p99 ≤ 45ms
- [ ] Run `infra/load-tests/k6-gps-telemetry-ingest.js`
- [ ] Fix all discovered bugs; re-run until 100% pass

## Phase 10: Production Deployment Readiness
- [ ] Author `apps/api/Dockerfile` (multi-stage Node 22 Alpine)
- [ ] Author `infra/coolify/docker-compose.prod.yml`, `pgbouncer.ini`, `postgresql.prod.conf`, `init-postgis.sql`, `redis.prod.conf`
- [ ] Author `apps/web/public/_redirects` and `_headers` for Cloudflare Pages
- [ ] Author `apps/mobile/app.json` and `eas.json` for Expo EAS Build & Update
- [ ] Author GitHub Actions workflows: `ci-verify.yml`, `deploy-cloudflare-web.yml`, `deploy-coolify-backend.yml`, `release-expo-mobile.yml`
- [ ] Final audit of all 4 documentation files — mark every task `- [x] Completed`
