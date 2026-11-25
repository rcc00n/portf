# Regression checks

The former syntax-only checks are superseded by the root
[regression workflow](../.github/workflows/ci.yml) and
[`scripts/check_release.py`](../scripts/check_release.py).

`python ci/checks.py` remains a compatibility entry point to the complete runner.
Install the dependencies/browser from the [root instructions](../README.md) first.
Checks use isolated databases/media and mocked or disabled providers. They do not
deploy or send real inquiries. GitHub also runs PostgreSQL migration and image checks.
