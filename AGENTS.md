# Weblix implementation workflow

## Scope

- Planning and dispatch tasks follow `docs/planner.md`. Implementation tasks use
  the workflow below.

- Use this workflow for already-defined features and fixes. The planning agent owns
  feature definition and acceptance criteria; do not add a discovery phase.
- Read `.github/copilot-instructions.md` and instructions in affected directories.
- Read-only investigations and reviews need no worktree, commit, or PR. If they lead
  to edits, isolate those edits. A local experiment does not imply publishing it.
- Documentation-only edits need relevant content checks, without runtime evidence
  or a bot review.

## Workflow

1. **Isolate.** Use a dedicated branch and worktree before editing. Reuse one already
   assigned to the task; never work directly on `main` or overwrite another task's
   changes. Check overlapping work for behavioral conflicts. Worktrees do not
   isolate ports or databases.
2. **Build.** Implement the supplied requirements and acceptance criteria. Ask only
   about ambiguity that blocks implementation. Follow existing architecture, keep
   presentation separate from business logic and data access, and extract reusable
   operations when there is a concrete benefit. Avoid speculative layers, unrelated
   refactors, and unnecessary dependencies.
3. **Verify.** Run applicable checks and exercise changed behavior in this
   worktree's running app, including error and permission cases. Before editing
   app behavior, follow `docs/pr-image-evidence.md` for baseline capture.
   Report blocked verification and leave incomplete work in draft.
4. **Open a draft PR.** When the task calls for delivery, push the task branch and
   open or update a draft PR using the repository template. Include verification,
   accessible evidence or artifact links, and a preview link when available.
   For code or executable workflow changes, request GitHub Copilot review, for
   example `gh pr create --draft --reviewer @copilot`. For an existing PR, use
   `gh pr edit <number> --add-reviewer @copilot`. Documentation-only work can skip
   Copilot review after its content checks pass.
   For issue-backed work, use the chat-title tool to name the chat
   `Issue #<issue number> - <issue title>` initially. Immediately after creating
   or attaching the implementation PR, rename it to
   `Issue #<issue number> - PR#<PR number> - <issue title>`. Read the actual numbers
   from GitHub; never assume the issue and PR numbers match. Preserve this prefix
   on subsequent title updates. If the title tool is unavailable, report that
   limitation rather than claiming the chat was renamed.
5. **Follow through.** Continue in the originating Codex chat: read Copilot's
   completed review, fix valid findings, rerun affected checks, push, and request
   re-review. Follow the completion and follow-up rules below. Once complete,
   refresh the PR evidence and summary, mark it ready with `gh pr ready <number>`,
   and present the PR URL. Marking ready does not authorize merging.

## Completion and follow-up rules

- Copilot is the code reviewer. Confirm a completed Copilot review covers the
  current PR head SHA; inspect its summary and inline findings. No comments,
  a pending request, or a failed review does not prove completion. If completion
  or revision cannot be verified, keep the PR in draft.
- Assess findings rather than applying every suggestion blindly. Fix valid issues;
  record a concise rationale in the PR for findings that do not apply. Resolving
  a conversation alone does not prove the issue was fixed.
- Allow at most three review-and-fix rounds per PR, across follow-ups. After the
  last fix, rerun affected checks and obtain a review of the final revision before
  marking ready. If further fixes are needed at the cap, leave the PR in draft
  and report the remaining work. Do not raise the cap automatically.
- Request re-review after pushing fixes unless automatic review of new pushes is
  confirmed enabled. Do not assume another push triggers Copilot.
- While active, check review and CI status at reasonable intervals. If waiting
  must continue after the turn, create a scheduled follow-up in this same chat
  using the app's automation tool. Do not rely on Copilot to wake Codex directly.
  Reuse or update an existing follow-up for the PR rather than creating duplicates.
- Save the repository, PR URL/number, worktree and branch, requested review SHA,
  completed round count, and processed review IDs in the follow-up prompt. Each
  run must read current GitHub state before acting, ignore already processed or
  stale reviews, and preserve the round count. Keep using the assigned worktree.
- The follow-up should stay quiet while review or CI is pending. On completed
  review, assess findings and continue the fix/check/re-review loop. Mark ready
  only after the latest revision has a completed review, required checks pass,
  acceptance criteria are verified, and no actionable findings remain. Update
  evidence after fixes. Notify the user on completion or a blocker requiring input.
- Stop and disable the follow-up when the PR is ready, closed, or merged, when
  three rounds are exhausted, or when review/CI fails or a review has remained
  pending for 30 minutes since its request. Leave an open incomplete PR in draft
  and report the reason. If follow-ups or GitHub access are unavailable, explicitly
  report that automatic continuation is not configured; never claim it is running.
- Record what was actually verified and the tested revision in linked artifacts or
  follow-up state; routine PR descriptions need no commit hashes. Report failed or skipped
  checks, unverified criteria, unavailable review, and remaining findings. Keep
  secrets and real customer data out of evidence.
- Leave merging and deployment for the user's approval unless already authorized.

## Weblix checks

For application code, run from `apps/web`:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Run `git diff --check` for all edits. For documentation-only changes, inspect the
content and check links and runnable examples as applicable; no application build
is required.

## Local database migrations

- Use `python3 scripts/local-db.py start` in the assigned worktree. It creates an
  isolated local Supabase stack and synthetic test accounts. Never copy hosted
  credentials into a worktree for migration tests or replace an unrelated env file.
- Write migrations under tracked `supabase/migrations`, preserving applied migration
  history. Run the helper's `up`, `check`, `reset`, and `check` commands to verify
  upgrades and clean replay, plus tests for the changed schema/behavior. `reset`
  erases only this worktree's local test data; do not run it against shared/remote DBs.
- Use the generated local test account variables for browser/RLS verification.
  Confirm app port/process and local API target before testing. Stop your owned
  stack when it is no longer needed. Never stop another agent's containers.
- Report migration and RLS results in the PR. Local success does not prove hosted
  migrations have been applied. Production/hosted migration application remains
  with the user unless separately authorized; do not link, push, or repair remote
  migration history during this workflow. See README for commands and limitations.

## PR presentation

Use `.github/pull_request_template.md` for the concise format and
`docs/pr-image-evidence.md` for screenshot capture and upload policy.
