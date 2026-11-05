# Taste homepage experiment

> Redesign the Weblix homepage so it looks like a polished, professional product a small business owner would trust, on desktop and phone. Keep everything the page currently says about the product accurate, and keep existing behavior and links working. Use the taste-skill skill and follow its instructions.

This independent experiment targets `codex/homepage-design-base` and remains a draft. Copilot review is skipped by explicit instruction. No preview, hosted migration, deployment, or merge was requested or performed.

## Revision and treatment

- Combined baseline: `1d70f1690f1d87d9845bc1ecd384a22f8b750959`, whose parents are PR51 `aab464939e0635724ad636a6c2dff9950e6ced10` and PR53 `b669441182db5bf08b16a917329b6748eee7dcd0`.
- Branch: `codex/homepage-design-taste`.
- Tested application revision: `b7b148d0a3e3e11c144a4376a41d628e254c7e50`; subsequent commits contain evidence only.
- Selected skill: `design-taste-frontend`, tasteskill **2.5.0**, copied unchanged from `design-skills/taste-skill` into `.agents/skills/taste-skill` before redesign. It is the only directory under `.agents/skills`.
- Source and selected-copy Git tree both equal `5743b6eb4d005c5bbe51aa4ecae701eb052d6198`; filesystem comparison also passed.
- No additional design skill, installer, or reviewer was activated. No other experiment implementation or result was inspected.

The software deal selected the split hero, olive-on-bone palette, Onest type pairing, soft radius, solid buttons, sage lit ground, dark footer, type close, and space rhythm. The photograph-card navigation falls back to the skill's split navigation because no photographs were supplied. The dealt effect is silk-folds in the content frame; the moment is word-highlight in its own statement section. Dealt CSS grounds are mist and dots. No scene subject or client media slots were supplied. There are no assumed prices, hours, addresses, coined names, stock photographs, or customer proof; fictional business names and content come from the baseline page.

The page retains manual business entry, CSV review and confirmation, grid/compact client search, business information, saved website content, original anchor destinations, login links, GitHub link, and the notice that rendering, live preview, and publishing are unavailable. Workspace pictures remain noninteractive illustrations with accessible fictional-data descriptions.

## Measurement protocol

Production Next.js 16.4.0 build/start on this run's port **3157**. The default Turbopack build was blocked by worker process/port creation (`Operation not permitted`); `npm run build -- --webpack` passed. Application and skill commands used Node 22.15.0; Lighthouse used Node 25.2.1.

Screenshots use the selected skill's headless Chrome script, settled fonts and layout, and full-page capture. The main viewports are **1440×900** and **390×844**. Additional required skill views are 1024×768, 820×1180, and 768×1024. Before/after images are direct GitHub attachments in the PR, not screenshot commits.

Both Lighthouse runs use **Lighthouse 13.0.1** and **Google Chrome 156.0.8078.80**. Exactly one run was measured for each preset, with no score tuning afterward. Mobile uses the default preset (412×823, DPR 1.75, simulated 4× CPU slowdown); desktop uses `--preset=desktop` (1350×940, DPR 1, simulated 1× CPU). The screenshot dimensions deliberately differ from the tool's default audit presets. Audit JSON is unchanged; trailing whitespace was normalized in published text logs and HTML. Full settings and timestamps are preserved in [measurement.json](measurement.json) and the raw JSON reports.

```text
lighthouse http://127.0.0.1:3157 --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --chrome-flags='--headless=new'
lighthouse http://127.0.0.1:3157 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --chrome-flags='--headless=new'
```

### Mobile Lighthouse

| Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- |
| 69 | 95 | 100 | 100 |

[HTML report](lighthouse-mobile.report.html) · [JSON report](lighthouse-mobile.report.json)

### Desktop Lighthouse

| Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- |
| 99 | 94 | 100 | 100 |

[HTML report](lighthouse-desktop.report.html) · [JSON report](lighthouse-desktop.report.json)

Both audits completed without runtime errors or run warnings. Mobile FCP/LCP are 2.9/3.3 seconds, total blocking time 700 ms, CLS 0.005; desktop FCP/LCP are 0.7/0.8 seconds, total blocking time 0 ms, CLS 0.013. The accessibility findings are a prohibited `aria-label` added to the statement paragraph by the supplied word-highlight module, and an h3 in the illustrative hero UI before the page's first h2. These remain in the measured revision.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint` | Fail: 15 errors and 153 warnings; the errors are React hook rule matches in copied vanilla JavaScript assets |
| Application lint (`eslint app lib proxy.ts next.config.ts`) | Pass: 0 errors, 8 warnings about manual stylesheet/font links required by the kit |
| `npm run typecheck` | Pass |
| `npm run test` | Pass: 206 tests in 24 files |
| Production build | Pass with webpack; default Turbopack blocked as described above |
| `git diff --check` | Pass (implementation and published evidence) |
| Live homepage | Captured and inspected at all five required widths; all visual frames render |
| Login | Link destination preserved; local HTTP 500 because `NEXT_PUBLIC_SUPABASE_URL` is missing and this worktree has no `.env.local`; authentication and permission flows unverified |
| Skill layout stress check | Actual headings and section geometry fit at all five widths; one 1440 stress-only failure when the checker expands the h1 to its kit maximum of 45 characters, producing four lines instead of three |
| Skill performance check | 0 failures, 2 warnings, both for 678.1 KiB parsed JavaScript |
| Final skill consistency check | Fail: 28 FAIL, 32 WARN; assessment below |
| Copilot review | Skipped by explicit experiment instruction |

[Layout check output](layout-check.txt) · [Skill performance output](skill-performance.txt) · [Skill performance JSON](skill-perf.json) · [Consistency report](consistency-report.json) · [Consistency output](consistency-check.txt)

## Skill limitations and finding assessment

The skill's `icons.mjs fetch csv` command could not resolve `csv` as a curated icon. No substitute was drawn. The existing Weblix logo is retained. The required kit files were not edited to silence lint or checker findings.

The final raw report contains **28 FAIL and 32 WARN** findings. The following assessment preserves those totals rather than treating the page as passing:

- **22 assessed checker conflicts:** four `scroll-reveal` failures flag the expressly dealt software `word-highlight` moment; ten `one-section` failures classify the prescribed app window/chrome or the prescribed full-width close-type button as forbidden text bands; four `one-heading` failures count individual large words inside the allowed statement moment (for example “location,” or “Keep”) as another section heading; four `split-pair` failures conflict with the dealt span-5 / span-6 start-7 composition and its cap-trimmed h1. These elements follow the skill's supplied recipes. This is an implementation assessment, not a modification of the checker or a clean checker result.
- **Six unresolved findings:** three `cut-text` cases clip illustration text at 1024 (hero services by 9px and editor label by 7px) or 768 (app-frame services by 18px); two `section-gaps` failures flag uneven content spacing at 1440 and 820; one `section-air` failure flags 640px of air at 820. These are remaining implementation limitations, not false positives.
- Warnings include the unavailable local login destination; different button/text-link treatments of the workspace action; missing scroll-current navigation indication; section spacing, proximity and spare card space; and wording/section-label matches. Full selectors and measurements are retained in the raw report.

The required layout stress checker separately exits with one remaining 1440 finding: an artificially expanded 45-character heading takes four lines. The actual heading fits three desktop lines and two phone lines. The kit's maximum and scripts were kept unchanged. The final consistency checks pass assets, shader lint, fallback rendering, off-viewport/spill, text contrast, button contrast, reduced motion, hidden content, font loading, hero screen height, section height, container edges, and the motion layer. The overall consistency check still fails.

The skill's own screenshots were used throughout; no hand-built capture or failed-step replacement was introduced. The initial diagnostic walk preceded the final layout fixes; the linked consistency report covers the frozen measured application revision. The raw diagnostic crop files remain local; full-page captures and the required before/after pairs are attached to the PR.

## Added/deleted lines versus the combined baseline

These are Git `--numstat` counts, not compressed transfer sizes. Binary file counts are shown separately.

| Category | Added | Deleted | Files | Binary files |
| --- | ---: | ---: | ---: | ---: |
| Homepage/app source and styling | 155 | 74 | 4 | 0 |
| Selected skill copy | 122,898 | 0 | 1,617 | 151 |
| Runtime kit assets copied into public assets | 99,569 | 0 | 1,588 | 151 |
| Skill deal history and plan | 58 | 0 | 5 | 0 |
| Measurement reports and evidence metadata | 26,958 | 0 | 13 | 0 |
| Total | 249,638 | 74 | 3,227 | 302 |

The full kit copy contributes considerable repository overhead; unused assets are not all transferred by the homepage. [Machine-readable counts](line-counts.json) record the final tree counts.

## Time and usage

The earliest recorded run event is assigned branch creation at **2026-11-05 10:44:52 UTC** (03:44:52 MST). Initial instruction-reading time precedes that event and was not independently timed. Local evidence completion: **2026-11-05 11:14:55 UTC**; recorded elapsed from branch creation: **0:30:03**. Draft publication time is recorded in the PR. Token and cost usage were not observable, so no usage estimate is supplied.
