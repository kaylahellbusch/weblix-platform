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

## Apply Supabase migration in SQL Editor

1. Open your Supabase project dashboard in a browser.
2. In the left navigation, open **SQL Editor**.
3. Click **New query**.
4. Open `supabase/migrations/20261014184500_create_businesses.sql` locally, copy its full contents, and paste into the SQL Editor query tab.
5. Click **Run**.
6. Confirm success by checking:
   - SQL Editor reports completion without errors.
   - In **Table Editor**, a `public.businesses` table exists.
   - In **Authentication > Policies** (or table policy view), `public.businesses` has ownership policies for `SELECT/INSERT/UPDATE/DELETE`.
   - The `authenticated` role has table privileges (`SELECT, INSERT, UPDATE, DELETE`) and schema usage as granted by the migration.

The migration creates:

- `public.businesses` table
- ownership indexes
- explicit grants for `authenticated`
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
2. Copy User A's business detail URL from `/admin` (it contains the business UUID).
3. Sign out and sign in as User B.
4. Confirm User B cannot see User A's business in `/admin`.
5. Attempt to open User A's business detail URL directly; it should return not found.
6. Confirm User B can create and view only their own businesses.

### Optional reproducible SQL verification (while signed in as each user)

In SQL Editor, run under each authenticated user context (or equivalent JWT-authenticated Data API request):

- `select id, owner_id, name from public.businesses order by created_at desc;`

Expected result: each user only receives rows where `owner_id` matches that user's auth id.

## Available scripts

```bash
cd apps/web
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```
