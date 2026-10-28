# Weblix Platform

Weblix is a multi-tenant website management platform I'm building to simplify creating and maintaining websites for local businesses. It brings business information, website content, and eventually publishing into one application.

Today, you can manage businesses, edit structured website content, and review and confirm CSV imports. Website rendering, AI copy generation, and publishing are still planned.

Built with **Next.js, React, TypeScript, and Supabase/PostgreSQL**, using a human-directed, AI-assisted development workflow.

[Features](#key-features) · [Architecture](#architecture) · [Engineering decisions](#engineering-decisions) · [AI workflow](#ai-assisted-development-workflow) · [Run locally](#local-development)

## Key features

- **Business management:** create, view, edit, and delete business records, with contact and location details.
- **Website content editing:** save a headline, introduction, ordered services, and service areas. Validation keeps failed edits in the form so you can correct them.
- **CSV review and import:** inspect valid rows, errors, and duplicates before confirming. The import saves valid unique rows together, with a way to retry if the response is lost.
- **Account separation:** each signed-in account manages its own businesses and content, with access checks in both the app and database.

### Authenticated business workflow

Sign in at `/login`, add an example business from `/admin`, then open its **Content** tab to write and save its copy. Reload to see the saved content. On the **Add business** page, the **Import from CSV** tab lets you inspect a file before importing anything.

For a concrete example, upload a file with one valid row, a copy of that row, and a row with an invalid email. Review shows **1 valid, 1 duplicate, and 1 invalid**. Cancel saves nothing; confirming saves one business. The [full walkthrough](docs/development.md#authenticated-business-workflow) includes the file and expected results.

There isn't an account-free demo or signup flow yet. [Local setup](#local-development) creates test accounts; an existing installation requires an account in its Supabase project. The content editor saves copy—it doesn't render or publish a website yet.

## Architecture

Weblix runs as **one Next.js App Router application**. Server-rendered pages load data; interactive forms call server actions to check access and validate input. Repository functions handle database access through Supabase with the signed-in user's session. PostgreSQL row-level security (RLS) checks which records that user can read or change.

| Component | Responsibility |
| --- | --- |
| Next.js 16, React 19, strict TypeScript | Routes, forms, server actions, and application logic in [`apps/web`](apps/web) |
| Tailwind CSS v4 | Application styling |
| Zod | Validates business details and website content; CSV rows reuse business validation |
| Supabase Auth + PostgreSQL | Sign-in, saved data, ownership rules, and import transactions |
| Vitest + Testing Library | Application and component tests; separate SQL and Python suites check database behavior |

The interface, business logic, and database access stay separate within one app. That keeps the current workflows in one deployable unit without a separate API service or worker to maintain. Background generation jobs aren't implemented.

The [migrations](supabase/migrations) define three tables: `businesses` holds business facts and ownership, `website_content` holds an optional content document per business, and `business_import_receipts` records import requests and counts for retries. Deleting a business removes its content; import receipts remain so earlier requests can still be recognized.

## Engineering decisions

### Access checks in the app and database

**Problem:** Knowing a business's URL shouldn't let another account read or change it. Hiding a link isn't an access check.

**Solution:** Pages and actions check the signed-in user, business queries include the owner's ID, and PostgreSQL RLS enforces ownership for database requests too. Content permissions follow the parent business, including attempts to move content to another business.

**Tradeoff:** Both paths need testing. App tests alone can't establish that direct database requests are restricted correctly.

**Evidence:** [Business access testing](https://github.com/kaylahellbusch/weblix-platform/issues/9#issuecomment-6241327356) covers browser flows, replayed requests, and two-user database checks. [Content SQL tests](supabase/tests/website_content.test.sql) check cross-account access, reassignment, and deletion behavior.

### Website copy saved as one document

**Problem:** A content edit can change several sections and their order. Saving those pieces separately would leave room for a partly saved page.

**Solution:** Save the content as one JSON document in a single database operation, separate from business facts. Zod checks field names, lengths, and list sizes; database constraints also reject malformed documents. A [mapping function](apps/web/lib/website-content/preview.ts) prepares the data for a future renderer without inventing missing business claims.

**Tradeoff:** The last successful save wins. There is no revision history or merging of concurrent edits. The mapping is implemented; the rendered website preview isn't.

**Evidence:** [Content schema](apps/web/lib/website-content/schema.ts), [persistence behavior](docs/website-content/persistence.md), and [implementation and testing in PR #25](https://github.com/kaylahellbusch/weblix-platform/pull/25).

### CSV imports that can be retried safely

**Problem:** An import can finish saving just as the connection drops. A missing response doesn't tell the user whether the businesses were saved, and submitting a new import could create them twice.

**Solution:** A signed review ties the file to the user and a request key. Confirmation checks the file again, then a database function gets the owner from `auth.uid()` and saves the batch and its receipt in one transaction. Requests with the same user and key run one at a time; retrying returns the original count. Changing the data while reusing that key is rejected.

**Tradeoff:** Receipts must be kept, and the signing secret must stay stable. Retry the same import from the retained page if its result is unknown. A new review creates a new request; duplicate checks only compare rows within the file, not existing businesses.

**Evidence:** [Transaction and receipt migration](supabase/migrations/20261020120000_atomic_business_import.sql), [implementation PR #35](https://github.com/kaylahellbusch/weblix-platform/pull/35), and [separate testing in PR #39](https://github.com/kaylahellbusch/weblix-platform/pull/39), including simultaneous requests, rollback, a lost response after saving, and account/token tampering checks.

## AI-assisted development workflow

I set the product direction, approve scope, and establish engineering standards. I review what to accept and merge, while deployment follows defined authorization rules. Agents help inspect the code, prepare GitHub issues, implement changes, and collect test results.

**Development orchestration:** Weblix uses public repository instructions alongside a separate private planning and coordination workspace. The private workspace keeps broader project context and supports planning, task preparation, and status reporting. This repository contains the application code, implementation instructions, issues, PRs, and testing evidence, so the delivered work and engineering decisions can be evaluated here.

The [project instructions](.github/copilot-instructions.md) set architecture and quality standards. The [planning guide](docs/planner.md) covers preparing issues with acceptance criteria, checking dependencies and ownership, and starting implementation when requested. The [delivery workflow](AGENTS.md) calls for isolated worktrees, relevant checks, and draft PRs. Code changes require running-app verification and Copilot review of the current revision; documentation-only changes have lighter checks. Valid findings are fixed and reviewed again, with a limit on review rounds. Blocked verification or unresolved findings keep the PR in draft.

Separate reviews of whether a feature meets its intended outcome also draw on private coordination and task-specific instructions. The CSV import is a public example: [issue #23](https://github.com/kaylahellbusch/weblix-platform/issues/23) defined the task, [PR #35](https://github.com/kaylahellbusch/weblix-platform/pull/35) implemented it, and [Copilot reviewed the final revision](https://github.com/kaylahellbusch/weblix-platform/pull/35#pullrequestreview-5590799993). A separate pass [tested the full workflow locally in PR #39](https://github.com/kaylahellbusch/weblix-platform/pull/39). Copilot found no defects and still recommended human review of the security-sensitive code.

Planning and coordination sit outside the application runtime. These instructions guide the work; they aren't an automatically enforced GitHub gate or proof that every past change followed today's process. CI automates the checks described below. Review comments and passing checks help me decide what to accept, but they don't replace trying the feature.

## Testing and security

- **Automatic in [CI](.github/workflows/ci.yml):** lint, TypeScript checks, Vitest/Testing Library tests, and a production build on pull requests and pushes to `main`.
- **Run separately:** [local database checks and pgTAP suites](docs/local-database-tests.md) for validation and access rules, plus [HTTP import tests](scripts/tests/test_business_import.py) for transactions, simultaneous requests, and retries. These don't run in application CI.
- **Configuration:** the app uses the signed-in user's session and a Supabase publishable key. CSV confirmation needs a stable server-only signing secret. Uploads stay in memory, limited to 1 MiB and 500 nonblank data rows. Keep secrets and customer data out of Git and test reports.

These checks cover specific behavior. A hosted installation still needs its migrations, settings, and signed-in workflows checked; passing tests or a successful deployment doesn't establish production readiness. See the [hosted setup and permission checks](docs/hosted-setup.md).

## Current status

- **Implemented:** existing-account sign-in/out; business management; saved website copy; CSV review, confirmation, and same-request retries; local database tools and application CI.
- **In progress:** [UI improvements, search, and business view options](https://github.com/kaylahellbusch/weblix-platform/pull/46), not yet merged into `main`.
- **Planned:** [product homepage](https://github.com/kaylahellbusch/weblix-platform/issues/43), [account-free demo](https://github.com/kaylahellbusch/weblix-platform/issues/44), and [owner-only Granite website preview](https://github.com/kaylahellbusch/weblix-platform/issues/13). Granite scope and assets still need preparation. AI copy generation, publishing, custom domains, and signup aren't implemented.

## Local development

Requires Git, **Node.js 22**, npm, **Python 3.9+**, running Docker, and the Supabase CLI (verified with **2.31.8**).

```bash
git clone https://github.com/kaylahellbusch/weblix-platform.git
cd weblix-platform
python3 scripts/local-db.py start
cd apps/web
npm ci
openssl rand -hex 32
```

Add the generated value as server-only `CSV_REVIEW_SECRET` in `apps/web/.env.local`, then run `npm run dev`. Open [localhost:3000/login](http://localhost:3000/login) and sign in with the test-account values in that file.

See the [development guide](docs/development.md) for account details, environment-file precautions, database management, and troubleshooting.

## Additional documentation

- [Local setup, application checks, and walkthrough](docs/development.md)
- [Database upgrades, resets, SQL tests, and troubleshooting](docs/local-database-tests.md)
- [Hosted migrations, environment settings, and two-user permission checks](docs/hosted-setup.md)
- [Vercel PR preview setup and use](docs/pr-previews.md) — previews require a ready-for-review PR targeting `main`.
- [CSV format](docs/csv/business-format.md) and [confirmation/retry instructions](docs/csv/confirmation.md)
- [Content model](apps/web/lib/website-content/README.md) and [editing/persistence behavior](docs/website-content/persistence.md)
