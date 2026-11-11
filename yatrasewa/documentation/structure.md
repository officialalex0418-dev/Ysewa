# YatraSewa — Monorepo Structure & Module Responsibility Map

> Updated at the end of every phase. Must reflect the actual filesystem exactly.

```
yatrasewa/
├── package.json                  # Root package: turbo, pnpm workspace config, shared scripts
├── pnpm-workspace.yaml           # Workspace globs
├── turbo.json                    # Turborepo pipeline config
├── tsconfig.base.json            # Shared TS config
├── .eslintrc.cjs                 # Shared ESLint config
├── .prettierrc                   # Shared Prettier config
├── .gitignore
├── .env.example                  # Root env example (DATABASE_URL, REDIS_URL, JWT_SECRET, gateway keys)
│
├── .stitch/
│   └── DESIGN.md                 # YatraSewa Emerald design tokens, extracted from reference UI
│
├── documentation/
│   ├── Task_list.md              # Master end-to-end checklist (status: - [ ] / - [/] / - [x])
│   ├── structure.md              # This file — exact tree + responsibilities
│   ├── memory.md                 # Locked architecture, RBAC, ledger math, gateway specs
│   └── changes.md                # Chronological changelog
│
├── packages/
│   ├── shared-types/             # Zod schemas + inferred TS types shared across all apps
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── auth.ts           # LoginRequest, OtpVerifyRequest, TokenResponse
│   │   │   ├── rbac.ts           # Role enum, Permission strings, PermissionBitmap
│   │   │   ├── seats.ts          # SeatStatus, SeatType, CabinLayout, SeatMatrix
│   │   │   ├── bookings.ts       # Booking, Passenger, PNR format
│   │   │   ├── payments.ts       # Gateway enums, eSewa/Khalti/ConnectIPS/Fonepay payloads
│   │   │   ├── ledger.ts         # Account types, JournalEntry, Posting (balanced)
│   │   │   ├── telemetry.ts      # GpsPing, GeofenceAlert, BusLiveState
│   │   │   └── nepal.ts          # Cities, Corridors, NPR helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                       # Shared React UI components + Tailwind preset (used by web)
│   │   ├── src/
│   │   │   ├── preset.ts         # Tailwind preset with YatraSewa colors/typography
│   │   │   ├── icons/            # Bus, Seat, Ticket, GPS, QR, eSewa/Khalti SVG icons
│   │   │   ├── components/       # Button, Card, Input, Badge, Modal, Tabs, Toast (shadcn-style)
│   │   │   └── seat-map/         # Interactive SVG seat map component (shared Web/Mobile)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── database/                 # Prisma schema, migrations, seeds
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # 22 normalized tables
│   │   │   ├── migrations/       # Sequential SQL migrations
│   │   │   ├── triggers/         # append-only audit & ledger-balance SQL
│   │   │   └── seed/
│   │   │       ├── index.ts
│   │   │       ├── nepal-cities.ts
│   │   │       ├── operators.ts
│   │   │       ├── fleet.ts
│   │   │       └── test-users.ts
│   │   └── package.json          # Exports @yatrasewa/database (Prisma client singleton)
│   │
│   └── api-client/               # Typed API client for web/mobile
│       ├── src/
│       │   ├── client.ts         # Axios instance with interceptors (JWT rotation, Idempotency-Key)
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useBookings.ts
│       │   │   ├── useTrips.ts
│       │   │   ├── useSeats.ts
│       │   │   ├── usePayments.ts
│       │   │   └── useFleet.ts
│       │   └── socket/
│       │       ├── socket.ts     # Socket.IO client singleton
│       │       ├── useTripSeatSocket.ts
│       │       └── useLiveBusGps.ts
│       └── package.json
│
├── apps/
│   ├── api/                      # Express.js API server
│   │   ├── src/
│   │   │   ├── index.ts          # Bootstrap: express, helmet, cors, socket.io, redis
│   │   │   ├── config/           # env loader, prisma singleton, redis client, logger
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts        # JWT verify + attach req.user
│   │   │   │   ├── rbac.middleware.ts        # requirePermission(module:action:scope)
│   │   │   │   ├── tenant-isolation.middleware.ts  # auto-scope prisma by operatorId/counterId
│   │   │   │   ├── idempotency.middleware.ts
│   │   │   │   ├── error-handler.ts          # RFC 7807 Problem+JSON
│   │   │   │   └── validate.ts               # Zod body/query validator
│   │   │   ├── modules/
│   │   │   │   ├── auth/                     # login, otp, totp, refresh, logout
│   │   │   │   ├── rbac/                     # role CRUD, permission bitmap, cache invalidation
│   │   │   │   ├── operators/                # operator CRUD + KYC verification
│   │   │   │   ├── fleet/                    # buses, cabin layouts, CRUD + documents
│   │   │   │   ├── routes-corridors/         # cities, routes, route_stops w/ GIS
│   │   │   │   ├── trips/                    # trip scheduling, conflict detection, crew assign
│   │   │   │   ├── seat-locks/               # acquire-seats.lua, release-seats.lua, booking create
│   │   │   │   ├── bookings/                 # booking CRUD, passenger check-in, cancellation
│   │   │   │   ├── payments/                 # esewa-v2, khalti-v2, connectips, fonepay-qr, bookie-float adapters
│   │   │   │   ├── ledger-settlement/        # double-entry engine, T+1 settlement worker
│   │   │   │   ├── telemetry/                # GPS ingest, geofence, live broadcast
│   │   │   │   ├── notifications/            # Sparrow SMS, SMTP email, PDF ticket
│   │   │   │   └── super-admin/              # platform reports, commission, customers, audit
│   │   │   ├── queues/
│   │   │   │   ├── index.ts
│   │   │   │   ├── settlement.queue.ts
│   │   │   │   ├── telemetry-flush.queue.ts
│   │   │   │   └── notification.queue.ts
│   │   │   ├── scripts/
│   │   │   │   └── load-seat-lock-lua.ts     # Register Lua scripts with Redis
│   │   │   └── lua/
│   │   │       ├── acquire-seats.lua
│   │   │       └── release-seats.lua
│   │   ├── tests/                # Vitest + supertest integration tests
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── worker/                   # BullMQ worker processes (standalone Node process)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── settlement.worker.ts    # T+1 NCHL payout batch at 02:00 NPT
│   │   │   ├── telemetry-flush.worker.ts  # 30s batch flush GPS to PG partitions
│   │   │   └── notification.worker.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                      # React 19 + Vite web app (Customer, SuperAdmin, Operator, Bookie POS)
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts    # Uses @yatrasewa/ui preset
│   │   ├── public/
│   │   │   ├── _redirects        # Cloudflare Pages SPA redirects
│   │   │   └── _headers          # Security headers
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx        # TanStack Router (role-based)
│   │   │   ├── lib/
│   │   │   │   ├── query-client.ts
│   │   │   │   └── auth-context.tsx
│   │   │   ├── features/
│   │   │   │   ├── auth/                 # Split Blue Bus Login, OTP, Reset
│   │   │   │   ├── customer/             # Search, Bus List, Seat Select, Checkout, E-Ticket, Track, Cancel
│   │   │   │   ├── super-admin/          # Dashboard, Companies, KYC, Commissions, Settlements, RBAC, Reports, Audit
│   │   │   │   ├── operator-panel/       # Overview, Fleet, Seat Canvas, Routes, Trips, Staff, Live Map, Settlements
│   │   │   │   └── bookie-pos/           # Hotkey POS, Float, Thermal Print modal
│   │   │   ├── components/
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── tests/                # Playwright E2E
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                   # React Native + Expo app (Customer, SuperAdmin, Operator, Driver, Conductor, Bookie)
│       ├── app.json
│       ├── eas.json
│       ├── metro.config.js
│       ├── tailwind.config.js    # NativeWind
│       ├── babel.config.js
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── (customer)/               # Emerald Splash, OTP, Home, Search, Buses, SeatPicker, Checkout, QR, Track, MyBookings
│       │   ├── (super-admin)/            # Reports, Commissions, Customers, RBAC, KYC, Companies, Dashboard, Payouts
│       │   ├── (operator)/               # Fleet, AddVehicle, Settlements, Dispatch, SeatCanvas, Routes
│       │   ├── (conductor)/              # LiveCabin, Manifest, QRScan, WalkInPOS, OfflineSync
│       │   ├── (driver)/                 # GpsHud, TripStart
│       │   └── (bookie)/                 # QuickBook, FloatPassbook
│       ├── src/
│       │   ├── db/
│       │   │   ├── sqlite.ts            # expo-sqlite setup
│       │   │   ├── manifest-cache.ts    # Offline manifest cache
│       │   │   └── outbox-sync.ts       # Outbox replay on reconnect
│       │   ├── location/
│       │   │   └── driver-tracking.ts   # 5s background task
│       │   ├── camera/
│       │   │   └── qr-scanner.ts        # HMAC QR verifier
│       │   ├── printing/
│       │   │   └── escpos-bluetooth.ts  # Thermal receipt
│       │   ├── api/
│       │   │   └── client.ts            # Axios + JWT rotation
│       │   └── components/              # Shared RN components (buttons, cards, seat map)
│       ├── assets/
│       ├── package.json
│       └── tsconfig.json
│
└── infra/
    ├── coolify/
    │   ├── docker-compose.prod.yml       # Kamatera VPS: api + worker + pg + redis + pgbouncer
    │   ├── pgbouncer.ini
    │   ├── postgresql.prod.conf
    │   ├── redis.prod.conf
    │   └── caddy/Caddyfile
    ├── init-db/
    │   └── init-postgis.sql             # CREATE EXTENSION postgis, btree_gist
    ├── load-tests/
    │   ├── k6-seat-lock-race.js         # 50-way seat A1 race
    │   └── k6-gps-telemetry-ingest.js
    └── github/
        └── workflows/
            ├── ci-verify.yml
            ├── deploy-cloudflare-web.yml
            ├── deploy-coolify-backend.yml
            └── release-expo-mobile.yml
```

---

## Current file map (post-build)
```
yatrasewa/
├── package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .eslintrc.cjs, .prettierrc, .gitignore, .env.example
├── .stitch/DESIGN.md                  ← YatraSewa design tokens
├── documentation/
│   ├── Task_list.md, structure.md, memory.md, changes.md
├── packages/
│   ├── shared-types/src/              ← 9 Zod modules (auth, rbac, seats, bookings, payments, ledger, telemetry, nepal, operators)
│   ├── ui/src/                        ← preset, styles.css, cn, Button, Card, CardHeader/Content/Footer, Badge, Input, SeatMap, 20+ icons
│   ├── database/prisma/
│   │   ├── schema.prisma              ← 22+ tables
│   │   ├── triggers/ (audit-append-only.sql, ledger-balance.sql)
│   │   └── seed/ (nepal-cities.ts, operators.ts, index.ts)
│   └── api-client/src/
├── apps/
│   ├── api/src/
│   │   ├── index.ts (main server), index-runner.mjs (demo fallback)
│   │   ├── config/ (env, redis, logger)
│   │   ├── middlewares/ (auth, rbac, tenant-isolation, idempotency, validate, error-handler)
│   │   ├── lua/ (acquire-seats.lua, release-seats.lua)
│   │   └── modules/ (auth, rbac, operators, fleet, routes-corridors, trips, seat-locks, bookings, payments, ledger-settlement stubs, telemetry, super-admin)
│   ├── web/
│   │   ├── index.html, vite.config.ts, src/main.tsx, src/App.tsx, src/styles.css
│   │   ├── src/lib/ (api client w/ JWT refresh, socket, auth context)
│   │   ├── src/components/ (TopNav+BottomNav, AdminShell, OperatorShell)
│   │   └── src/pages/
│   │       ├── customer/ (Home, SearchResults, TripDetails, Checkout, BookingSuccess, MyBookings, TrackBus)
│   │       ├── auth/ (Login, Otp)
│   │       ├── super-admin/ (Dashboard, Operators, Settlements)
│   │       ├── operator/ (Dashboard, Fleet, Trips)
│   │       └── bookie/ (Pos)
│   └── mobile/ (scaffolded for Phase 8 Expo implementation)
└── infra/init-db/init-postgis.sql
```

## Dev servers (running)
- Web: http://localhost:5173/
- API demo: http://localhost:4000/health

## Build status
- `pnpm --filter @yatrasewa/shared-types build` ✓
- `pnpm --filter @yatrasewa/ui build` ✓
- `pnpm --filter @yatrasewa/api-client build` ✓
- `pnpm --filter @yatrasewa/database build` ✓ (prisma:generate ✓)
- `pnpm --filter @yatrasewa/web build` ✓ (dist/ produced)

## Next up: Phase 8 (React Native Expo mobile app), Phase 9 (integration tests), Phase 10 (Docker/Coolify/GitHub Actions/EAS configs).

### Auth
- `POST /api/v1/auth/login` — phone/email + password
- `POST /api/v1/auth/send-otp` — request 6-digit SMS OTP
- `POST /api/v1/auth/verify-otp` — verify OTP, issue tokens
- `POST /api/v1/auth/totp/setup` — Super Admin/Employee: enable TOTP
- `POST /api/v1/auth/totp/verify`
- `POST /api/v1/auth/refresh` — rotate refresh token, issue new access
- `POST /api/v1/auth/logout`

### RBAC & Users (Super Admin / Operator Owner)
- `GET /api/v1/roles`
- `POST /api/v1/roles`
- `PUT /api/v1/roles/:id`
- `GET /api/v1/users`
- `PUT /api/v1/users/:id`

### Operators / KYC
- `GET /api/v1/operators`
- `POST /api/v1/operators`
- `GET /api/v1/operators/:id`
- `PUT /api/v1/operators/:id`
- `POST /api/v1/operators/:id/kyc` — upload KYC doc
- `POST /api/v1/operators/:id/verify` — Super Admin: approve/suspend

### Fleet & Cabin Layouts
- `GET /api/v1/fleet/buses`
- `POST /api/v1/fleet/buses`
- `GET /api/v1/fleet/buses/:id`
- `PUT /api/v1/fleet/buses/:id`
- `GET /api/v1/fleet/cabin-layouts`
- `POST /api/v1/fleet/cabin-layouts`
- `PUT /api/v1/fleet/cabin-layouts/:id`

### Routes & Corridors
- `GET /api/v1/cities`
- `GET /api/v1/routes`
- `POST /api/v1/routes`
- `POST /api/v1/routes/:id/stops`
- `PUT /api/v1/routes/:id/stops/:stopId`
- `GET /api/v1/routes/search?from=&to=&date=` — public search

### Trips
- `GET /api/v1/trips`
- `POST /api/v1/trips`
- `GET /api/v1/trips/:id`
- `GET /api/v1/trips/:id/seats`
- `POST /api/v1/trips/:id/seats/lock` — atomic Lua + PG
- `DELETE /api/v1/trips/:id/seats/release`

### Bookings
- `GET /api/v1/bookings`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/:pnr`
- `POST /api/v1/bookings/:pnr/cancel`
- `POST /api/v1/bookings/:pnr/checkin` — conductor QR scan

### Payments
- `POST /api/v1/payments/esewa/initiate`
- `GET /api/v1/payments/esewa/callback`
- `POST /api/v1/payments/khalti/initiate`
- `POST /api/v1/payments/khalti/verify`
- `POST /api/v1/payments/connectips/initiate`
- `POST /api/v1/payments/connectips/verify`
- `POST /api/v1/payments/fonepay/generate-qr`
- `POST /api/v1/payments/fonepay/webhook`
- `POST /api/v1/payments/bookie-float/pay`

### Ledger & Settlements (Super Admin / Operator)
- `GET /api/v1/ledger/accounts`
- `GET /api/v1/ledger/entries`
- `GET /api/v1/settlements`
- `POST /api/v1/settlements/:id/approve`
- `POST /api/v1/settlements/run-batch` — manual trigger of T+1

### Telemetry & Live
- `POST /api/v1/telemetry/ping` — driver/conductor app 5s GPS
- `POST /api/v1/telemetry/sync` — offline batch replay
- `SOCKET.IO telemetry:ping`, `telemetry:update`, `seat:state-changed`

### Notifications
- `GET /api/v1/tickets/:pnr/qr-pdf` — download PDF e-ticket

### Super Admin platform
- `GET /api/v1/admin/dashboard` — NPR 4.82M KPIs
- `GET /api/v1/admin/customers`
- `GET /api/v1/admin/customers/:id`
- `PUT /api/v1/admin/customers/:id/suspend`
- `POST /api/v1/admin/commission-rules`
- `GET /api/v1/admin/reports/route-performance`
- `GET /api/v1/admin/audit-logs`

### Bookie POS
- `GET /api/v1/bookie/float`
- `POST /api/v1/bookie/float/topup`

### Conductor
- `GET /api/v1/conductor/trips/:id/manifest`
- `POST /api/v1/conductor/trips/:id/walk-in` — sell seat C1 en route
- `POST /api/v1/conductor/trips/:id/sync` — offline replay
