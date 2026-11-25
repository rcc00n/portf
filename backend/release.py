"""New-image release task. Catalog publication is explicit and one release only."""
import os
import subprocess
import sys


def main():
    portfolio = os.environ.get("RACCN_RELEASE_PORTFOLIO", "")
    if portfolio not in {"", "2026-11-25"}:
        raise SystemExit("Unknown portfolio release. Refusing an unreviewed data import.")
    subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"], check=True)
    if portfolio:
        subprocess.run([
            sys.executable, "manage.py", "publish_release_portfolio", "--apply", "--replace-selection",
            "--map", "renter:7", "--map", "bad-guy-motors:5",
        ], check=True)


if __name__ == "__main__":
    main()
