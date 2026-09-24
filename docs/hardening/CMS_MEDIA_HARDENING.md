> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# CMS/media authority — phase handoff

1. **Branch/base.** `hardening/cms-media-authority`, based on F14 commit `b59b97d`
   and approved checkpoint `08056ef7f96be30d42a89a98c4199191ba0eb621`. F14 files,
   arithmetic, Control Plane geometry/activation, typography and style sources were
   not changed. Untracked audit/review files were left outside application commits.

2. **Schema.** Project gains `slug` (unique, 120 characters), optional `headline`
   (200 characters, multiline), optional `status` (120), `featured_placement`
   (`""` archive / `lead` / `supporting`) and `featured_order`. One **published**
   lead placement is enforced by the database. New projects default to draft.
   Public ordering is `(order, id)`. Existing image alt/order and link/order fields
   remain; uploads now validate supported raster formats so unsupported images
   receive an admin form error rather than becoming broken public URLs. PricingTier/PricingPoint and all lead capabilities are preserved.

3. **Migration.** `projects.0003_alter_project_options_project_featured_order_and_more`
   adds a nullable slug, populates existing rows deterministically as `project-<id>`,
   then enforces unique/non-null slugs. Existing titles/publication/copy/media/links
   are preserved. Existing placements are archive and new factual fields are blank.
   New programmatic records get a UUID-based neutral slug unless supplied explicitly.
   Renaming a title never changes its slug. No meaningful identity or project claim
   is inferred from an ambiguous title. Forward migration is tested with duplicate
   titles, an empty title, and both publication states.

4. **Public API.** `GET /api/projects/` returns a JSON array of published records,
   ordered by `order`, then `id`, with `Cache-Control: no-store`:

   ```json
   [{
     "id": 7,
     "slug": "renter",
     "is_published": true,
     "order": 0,
     "featured_placement": "lead",
     "featured_order": 0,
     "case_path": "/work/renter",
     "title": "Owner-approved title",
     "headline": "Owner-approved editorial headline",
     "status": "",
     "impact": "Owner-approved project type",
     "blurb": "Owner-approved description",
     "url": "https://verified.example.org/",
     "tags": [],
     "links": [{"id": 4, "label": "Live project", "href": "https://verified.example.org/", "order": 0}],
     "images": ["https://verified-host/media/projects/7/evidence.webp"],
     "media": [{"id": 9, "url": "https://verified-host/media/projects/7/evidence.webp", "alt": "Owner-authored image description", "order": 0}]
   }]
   ```

   Host/domain above is illustrative, not a configured production domain. `images`
   remains the ordered URL array for compatibility. Redesigned consumers use `media`
   to retain alt and ordering. Images and links sort by `(order, id)`. Relations are
   prefetched: the list takes three queries rather than queries per project.
   An empty database/publication set returns `[]`. Only `renter` has a case_path;
   creating any other slug does not automatically create a case route.

5. **Featured selection.** Explicit placement controls lead/supporting/archive;
   featured order is `(featured_order, order, id)` within a placement. Homepage
   displays lead + supporting; Work displays lead, supporting, then archive. Archive
   uses ordinary API order. Slugs select approved art direction, not titles or regex.
   Featured copy, type/status, links and images come from CMS. Missing media is
   omitted; missing headline uses that record's title; no unrelated seed is substituted.
   Missing alt uses the same project's title and image index. Work's approved
   editorial containers and homepage choreography remain. A Work-only observer
   attaches the existing evidence motion to asynchronously arriving CMS nodes.

6. **Renter.** A reviewed published record with exact slug `renter` is required.
   Its title/blurb/status/links/media control Home, Work, the case and Systems'
   customer/operator evidence. Renter may be lead, supporting or archive. Publication
   gates the case regardless of placement. Media order determines customer view
   first, operator view second; additional case images follow the existing evidence
   component. Its existing custom responsibility/decision composition is retained as
   editorial interpretation, not imported into CMS as new technical claims.
   Direct `/work/renter` becomes HTTP 404 + noindex if missing/unpublished; database
   failure returns 503. Unknown `/work/:slug` stays 404 even if a project has that slug.

7. **Empty/error.** Loading, ready, empty and error are separate frontend states.
   Empty shows “No projects are published here yet.” API failure/malformed data shows
   temporary unavailability and a retry control, logs a concise console error, and
   renders no cached/seed project. A catalog with archive-only entries links users to
   the project index from Home. No continuous polling is added; publication changes
   take effect on the next catalog request/navigation/reload. An already open page is
   not a live CMS subscription.

8. **Media architecture.** Persistent Dokku mount stays at `/srv/app/media`.
   Dokku nginx proxies to Gunicorn; Django streams only registered ProjectImage
   raster files after checking publication or authorized staff preview. It does not
   use the DEBUG-only helper. WhiteNoise remains static-only. Separate roots/URLs
   and local storage are checked by Django. Exact deployment requirements and
   official documentation links are in [DOKKU.md](DOKKU.md).

9. **Local verification.** Maintained tests cover admin upload → isolated persistent
   path → API URL → HTTP 200 with detected image MIME, ETag/304 and revalidation
   cache headers at DEBUG=false. Missing files, unregistered files, traversal,
   symlink escape, non-image files and unpublished public images return 404.
   Staff previews use private/no-store. Public media are revalidated against current
   publication. The Gunicorn/browser smoke covers publication, render, order/media
   update, unpublish, case 404, empty/error/retry and desktop/mobile.

10. **Admin workflow.** Create a draft; assign a stable unique slug; supply verified
    title, blurb, impact, optional headline/status and links. Add images with meaningful
    alt and numeric order. Choose archive, lead or supporting, set featured order and
    index order, then publish. The list supports publication/placement/order editing,
    filters and slug search. Changing the sole published lead requires releasing the
    previous lead slot first. Admin can preview unpublished images. Ordinary content
    publishing needs no frontend code change; approving a new custom case route does.

11. **Regressions/CI.** Five new Node project-contract tests cover publication,
    explicit featured selection, title collisions, ordering, CMS media/alt/copy/links,
    case allowlist, missing fields and empty/error. Twelve Django tests cover API,
    admin upload/media security/cache, case status, constraints and forward migration.
    `scripts/cms_media_smoke.py` runs the production-like Gunicorn/browser flow using
    only temporary SQLite/media and a purpose-built fixture catalog. Root CI runs it
    after the build, alongside existing F14 browser/unit/backend tests and migration
    checks. No deployment jobs or production credentials are added. `.env` files and large
    local review artifacts are now excluded from the Docker build context.

12. **Fallback changes.**

    | Before | After |
    | --- | --- |
    | Title substring matching for Bad Guy Motors/WorldDoc | Stable slug + explicit placement |
    | Curated seed restored when missing, empty or failed | No public seed fallback |
    | Broad title regex excludes archive entries | Placement and publication fields only |
    | Hardcoded Renter Home/Work/case/Systems media | Ordered CMS media + alt |
    | Missing CMS link/copy inherits curated record | Omit field/link or use same record title |
    | Always-public Renter case shell | Published identity gate, real 404/503 |
    | Empty and failure both silently use seeds | Explicit empty/error, retry and concise logging |

13. **Retained legacy material.** `legacyCuratedProjects` in homeData is now unused
    historical reference: **SAFE TO DELETE** after owner review, never called to
    publish content. The dead App.jsx `projectSeed`, old project PNGs and prototype
    studies/media are **OWNER DECISION REQUIRED**: production CMS references and
    archival intent have not been inspected. No files were deleted. Approved generic
    systems/approach descriptions and Renter responsibility/decision interpretation
    are **KEEP AS STATIC NON-CMS EVIDENCE**, with the Renter case gated by publication.
    Prototype study routes/assets remain the separate pending prototype migration
    issue from the audit; they are not a CMS publishing fallback and must be reviewed
    before the final public release. No unsupported legacy metrics were restored.

14. **Owner input required.** Identify the actual Renter, Bad Guy Motors and WorldDoc
    records (if present); assign reviewed slugs and placements. Confirm public title,
    description, links, status, image rights/alt and customer/operator ordering. Review
    Renter's retained editorial interpretation against actual project evidence.
    Approve which legacy/project assets can be retired. No production dataset was
    accessed and no factual project records were automatically seeded.

15. **Not verified.** Actual Dokku/nginx configuration, host/domain/TLS/proxy headers,
    mount existence/ownership/restart persistence, real PostgreSQL dataset/migration,
    media backups/restore, worker sizing/load, actual Docker image execution and live
    GitHub CI. Local Gunicorn/SQLite evidence is not verification of those systems.
    No production or staging record, deployment, mount or secret was changed.
    Final local checks passed: 28 Node tests (including the existing 81-case legacy
    and 27-case SaaS arithmetic checks), 39 Django tests, five F14 browser scenarios,
    the Gunicorn integration smoke, lint, production build and migration check.

16. **Review boundary.** This resolves the local CMS/media authority contract;
    it is not an overall production-ready claim. The other audit hardening findings,
    owner/legal review and infrastructure verification remain open. Stop here for
    review before staging or production.
