# YatraSewa — Persistent Architectural Memory (Brain)

> This file is the single source of truth for locked architectural decisions. Update it immediately after every decision/debug/lesson. Do NOT delete entries — only append and annotate.

---

## 1. LOCKED TECH STACK

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Monorepo | Turborepo + pnpm workspaces | turbo 2.x, pnpm 9.x | Fast incremental builds, workspace hoisting |
| Web | React 19 + TypeScript + Vite | React 19, Vite 6 | Fast HMR, React Compiler ready |
| Web Styling | Tailwind CSS 4 + shadcn/ui | Tailwind 4.x | Utility-first, matches design tokens |
| Web State | TanStack Query v5 + Zustand | — | Server state + local UI state |
| Web Realtime | Socket.IO Client v4 | — | Seat locks + GPS tracking |
| Mobile | React Native + Expo SDK 52 | Expo SDK 52 | Universal iOS/Android, OTA updates |
| Mobile Routing | Expo Router | v4 | File-based, deep-link native |
| Mobile Offline | expo-sqlite | — | Mountain highway dead zones |
| Mobile Location | expo-location | — | 5s background GPS for drivers |
| Mobile Camera | expo-camera | — | HMAC QR ticket scanning |
| Mobile Printing | React Native ESC/POS Bluetooth | — | 58/80mm thermal receipts |
| Backend | Node.js 22 LTS + Express.js | Node 22 | Stable LTS, broad ecosystem |
| Realtime | Socket.IO v4 + Redis Adapter | — | Cross-instance broadcast |
| Jobs | BullMQ | v5 | Redis-backed reliable queues |
| Primary DB | PostgreSQL 18 + PostGIS 3.6 | PG 18 | ACID, geospatial, GiST exclusions |
| ORM | Prisma | v6 | Type-safe, migration tooling |
| Cache/Queues/Locks | Redis 7 | 7.x | Lua seat locks, BullMQ, pub/sub |
| Validation | Zod | v3 | End-to-end type safety |
| Logging | Pino | v9 | Structured JSON logging |
| Validation Tests | Vitest + Supertest | — | Fast unit/integration |
| E2E Tests | Playwright | v1.48 | Web E2E |
| Load Tests | k6 | latest | Seat lock concurrency + GPS ingest |
| Money Type | `NUMERIC(14,2)` in PG; Prisma `Decimal` in TS | — | No float errors for NPR |

---

## 2. YATRASEWA DESIGN TOKENS (Emerald Nepal Identity)

```
Primary Brand Emerald : #08976B   /* CTAs, active nav, primary actions */
Hover Forest          : #0B7A5A   /* Button hover */
Deep Pine             : #175C49   /* Headers, splash screen background */
Mint Accent (light)   : #3CB58C   /* Badges, secondary highlights */
Mint Tint (surface)   : #E8FFEE   /* Selected seats, success fills */

Semantic Status:
  Success             : #14813E
  Warning             : #B3570C
  Danger              : #C92D30
  Info                : #405491

Surfaces & Ink:
  Card Surface        : #FFFFFF
  App Canvas          : #F7F8FA
  Border              : #E2E7ED
  Primary Ink         : #1E1E1E
  Muted Ink           : #4A505C

Typography:
  Headings            : Plus Jakarta Sans (600/700)
  Body & Tabular NPR  : Inter (400/500, tabular-nums)
  OTP digits          : Inter (700, tabular-nums)

Radii:
  Cards               : 12px
  Buttons/Inputs      : 8px
  Circular avatars    : 9999px (rounded-full)
  Modals              : 16px

Shadows:
  Card shadow         : 0 1px 3px rgba(30,30,30,.06), 0 1px 2px rgba(30,30,30,.04)
  Modal shadow        : 0 20px 40px rgba(23,92,73,.15), 0 4px 12px rgba(30,30,30,.08)
  Float (FAB)         : 0 6px 20px rgba(8,151,107,.35)
```

---

## 3. RBAC — 7 ROLES & PERMISSION SCOPES

| Role | Code | Description | Key Permissions |
|------|------|-------------|-----------------|
| Super Admin | `SUPER_ADMIN` | YatraSewa platform owner | Full access to all tenants, commission rules, settlements, RBAC builder, audit logs |
| System Employee | `SYSTEM_EMPLOYEE` | YatraSewa support/ops/finance staff | Scoped via permission bitmap (view companies, approve KYC, approve payouts, view reports, support tickets) |
| Operator Owner | `OPERATOR_OWNER` | Bus company owner | Full access to own operator_id: fleet, routes, trips, staff, settlements, reports |
| Operator Staff | `OPERATOR_STAFF` | Company dispatch/ops | Scoped per operator: view trips, manifest, telemetry (no financials, no staff mgmt) |
| Driver | `DRIVER` | Trip driver | GPS telemetry ping, start/end trip, own trip view only |
| Conductor | `CONDUCTOR` | On-board ticketing | Trip manifest view, QR scan check-in, en-route walk-in POS, offline sync |
| Bookie Counter | `BOOKIE_COUNTER` | Offline agent counter | Search trips, book seats at counter, thermal print, use prepaid float wallet (counter_id scoped) |
| Customer | `CUSTOMER` | Traveler | Search, book, cancel own bookings, download tickets, track bus (no cross-user access) |

Permission string format: `module:action:scope`
Examples: `trips:read:own`, `seats:lock:counter`, `settlements:approve:all`, `ledger:read:operator`

---

## 4. DATABASE SCHEMA (22 TABLES)

### Identity & RBAC
1. `users` — id (uuid pk), phone, email, password_hash, full_name, role enum, operator_id fk, counter_id fk, totp_secret, is_2fa_enabled, is_active, created_at, updated_at
2. `roles` — id, name, is_system_role, description
3. `role_permissions` — id, role_id fk, permission_code (e.g., "trips:create:operator")
4. `user_sessions` — id, user_id fk, refresh_token_hash, user_agent, ip, expires_at, created_at
5. `security_audit_logs` — id, actor_id, action, resource_type, resource_id, meta jsonb, ip, created_at — **APPEND-ONLY trigger prevents UPDATE/DELETE**

### Tenants & Network
6. `operators` — id (OP-NP-XXXX format), legal_name, brand_name, pan_no, pan_verified, status (pending/approved/suspended/under_audit), contact_email, contact_phone, primary_address, logo_url, created_at, commission_rate numeric, created_at, approved_at, suspended_at
7. `operator_kyc_documents` — id, operator_id fk, doc_type enum (DoTM License, Company Reg, PAN/VAT, Insurance, PAN), file_url, status, uploaded_at, verified_at, notes
8. `operator_staff` — id, operator_id fk, user_id fk, staff_role, created_at
9. `bookie_counters` — id, counter_code, operator_id fk, owner_name, location GEOGRAPHY(POINT), address, float_balance numeric, float_limit numeric, is_active, created_at

### Fleet & Scheduling
10. `cabin_layouts` — id, operator_id fk, name (e.g., "2x2 Deluxe Coach"), layout_json (seats map with rows, cols, types: regular/lady/sleeper/vip/door/driver), deck_count, total_seats, created_at
11. `buses` — id, operator_id fk, plate_number (e.g., "BA 2 KHA 4512"), nickname, cabin_layout_id fk, vehicle_type enum (Deluxe/AC/VIP_Sofa/Sleeper), amenities jsonb (wifi, charging, water_bottle, blanket, reading_light, cctv), telematics_enabled bool, registration_doc_url, insurance_doc_url, fitness_cert_url, status enum, created_at
12. `cities` — id, name, name_ne (Devanagari), district, province, is_pickup_hub bool
13. `routes` — id, operator_id fk, origin_city_id fk, destination_city_id fk, route_name, corridor_name, distance_km numeric, base_fare numeric, is_active, created_at
14. `route_stops` — id, route_id fk, sequence int, stop_name, location GEOGRAPHY(POINT,4326), geofence_radius_m int default 1500, is_boarding bool, is_dropping bool, arrival_offset_minutes int, created_at
15. `trips` — id, operator_id fk, bus_id fk, route_id fk, trip_date date, departure_time timestamptz, arrival_time timestamptz, driver_id fk, conductor_id fk, status enum (scheduled/boarding/in_transit/completed/cancelled), fare numeric, available_seats int, created_at
16. `trip_seats` — id, trip_id fk, seat_label (e.g., "A1"), status enum (available/locked/booked/held_crew), locked_by fk, locked_until timestamptz, booking_id fk, from_segment_start int, to_segment_end int, version int default 0
    - Uses `version` for optimistic concurrency; segment exclusion via GiST for partial-route bookings

### Ticketing & Payments
17. `bookings` — id, pnr (unique, format YS-XXXX-XXXXXX), user_id fk, trip_id fk, counter_id fk (nullable for online), channel enum (online/bookie/conductor), status enum (PENDING_PAYMENT/CONFIRMED/CANCELLED/REFUNDED), total_fare numeric, discount numeric, tax_amount numeric, platform_fee numeric, net_payable numeric, coupon_id fk, passenger_count int, seat_labels text[], booking_source, created_at, confirmed_at, cancelled_at, cancellation_reason
18. `booking_passengers` — id, booking_id fk, full_name, age, gender, seat_label, id_type, id_number, checked_in bool, checked_in_at, checked_in_by fk
19. `coupons` — id, code, discount_type enum (percent/fixed), discount_value, min_fare numeric, max_discount numeric, starts_at, expires_at, usage_limit, used_count, is_active
20. `payment_transactions` — id, booking_id fk, gateway enum (esewa/khalti/connectips/fonepay/bookie_float/conductor_cash), amount numeric, gateway_transaction_id, gateway_status, request_payload jsonb, response_payload jsonb, verified bool, verified_at, created_at

### Ledger & Telemetry
21. Ledger (3 sub-tables for strict double-entry):
    - `ledger_accounts` — id, account_type enum (Platform_Gateway_Escrow/Bookie_Prepaid_Float_Wallet/Operator_Payable_Account/Platform_Commission_Rev/Tax_TDS_Payable/Passenger_Receivable/Conductor_Cash_Undeposited), account_owner_type, account_owner_id, current_balance numeric, currency default 'NPR'
    - `ledger_journal_entries` — id, description, entry_type enum (booking_payment/cancellation_refund/settlement_payout/bookie_float_topup/conductor_remittance/tds_remittance), reference_type, reference_id, created_by, created_at
    - `ledger_postings` — id, journal_entry_id fk, account_id fk, debit_amount numeric default 0, credit_amount numeric default 0, created_at — **TRIGGER enforces debit+credit balance and APPEND-ONLY**
22. `settlement_payouts` — id, operator_id fk, period_start date, period_end date, gross_collected numeric, commission_deducted numeric, tds_deducted numeric, net_payable numeric, status enum (pending/approved/processing/paid/failed), nchl_batch_id, paid_at, created_at
23. `trip_gps_telemetry` — id, trip_id fk, bus_id fk, recorded_at timestamptz, location GEOGRAPHY(POINT,4326), speed_kmh numeric, heading_deg numeric, accuracy_m numeric, source enum (driver_app/hardware_tracker) — **PARTITIONED BY trip_id via pg_partman**

---

## 5. REDIS LUA SEAT-LOCK INVARIANTS

### Lock TTL
- Online customers: 600 seconds (10 minutes) — "SETEX seat_lock:{tripId}:{seatLabel} 600 {actorId}"
- Bookie counter: 180 seconds (3 minutes) — faster turnaround
- Conductor walk-in: instant confirmation (no lock, direct booking in PG tx)

### acquire-seats.lua contract
1. Input: KEYS = [lock keys for each seat], ARGV = [actorId, ttl, tripId]
2. For each key, run `SET key actorId NX EX ttl`
3. If ALL succeed → return {1, "ok"}
4. If ANY fail → roll back all previously-acquired keys (DELETE), return {0, failedSeatLabel}
5. On success caller MUST immediately open PG transaction and:
   - SELECT trip_seats WHERE seat_label IN (...) AND status='available' FOR UPDATE
   - UPDATE to status='locked', locked_by=actorId, locked_until=now()+ttl, version=version+1
   - INSERT booking with status='PENDING_PAYMENT'
   - COMMIT then Socket.IO emit SEAT_STATE_CHANGED

### release-seats.lua contract
- Input: KEYS, ARGV = [actorId]
- Verify lock owner matches actorId before DELETE (prevents releasing others' locks)

---

## 6. DOUBLE-ENTRY LEDGER MATH

For every booking of NPR X with platform commission C% and TDS 1.5%:

```
DR  Passenger_Receivable (or Gateway_Escrow on capture)  X
    CR  Operator_Payable_Account                          X * (1 - C)
    CR  Platform_Commission_Rev                          X * C
    DR  Operator_Payable_Account                         X * C * 0.015
    CR  Tax_TDS_Payable                                  X * C * 0.015

Net operator payable per booking = X * (1 - C) * (1 - 0.015)
Settlement batch = Σ confirmed bookings for period - Σ refunds
```

All operations post within a single PG SERIALIZABLE transaction. The `ledger_postings` trigger enforces:
- Σ(debit_amount) = Σ(credit_amount) per journal_entry_id
- No UPDATE/DELETE allowed (append-only)

---

## 7. NEPAL PAYMENT GATEWAY SPECS

### eSewa ePay v2
- **Init:** Form POST to `https://epay.esewa.com.np/api/epay/main/v2/form` with `amount`, `tax_amount`, `total_amount`, `transaction_uuid`, `product_code`, `product_service_charge=0`, `product_delivery_charge=0`, `success_url`, `failure_url`, `signed_field_names=total_amount,transaction_uuid,product_code`, `signature=HMAC-SHA256(secret, "total_amount=X,transaction_uuid=Y,product_code=Z")`
- **Verify:** Server GET `https://epay.esewa.com.np/api/epay/transaction/status/?product_code=X&total_amount=Y&transaction_uuid=Z` → must return `status: "COMPLETE"`
- Amounts in NPR (rupees, NOT paisa) as strings.

### Khalti KPG-2
- **Init:** POST `https://khalti.com/api/v2/epayment/initiate/` with `return_url`, `website_url`, `amount` (in PAISA, multiply by 100), `purchase_order_id`, `purchase_order_name`, `customer_info`, Authorization: `Key <secret_key>`
- Returns `pidx`, `payment_url`
- **Verify:** POST `https://khalti.com/api/v2/epayment/lookup/` with `pidx` → must return `status: "Completed"`

### ConnectIPS / NCHL NPI
- **Init:** POST to ConnectIPS endpoint with MERCHANT_ID, APP_ID, APP_NAME, TXNID (uuid), TXNDATE, TXNCRNCY="NPR", TXNAMT, REFERENCEID, REMARKS, PARTICULARS, TOKEN=SHA256withRSA(base64(pfx), hash-of-txn-fields)
- `.pfx` private key loaded from secure env, signed per NCHL spec
- **Verify:** POST `/connectipswebws/api/creditor/validatetxn` with MERCHANT_ID, APP_ID, TXNID, TOKEN → status=SUCCESS and amount match before confirming booking

### Fonepay Dynamic QR (EMVCo)
- Generate EMVCo-compliant QR payload including merchant ID, MID, amount, reference, CRC16
- Sign the payload portion with HMAC-SHA512(secret, nonce+amount+ref)
- Merchant shows QR; after customer pays, Fonepay sends callback to our webhook and/or we poll
- WebSocket listener pushes payment confirmation back to Bookie POS / Conductor screen

### Bookie Prepaid Float
- Bookie must have float_balance >= Gross Fare - Bookie Net Commission (i.e., net payout owed to platform)
- Float top-up via manual admin credit or ConnectIPS transfer
- Booking = atomic Redis lock + PG transaction that debits float wallet ledger entry

---

## 8. NOTIFICATIONS

### Sparrow SMS API v2
- POST `https://api.sparrowmessages.com/v2/sms` with `token`, `from`, `to`, `text`
- Single-segment PNR ≤ 160 chars, Devanagari supported
- Secondary failover: alternate SMS provider on consecutive 5xx
- OTPs: 6-digit, 5-minute expiry, max 3 sends per phone per 15 minutes
- Geofence alerts: 1.5 km PostGIS `ST_DWithin(bus_location, stop_location, 1500)` triggers SMS "Your bus YS-XXXX is approaching {stop_name}"

### Email + PDF e-ticket
- SMTP transport with HTML Nunjucks templates
- PDF e-ticket generated as vector PDF (pdfmake) with HMAC-SHA256 signed QR code
- QR payload: `yatrasewa://verify/{pnr}?sig=HMAC_SHA256(pnr,secret)` → offline-verifiable by conductor app

---

## 9. TIME ZONE, CURRENCY & TAX
- All server times in UTC; display in Asia/Kathmandu (NPT, UTC+05:45)
- Currency: NPR (Nepalese Rupee), symbol रू, 2-decimal NUMERIC
- TDS on commission to operators: 1.5% as per Nepal Income Tax Act service payments
- All money math uses Prisma Decimal / pg NUMERIC(14,2) — JS floating point FORBIDDEN in ledger code

---

## 10. IMPORTANT LESSONS (append as you debug)

_(to be filled during implementation)_
