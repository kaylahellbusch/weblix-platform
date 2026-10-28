# Vercel PR previews (on-demand)

The [preview workflow](../.github/workflows/vercel-pr-preview.yml) deploys the latest commit of an open, ready-for-review PR targeting `main` from this repository to a Vercel **preview** environment. It can run when a PR is marked ready or when started manually. It doesn't deploy to production or redeploy with every push or merge. The workflow was re-enabled on October 27, 2026; inspect current Actions state and run results rather than assuming a preview is available.

## Manual redeploy

Once the workflow is enabled and a preview is approved, open **Actions → Vercel PR Preview → Run workflow** and enter the open PR number. A manual run uses the workflow from the default branch and looks up the PR's latest commit before checking it out. Draft, closed, fork, and non-`main`-targeting PRs are rejected. Internal PRs targeting outcome branches do not create previews. Check whether a matching run already exists before starting another.

## Where to find the preview URL

Find the **Preview URL** and **Commit** in the successful run's summary. Check the commit against the PR; an older preview won't necessarily include your latest push. The URL also appears in the deploy-step output.

## Vercel/GitHub configuration notes

- Configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, preferably as secrets in the `vercel-preview` GitHub Environment.
- To require approval before the job can use deployment secrets, add required reviewers to that environment. Naming the environment in the workflow doesn't set up that protection.
- Keep the Vercel project Root Directory at `apps/web`. The workflow runs pinned Vercel CLI commands from the repository root so the project root is applied once.
- These CLI deployments are separate from Vercel's Git build settings. The workflow doesn't pass `--prod`; check the Vercel project separately for production release settings.

## Limitations and cleanup

The workflow doesn't apply database migrations or configure app secrets. Set those up separately and test the signed-in workflows on the preview. Closing a PR doesn't remove its deployment automatically; unused previews can be removed manually.

[Hosted prerequisites](hosted-setup.md) · [Back to the README](../README.md)
