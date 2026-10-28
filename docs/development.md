# Local development

Run these commands from your own clone or assigned worktree. Commands in this guide target the local stack, not a hosted project.

Requires Git, **Node.js 22** (matching CI), npm, **Python 3.9+**, running Docker, and the Supabase CLI (verified with **2.31.8**). Clone the repository, then run from its root:

```bash
git clone https://github.com/kaylahellbusch/weblix-platform.git
cd weblix-platform
python3 scripts/local-db.py start
cd apps/web
npm ci
```

The helper starts a local database, Auth, and Data API for this worktree. On a fresh database it applies the migrations, adds two test users and example businesses, and writes an ignored `apps/web/.env.local` file. Use the `TEST_USER_ONE_EMAIL`, `TEST_USER_TWO_EMAIL`, and `TEST_USER_PASSWORD` values in that file to sign in locally. These accounts are only for local testing.

CSV review also needs a signing secret. Generate one with:

```bash
openssl rand -hex 32
```

Add the value as `CSV_REVIEW_SECRET` in `apps/web/.env.local`. Keep this server-only—no `NEXT_PUBLIC_` prefix—and use the same value across restarts and app instances. Then, from `apps/web`:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000), then `/login`. If an environment file already exists and wasn't created by the helper, the helper leaves it alone. Use a fresh worktree for local setup rather than copying hosted credentials.

**`start` and `reset` rewrite environment files created by the helper.** Add your local signing secret back afterwards. Finish any import with an unknown result before changing the secret, and restart the app when environment settings change.

Each worktree gets its own database project ID and ports. If another app server is already running, choose a different app port with `npm run dev -- --port 3001` and update `NEXT_PUBLIC_APP_URL` to match. The local Auth settings allow these development ports. Generated files stay in ignored `.supabase-local/`. Services the app doesn't use, such as Storage, Realtime, and Studio, are disabled.

From the repository root:

```bash
python3 scripts/local-db.py check   # Business persistence and two-user RLS smoke checks
python3 scripts/local-db.py test    # All tracked feature SQL suites (pgTAP)
python3 scripts/local-db.py up      # Apply pending migrations to this local stack
python3 scripts/local-db.py reset   # Erase/rebuild ONLY this local DB, then reseed
python3 scripts/local-db.py stop    # Stop only this stack; retain its data
```

If the database already exists, `start` reuses it. Run `up` to apply new migrations. Put migration files in tracked `supabase/migrations`, not `.supabase-local/`, and leave previously applied migrations intact.

Check an upgrade with `up`, `check`, and `test`. To check a fresh rebuild, use `reset`, `check`, and `test`. **Reset deletes this worktree's local test data.** Use the helper so these commands target your local database. The [database testing guide](local-database-tests.md) explains requirements and troubleshooting.

## Available scripts

From `apps/web`:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

From the repository root, with the local stack running for the HTTP suite:

```bash
python3 scripts/tests/test_business_import.py
python3 -m unittest discover -s scripts/tests -v
git diff --check
```

## Authenticated business workflow

After [local setup](#local-development), open `/login` and sign in with a test account.

1. Open `/admin` and choose **Add business**. Try an example like *Cedar Demo Roofing*. Save it, open its details, and refresh to see that the information is still there.
2. On the **Details** tab, choose **Edit details** to change contact or location details. Save your changes, or Cancel to leave the saved record as it was.
3. Open the **Content** tab. Add a headline, introduction, services, and service areas. Save, reload, and try changing the list order. You're editing the copy here; website preview and publishing aren't available yet.
4. Return to `/admin`, choose **Add business**, then the **Import from CSV** tab. Download the sample or try this file:

   ```csv
   name,industry,email
   Cedar Import Demo,roofing,cedar@example.test
   Invalid Demo,roofing,not-an-email
   Cedar Import Demo,roofing,cedar@example.test
   ```

   You should see **1 valid, 1 invalid, and 1 duplicate**. Canceling leaves the database unchanged. **Confirm import** saves one business and skips the other two rows. Return to the list and reload to see the new business.
5. Try deleting a test business. On its **Settings** tab, choose **Delete business**, then **Permanently delete business**. Cancel keeps it. Sign out from `/admin` when you're done.

**If the app can't tell whether an import finished, keep the page open and retry that same import.** Starting a new review creates a new request and could save another copy. The duplicate check only compares rows within the file; it doesn't look for businesses already in the database. See the [CSV format](csv/business-format.md) and [retry instructions](csv/confirmation.md) for details.

[Back to the README](../README.md)
