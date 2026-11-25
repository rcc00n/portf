"""Retain only a previous Vite entrypoint's reachable, immutable JS/CSS chunks.

Call ``collect(previous, current, output)`` or use the CLI. Both input paths are
frontend_dist directories. Output is a new/empty directory of flat hashed files,
ready to copy into the new build's assets directory. The returned/printed manifest
contains public filenames, lengths and SHA256 hashes, never source filesystem paths.
No input build is modified; all validation finishes before output is written.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
from urllib.parse import urlsplit


HASHED_CODE = re.compile(r"[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8,}\.(?:js|css)\Z")
REFERENCES = re.compile(r'''["'`(]([^"'`()\s<>]+\.(?:js|css)(?:[?#][^"'`()\s<>]*)?)(?=["'`)])''')


def _no_symlink(path):
    for candidate in (path, *path.parents):
        if candidate.is_symlink():
            raise ValueError("Symlinks are not permitted in compatibility inputs/output.")


def _regular_file(path):
    _no_symlink(path)
    if not path.is_file():
        raise ValueError(f"Referenced build file is missing or not regular: {path.name}")
    return path.read_bytes()


def _references(data):
    """Read literal Vite chunk references, not arbitrary import expressions/URLs."""
    names = set()
    for match in REFERENCES.finditer(data.decode("utf-8")):
        reference = match.group(1)
        parts = urlsplit(reference)
        if parts.scheme or parts.netloc:
            continue
        path = parts.path
        name = path.rsplit("/", 1)[-1]
        if not HASHED_CODE.fullmatch(name):
            continue  # Fonts, images, maps and copy such as "React/Next.js" are not code assets.
        if path not in {name, f"./{name}", f"assets/{name}", f"./assets/{name}", f"/assets/{name}"}:
            raise ValueError(f"Unsupported chunk path; only flat assets are permitted: {name}")
        names.add(name)
    return names


def collect(previous, current, output):
    """Validate the old reachable chunk graph, then atomically publish missing files.

    Identical names in the current build must have identical bytes. Only missing
    files are copied, and the previous index.html itself is never retained.
    """
    previous, current, output = (Path(path).absolute() for path in (previous, current, output))
    for root in (previous, current):
        _no_symlink(root)
        if not root.is_dir() or not (root / "assets").is_dir():
            raise ValueError("Each input must be a built frontend directory with assets/.")
        _no_symlink(root / "assets")
        _regular_file(root / "index.html")
    _no_symlink(output)
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise ValueError("Output must be a new or empty directory.")
    if not output.parent.is_dir():
        raise ValueError("Output parent directory must already exist.")
    if output == previous or output == current or previous in output.parents or current in output.parents:
        raise ValueError("Output must be separate from both input builds.")

    index = _regular_file(previous / "index.html")
    pending = _references(index)
    if not pending:
        raise ValueError("Previous index.html has no supported hashed JS/CSS entrypoints.")
    seen, retained, manifest = set(), {}, []
    while pending:
        name = min(pending)
        pending.remove(name)
        if name in seen:
            continue
        data = _regular_file(previous / "assets" / name)
        destination = current / "assets" / name
        _no_symlink(destination)
        reused = destination.exists()
        if reused and _regular_file(destination) != data:
            raise ValueError(f"Immutable chunk name collision: {name}")
        seen.add(name)
        pending.update(_references(data) - seen)
        if not reused:
            retained[name] = data
        manifest.append({"name": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "status": "reused" if reused else "copied"})

    # Stage beside the destination, then rename once. Invalid graphs never leave
    # partly copied output; failed writes are cleaned up by TemporaryDirectory.
    with tempfile.TemporaryDirectory(prefix=".frontend-compat-", dir=output.parent) as temporary:
        staging = Path(temporary)
        staging.chmod(0o755)
        for name, data in retained.items():
            (staging / name).write_bytes(data)
            (staging / name).chmod(0o644)
        if output.exists() and (not output.is_dir() or any(output.iterdir())):
            raise ValueError("Output changed while preparing compatibility assets.")
        os.replace(staging, output)
    return {
        "source_index_sha256": hashlib.sha256(index).hexdigest(),
        "copied_count": len(retained), "reused_count": len(seen) - len(retained),
        "files": sorted(manifest, key=lambda item: item["name"]),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("previous", "current", "output"):
        parser.add_argument(f"--{name}", required=True, type=Path)
    args = parser.parse_args()
    try:
        result = collect(args.previous, args.current, args.output)
    except (ValueError, OSError, UnicodeError) as error:
        parser.exit(1, f"Compatibility assets rejected: {error}\n")
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
