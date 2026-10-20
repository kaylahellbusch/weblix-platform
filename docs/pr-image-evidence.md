# PR screenshot evidence

- For app changes, capture the original behavior before editing and the working
  result afterward, using the same scenario, data, and viewport. Show them in a
  Before/After table. If a baseline cannot be reproduced, say so; never fabricate it.
- Attach images directly to GitHub PRs with `gh pr create/edit --attach` or the
  browser attachment UI. With `--body-file`, matching local image paths in the
  Markdown are replaced by uploaded URLs. Verify both images render.
- Do not create image-only branches or commit screenshots to application branches.
  If direct upload is blocked, retain local captures and report the specific blocker.
  Do not delete existing evidence branches until their images are reattached and
  every reference is updated.
