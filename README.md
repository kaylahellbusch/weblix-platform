# Weblix Platform

Weblix Platform is a Next.js application for managing business data and generating customizable business websites.

## Architecture

- `apps/web` contains the primary Next.js App Router application.
- Supabase Auth + database persistence are integrated directly in `apps/web` using server-side Supabase SSR clients.
- `supabase/migrations` stores version-controlled SQL migrations.

## Local setup

```bash
cd apps/web
npm install
cp .env.example .env.local
```

Set placeholders in `apps/web/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then start the app:

```bash
npm run dev
```

Open http://localhost:3000 in a browser.

## Apply Supabase migration

From the repository root, apply `supabase/migrations/20261014184500_create_businesses.sql` using your normal Supabase workflow (for example Supabase CLI migration commands or SQL editor execution in your Supabase project).

The migration creates:

- `public.businesses` table
- ownership indexes
- `updated_at` trigger
- Row Level Security policies enforcing `auth.uid() = owner_id` for select/insert/update/delete

## Authenticated business workflow

After migration and env setup:

1. Sign in at `/login` with an existing Supabase Auth user.
2. Access `/admin` to view only that user's businesses.
3. Create a business at `/admin/businesses/new`.
4. Confirm redirect to `/admin/businesses/[id]` and refresh persistence.
5. Sign out from `/admin`.

## Manual RLS verification with two users

Use two separate Supabase Auth accounts (User A and User B):

1. Sign in as User A and create a business.
2. Sign out and sign in as User B.
3. Confirm User B cannot see User A's business in `/admin`.
4. Attempt to open User A's detail URL (`/admin/businesses/<user-a-id>`); it should return not found.
5. Confirm User B can create and view only their own businesses.

## Available scripts

```bash
cd apps/web
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```
