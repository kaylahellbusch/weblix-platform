# Weblix Platform

Weblix Platform is a Next.js application for managing business data and generating customizable business websites.

## Architecture

- `apps/web` contains the primary Next.js application and all UI logic.
- `apps/api` remains intentionally untouched as a placeholder for future backend work.
- The app uses App Router, TypeScript, and Tailwind CSS for a simple, maintainable foundation.

## Local setup

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 in a browser.

## Available scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Vercel PR previews (on-demand)

- Workflow: `.github/workflows/vercel-pr-preview.yml`
- Required GitHub Actions secrets (preferably as **environment secrets** on `vercel-preview`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Automatic trigger: only when a same-repository PR changes from **Draft** to **Ready for review** (`pull_request: ready_for_review`)
- No automatic redeploys on `push`, `synchronize`, draft creation, PR merge, or `main` updates

### Manual redeploy

1. Open **Actions** → **Vercel PR Preview** → **Run workflow**
2. Enter `pr_number` for the open PR to redeploy
3. The workflow verifies the PR is:
   - open
   - same-repository (not fork head code)
   - ready for review (not draft)
4. If checks pass, it deploys the PR head SHA as a **preview** (never production)
5. `workflow_dispatch` always uses the workflow file from the default branch, then resolves the current PR head SHA via GitHub API before checkout/deploy.

### Where to find the preview URL

- In the workflow run summary (`Vercel preview deployed`)
- In the deploy step output (`Deploy preview artifacts`)
- To confirm the preview maps to the intended revision, compare the summary `Commit` value with the PR head commit shown in GitHub.

### Vercel/GitHub configuration notes

- Vercel project Root Directory must stay `apps/web`.
- Keep production disabled in GitHub Actions (this workflow never passes `--prod`).
- Vercel's ignored Git build setting does not block this workflow because deployment is CLI-driven (`vercel pull/build/deploy`) from Actions, not Vercel Git auto-builds.
- The workflow preserves the GitHub runner toolchain `PATH` during `vercel build` if a pulled preview environment variable also defines `PATH`, preventing local CLI dependency-install failures (`spawn npm ENOENT`).
- The deploy job uses the protected `vercel-preview` GitHub Environment. Configure **required reviewers** on that environment so approval is required before any deployment secrets are exposed to the job.
- If you currently store Vercel secrets only at repository scope, move them to `vercel-preview` environment secrets (or duplicate there and remove repo-level copies) to enforce the approval boundary.
- Vercel CLI is pinned in workflow (`VERCEL_CLI_VERSION`) for reproducibility.

### Limitations and cleanup

- Fork PRs are intentionally rejected before secrets are used.
- Same-repository PR branches are treated as trusted only after reviewer approval of the protected environment gate.
- Automatic cleanup on PR close is not configured. Vercel preview deployments can be removed manually from the Vercel dashboard if needed.

## Current status

This repository is in the early bootstrap stage. It includes the project foundation, a minimal landing page, automated checks, and CI for pull requests and pushes to `main`.
