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
3. **Verify.** Check acceptance criteria and relevant error and permission cases.
   Run the applicable checks below and use meaningful tests proportional to the
   change. Exercise changed user flows in the running app, locally or on an
   available preview, including relevant error and permission cases. Confirm the
   app serves this task's revision. If access or setup blocks live testing, report
   the unverified behavior and leave the PR in draft. Prefer screenshots of the
   actual running app whenever practical, even when the change is not purely visual.
   Capture a baseline before editing when comparison helps; use comparable data and
   conditions. Use other evidence when screenshots cannot demonstrate the change
   or capture is unavailable, and briefly explain why. Screenshots alone do not
   prove persistence or permissions; include relevant assertions or results too.
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

## PR presentation

- Use the PR template: 1–3 short change bullets, a compact verification table,
  visual evidence, and only actionable notes. Favor visuals over paragraphs.
- Put lint, types, tests, production build, diff checks, live behavior, and review
  results in individual table rows. Use ✅ only for observed passes; distinguish
  ❌ failures, ⏳ pending checks, and — N/A with a brief reason. Do not repeat these
  results in prose. Show a test count only when useful.
- Embed 1–3 relevant app screenshots with short captions when practical; use a
  Before/After table when helpful. Publish through an authorized destination and
  use GitHub-accessible image URLs or artifact links, not local filesystem paths.
  If capture/upload is unavailable, say so briefly and link other suitable proof.
  Documentation-only changes need no app screenshot.
- Omit routine commit hashes, file inventories, and command transcripts. Put
  necessary technical detail/logs in linked artifacts or a collapsed details block.
  Keep the visible description short; preserve honest caveats without long narration.
