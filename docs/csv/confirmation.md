# Confirming CSV imports

Apply tracked migrations through `20261020120000_atomic_business_import.sql` before
using confirmation. For disposable local verification, use the root local database
workflow (`python3 scripts/local-db.py start`, `up`, `check`, `reset`, `check`).
Do not apply these commands to hosted data.

Set `CSV_REVIEW_SECRET` in the server environment to a cryptographically random
secret of at least 32 characters (for example, generate it with
`openssl rand -hex 32`). Keep it stable across server instances and restarts and
never expose it with a `NEXT_PUBLIC_` prefix. Rotation invalidates outstanding
review tokens; resolve uncertain imports before rotating. No service key is used.

Review and cancel never write to the database. A signed token binds the reviewed
bytes, authenticated owner and a fresh request UUID. Confirmation uploads those
same bytes, authenticates again, verifies the signature and reparses the file with
the existing parser. Only normalized valid unique rows reach the database.

The authenticated RPC validates its bounded row input independently, derives its
owner from `auth.uid()`, and serializes each owner/request pair. It commits all
businesses and a minimal receipt in one transaction. Receipts contain only owner,
request key, payload fingerprint and inserted count: no file, uploaded rows or
business IDs. Clients can read their own receipts but cannot write them directly.
The narrowly scoped definer function is the only receipt writer; its explicit
owner predicate and inserts preserve owner isolation.

A repeated request returns its original count, including after a business is
edited or deleted. Changed payloads cannot reuse that key. A timeout or transport
failure is an unknown outcome: keep the page open and retry the same import.
Do not start a fresh review to resolve an uncertain import. A new review creates
a new request, and may create additional businesses from the same file. Existing
businesses are never matched, updated or deduplicated.

## Local transaction tests

Run `supabase/tests/business_import.test.sql` with pgTAP against the disposable
worktree database. All fixtures roll back. Concurrency and transport retry tests
are in `scripts/tests/test_business_import.py`, which uses only the current
worktree's generated local runtime and synthetic accounts:

```sh
python3 scripts/tests/test_business_import.py
```
