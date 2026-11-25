# Release and rollback: RACCN Code on Dokku

This procedure targets the existing `portf` application only. Do not restart,
reconfigure or replace BGM, Quantix, shared databases, or other hosted applications.
Commands below are operator steps, not a statement that they have been executed.

## Observed boundary, 2026-11-25

Read-only inspection confirmed Dokku 0.34.7, PostgreSQL plugin 1.44.0, linked service
`portf-db`, one `portf` web process, and the existing media mount:
`/var/lib/dokku/data/storage/portf-media:/srv/app/media`.
The database connection uses TLS. nginx overwrites `X-Forwarded-For` with
`$remote_addr` and `X-Forwarded-Proto` with `$scheme`; it preserves the request Host.
There is no `tags` plugin: do not use obsolete `tags:deploy` rollback instructions.

The pre-release legacy runtime needed production configuration changes before it could run
the hardened code: disable DEBUG, explicitly select production, set the verified
canonical origin, configure the trusted proxy boundary, and replace the old key
with a private stable key meeting the new minimum. Key replacement invalidates
existing authenticated sessions; it does not change admin passwords or stored leads.
Never print the old or replacement key. Preserve a private configuration rollback
snapshot through the operator's secret-management procedure, outside Git and logs.

## Before changing anything

1. Confirm app/domain/database/mount identity again. Preserve current image ID,
   process scale, source revision, nginx settings and private config snapshot.
2. Record aggregate project/image/inquiry counts without exporting personal records
   into terminal output. Do not copy a local SQLite database onto production.
3. Create private database and media backups together. Restrict backup directory
   permissions to the operator. Example commands **on the host**, with a fresh
   directory chosen deliberately:

   ```sh
   umask 077
   raccn_backup_dir=/var/backups/raccn/RELEASE_ID
   install -d -m 700 "$raccn_backup_dir"
   dokku postgres:export portf-db > "$raccn_backup_dir/portf-db.dump"
   tar -C /var/lib/dokku/data/storage -czf "$raccn_backup_dir/portf-media.tar.gz" portf-media
   sha256sum "$raccn_backup_dir/portf-db.dump" "$raccn_backup_dir/portf-media.tar.gz" > "$raccn_backup_dir/SHA256SUMS"
   ```

   The plugin produces a PostgreSQL custom-format dump. Verify with the matching
   `pg_restore --list` and rehearse restoring into an **isolated new database**.
   Do not display dump contents or put dumps in this repository. Coordinate uploads
   during backup so new files and their database records remain consistent.
4. Preserve the running image with a unique local Docker tag before Dokku replaces
   `dokku/portf:latest`; use the verified running container image ID, not a guessed
   previous tag. Also save a restricted, checksummed image archive: scheduled Docker
   pruning can delete an unused tagged image. Keep both through the rollback window.
5. Run migrations and the reviewed project import against the isolated restored DB,
   with notification delivery disabled. Check retained lead/media counts. Published
   identity mapping must be explicit, and unverified legacy claims remain excluded.

## Runtime configuration and release

Use the production environment contract in [DOKKU.md](../../DOKKU.md). Apply changes
only to `portf`, without restarting the old app prematurely. Do not paste secret
values into shell history, this document, CI output, or tool output. PostgreSQL
TLS is supported by the observed connection; preserve TLS rather than disabling it.

Trust only the verified host proxy source address, not the whole Docker subnet.
Confirm it using the current container gateway and `ip route get` for its address.
The observed nginx overwrite policy permits `DJANGO_TRUST_PROXY_CLIENT_IP=true`
once that exact source address is configured in `DJANGO_TRUSTED_PROXY_CIDRS`.
Recheck this boundary after network/topology changes. Without it, all inquiries
share the proxy rate-limit bucket and HTTPS redirects cannot safely trust scheme.

The shipped Procfile `release` phase runs migrations from the new image before
Dokku schedules it. Failure blocks the release. Database changes are not rolled
back merely because a later startup check fails; retain the compatible old image
and rehearse migrations first. No worker or public traffic should use the new code
before migrations finish. Do not scale the `release` process.

The approved initial catalog can be imported in that same release phase with the
explicit one-time `RACCN_RELEASE_PORTFOLIO=2026-11-25` flag. `release.py` uses reviewed
record mappings (`renter:7`, `bad-guy-motors:5`), validates titles before adoption,
and runs the versioned manifest import after migration. This avoids an empty
catalog between the traffic switch and a later manual import. **Unset the flag
with `--no-restart` immediately after success**. The default release remains
migration-only; leaving the flag set would overwrite later owner CMS edits.

`app.json` requires the new web container's loopback `/ready/` to pass before the
traffic switch. The probe ignores HTTP proxies and refuses redirects; it cannot
fall through to an old healthy public container. Readiness requires DB connection,
applied migrations, writable mounted media and a frontend artifact. It deliberately
does not call Telegram.

On installed Dokku 0.34.7, the startup-check `command` must be an argument array.
The shipped image and Procfile start Gunicorn directly; `gunicorn.conf.py` reads
`PORT` inside the running container. Avoid a shell-expanded bind expression that
Dokku can evaluate before the runtime environment exists. CI exercises the actual
image default command on a non-default port, not an overridden test command.

After the web release and reviewed CMS import, set one worker while preserving web
scale (`dokku ps:scale portf web=1 worker=1`). Verify recognition of the new Procfile,
restart policy, queue state and graceful shutdown. A worker must not replay old
accepted inquiries automatically: existing leads have no newly fabricated jobs.
Verify active notification recipients through protected admin without displaying
recipient identities or sending an unrequested real test inquiry.

## Post-release verification

Check canonical HTTPS pages, real 404s, legacy redirects, project API order and
publication, project media MIME/cache/authorization, raw metadata, robots/sitemap,
and mobile/desktop interaction. Confirm no redirect loop or mixed-content image URL.
Use existing isolated/mocked tests for inquiries; do not send a real notification
as a hidden health check. Verify web/worker share the same DB and media persists
across the controlled container replacement. Check BGM and other protected public
paths remain healthy without changing their process/configuration.

## Preserve navigation in already-open tabs

Vite route chunks are loaded on demand. Replacing the image while a tab still
holds the previous entry script can otherwise remove a chunk that tab has not
requested yet. A missing route chunk was reproduced as an empty React root during
the architecture release review.

Retain the immediately preceding approved release's reachable hashed JavaScript
and CSS alongside the new build. This is a packaging step, not a fallback to old
HTML or project data:

1. Export `frontend_dist` from the verified running image into a restricted
   temporary directory. Record that image ID. Extract the tested candidate's
   `frontend_dist` separately.
2. Run `scripts/prepare_frontend_compat.py --previous PREVIOUS_DIST --current
   CANDIDATE_DIST --output CONTEXT/assets`. The output directory must be empty or
   absent. The collector follows the previous entry document's code dependencies,
   copies only missing hashed `.js`/`.css` files, and rejects missing dependencies,
   symlinks and same-name/different-byte collisions. Save its JSON manifest outside
   the `assets` directory.
3. Build the final image from that reviewed context with
   `docker build -f deploy/frontend-compat.Dockerfile --build-arg
   RELEASE_IMAGE=TESTED_CANDIDATE -t FINAL_IMAGE CONTEXT`. Label the final image with
   the current source revision and retain the previous-image/asset manifest with
   the release evidence. Re-run the actual default-command readiness smoke against
   the final image.
4. Hold an existing browser tab open before the traffic switch. After switching,
   navigate to an unvisited lazy route without refreshing and verify its assets
   and page load. Then refresh and verify the new application is selected.

Do not copy all historical assets. The collector deliberately excludes uploaded
media, images, fonts, source maps, documents and the previous HTML, and does not
retain unreachable leftovers from earlier compatibility layers. Only use a
privacy-reviewed previous release. New requests receive the new HTML; the limited
compatibility files let an existing session finish navigation without interruption.
This retains one previous application version, not indefinitely old browser tabs.

## Rollback

Dokku 0.34.7 supports `git:from-image` for a preserved local image:

```sh
dokku ps:scale portf worker=0
dokku git:from-image portf raccn-portf:REVIEWED_ROLLBACK_TAG
```

The tag must have been created from the known running old image. This changes the
app deployment repository to a Dockerfile referring to that image; retain the
source revision separately and use the normal source deployment for later releases.
Do not assume a source reset alone restores database or config state.

Prefer an image-only rollback when the migrated schema remains compatible, retaining
new inquiries. Also verify runtime compatibility: the observed legacy image depended
on DEBUG for uploaded-media serving. Running that old image under the hardened
DEBUG=false configuration does not restore its old media behavior. A rollback needs
an explicit reviewed configuration restoration from the private snapshot; never
turn DEBUG on for the hardened release to work around a problem.
If database restoration is necessary, stop writes and preserve a
post-failure backup first; reconcile any inquiries accepted since the original
snapshot. Never silently discard those records. Rehearse `postgres:import` into an
isolated restore service before replacing live data; restore media consistently.
Keep the worker stopped until schema, idempotency and notification state agree.

## PostgreSQL migration regression

The isolated PostgreSQL 17.5 restore rehearsal caught a real failure missed by
SQLite: migration `projects.0003` attempted to create the same slug LIKE index
twice. Its temporary nullable SlugField now uses `db_index=False`; the final unique
slug definition is unchanged. The maintained PostgreSQL CI service applies the
migrations to a populated legacy catalog and verifies neutral identities, image/alt
and link preservation, ordering, and final uniqueness. Do not replace this check
with SQLite-only migration validation.

## Versioned references

- [Dokku 0.34.7 release phase](https://github.com/dokku/dokku/blob/v0.34.7/docs/advanced-usage/deployment-tasks.md)
- [Dokku 0.34.7 startup checks](https://github.com/dokku/dokku/blob/v0.34.7/docs/deployment/zero-downtime-deploys.md)
- [Dokku 0.34.7 image deployment](https://github.com/dokku/dokku/blob/v0.34.7/docs/deployment/methods/image.md)
- [PostgreSQL plugin 1.44.0 export/import](https://github.com/dokku/dokku-postgres/blob/1.44.0/README.md#data-management)
