<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Local test accounts

Two Supabase test accounts may be configured in a Git-ignored `.env.local`:
`TEST_USER_ONE_EMAIL`, `TEST_USER_TWO_EMAIL`, and `TEST_USER_PASSWORD` (shared by both).
Use these accounts for authenticated local testing and two-user ownership/RLS checks.
Read the values locally when needed; never print, commit, or copy them into documentation,
PR descriptions, or tracked files. The `.env.local` file is not copied automatically into
other clones, worktrees, or cloud chats; if it's missing, say so instead of guessing values.
