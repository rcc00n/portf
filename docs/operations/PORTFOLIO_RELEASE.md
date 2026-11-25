# Selected portfolio release — 2026-11-25

## Presentation

Visual thesis: preserve the carbon/mineral Control Plane identity, with tighter
editorial spacing and evidence doing the selling. Content runs from the existing
hero to two large projects, four compact project links, Systems, Approach and Start.
The interaction adds a quiet right-edge contact link and accessible image galleries
alongside the existing authored motion; it does not change the Control Plane.

The contact rail appears only on wide screens after the opening has passed, and
withdraws when the page's closing action/form is visible. No rail on contact,
definition, legal or demo routes. No floating mobile action. Gallery dialogs expose
all ordered CMS images with native modal semantics, focus return, keyboard navigation
and reduced motion. Project links remain separate from gallery buttons.

## Reviewed catalog and source evidence

| Identity | Public title | Evidence and constraints |
| --- | --- | --- |
| renter | Renter | Approved bundled customer/operator images, existing production record. Only approved case route. |
| bad-guy-motors | Bad Guy Motors | Actual public storefront capture; existing production record and gallery retained. |
| quantix | QUANTIX | Authentic application capture with synthetic/paper-only banner. No real orders or profit claims. |
| quorum | Quorum | Reviewed historical landing screenshot. Source link only; live endpoint failed during review. |
| milk-vancouver | MilkRoute | Actual storefront capture; source implements queued delivery optimization. Owner renamed public title; stable identity/anchors retained. Source link only, per owner. |
| contract-workflow | Contract workflow | Actual anonymized application UI with explicit synthetic-data banner. Private contract templates and operational data are not bundled. Neutral source repository published after explicit owner approval. |

Release images and copy live under `backend/projects/release_portfolio/`, as input
to an explicit management command. **They are not runtime publishing fallbacks.**
After import, Django controls publication, title, order, media and links normally.
The frontend never re-publishes these assets if a project is unpublished.

## Non-destructive publication

`python manage.py publish_release_portfolio` previews without writes. `--apply`
imports; `--replace-selection` unpublishes other records without deleting projects,
leads or their media. Explicit `--map renter:7 --map bad-guy-motors:5` adopts the
production identities verified before release; it checks exact expected titles and
the old/new stable slug, refusing mismatches before writes. These IDs are specific
to the verified production database, not assumptions for other environments.

Existing images remain available, after the new release cover images. Import image
names are stable across retries. Existing links are retained except exact URLs in
the owner-approved `retired_links` list. MilkRoute's old live-site link is explicitly
retired. Unrelated links are never removed by a broad title/URL heuristic.

Privacy exception: reviewed Renter operator/profile captures contained identifiable
account/contact values. Opaque labelled redactions preserve the real interface;
the importer reuses the three known legacy image records by explicit filename.
The operator/profile records now point to redacted files. Originals remain in the
private backup/media storage but are no longer registered public paths, so the
new protected media handler returns 404 for those old URLs. No claim is made that
historical public downloads or Git/provider caches have been erased.

New-image `release.py` normally runs migrations only. The one-time, explicitly
reviewed `RACCN_RELEASE_PORTFOLIO=2026-11-25` flag additionally runs the above mapped
import before traffic switches. Unset it immediately after a successful release;
ordinary later releases must not overwrite owner CMS edits. Unknown flag values
fail closed. Do not set this flag on a blank/local database: use the importer
without mappings instead. Never copy the local preview SQLite/admin user to production.

## Privacy boundary

The neutral `rcc00n/contract-workflow` repository contains sanitized reachable
history. The former repository remains private and restricted backups remain outside
Git. Third-party clones and old search/provider caches cannot be erased by changing
Git history. No claim is made that these external copies have been purged. The
contract application's deployment was not changed by the portfolio release.

## Regressions

Maintained checks cover non-writing preview, explicit identity rejection,
idempotent imports, preservation of original media, publication selection and
precise link retirement; release tests enforce migrate-only defaults. Browser tests
cover galleries and edge-action visibility, keyboard, mobile and reduced motion.
See the root CI and `scripts/check_release.py` for the complete isolated suite.

See [release operations](RELEASE_RUNBOOK.md) for backup, rehearsal, readiness and
rollback. Actual deployment outcomes belong in the release verification record.
