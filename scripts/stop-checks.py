#!/usr/bin/env python3
"""Stop hook for Claude Code and Codex: an agent can't finish while lint, types or tests fail.

Runs only when apps/web differs from origin/main, and skips a tree that already passed. After three
failed attempts in one session it lets the agent stop, so it reports the failure instead of looping.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "apps" / "web"
CHECKS = ["lint", "typecheck", "test"]
MAX_BLOCKS = 3


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout


def changed_web_files():
    base = git("merge-base", "HEAD", "origin/main").strip() or "HEAD"
    tracked = git("diff", "--name-only", base, "--", "apps/web").split()
    untracked = git("ls-files", "--others", "--exclude-standard", "--", "apps/web").split()
    return sorted(set(tracked + untracked))


def fingerprint(files):
    digest = hashlib.sha256(git("rev-parse", "HEAD").encode() + git("diff", "HEAD", "--", "apps/web").encode())
    for name in files:
        path = ROOT / name
        digest.update(name.encode() + (path.read_bytes() if path.is_file() else b""))
    return digest.hexdigest()


def finish(output=None):
    print(json.dumps(output or {}))
    sys.exit(0)


def main():
    event = json.load(sys.stdin)
    state_dir = ROOT / git("rev-parse", "--git-dir").strip() / "stop-checks"
    state_dir.mkdir(exist_ok=True)
    passed = state_dir / "passed"
    blocks = state_dir / f"blocks-{event.get('session_id', 'unknown')}"

    files = changed_web_files()
    if not files:
        finish()
    fp = fingerprint(files)
    if passed.exists() and passed.read_text() == fp:
        finish()

    if not (WEB / "node_modules").exists():
        failures = ["node_modules is missing. Run `npm ci` in apps/web, then rerun the checks."]
    else:
        failures = []
        for check in CHECKS:
            run = subprocess.run(["npm", "run", check], cwd=WEB, capture_output=True, text=True)
            if run.returncode:
                tail = "\n".join((run.stdout + run.stderr).strip().splitlines()[-40:])
                failures.append(f"`npm run {check}` failed:\n{tail}")

    if not failures:
        passed.write_text(fp)
        blocks.unlink(missing_ok=True)
        finish()

    count = int(blocks.read_text()) + 1 if blocks.exists() else 1
    blocks.write_text(str(count))
    report = "\n\n".join(failures)
    if count > MAX_BLOCKS:
        finish({"systemMessage": f"Checks still fail after {MAX_BLOCKS} attempts. The work is not done.\n\n{report}"})
    finish({
        "decision": "block",
        "reason": f"Checks fail (attempt {count} of {MAX_BLOCKS}). Fix them before finishing, "
        f"or say plainly that they fail and why.\n\n{report}",
    })


if __name__ == "__main__":
    main()
