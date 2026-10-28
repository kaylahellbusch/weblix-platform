# Website content persistence

Owners open **Edit website** from the business list, or the **Content** tab, at
`/admin/businesses/[id]/content`. Headline, introduction, ordered services and
ordered service areas use `apps/web/lib/website-content/schema.ts`. All sections
may be cleared. Text is literal, with no HTML interpretation. Add/remove and
move-up/down controls change only the draft until Save; Cancel returns to the
business without writing. JavaScript is required for this editor.

Each business has zero or one `website_content` row. A save validates and replaces
the whole JSON document in one upsert; repeated saves reuse the business primary
key. Concurrent edits use **last successful save wins**, without merging. The
business foreign key cascades deletion. Business facts remain in `businesses`.

Reads and writes use the signed-in caller's Supabase client. Every page and action
checks authentication and parent ownership. Database RLS independently checks the
parent on reads, inserts, updates and deletes, including both sides of a parent
reassignment. Anonymous clients have no table privileges. Database checks reject
unknown fields, incorrect types, oversized text/lists and blank required entries.
The server reuses the strict contract, trims text, and validates read results.

## Setup and verification

The app requires the environment variables in `apps/web/.env.example`. Apply
`supabase/migrations/20261017230000_create_website_content.sql` after the existing
business migration **only in an authorized environment**. Existing business rows
need no backfill. A hosted migration and deployment require separate approval.

For disposable local verification, create a separate Supabase project directory,
copy this repository's `supabase/migrations` and `supabase/tests` directories into
its `supabase` directory, and configure unique project ID and free API/database
ports in its generated `config.toml`. Disable unused services, use synthetic local
users, and point a task-specific app server at that local API. Never reset a
shared project or use hosted credentials for these tests.

Run `supabase start --workdir <disposable-project>` followed by
`supabase test db --workdir <disposable-project>`. The rollback-only pgTAP suite
checks replacement, uniqueness, list order, validation bounds, anonymous denial,
two-owner isolation and denied reassignment, and cascade cleanup without RLS
filtering. Run application lint, typecheck, test and build from `apps/web`, plus
`git diff --check`. Action/repository/component/page tests cover authorization,
validation, failure messages, exact draft retention, list editing and navigation.

Also exercise the actual running revision: create a synthetic business, open the
empty editor, save all sections, reload, reorder/update, clear, and cancel edits.
Verify invalid submissions retain input and do not alter persisted content;
check direct nonowner URLs/actions and authenticated API mutations. Verify business
create/edit/delete still works. Unit mocks are not evidence of live persistence
or database permissions. Keep the PR draft if any required verification is blocked.
