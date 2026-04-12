# GameVault — Personal Game Library
## Complete Technical Documentation

---

> **CRITICAL INSTRUCTION FOR ANTIGRAVITY:**
> You MUST read every single line of this documentation before writing a single line of code. Do not skim. Do not skip sections. This document is the source of truth. Any deviation from the spec here will result in bugs, broken UI, or security issues. After reading this document in full, read the installed skills and global rules before proceeding.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Variables](#3-environment-variables)
4. [Supabase Setup via MCP](#4-supabase-setup-via-mcp)
5. [Project Structure](#5-project-structure)
6. [Authentication System](#6-authentication-system)
7. [API Routes — Full Specification](#7-api-routes--full-specification)
8. [Frontend Pages — Full Specification](#8-frontend-pages--full-specification)
9. [Design System — The Verge](#9-design-system--the-verge)
10. [Component Specifications](#10-component-specifications)
11. [Responsive Behavior](#11-responsive-behavior)
12. [Error Handling](#12-error-handling)
13. [Performance Requirements](#13-performance-requirements)
14. [Step-by-Step Build Order](#14-step-by-step-build-order)

---

## 1. Project Overview

**GameVault** is a private, password-protected personal game library web application. It is built for a single admin user who wants to:

- Browse their personal game collection in a beautiful UI
- Add games by searching IGDB (the industry-standard game database)
- Attach a download link and an optional save/backup link to each game
- Edit or delete games at any time
- Switch between a grid view (poster-dominant) and a list view (metadata-dominant)

This is NOT a multi-user app. There is no signup, no user accounts, no public access. It is a personal tool gated by a single admin password.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use App Router, not Pages Router |
| Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS + CSS Modules | Tailwind for layout/spacing, CSS for design system tokens |
| Database | Supabase (PostgreSQL) | Setup via MCP |
| Game Data | IGDB API | Requires Twitch OAuth server-side |
| Auth | Custom password gate | No NextAuth, no Clerk — just a simple password check |
| State | React useState/useEffect | No Redux, no Zustand needed |
| Icons | Lucide React | Lightweight, consistent |
| Fonts | Google Fonts: Anton (Manuka substitute) + Space Mono + DM Sans | See Design System section |

---

## 3. Environment Variables

Create a `.env.local` file in the project root. NEVER commit this file. These variables must all be present or the app will not function.

```env
# Admin Authentication
ADMIN_PASSWORD=your_secure_password_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# IGDB / Twitch (server-side only — NO NEXT_PUBLIC prefix)
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

**Security rules:**
- `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` must NEVER have the `NEXT_PUBLIC_` prefix. They are server-side only.
- `SUPABASE_SERVICE_ROLE_KEY` is also server-side only — no `NEXT_PUBLIC_` prefix.
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose to the client.

---

## 4. Supabase Setup via MCP

**USE THE SUPABASE MCP TO PERFORM ALL OF THE FOLLOWING STEPS. Do not ask the user to do this manually.**

### 4.1 Create the `games` Table

Run this SQL via the Supabase MCP:

```sql
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  igdb_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  cover_url TEXT,
  release_year INTEGER,
  genres TEXT[],
  rating NUMERIC(4, 1),
  platforms TEXT[],
  summary TEXT,
  download_link TEXT NOT NULL,
  save_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Row Level Security

Run this SQL via the Supabase MCP to enable RLS and allow all operations (since auth is handled at the app level, not Supabase level):

```sql
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON games
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 4.3 Indexes

Run this SQL via the Supabase MCP for performance:

```sql
CREATE INDEX idx_games_igdb_id ON games(igdb_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_title ON games(title);
```

### 4.4 Verify

After running the above, confirm via MCP that:
- The `games` table exists with all columns
- RLS is enabled
- The policy exists
- All 3 indexes exist

---

## 5. Project Structure

```
gamevault/
├── app/
│   ├── layout.tsx                  # Root layout with fonts and global styles
│   ├── page.tsx                    # Password gate (the login page)
│   ├── library/
│   │   └── page.tsx                # Main library page (protected)
│   └── api/
│       ├── auth/
│       │   └── route.ts            # POST — validate password
│       ├── igdb/
│       │   ├── search/
│       │   │   └── route.ts        # GET — search games by name or ID
│       │   └── game/
│       │       └── [id]/
│       │           └── route.ts    # GET — fetch single game details
│       └── games/
│           └── route.ts            # GET all, POST new, PATCH edit, DELETE
├── components/
│   ├── PasswordGate.tsx            # The login form component
│   ├── Library.tsx                 # The main library shell
│   ├── GameGrid.tsx                # Grid view of game cards
│   ├── GameList.tsx                # List view of game rows
│   ├── GameCard.tsx                # Individual card (grid mode)
│   ├── GameRow.tsx                 # Individual row (list mode)
│   ├── AddGameModal.tsx            # Modal for adding a game
│   ├── EditGameModal.tsx           # Modal for editing a game
│   ├── SearchResults.tsx           # IGDB search result picker
│   ├── ViewToggle.tsx              # Grid/list toggle button
│   ├── SearchBar.tsx               # Filter the local library
│   └── Toast.tsx                   # Success/error toast notifications
├── lib/
│   ├── supabase.ts                 # Supabase client (client-side)
│   ├── supabaseServer.ts           # Supabase client (server-side, service role)
│   ├── igdb.ts                     # IGDB token fetching and API calls
│   └── auth.ts                     # Auth helper (check session)
├── types/
│   └── index.ts                    # All TypeScript types
├── styles/
│   └── globals.css                 # CSS variables (design system tokens)
├── public/
│   └── favicon.ico
├── .env.local                      # NEVER commit this
├── .gitignore                      # Must include .env.local
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 6. Authentication System

### How it works

1. User lands on `/` — sees the password gate UI
2. User enters password and submits
3. Frontend POSTs to `/api/auth` with the password
4. API route compares against `process.env.ADMIN_PASSWORD`
5. If correct, returns `{ success: true }` and the frontend stores `authenticated: true` in `localStorage`
6. Frontend redirects to `/library`
7. On every load of `/library`, the component checks `localStorage` for the auth flag. If missing, redirects to `/`

### Security note

This is a simple single-user personal tool. The localStorage approach is intentional and acceptable for this use case. Do not over-engineer with JWTs or cookies unless the user asks.

### `/api/auth/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  
  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }
  
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
```

---

## 7. API Routes — Full Specification

### 7.1 IGDB Token Management — `lib/igdb.ts`

IGDB requires a Twitch OAuth token. This token expires and must be cached and refreshed. Implement a simple in-memory cache:

```typescript
let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getIGDBToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }
  
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )
  
  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000 // 5 min buffer
  return cachedToken
}

export async function igdbFetch(endpoint: string, body: string) {
  const token = await getIGDBToken()
  
  return fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
}
```

### 7.2 IGDB Search — `GET /api/igdb/search?q=name` or `GET /api/igdb/search?id=123`

```typescript
// Query by name: returns up to 8 results
// Query by ID: returns exact match

// IGDB fields to fetch:
// id, name, cover.url, first_release_date, genres.name, 
// rating, platforms.name, summary
```

**Response shape:**
```typescript
{
  results: IGDBGame[]
}
```

**IGDB cover URL transformation:** IGDB returns URLs like `//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg`. Transform these to HTTPS and replace `t_thumb` with `t_cover_big` for proper resolution.

```typescript
function transformCoverUrl(url: string): string {
  return `https:${url.replace('t_thumb', 't_cover_big')}`
}
```

### 7.3 Games CRUD — `/api/games/route.ts`

**GET** — Return all games from Supabase ordered by `created_at DESC`

**POST** — Insert a new game. Body:
```typescript
{
  igdb_id: number
  title: string
  cover_url: string
  release_year: number
  genres: string[]
  rating: number
  platforms: string[]
  summary: string
  download_link: string
  save_link?: string
}
```

Validate that `igdb_id` doesn't already exist in the table before inserting. If it does, return `{ error: 'Game already in library' }` with status 409.

**PATCH** — Update `download_link` and/or `save_link` by game `id`. Body:
```typescript
{
  id: string
  download_link?: string
  save_link?: string
}
```

**DELETE** — Delete by game `id`. Query param: `?id=uuid`

All routes use `supabaseServer.ts` (service role key) for database access.

---

## 8. Frontend Pages — Full Specification

### 8.1 Password Gate — `app/page.tsx`

**Layout:**
- Full screen, centered vertically and horizontally
- Background: `#131313`
- Large "GAMEVAULT" wordmark at the top in Anton font, mint color `#3cffd0`
- Subline: "PRIVATE LIBRARY" in Space Mono, uppercase, `#949494`, 1.8px letter-spacing
- Password input below with show/hide toggle
- "ENTER" button — mint pill button
- On wrong password: shake animation on the input + red border briefly + toast error
- On correct password: brief success state then redirect

**Behavior:**
- Check localStorage on mount — if already authenticated, redirect to `/library` immediately
- On submit: POST to `/api/auth`, handle response

### 8.2 Library Page — `app/library/page.tsx`

**Layout sections (top to bottom):**

1. **Header/Nav bar** — sticky, `#131313` background, 1px bottom border `#ffffff`
   - Left: "GAMEVAULT" wordmark in Anton, mint, links to `/library`
   - Center (desktop): search bar to filter the local library
   - Right: View toggle (grid/list) + "ADD GAME" mint pill button + logout icon

2. **Search bar (mobile)** — below the nav on mobile, full width

3. **Game count** — Small mono uppercase label: "XX GAMES IN YOUR VAULT"

4. **Grid or List view** — the main content area

5. **Empty state** — When no games: large centered message "YOUR VAULT IS EMPTY" with a "ADD YOUR FIRST GAME" button

**Add Game Flow:**
- Click "ADD GAME" → `AddGameModal` opens
- User types a game name OR pastes an IGDB numeric ID
- As user types (debounced 400ms), fetch from `/api/igdb/search?q=query`
- If input is purely numeric, also try `/api/igdb/search?id=number`
- Show up to 8 results in a scrollable list inside the modal
- User clicks a result to select it — shows a preview (cover, title, year, genres, rating)
- Two inputs appear: "DOWNLOAD LINK" (required) and "SAVE LINK" (optional)
- "ADD TO VAULT" button submits to `/api/games` POST
- On success: close modal, refresh library, show success toast

**Edit Game Flow:**
- Hover over a game card → edit icon appears (pencil, top-right corner)
- Click → `EditGameModal` opens pre-filled with current links
- User can update download link, save link, or click "REMOVE FROM VAULT" (red destructive action)
- Confirm delete with a simple "Are you sure?" step inside the modal
- On save: PATCH to `/api/games`, refresh library
- On delete: DELETE to `/api/games?id=uuid`, refresh library

---

## 9. Design System — The Verge

**Read this section completely. Every value here is intentional.**

### 9.1 Color Tokens (define in `globals.css`)

```css
:root {
  --canvas: #131313;
  --surface: #2d2d2d;
  --mint: #3cffd0;
  --mint-dark: #309875;
  --ultraviolet: #5200ff;
  --ultraviolet-dark: #3d00bf;
  --text-primary: #ffffff;
  --text-secondary: #949494;
  --text-muted: #e9e9e9;
  --text-inverted: #131313;
  --text-absolute-black: #000000;
  --link-hover: #3860be;
  --border-default: #ffffff;
  --border-mint: #3cffd0;
  --border-surface: #313131;
  --focus-ring: #1eaedb;
}
```

### 9.2 Fonts

Use Google Fonts. Import in `app/layout.tsx`:

```typescript
import { Anton, Space_Mono, DM_Sans } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-mono' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
```

**Font usage rules:**
- `Anton` (var `--font-display`) → Wordmark and hero titles only. Minimum 48px. UPPERCASE always.
- `Space Mono` (var `--font-mono`) → ALL CAPS labels, timestamps, tags, button text, category labels. Always uppercase. Letter-spacing: 1.1px–1.9px.
- `DM Sans` (var `--font-body`) → Everything else: body text, headlines inside cards, inputs, metadata.

### 9.3 Border Radius Scale

```
2px  — inputs, form fields
4px  — nested images
20px — standard cards (GameCard, GameRow)
24px — feature/large cards, primary buttons
30px — promotional outlined buttons
40px — large pill CTA buttons
```

Never use square corners on cards or buttons.

### 9.4 Depth / Elevation

- NO `box-shadow` for elevation. Forbidden.
- Use `1px solid var(--border-default)` for card outlines
- Use `1px solid var(--mint)` for active/focused states
- Use saturated accent fill (mint background) to make something visually "pop"
- The only allowed shadow is `0px -1px 0px 0px inset` for active tab underlines

### 9.5 Button Styles

**Primary (Mint Pill):**
```css
background: var(--mint);
color: var(--text-absolute-black);
font-family: var(--font-mono);
font-size: 12px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1.5px;
border-radius: 24px;
padding: 10px 24px;
border: none;
transition: background 180ms ease;
```
Hover: `rgba(255, 255, 255, 0.2)` background, black text, `1px solid #c2c2c2` ring

**Secondary (Slate Pill):**
```css
background: var(--surface);
color: var(--text-muted);
font-family: var(--font-body);
font-size: 16px;
border-radius: 24px;
padding: 10px 24px;
border: none;
```

**Destructive (Delete):**
```css
background: transparent;
color: #ff4444;
border: 1px solid #ff4444;
border-radius: 24px;
padding: 10px 24px;
font-family: var(--font-mono);
font-size: 12px;
text-transform: uppercase;
letter-spacing: 1.5px;
```

### 9.6 Input Styles

```css
background: var(--canvas);
border: 1px solid var(--text-secondary);
border-radius: 2px;
color: var(--text-primary);
font-family: var(--font-body);
font-size: 15px;
padding: 12px 16px;
transition: border-color 150ms ease;
```
Focus: `border-color: var(--mint)`
Error: `border-color: var(--ultraviolet)`

---

## 10. Component Specifications

### 10.1 GameCard (Grid View)

- Container: 20px border-radius, `1px solid var(--border-default)`, background `var(--canvas)`
- Cover image: 16:9 or 3:4 aspect ratio, object-fit cover, 4px inner radius, full width
- Padding below image: 16px
- Category label: Space Mono, 10px, uppercase, `var(--mint)`, 1.8px tracking
- Title: DM Sans 700, 18px, white, 2 lines max with ellipsis overflow
- Metadata row: DM Sans 400, 12px, `var(--text-secondary)` — "2023 · RPG · 87.4"
- Two buttons at bottom: "DOWNLOAD" (mint pill) and "SAVE" (outline pill, hidden if no save_link)
- Edit icon: appears on hover, top-right corner, pencil icon, `var(--text-secondary)`
- Hover on title: color transitions to `var(--link-hover)` (#3860be)

**Button behavior:**
- Clicking "DOWNLOAD" or "SAVE": opens link in new tab AND copies to clipboard simultaneously
- Show a brief "COPIED!" tooltip for 1.5 seconds after copy

### 10.2 GameRow (List View)

- Full width row, 20px border-radius, `1px solid var(--border-default)`, `var(--canvas)` background
- Padding: 16px 20px
- Left: cover thumbnail 60×80px (4px radius)
- Middle: title (DM Sans 700, 18px, white), then metadata row (year · genres · rating), then platforms
- Right: "DOWNLOAD" and "SAVE" buttons stacked vertically + edit icon
- On mobile: buttons move below the text, full width

### 10.3 AddGameModal / EditGameModal

- Full screen overlay: `rgba(0, 0, 0, 0.85)` backdrop
- Modal container: `var(--surface)` background, 24px border-radius, `1px solid var(--border-default)`
- Max width: 560px, centered
- Header: "ADD TO VAULT" or "EDIT GAME" in Space Mono uppercase
- Close button: X icon, top-right
- Search input with a search icon inside
- Results list: scrollable, max 320px height, each result is a row with thumbnail + title + year
- Selected game preview: cover + metadata displayed before the link inputs
- Link inputs: labeled "DOWNLOAD LINK *" and "SAVE LINK (OPTIONAL)"
- Action buttons at bottom

**Modal animation:**
- Backdrop fades in: `opacity 0 → 1`, 200ms
- Modal slides up: `translateY(20px) → translateY(0)`, 250ms ease-out

### 10.4 Toast Notifications

- Fixed position: bottom-right, 24px from edges
- Background: `var(--surface)`, `1px solid` border (mint for success, red for error)
- Space Mono, 12px, uppercase
- Auto-dismiss: 3 seconds
- Slide in from right: `translateX(100%) → translateX(0)`, 200ms

### 10.5 ViewToggle

- Two icon buttons: grid icon and list icon
- Active state: mint color with mint border underline
- Inactive state: `var(--text-secondary)`
- Transition: 150ms

---

## 11. Responsive Behavior

This is critical. The app must be fully functional and beautiful at ALL screen sizes. Test every breakpoint.

### Breakpoints

```css
/* Mobile: < 640px */
/* Tablet: 640px – 1023px */
/* Desktop: ≥ 1024px */
```

### Nav (Header)

- **Desktop**: logo left, search center, actions right — all in one row
- **Tablet**: logo left, actions right, search bar drops to second row
- **Mobile**: logo left, hamburger/add button right, search bar below full width

### Grid View Columns

- **Mobile (< 640px)**: 2 columns
- **Tablet (640–1023px)**: 3 columns
- **Desktop (≥ 1024px)**: 4 columns
- **Large desktop (≥ 1280px)**: 5 columns

### List View

- Always single column, full width
- On mobile: stack cover + text vertically if needed

### Modal

- **Desktop**: centered modal, max-width 560px
- **Mobile**: modal fills the bottom 90% of the screen like a bottom sheet, border-radius only on top two corners (24px 24px 0 0)

### Wordmark

- **Desktop**: Anton, 36px
- **Mobile**: Anton, 24px

### Typography scaling

- Card titles: 18px desktop → 15px mobile
- Metadata: 12px across all sizes (never shrink mono labels below 10px)
- Button text: stays at 12px across all sizes

---

## 12. Error Handling

Handle every possible failure state gracefully. No blank screens, no uncaught errors.

| Scenario | Behavior |
|---|---|
| Wrong password | Shake animation on input + "INVALID PASSWORD" toast |
| IGDB search fails | "SEARCH UNAVAILABLE" message inside the modal search area |
| IGDB returns no results | "NO GAMES FOUND — TRY A DIFFERENT SEARCH" |
| Game already in library (409) | "ALREADY IN YOUR VAULT" toast |
| Supabase insert fails | "FAILED TO ADD GAME — TRY AGAIN" toast |
| Supabase fetch fails | Library shows error state with retry button |
| Invalid download link (not a URL) | Input validation before submit |
| Network offline | Detect with `navigator.onLine` and show a banner |
| Image fails to load | Show a placeholder with the game's first letter |

---

## 13. Performance Requirements

- Use `next/image` for ALL game cover images — enables automatic optimization, lazy loading, and WebP conversion
- Debounce IGDB search input by 400ms to avoid hammering the API
- Cache the Twitch OAuth token in memory (already specified in `lib/igdb.ts`)
- Library data is fetched client-side on mount with a loading skeleton state
- Loading skeletons must match the shape of the actual cards (not a generic spinner)
- `loading="eager"` only on the wordmark image (if any)
- All other images: `loading="lazy"` via next/image defaults

### Skeleton Loading

When the library is loading, show ghost card skeletons:
- Same dimensions as real cards
- Background: `var(--surface)` with a shimmer animation
- Grid/list layout matches the selected view mode
- Show 8 skeletons on initial load

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #2d2d2d 25%, #3a3a3a 50%, #2d2d2d 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 14. Step-by-Step Build Order

Follow this exact order. Do not skip ahead.

1. **Initialize Next.js project** with TypeScript and Tailwind
2. **Install dependencies**: `@supabase/supabase-js`, `lucide-react`, `next` fonts
3. **Set up Supabase via MCP** — run all SQL from Section 4 and verify
4. **Create `.env.local`** with all variables from Section 3
5. **Create `types/index.ts`** — all TypeScript types first
6. **Create `lib/supabase.ts`** and `lib/supabaseServer.ts`
7. **Create `lib/igdb.ts`** — token caching + fetch wrapper
8. **Create `lib/auth.ts`** — localStorage auth helper
9. **Create `styles/globals.css`** — all CSS variables from Section 9.1
10. **Configure `tailwind.config.ts`** — extend with CSS variable colors
11. **Create `app/layout.tsx`** — fonts, global styles
12. **Build `/api/auth/route.ts`**
13. **Build `/api/igdb/search/route.ts`**
14. **Build `/api/igdb/game/[id]/route.ts`**
15. **Build `/api/games/route.ts`** — all 4 methods
16. **Build `components/Toast.tsx`** — needed by everything
17. **Build `app/page.tsx`** — password gate
18. **Build `components/PasswordGate.tsx`**
19. **Build `components/ViewToggle.tsx`**
20. **Build `components/SearchBar.tsx`**
21. **Build `components/GameCard.tsx`**
22. **Build `components/GameRow.tsx`**
23. **Build `components/SearchResults.tsx`**
24. **Build `components/AddGameModal.tsx`**
25. **Build `components/EditGameModal.tsx`**
26. **Build `components/GameGrid.tsx`**
27. **Build `components/GameList.tsx`**
28. **Build `components/Library.tsx`** — assembles all components
29. **Build `app/library/page.tsx`** — protected page shell
30. **Final pass**: test all breakpoints, test all error states, verify design tokens match spec

---

## Appendix A — TypeScript Types (`types/index.ts`)

```typescript
export interface Game {
  id: string
  igdb_id: number
  title: string
  cover_url: string | null
  release_year: number | null
  genres: string[] | null
  rating: number | null
  platforms: string[] | null
  summary: string | null
  download_link: string
  save_link: string | null
  created_at: string
}

export interface IGDBGame {
  id: number
  name: string
  cover?: { url: string }
  first_release_date?: number
  genres?: { name: string }[]
  rating?: number
  platforms?: { name: string }[]
  summary?: string
}

export interface AddGamePayload {
  igdb_id: number
  title: string
  cover_url: string
  release_year: number
  genres: string[]
  rating: number
  platforms: string[]
  summary: string
  download_link: string
  save_link?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error'
  message: string
}

export type ViewMode = 'grid' | 'list'
```

---

## Appendix B — IGDB API Query Examples

**Search by name:**
```
fields id,name,cover.url,first_release_date,genres.name,rating,platforms.name,summary;
search "halo";
limit 8;
```

**Search by ID:**
```
fields id,name,cover.url,first_release_date,genres.name,rating,platforms.name,summary;
where id = 1234;
```

**Notes:**
- `first_release_date` is a Unix timestamp — convert to year with `new Date(timestamp * 1000).getFullYear()`
- `rating` is 0–100 — display as one decimal: `(rating / 10).toFixed(1)` or show as is
- Cover URL must be transformed: prepend `https:` and replace `t_thumb` with `t_cover_big`
- Always handle the case where any field may be `undefined` or `null`

---

*End of Documentation — GameVault v1.0*
