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
## Vercel PR previews (on-demand)

- Workflow: `.github/workflows/vercel-pr-preview.yml`
- Required GitHub Actions secrets (preferably as **environment secrets** on `vercel-preview`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Automatic trigger: only when a same-repository PR changes from **Draft** to **Ready for review** (`pull_request: ready_for_review`)
- No automatic redeploys on `push`, `synchronize`, draft creation, PR merge, or `main` updates

### Manual redeploy

1. Open **Actions** → **Vercel PR Preview** → **Run workflow**
2. Enter `pr_number` for the open PR to redeploy
3. The workflow verifies the PR is:
   - open
   - same-repository (not fork head code)
   - ready for review (not draft)
4. If checks pass, it deploys the PR head SHA as a **preview** (never production)
5. `workflow_dispatch` always uses the workflow file from the default branch, then resolves the current PR head SHA via GitHub API before checkout/deploy.

### Where to find the preview URL

- In the workflow run summary (`Vercel preview deployed`)
- In the deploy step output (`Deploy preview artifacts`)
- To confirm the preview maps to the intended revision, compare the summary `Commit` value with the PR head commit shown in GitHub.

### Vercel/GitHub configuration notes

- Vercel project Root Directory must stay `apps/web`.
- Keep production disabled in GitHub Actions (this workflow never passes `--prod`).
- Vercel's ignored Git build setting does not block this workflow because deployment is CLI-driven (`vercel pull/build/deploy`) from Actions, not Vercel Git auto-builds.
- The workflow runs Vercel CLI commands from repository root (not inside `apps/web`) so Vercel project `rootDirectory` is applied only once during `vercel build`; it also logs boolean-only diagnostics for `PATH` presence and npm resolution without printing secret/env values.
- The deploy job uses the protected `vercel-preview` GitHub Environment. Configure **required reviewers** on that environment so approval is required before any deployment secrets are exposed to the job.
- If you currently store Vercel secrets only at repository scope, move them to `vercel-preview` environment secrets (or duplicate there and remove repo-level copies) to enforce the approval boundary.
- Vercel CLI is pinned in workflow (`VERCEL_CLI_VERSION`) for reproducibility.

### Limitations and cleanup

- Fork PRs are intentionally rejected before secrets are used.
- Same-repository PR branches are treated as trusted only after reviewer approval of the protected environment gate.
- Automatic cleanup on PR close is not configured. Vercel preview deployments can be removed manually from the Vercel dashboard if needed.

## Current status

This repository is in the early bootstrap stage. It includes the project foundation, a minimal landing page, automated checks, and CI for pull requests and pushes to `main`.
