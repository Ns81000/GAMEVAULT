# GameVault

A private, high-performance personal game collection manager. Designed securely for a single owner to organize, search, and manage an extensive library of games with a premium, cinematic aesthetic.

## Features

- **Strict Privacy**: Single-password protected instance using Supabase Authentication.
- **Lightning Search**: Full in-memory metadata search (0ms delay) that parses title, genres, platform, and release year simultaneously.
- **Responsive Views**: 
  - **Grid View**: A stunning "pure poster" Steam-style layout with elegant glassmorphism hover overlays.
  - **List View**: A dense, horizontal Bento-style layout explicitly tailored for reading heavy metadata optimally across all screen sizes.
- **Drag-and-Drop Sync**: Seamlessly reorder your library visually via touch-friendly `@dnd-kit` physics. Automatically syncs sequence to your database in the background.
- **Intelligent Loading**: Smart pagination instantly controls DOM bloat, keeping your interface smooth independently of an infinite database.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom Design System
- **Database / Auth:** Supabase
- **Data Hydration:** IGDB API Integration
- **Interaction:** Lucide React, dnd-kit

## Vercel Deployment Instructions

This project is 100% pre-configured for instant deployment on Vercel.

1. **Push your code** to any Git repository.
2. In the Vercel Dashboard, select **Import Project** and point to your repository.
3. During the setup phase on Vercel, expand the **Environment Variables** section and strictly copy the following exact keys from your local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

ADMIN_EMAIL=your_admin_email_for_auth

TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

4. Click **Deploy**. Vercel will automatically detect Next.js, securely hide your keys, and build the optimized production package beautifully. 

> **Important**: Ensure you have successfully run the Supabase database migrations (to create the `games` table and `sort_order` column) before your deployed site attempts to interact with it.
