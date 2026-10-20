# Local database feature tests

Requires Python 3.9+, Git, the Supabase CLI (verified with 2.31.8), and running
Docker. Run from your assigned worktree's repository root:

```bash
python3 scripts/local-db.py start
python3 scripts/local-db.py up
python3 scripts/local-db.py test
python3 scripts/local-db.py check
python3 scripts/local-db.py stop
```

`test` runs all tracked SQL suites under `supabase/tests` using
`supabase --workdir <this-worktree>/.supabase-local test db --local`.
It refreshes the runtime test copies on every invocation, removing stale copies.
Add new suites to Git before running; untracked SQL files are not executed.
The existing website-content suite covers 29 validation, persistence, and owner
isolation assertions. `check` remains a separate two-user business smoke check;
its success does not mean the SQL suites passed.

The command requires an existing, running local stack and applied migrations.
It never starts, resets, seeds, applies migrations, rewrites the app environment,
links a hosted project, or accepts a database URL. Missing suites/tools, unavailable
stacks, runner failures, and missing/empty/nonpassing runner summaries fail with a
nonzero exit status. A successful run prints suite names and assertion counts.
Raw failure output stays in ignored `.supabase-local/last-error.log` with mode
0600 because CLI diagnostics can contain credentials; do not publish raw logs.

Write suites with a transaction, a pgTAP plan, `finish()`, and `rollback`, following
`supabase/tests/website_content.test.sql`. The runner does not clean up a suite
that deliberately commits data. Use synthetic fixtures and only a disposable
local stack. To verify failure propagation, temporarily change an assertion in
an existing tracked suite, run `test` and confirm a nonzero exit, restore the file,
and rerun. Repeated runs copy the current working-tree contents, including edits
to tracked files. No migration or assertion suite is rewritten by the helper.

For a clean migration replay, run `reset`, `check`, and `test` in that order.
`reset` erases only this worktree's local data; do not use it for shared databases.
Each worktree has its own runtime ID/ports. Stop only your owned stack when done.
Local results do not prove hosted migrations have been applied.

Helper unit tests (no Docker required):

```bash
python3 -m unittest discover -s scripts/tests -v
```
