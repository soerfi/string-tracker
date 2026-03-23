# String Tracker - AI System Instructions

Welcome, future AI! You are working on "String Tracker", a modern Next.js CRM designed specifically for tennis stringers to manage customers, string inventory, and calculate physical string decay over time. 

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Lucide React icons
- **Database**: SQLite
- **ORM**: Prisma (`npx prisma studio` to view data, `npx prisma db push` to sync schema)
- **Scanning**: `html5-qrcode`

## 🧠 Core Architecture & Features
### 1. Database Schema (`prisma/schema.prisma`)
- **Player**: The customer. Holds `skillMultiplier` (affects string life) and `weeklyFrequency` (play time).
- **Racket**: Specific rackets owned by a Player. Uniquely identified by `qrCodeToken`.
- **TennisString**: Inventory of strings. Features a `baseLifeHours` property which is dynamically calculated from physical traits (Material, Surface friction, Gauge thickness).
- **StringJob**: The core transactional relationship. Connects Player + Racket + String. Holds `tensionMain`, `tensionCross`, `status` (`PENDING` or `DONE`), and `isPaid`.

### 2. Admin Dashboard (`/admin`)
- **Jobs Engine (`/admin/jobs/[id]`)**: Where stringers mark jobs as done, change tensions, and flag grommet/grip issues.
- **Customers (`/admin/customers`)**: Modal-based CRM. Admins can create new customers, link new Rackets to them, and generate/scan QR codes directly from the browser to pull up their data.
- **Strings (`/admin/strings`)**: Contains a live Physics Calculator. When creating a string, the UI scales the `baseLifeHours` linearly via material, applying a 0.85x penalty for profiled strings, and geometrically adjusting for gauge thickness (1.25mm = 1.0x baseline).

### 3. Public Player View (`/player/[id]`)
- Unauthenticated public page accessible via scanned QR codes.
- Features a **String Decay Engine** (`src/lib/decay.ts`):
  - Formula dynamically mixes the `baseLifeHours` of the string against the player's `skillMultiplier` and slider-adjustable `weeklyFrequency`.
  - Computes the EXACT DAY the string mathematically loses its snapback and needs replacement.
  - Implements robust strict Midnight `Date()` comparisons to prevent `Math.ceil()` timezone/hour rounding glitches.
- A flashing `🚨 SAITE ERSETZEN!` alert triggers when `daysLeft <= 0`.

## ⚠️ Known Gotchas & Coding Guidelines
1. **Next.js Caching**: If changes don't reflect, delete `.next` and restart `npm run dev`.
2. **Server/Client Components**: UI components manipulating hooks (useState/useEffect) MUST have `"use client";` at the top. Data fetching is primarily done in Server Components (`page.tsx`) mapping data downwards.
3. **Prisma Type Lag**: Frequently `npx prisma generate` after schema changes. The local IDE typescript server might hallucinate that schema properties are missing (e.g. `email` on `PlayerCreateInput` or `status` on `WhereInput`). If the build `npm run build` succeeds, safely ignore the IDE linting ghosts!
4. **Dates Math**: Never perform direct floating-point Date subtraction for "Days Left" without first rounding both `Date` objects down to their midnight origin, otherwise `Math.ceil` will create an off-by-one calendar error for end users depending on the time of day.
5. **Design Aesthetics**: Keep to the established Dark Mode theme. App uses `#0a0a0a` background, `#161616` cards, and glowing `#10b981` (Neon Tennis Green) as the primary brand accent. Maintain rounded-3xl corners and shadow halos for a premium iOS-like glass feeling.
6. **Whitespace Preservation**: Use the `whitespace-pre-line` Tailwind class to safely render textarea descriptions pulled from the DB with natural user linebreaks preserved.
7. **Docker Phantom Containers**: When running `--no-cache` builds or wiping old images, older versions of `docker-compose` can crash with `KeyError: 'ContainerConfig'` because of orphaned hex-named shadow containers. **ALWAYS** use `./deploy.sh` to construct and swap the containers seamlessly! It internally executes `docker-compose down --remove-orphans && docker system prune -f` before building.
8. **Framer Motion Mobile Triggers**: `amount` thresholds on `useInView` can fail to delay animations on tall mobile screens when content overflows the viewport. Use explicit viewport margins (e.g., `margin: "0px 0px -25% 0px"`) to reliably force the user to scroll before triggering sweeping `strokeDashoffset` animations.
9. **Interactive Framer Physics**: Never tie a React slider drag-hook (e.g. `onChange`) into a fixed-duration `animate()` Tween. Dragging generates 60 updates per second, instantly snapping Tweens and causing severe visual stutter! Always switch interactive real-time updates to `type: "spring", bounce: 0` to let the physics engine fluidly track the rapidly moving target value.
## 🚀 Execution Defaults
- Run Dev: `npm run dev`
- Build Verification: `npm run build && npm run lint`
- Clean DB Wipe: Delete `prisma/dev.db` and push.
