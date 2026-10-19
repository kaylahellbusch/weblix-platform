# Publish PR screenshots through the GitHub connection

The connected GitHub tools can upload images as base64 Git blobs. A native PR
attachment uploader is not required. Use this route before reporting that image
upload is unavailable. It needs existing repository write access, no new token or
external image host.

## Capture and inspect

Save screenshots while testing the actual running app in the issue worktree.
Keep the local originals until the PR is reviewed. Inspect them for secrets or
real customer data; this repository and its evidence branches are public. Use
synthetic data. Check the actual image format and use the matching extension
(browser screenshots may contain JPEG bytes despite a `.png` filename).

Keep tested revision and capture context in follow-up state or a small evidence
manifest, not routine paragraphs in the PR. A screenshot proves only what it shows;
retain tests for persistence, errors, and permissions.

## Upload without changing the implementation branch

Use the GitHub connection's Git data tools. Discover their current argument
schemas before invoking them; tool availability can differ between chats.

1. Read the current PR head SHA. Base64-encode the local image, then pass it to
   `create_blob` with `encoding: base64`. Compose these calls programmatically so
   the full base64 image is not printed in chat. Keep the returned blob SHA.
2. Create a new tree with the screenshot entry (path such as
   `pr-<number>/dashboard.jpg`, mode `100644`, type `blob`, and its blob SHA).
   Include all images for this capture, plus an optional concise manifest. Omit
   the base tree to make this an evidence-only snapshot.
3. Create a commit using that tree and the tested PR head as parent. Create a new,
   uniquely named branch such as `codex/evidence/pr-<number>-<unique-capture-id>`
   pointing at that commit. Never update the implementation branch or main with
   the evidence-only tree: it deliberately contains no application files.
4. Embed each image using an immutable URL:
   `https://raw.githubusercontent.com/kaylahellbusch/weblix-platform/<evidence-commit>/<image-path>`.
   The evidence commit identifies the upload; the manifest/context identifies
   the tested app revision. Do not confuse the two.
5. Verify the image URL loads and the downloaded bytes match the captured image,
   then update the PR Evidence section with the image and a short caption. A
   successful blob upload alone is not proof that the published image works.

Keep evidence branches after PR merge so images remain reachable. Do not open a
PR from an evidence branch or merge it. Use a fresh branch per capture to avoid
concurrent agents overwriting each other; never force-push shared evidence.

Binary read caveat: `fetch_blob`/generic connector fetch may try UTF-8 decoding
and fail on images. That is not an upload failure. Verify through the raw image
URL using an approved HTTP client or browser instead. If access or an actual
upload request fails, report the concrete error and retain local screenshots;
do not claim the connector has no upload capability merely because it lacks a
native attachment tool.

## Verified example

The connector uploaded the synthetic dashboard screenshot from PR #26. Its raw
GitHub image URL returned HTTP 200 with `image/jpeg`; its bytes matched the local
capture. PR #26 embeds that image. No application commit or hosted database was
modified by publishing it.
