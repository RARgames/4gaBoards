from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
E2E_DIR = Path(__file__).resolve().parents[1]


def _pnpm_executable() -> str:
    return shutil.which("pnpm") or "pnpm"


@pytest.mark.e2e
def test_playwright_typescript_suite() -> None:
    """Run `pnpm --dir e2e exec playwright test` from the repository root."""
    env = os.environ.copy()
    proc = subprocess.run(
        [_pnpm_executable(), "--dir", str(E2E_DIR), "exec", "playwright", "test"],
        cwd=REPO_ROOT,
        env=env,
        check=False,
    )
    assert proc.returncode == 0, (
        "Playwright suite failed. Inspect e2e/playwright-report/ and e2e/test-results/ "
        "after enabling traces or video in playwright.config.ts."
    )
