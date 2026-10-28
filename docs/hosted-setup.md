# Hosted setup (manual, separate from local development)

A working local app doesn't tell you whether a hosted installation has been set up. When configuring an approved hosted environment:

1. Check which Supabase project you're using. Compare **all** [migration files](../supabase/migrations) with its migration history, records of manually run SQL, and actual tables and functions. A missing history entry doesn't mean the SQL hasn't run. Resolve differences before rerunning files, using `db push`, or changing history.
2. Apply only migrations you've confirmed are missing, in timestamp order: `20261014184500_create_businesses.sql`, `20261017230000_create_website_content.sql`, then `20261020120000_atomic_business_import.sql`. Some statements will fail if run twice. Record each successful migration and investigate an error before moving on. Existing businesses don't need a content backfill.
3. Compare tables, constraints, functions, permissions, and RLS policies with the migration files. Then test access with signed-in users; checking that the tables exist isn't enough.
4. Use [`.env.example`](../apps/web/.env.example) to configure `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `CSV_REVIEW_SECRET` (cryptographically random, at least 32 characters). Use the publishable key, not a service-role key. Keep the signing secret stable; changing it invalidates reviews that are still open. Configure each environment separately and rebuild or restart after changes.
5. Test the deployed version with test accounts: add, edit, and delete a business; save, reload, clear, and cancel content edits; review, cancel, confirm, and retry a CSV import. Check that a second user can't access the first user's data. A deployment marked Ready still needs these checks.

See [content testing instructions](website-content/persistence.md#setup-and-verification) and [CSV prerequisites and retry guarantees](csv/confirmation.md). Hosted changes must follow the authorization rules in [AGENTS.md](../AGENTS.md); deployment is separate from local development.

## Manual RLS verification with two users

Use two test accounts in separate browser sessions:

1. As User A, create an example business, save content, and copy its detail/edit/content/settings URLs.
2. As User B, confirm A's business is absent from `/admin` and those direct URLs return not found. B should still be able to manage B's own records.
3. With User B's session, try reading or changing A's records through the Data API or replayed form requests. Check that A's business and content haven't changed. The [content testing guide](website-content/persistence.md#setup-and-verification) also covers moving content between businesses and requests without a signed-in user.
4. As A, verify invalid edits retain input without saving, valid edits persist after reload, canceled deletion changes nothing, and confirmed deletion removes the business and its content.

### Authenticated RLS verification context

SQL Editor usually runs with more access than an app user. Signing into the app or dashboard doesn't make its queries run as that user, so those results can't tell you whether RLS works. Use each test user's access token and the project's publishable key for these checks. If you configure a SQL session for testing, first check that its role is `authenticated` and `auth.uid()` matches the test user.

[Local development](development.md) · [Back to the README](../README.md)
