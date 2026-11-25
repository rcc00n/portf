"""Compatibility entry point for the maintained isolated release checks."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).resolve().parents[1] / 'scripts' / 'check_release.py'),
              run_name='__main__')
