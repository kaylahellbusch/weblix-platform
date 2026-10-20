# Weblix planner

The planner defines work; implementation chats execute it using root `AGENTS.md`.
Run manually in the Weblix Planner chat or through its weekday follow-up.

## Prepare work

- Inspect current main, the user-provided roadmap and priorities, open issues,
  active implementation chats, and open PRs before proposing or creating work.
  Do not infer product commitments from missing code or create work to fill a quota.
- Create or update GitHub issues for concrete user-authorized goals. Check for
  duplicates and update existing issues instead of repeatedly recreating them.
  If product direction is missing, report that rather than inventing a roadmap.
- Use `.github/ISSUE_TEMPLATE/defined-work.md`: outcome, scope and exclusions,
  observable acceptance criteria, dependencies, verification, and likely areas of
  change. Flag uncertain scope; do not prescribe unnecessary implementation detail.
- Mark issues Ready, Needs clarification, Blocked, In progress, or PR ready in a
  Planner status section of the issue body. Ready requires sufficient definition
  and all prerequisite work merged. Record blocking issue/PR links.
- Prepare any number of useful issues, including none. Stay quiet on scheduled
  runs when nothing meaningful changes; report newly ready work or a blocker
  requiring the user. Do not implement code during planning.

## Dispatch only when requested

Scheduled runs prepare work. They do not automatically launch implementation.
The user may ask to start a specific issue or dispatch eligible ready work.

- Choose work by priority, readiness, available capacity, and independence. There
  is no required batch size. Start zero if no safe candidate exists. Honor a
  user-supplied concurrency ceiling as a maximum, never as a target; do not invent
  a fixed issue count. Explain any capacity limitation imposed by the environment.
- Compare expected behavior, likely changed files, shared schema/API contracts,
  active PRs, and shared test resources. Shared files alone need not conflict,
  but do not launch work together when it depends on unmerged changes or has
  unresolved behavioral, migration, or shared-resource conflicts.
- Before launch, recheck issues, open PRs, and active chats for existing ownership.
  Record a dispatch reservation in the issue before creating a chat. If it fails,
  clear the reservation; if the result is uncertain, reconcile chat inventory
  before retrying. Never launch a duplicate merely because a run was interrupted.
- Create a separate Codex project chat in its own worktree from latest main for
  each selected issue. Use the naming rules in `AGENTS.md`; give it the issue URL
  and instruct it to follow that workflow through PR readiness. Do not use temporary
  subagents as durable issue owners or authorize merging/production deployment.
- Record the returned chat ID, branch/worktree when available, and later the PR URL
  in the issue's Planner status. Distinguish queued setup from a running chat.
  If dispatch tooling is unavailable, report that without marking work started.
- Check existing implementation status on later runs and update issue status.
  A ready PR does not complete a dependency; require merge before dependent work
  becomes Ready. Do not close issues just because an agent stopped or opened a PR.
- Do not send follow-up instructions to implementation chats unless the user has
  authorized those messages. Read-only monitoring is sufficient for normal status
  updates; each implementation chat owns its review loop.

## Manual examples

“Prepare the next useful implementation-ready work from the current priorities.”

“Start issue #123 in its own implementation chat and worktree.”

“Dispatch eligible ready work, considering current capacity and conflicts.”

Keep the repository public-data safe: no credentials, real customer data, or
private project history in issues, prompts, or evidence.
