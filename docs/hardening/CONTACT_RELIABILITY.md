> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# Contact reliability — review handoff

Branch: `hardening/contact-reliability`, based on CMS/media commit
`1908c702eaf3762e67fa7c862e14f112be183383` (approved application checkpoint
`08056ef7f96be30d42a89a98c4199191ba0eb621`). The phase commit is the branch HEAD.
No deployment, production inquiry, or real Telegram message was sent.

## Acceptance and API contract

`POST /api/contacts/` requires `Content-Type: application/json` (UTF-8, optional
charset parameter) and a randomly generated UUID v4 `Idempotency-Key` header.
The three required fields remain name, email and message. Example body:

```json
{
  "name": "Example visitor",
  "email": "visitor@example.test",
  "message": "Project context",
  "source": "site-start",
  "website": "",
  "qualification": {
    "projectType": {"value": "unsure", "label": "Not sure"}
  }
}
```

- Confirmed acceptance and identical normalized retries: HTTP 200,
  `{"ok":true,"id":123}`. No notification-delivery claim or lead contents returned.
- Errors: `{"ok":false,"errors":{"request":"…"},"fields":{"request":"…"},"error":"…"}`.
  Field validation uses field names in `errors`; `fields` remains a compatibility
  alias. Error strings are controlled messages, never exception/Telegram text.
- 400 invalid JSON, token, shape, required field, email, field bounds or honeypot;
  403 configured Origin mismatch; 405 non-POST; 409 same key/different normalized
  content; 413 body too large; 415 unsupported content type; 429 rate budget;
  503 database acceptance unconfirmed. 429 includes `Retry-After: 3600`.
- Responses use `Cache-Control: no-store`. HTML forms and text/plain JSON cannot
  call this contract. Infrastructure-level proxy errors may still be non-JSON;
  the frontend treats them as unconfirmed and keeps all text.

Bounds: body 32,768 bytes; name 120, email 254, company 200, message 5,000
characters. Required strings are trimmed; malformed required values produce field
errors. Optional source is capped at 120, user agent at 255. Legacy company and
source payloads remain supported. Unknown top-level/qualification keys are ignored.
Optional qualification recognizes only projectType, complexity, budget and timeline;
each must be an object. Value/label are capped at 64/160 characters. Rating/total
accept integers 0–100, integral finite floats and up to three ASCII decimal digits.
Negative, oversized, fractional, Boolean, Unicode numeric-looking, array/object and
nonfinite values become null. Malformed optional containers are ignored. Legacy
nonstandard JSON NaN/Infinity constants are treated as null; enormous JSON integer
literals are discarded before integer conversion. Invalid Unicode surrogate code
points in strings are replaced, avoiding database encoding errors. No estimator
arithmetic or unknown-project semantics were changed.

The header is deliberately required: old unmounted `App.jsx` and external clients
without a key now receive a predictable 400, not an unprotected acceptance. Deploy
the matching frontend/backend together when authorized; verify any external consumers
before staging. This phase did not delete historical presentation source.

## Idempotency and schema

Migration: `leads/0003_inquiryratebucket_contactrequest_submission_digest_and_more.py`.

| Model | Change |
|---|---|
| ContactRequest | Nullable unique UUID `submission_key`; private 64-character `submission_digest` |
| InquiryNotification | One-to-one lead; pending/processing/sent/failed; per-recipient delivery JSON; attempt count; last/next attempt; safe error summary; sent/created timestamps; lease UUID and expiry; due-job index |
| InquiryRateBucket | HMAC window key, count, indexed expiry |

Lead and outbox creation share one database transaction. The unique key constraint
prevents concurrent retry inserts. A SHA-256 digest of the normalized accepted
payload binds the random key to its content; it is **not** the key. A known key
with different content returns 409 without revealing the existing ID or data.
The digest survives application secret rotation; tokens/digests are not exposed in
admin or public responses. Historical leads retain null keys, unchanged definitions,
statuses and notification flags; no old notifications are automatically enqueued.
A new random key represents a new legitimate inquiry, including repeated wording.
Keys remain with the lead for its lifetime; deleting/restoring records affects that
guarantee, so retention and backups must preserve the required retry horizon.

## Abuse controls and security review

- Hidden, non-required `website` honeypot; nonempty submissions cannot create jobs.
  No CAPTCHA, artificial delay, invasive fingerprinting or extra visible fields.
  A minimum timing gate was omitted because autofill/accessibility make it unreliable.
- Durable atomic fixed-window budget: 60 new valid attempts/socket peer/UTC hour,
  configurable with `INQUIRY_RATE_LIMIT`. IPv6 uses /64. Successful retries bypass
  this budget; they never create another job. Invalid requests never enqueue work.
- Socket REMOTE_ADDR only; arbitrary X-Forwarded-For cannot bypass the limit. Behind
  Dokku nginx, this may be a shared proxy budget rather than a per-visitor budget.
  Verify topology and edge limits before staging; do not trust unsanitized headers.
- Optional exact `INQUIRY_ALLOWED_ORIGINS` list supplements JSON restrictions.
  Missing Origin remains allowed. CORS/origin checks are not spam authentication.
- Client-controlled recipients, URLs or commands are ignored. The worker uses the
  fixed Telegram API host, operator token and authenticated-admin recipient records.
  Plain text messages disable link previews. HTTP 400/401/403/404 delivery failures
  are terminal until staff review; transport/429/server failures retry with bounds.
- No raw transport exceptions, Telegram descriptions or credentials are saved/logged.
  Admin auth, permission checks and CSRF remain enabled; only public inquiry POST
  has its existing CSRF exemption. Rate counters contain HMAC keys, not copied IPs.

This limits public notification amplification but is not a DDoS solution or formal
penetration test. Distributed spam and worker/proxy capacity need operational
monitoring. Stable `DJANGO_SECRET_KEY` is required across workers for shared HMAC
rate buckets (and existing sessions). The edge still needs request/header timeouts.

## Notification lifecycle

One durable job per lead snapshots active recipients at acceptance. Delivery results
are saved **after each recipient**. A successful recipient is skipped on subsequent
automatic or staff retries; another recipient's failure does not invalidate the lead.
An initially empty snapshot can populate from active configuration when processed.
A removed/disabled snapshotted recipient is not contacted and is visibly failed.

`process_inquiry_notifications` claims due jobs with an atomic conditional update
and a 60-second UUID lease, renewed before each recipient. Transport timeout is
10 seconds. There is no database transaction held across the external HTTP call.
Interrupted processing can be reclaimed after lease expiry; stale owners cannot
write over another lease. Run one supervised worker initially. At most five delivery
rounds occur, with 60s, 300s, 1,800s, 7,200s backoff before subsequent rounds.
Permanent recipient failures are not automatically retried. Configuration absence
also becomes failed after the bounded attempts. No infinite resend loop.

A worker crash after Telegram accepts a message but before the database records
that success can cause an external duplicate. Exactly-once **lead persistence** is
guaranteed by the database key; Telegram delivery is at-least-once attempted with
bounded retries, and can end in visible permanent failure. Do not claim guaranteed
or exactly-once external delivery. Legacy `telegram_sent` means any recipient sent;
the job and its individual results are authoritative for complete delivery state.

Messages put lead ID, name, email, source, staff admin record path and optional
project definition **before** the message body. The body is explicitly marked when
shortened. The full inquiry always remains in Django. Text is capped at 3,900 UTF-16
units, conservatively below Telegram's 4,096-character sendMessage limit;
[Telegram's message contract](https://core.telegram.org/bots/api#sendmessage).
The staff path is only inside staff notifications, never public API responses.

## Frontend and admin

The approved form layout, three native required fields, full-block focus, hover,
completed states and success animation are unchanged. A random key stays in a ref
through network/server errors and the 20-second timeout. Retrying unchanged content
reuses it. Editing submitted content starts a new logical submission/key. Only a
confirmed `ok:true` and positive integer ID clears form state and shows success.
Unconfirmed copy asks the visitor to retry; rate-limit copy asks them to wait.
Optional definition opt-in/out and unknown intent remain regression-protected.
No PII or submission data was added to browser storage. Reloading/leaving the form
still discards its in-memory draft/key; recovery is within the mounted form.

Contact admin lists notification state, received time and inquiry status; detail
shows source, qualification, recipient results, attempts, timestamps and safe errors.
The separate notification list filters pending/processing/sent/failed and supports
an authenticated **Retry failed notifications** action. It resets the attempt budget
and preserves already delivered recipients. Notification payload/lease fields cannot
be edited as arbitrary destinations through that admin.

## Verification and CI

Local results:

- Frontend lint, 29 Node tests and production build passed. Existing tests include
  all 81 verified estimator combinations and corrected SaaS/unknown semantics.
- 7 contact browser cases + 5 existing definition browser cases passed: success,
  validation, 503, lost connection, virtual-clock timeout, unchanged-key retry,
  edited intent, retained text, unconfirmed 200, mobile field surfaces, metadata
  opt-in/out and reduced-motion behavior. All browser-only contact calls intercepted.
- 66 Django tests passed, including contact validation/persistence, malformed JSON,
  wrong content type, oversized inputs, numeric/Unicode edge cases, throttling,
  honeypot, idempotency/conflicts, rollback, no synchronous notification, multiple
  recipients, retry exhaustion, permanent failure, lease recovery, truncation,
  authenticated admin, forward migration and existing routes/projects/media.
- `makemigrations --check --dry-run` passed; forward migration tested on historical
  fixtures and fresh temporary databases. No historical lead classification changed.
- Real Gunicorn/temporary SQLite flow passed: POST persists → browser loses response
  → two web workers restart → unchanged retry recovers same ID. A concurrent duplicate
  race also produced one record/job. No notification worker ran; synthetic records
  were removed with the temporary database. All Telegram unit calls are mocked.
- Existing CMS/media smoke passed: all 12 canonical routes, publication/order/media,
  real case 404, empty/failure distinction, desktop/mobile and reduced-motion hero.
- Root CI now runs contact browser and real HTTP smoke regressions alongside existing
  lint/unit/build/backend/migration/CMS-media checks. No deployment step added.

Screenshots generated for local review, excluded from Git:
`/tmp/raccn-contact-unconfirmed-desktop.png`,
`/tmp/raccn-contact-confirmed-desktop.png`,
`/tmp/raccn-contact-confirmed-mobile.png`.
No CSS, hero geometry, choreography, typography, CMS schema or estimator arithmetic
files changed. No dependency was added.

Reproduce with a built frontend and installed existing test dependencies:

```sh
npm --prefix app run lint
npm --prefix app test
npm --prefix app run build
# Start Vite preview separately at 127.0.0.1:4173, then:
RACCN_TEST_URL=http://127.0.0.1:4173 python3 app/tests/contact_browser.py
RACCN_TEST_URL=http://127.0.0.1:4173 python3 app/tests/definition_browser.py
python3 scripts/contact_reliability_smoke.py
python3 scripts/cms_media_smoke.py
# From backend/ with local test environment configured as in root CI:
python3 manage.py test
python3 manage.py makemigrations --check --dry-run
```

## Runtime, owner review and unverified infrastructure

The new root Procfile defines web and worker, copied into the existing Docker image.
No Redis/Celery, threads in Gunicorn, new hosted service or infrastructure deployment.
See [Dokku worker requirements](DOKKU.md#inquiry-notification-worker-contact-reliability-phase)
for explicit process commands, environment, shutdown/recovery and staff operations.

**OWNER INPUT REQUIRED:** confirm notification recipients and responsible staff;
who monitors pending/failed jobs; retention policy for inquiry/outbox/idempotency
records; privacy/legal appropriateness of forwarding submitted context to Telegram;
any external consumers still using the old keyless contact API. No new marketing
claims, response-time promises or legal text have been invented.

**NOT VERIFIED:** installed Dokku/Procfile support and actual worker scale/restart;
production PostgreSQL migrations/concurrency and backup restore; stable shared
secret/database across processes; sanitized proxy topology/actual REMOTE_ADDR,
shared-IP rate budget and edge request limits; verified Origin/CORS/domain settings;
real Telegram token, recipients, reachability/provider delivery limits; shutdown
grace under the actual recipient count; queue-age/error alert routing; Docker image
build on the target platform. Local tests used SQLite/Chromium and mocked Telegram,
not the production database/provider. Worker is not claimed active in production.

Stop here for review. No staging or production deployment has been authorized.
