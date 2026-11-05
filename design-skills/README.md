# Design skills

Three third-party agent skills for frontend design, copied unchanged from their repos so they can be compared on
the same task. They live here, outside `.agents/skills/`, so no agent loads them by accident.

| Folder | Source | Commit | License |
|---|---|---|---|
| `impeccable/` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), `.agents/skills/impeccable` (the Codex build) | `c8891a9` | Apache-2.0 (`impeccable-license/`, with its NOTICE) |
| `taste-skill/` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), `skills/taste-skill` | `9b4bf93` | MIT (`taste-skill-license/`); photos keep the licences listed in `assets/photos/photos.json` |
| `frontend-design/` | [anthropics/skills](https://github.com/anthropics/skills), `skills/frontend-design` | `ca45fc4` | Apache-2.0 (`frontend-design/LICENSE.txt`) |

Each folder is byte-for-byte the upstream folder at that commit (checked with `diff -r`).

## Using one

In the branch for that run only, copy one skill where Codex looks for skills, and name it in the prompt:

```
mkdir -p .agents/skills && cp -R design-skills/<folder> .agents/skills/
```

Give every run the same base and the same prompt, so the skill is the only difference.

## What each needs

- **impeccable:** its launcher downloads a prebuilt engine binary from the project's GitHub releases on first run,
  verified against `scripts/engine-checksums.txt`.
- **taste-skill:** Node 22+ and Chrome, Edge or Chromium. Its scripts load Google Fonts, jsDelivr, Lorem Picsum and
  Wikimedia images. Don't run the upstream `install.sh`.
- **frontend-design:** instructions only.
