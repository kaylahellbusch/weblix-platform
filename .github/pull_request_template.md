## Purpose

<!-- Link the issue. Carry its purpose forward, updating it to actual delivery
and final scope; never copy promises that were not implemented. -->

- **Why needed:** <!-- The problem or gap addressed. -->
- **What changed:** <!-- Observable before → actual after. -->
- **What it enables:** <!-- Contribution to the milestone or next capability. -->

<!-- These three bullets replace a separate Changes list. Omit routine file
inventories, commit hashes, implementation narration, and repeated test prose. -->

## Verification

<!-- Replace Pending only with actual results: ✅ Pass, ❌ Fail, ⏳ Pending,
or — N/A (brief reason). Include test count if useful. Add relevant behavior/RLS
rows. Don't mark a check passed merely because it was requested. -->

| Check | Result |
| --- | --- |
| Lint | ⏳ Pending |
| Types | ⏳ Pending |
| Tests | ⏳ Pending |
| Production build | ⏳ Pending |
| Diff checks | ⏳ Pending |
| Live app check | ⏳ Pending |
| Copilot review | ⏳ Pending |

## Evidence

<!-- Follow docs/pr-image-evidence.md. Show the Before/After pair here;
for nonvisual changes or unavailable captures, give suitable proof and a short
reason. Documentation-only: "No app change." Add a preview link when available. -->

## After merge — actions for the owner

<!-- Write "None — no migration, environment, hosting-setting or manual release
changes required." when verified. Otherwise give a short numbered checklist based
on inspected code/config/docs, not assumptions:
1. WHEN / WHERE: prerequisites and exact order relative to deployment; identify
   Preview vs Production and the intended Supabase/Vercel project without secrets.
2. DO: exact dashboard navigation/setting or command (with working directory),
   migration filename(s) in order, and links to committed SQL/instructions.
   Explain how to identify already-applied migrations; never blindly rerun SQL.
   For env vars name the key, scope and whether to generate/reuse a stable value;
   never put secret values in the PR. State whether a redeploy is needed and how
   to initiate the authorized release path.
3. VERIFY: expected result and exact user flow/query/check.
Include recovery/stop guidance for failed or potentially destructive steps.
Flag steps that must happen BEFORE merge/deploy separately; do not hide them in
post-merge instructions. Distinguish required actions, optional actions and items
already verified complete. If hosted state cannot be inspected, say what remains
unknown and how the owner can check it. Link lengthy details instead of duplicating
a manual, but leave the actionable checklist here. Instructions do not authorize
agents to apply hosted changes. -->

## Notes

<!-- Only actionable limitations, failures, skipped verification, or review caveats;
one or two short bullets. Remove this section when none. Keep incomplete PRs draft. -->
