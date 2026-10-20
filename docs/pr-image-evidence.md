# PR image uploads

The GitHub connection supports base64 image uploads through its Git data tools;
no native PR attachment tool or new token is needed.

- Upload with `create_blob` (`encoding: base64`), then `create_tree`,
  `create_commit`, and `create_branch`. Store images on a unique
  `codex/evidence/pr-<number>-<capture-id>` branch, separate from application work.
- Embed `https://raw.githubusercontent.com/kaylahellbusch/weblix-platform/<evidence-commit>/<image-path>`
  in the PR and verify it loads. Keep evidence branches; never merge them or move
  application/main refs to an evidence-only tree.
- Binary connector reads may fail UTF-8 decoding even after a successful upload.
  Verify the raw image URL with a browser or HTTP client instead.
