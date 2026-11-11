# YatraSewa — Design System Specification (.stitch/DESIGN.md)

> Reference UI boards: `Mobile View-YatraSewa.png`, `YatraSewa- Company Panel.png`, `Mobile View-YatraSewa (1).png`, `Mobile View-YatraSewa (2).png`.
> All UI implementations (Web + Mobile) must match these tokens exactly.

## Brand
- **Product name:** YatraSewa
- **Tagline:** "Seamless transit across Nepal"
- **Mark:** Bus silhouette inside rounded emerald square with radiating waves (see mobile splash).

## Color Palette

### Primary Brand
| Token | Hex | Usage |
|---|---|---|
| `--ys-emerald` | `#08976B` | CTAs, active tab, primary buttons, checkmarks, selected payment radio |
| `--ys-emerald-hover` | `#0B7A5A` | Button hover state |
| `--ys-deep-pine` | `#175C49` | Splash screen background, header bars, super admin top bar, app icons |
| `--ys-mint` | `#3CB58C` | Light badges, secondary highlights, soft success chips |
| `--ys-mint-tint` | `#E8FFEE` | Selected seat fill, success background, approved badges |

### Semantic Status
| Token | Hex | Usage |
|---|---|---|
| `--ys-success` | `#14813E` | Confirmed, Approved, Complete |
| `--ys-warning` | `#B3570C` | Pending Payment, Attention, Conflict |
| `--ys-danger` | `#C92D30` | Cancelled, Overdue, Suspended, Delete actions |
| `--ys-info` | `#405491` | Info banner, secondary actions |

### Surfaces & Ink
| Token | Hex | Usage |
|---|---|---|
| `--ys-surface` | `#FFFFFF` | Cards, modals, panels |
| `--ys-canvas` | `#F7F8FA` | App background, page canvas |
| `--ys-border` | `#E2E7ED` | Dividers, inputs, card outlines |
| `--ys-ink-primary` | `#1E1E1E` | Headings, body |
| `--ys-ink-muted` | `#4A505C` | Captions, secondary text, timestamps |
| `--ys-ink-subtle` | `#8B93A3` | Placeholder, disabled |

## Typography
- **Headings:** Plus Jakarta Sans, weights 600 / 700
- **Body / UI / NPR tabular figures:** Inter, weights 400 / 500, with `font-variant-numeric: tabular-nums` for NPR amounts and PNR codes
- **OTP digits:** Inter 700, tabular-nums, 28px per slot
- **Monospace/amounts:** Inter 500/600 tabular-nums
- **Body font size:** 14px (web compact) / 15px (mobile)
- **Page title:** 22px/700 (mobile) / 28px/700 (web)

## Radii
- Cards: 12px
- Buttons / Inputs / Badges: 8px
- FAB / Circular avatars: 9999px
- Modals: 16px top corners (mobile bottom sheet style)
- Screen hero: 0px (emerald header bleeds to top edge)

## Spacing (4px grid)
- xs = 4px, sm = 8px, md = 12px, base = 16px, lg = 20px, xl = 24px, 2xl = 32px

## Shadows
- Card: `0 1px 3px rgba(30,30,30,.06), 0 1px 2px rgba(30,30,30,.04)`
- Modal bottom sheet: `0 -8px 24px rgba(23,92,73,.10)`
- Float/FAB: `0 6px 20px rgba(8,151,107,.35)`
- Active card: `0 4px 14px rgba(8,151,107,.20)`

## Icons
- Line style, 1.75px stroke, rounded ends
- Primary bus/schedule/route/ticket/gps/qr/wallet icons use emerald/deep-pine fill
- Navigation bar: 24px line icons; active tab emerald, inactive muted

## Seat Matrix Color Rules (SVG)
- Available: white fill, `#E2E7ED` stroke
- Selected: `#E8FFEE` fill, `#08976B` stroke, label in `#08976B`
- Booked/Sold: `#F1F3F6` fill, `#C92D30` X mark, not interactive
- Locked by another user: soft pink `#FCE8E8` with spinner, not interactive
- Lady-reserved: pink tint `#FCE7F1` border, `#D93F82`
- Sleeper: 2:1 rectangle, same color logic
- Driver seat: grey circle with steering wheel icon, non-selectable
- Door: simple door icon, non-selectable

## Bottom Navigation (Mobile)
- 4 tabs: Home, Bookings, Alerts, Account (customer); variant for other roles
- Active tab: emerald icon + emerald label; inactive: muted
- Floating emerald Scan/Action FAB centered between tabs (conductor/driver roles)

## Button Variants
1. **Primary CTA** (Search buses, Continue to payment, Pay Rs. X, Approve Payout)
   - bg `#08976B`, white text, h-12, 8px radius, 600 weight
   - Hover: `#0B7A5A`; Disabled: `#C8EADB` with white text at 50%
2. **Secondary / Ghost** (Select seats, Keep booking, View details)
   - bg white, `#08976B` text + border `#08976B`
3. **Danger** (Confirm cancellation, Block/Suspend)
   - bg `#C92D30`, white text
4. **Text Link**
   - `#08976B` text, no background
5. **Small chip** (4 SEATS ASSIGNED, A/C DELUXE, LIVE SYNC)
   - 24px height, 12px text, bg `#E8FFEE` text `#08976B` OR neutral `#F1F3F6` text `#4A505C`

## Card Pattern (repeats across web + mobile)
- White bg, 12px radius, `--ys-card-shadow`
- 16px padding (mobile) / 20px (web)
- Header row: operator name left, NPR price right in tabular-num Inter 600
- Sub row: times (07:00 AM → 01:30 PM), duration, distance
- Amenity chips row: Wi-Fi, Charging, Water bottle, Blanket, Reading light, CCTV
- Footer CTA: "Select seats →" emerald ghost button right-aligned

## Payment Method Radio List
- Each row: payment icon left, name+meta middle, emerald radio ring right
- Selected row: `#E8FFEE` bg, `#08976B` ring around radio
- Methods: eSewa (POPULAR), Khalti (WALLET), FonePay (QR & BANK), ConnectIPS (BANK)
- Cash options for Conductor walk-in

## Cancellation Slab Table (on bus details screen)
| Rule | Refund |
|---|---|
| >24h before departure | 100% fee 0% |
| 12-24h before | 25% fee / 75% refund |
| 6-12h before | 50% fee / 50% refund |
| <6h / No-show | No refund (100% fee) |
- Rendered as green-tinted percentage bars

## Live Indicator Pill
- 8px emerald pulsing dot + "LIVE SYNC" text in small caps
- Used on Bookie/Counter/Driver/SuperAdmin live status screens

## Approved / Verified Badge
- Emerald fill, white checkmark, "Verified Operator" / "Approved"
- Red "Suspended" / "Under Audit" / "Pending Payment" variants use danger/warning
