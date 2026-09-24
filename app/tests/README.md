# Definition regression protection

This suite covers the focused F14 unknown-project fix. It is not certification that
all findings in the completeness/migration audit have been resolved.

## Commands

- Frontend unit tests: `npm --prefix app test`
- Lint/build: `npm --prefix app run lint` and `npm --prefix app run build`
- Backend (isolated SQLite, no Telegram):
  `cd backend && DJANGO_DEBUG=true DJANGO_DB_SSL=false DATABASE_URL=sqlite:////tmp/raccn-tests.sqlite3 TELEGRAM_BOT_TOKEN= python3 manage.py test`
- Browser: install `app/tests/requirements.txt` and run
  `python3 -m playwright install chromium`; against a local build/server run
  `RACCN_TEST_URL=http://127.0.0.1:8001 python3 app/tests/definition_browser.py`.
  All inquiry requests are intercepted; this never submits a real inquiry.

Root `.github/workflows/ci.yml` runs lint, unit tests, the Vite build, browser
regressions, backend tests and migration checks. It has no deployment job.
The backend/browser checks are separate: browser tests verify the real form's JSON
and error/retry/opt-out behavior; Django tests verify validation and persisted JSON.

## Contract

- `unsure`, `unknown`, `not sure` and `Not sure` normalize to `unsure`, labelled
  **Not sure**. They survive query strings, saved data, summary and opt-in inquiry.
- `selected` contains actual scope choices. Display/calculation `defaults` are
  illustrative only. No defaults are written into new snapshots, share links,
  inquiry qualification or the source string.
- For undecided products, the estimate can illustrate CRM; the range and block
  evidence explicitly identify example assumptions. The visitor's product remains
  `unsure`. No additional contact field is required.
- New `estimateSnapshot` records have `version: 2` and contain only selected scope
  fields plus storage metadata. Existing storage keys and privacy clearing work.
- Query overrides snapshot, then qualification. For ambiguous **legacy** snapshots,
  an explicit unknown qualification wins over a stored concrete product, because
  the old bug could have written CRM without a product decision. An explicit URL
  or a new v2 product selection can resolve that uncertainty.
- Historical leads already stored as CRM cannot be safely reclassified without
  evidence of their original intent; this change does not rewrite them.

## Arithmetic baseline

`fixtures/estimator-legacy.json` freezes the complete results of all 81 valid
combinations from Git revision `ded2944`, before this fix. Tests compare ranges,
notes, blocks and tags. Do not regenerate it from the modified implementation.
The corrected SaaS behavior is checked separately across its 27 combinations.
No estimator arithmetic code is changed in this fix.

## Checkpoint and scope

Approved application checkpoint: `08056ef7f96be30d42a89a98c4199191ba0eb621`.
Branch: `hardening/unknown-project-intent`.
The checkpoint includes application sources, tests, required assets and font
licences. Audit/review recordings, local databases and environment files were not
staged. A selected-file secret-pattern scan found no matches; this is not a
full security certification.

CMS authority and production media were addressed in the next focused phase; see
[CMS_MEDIA_HARDENING.md](../../CMS_MEDIA_HARDENING.md) for that contract and remaining
infrastructure checks. Other release-hardening work remains open:
contact abuse control/durable notifications, prototype asset migration, raw route
metadata, dependency triage, operations, broader accessibility and legacy cleanup.
No production or staging deployment was performed. Owner/legal/infrastructure
verification remains required before a release-readiness claim.

Contact reliability regression:

```sh
RACCN_TEST_URL=http://127.0.0.1:4173 python3 app/tests/contact_browser.py
python3 scripts/contact_reliability_smoke.py
```

The seven browser cases intercept every inquiry and check success, validation,
server failure, lost response, virtual-clock timeout, key reuse/new edited intent,
retained text and mobile native field focus. Existing definition browser cases
retain metadata opt-in/opt-out coverage. The smoke script starts two Gunicorn web
workers against a temporary SQLite database, deliberately loses the response after
persistence, restarts the server, retries, and exercises a duplicate HTTP race.
It never starts a notification worker and removes synthetic records with its temp DB.
All worker/Telegram tests use mocked transport in `backend/leads/test_reliability.py`.
