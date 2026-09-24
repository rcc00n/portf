> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code — Control Plane refinement review

Status: ready for local owner review. Nothing deployed, pushed, committed, or merged. Existing uncommitted redesign work was preserved on `redesign/research-and-direction` (base commit `ded2944`). The real `/` homepage was refined; no new prototype route was created.

## Review URLs and artifacts

- Development homepage: **http://127.0.0.1:5173/**
- Integrated production build, served by local Django: **http://127.0.0.1:8001/**
- Privacy: http://127.0.0.1:8001/privacy
- Terms: http://127.0.0.1:8001/terms
- [Desktop full-page screenshot](homepage-review/refinement/desktop-full.png)
- [390px mobile full-page screenshot](homepage-review/refinement/mobile-full.png)
- [1024px laptop screenshot](homepage-review/refinement/laptop-full.png)
- [820px tablet screenshot](homepage-review/refinement/tablet-full.png)
- [Updated Control Plane motion recording](homepage-review/refinement/control-plane-motion.webm)
- [Social-share image](app/public/social/raccn-code.png)

The backend uses isolated `/tmp/portf-refinement.sqlite3`; Telegram notifications are disabled. Project/pricing APIs are functioning but empty in this database, so the homepage shows its curated repository media and descriptions. No production inquiry or notification was sent.

## Composition, motion, and control

**ROUTE INDEX is completely removed from the homepage**, including its controls, styling, and pointer-quadrant handlers. Its space is left to the existing dimensional object. RACCN CODE, the carbon grid, mineral material, blue control surface, and Work → Systems → Approach → Start hierarchy remain.

The motion now follows explicit assembly, exposure, routing, resolution, and handoff stages. Rear and middle layers separate laterally while the front remains a stable control surface. The connected circuit stays together as the material resolves, then the surviving blue path meets the Work section’s actual header rule. This replaces detached lines and arbitrary pointer-quadrant changes with legible system states.

Native scrolling starts exposing layers at about **15px** in a 1000px-high hero (previously 80px); routing completes near **350px** (previously 610px), material resolution near **550px** (previously 800px), and handoff near **760px** (previously 980px). The recording includes sampled states at 100, 230, 370, 510, 660, and 830px. No scroll hijacking, pinned blank region, wheel interception, or graphics library was introduced.

The central diamond is a real focusable SVG button, present as a button in Chromium’s accessibility tree. Mouse click, touch, Enter, and Space deterministically toggle `aria-pressed` and visible state:

- Ready: electric blue surface, mineral center, plus symbol, Activate label.
- Active: mineral surface, blue center, check symbol, Reset label, illuminated connected routes and terminal nodes.

The hit area is the complete diamond. State does not move the target. Focus has a separate high-contrast outline. Mobile receives a shorter, larger annotation. The faded hero CTA becomes inert during handoff and is restored when scrolling back.

Ambient signal passes remain finite and restrained. They are disabled on coarse pointers and reduced motion, stop offscreen, and have document-visibility guards. Reduced motion resolves states at thresholds without continuous interpolation. Offscreen SVG animations pause as well.

## Line and diagram audit

- Replaced the hero’s four outward-running route fragments with paths between the control and actual corner terminals; removed its three unanchored guides and scan fragment.
- Rebuilt Systems from shared node/route coordinates; rendered endpoint error was below 0.013px in the geometry check.
- Removed routes to nonexistent fifth/sixth blocks in the four-node Admin-first view.
- Removed progress-dashed partial base routes, unrelated background grid lines, and the hover lift that detached nodes from connectors.
- Moved the selected-node explanation below the graph so it never conceals route endings.
- Preserved a complete connected graph on mobile, with 77px targets rather than a disconnected decorative stem.
- Removed the three free-floating Approach rules and redundant vertical stem.
- Removed the Start section’s decorative L-shaped route.
- Replaced Work’s disconnected horizontal turn with a vertical route that terminates on its real header boundary.

Every remaining diagram path joins nodes; layout rules delimit actual content. The diagrams remain coherent in a still frame.

## Typography, UX, and client journey

Navigation, metadata, captions, system labels, helpers, and legal links have larger type, stronger contrast, calmer tracking, and usable line height. Most technical labels now start at 12px; header status text remains subordinate. Large section headings have more line/word spacing. A final laptop inspection caught and fixed Approach’s unused third grid column, which had forced an awkward extra line.

The hero now states what RACCN builds: sophisticated web products, marketplaces, commerce, SaaS, and AI systems. **Start a project** is the consistent main action in the hero, after Work, after Systems, and at the final form. Existing project index, architecture case, engineering demonstrations, decision records, and estimator remain reachable.

Large project evidence is preserved. Secondary projects have real, checked destinations and explicit new-tab accessible names. Placeholder `#`, `example.com`, and `yourdomain.com` links are removed or filtered. Bad Guy Motors’ fallback copy was corrected to match the fabrication/service website visible in its image. No client metric, testimonial, certification, or paid relationship was added.

Header anchors clear the fixed navigation; logo and skip links work; focus is visible; hidden content does not block tested controls. Form inputs remain at least 16px on mobile. The mobile layout was inspected separately at 390px, with additional checks at 360, 820, 1024, and 1440px.

## Start experience and backend

The ruled Control Plane form requires only name, email, and project outline. Labels, helper text, optional preparation, and the next email step are explicit. It provides:

- linked field errors and focus on the first invalid field;
- aligned browser/server limits of 120/254/5000 characters;
- autocomplete, mobile email keyboard, and email capitalization/spellcheck handling;
- visible loading, protected fields during submission, duplicate-click prevention, and a 20-second timeout;
- retained input and useful recovery copy on network/server failure;
- a stable success message with an optional preparation link, replacing the timed redirect;
- a nearby privacy notice and working Privacy Policy link; no marketing subscription.

The retained detailed contact form also received visible labels, field limits, and disclosure that saved qualification/routing choices can accompany it. Unsupported 24-hour response promises were removed from public request copy and CTAs.

Django validates JSON shape, email, required fields, lengths, and malformed IP data. Telegram transport errors no longer store exception text that could contain a bot-token URL. Existing lead storage and configured notification behavior remain.

The production frontend fallback now safely serves root build assets, fonts, images, robots, sitemap, and social artwork with correct MIME and cache headers. Known deep links receive the SPA shell; unknown routes receive the existing not-found screen with **HTTP 404** and noindex. Missing assets are real 404s. Path traversal and escaping symlinks are rejected. No SSR claim is made.

## Identity, privacy, and public-web basics

The raccoon mark was simplified to symmetric vector geometry with cleaner negative space and eye/nose shapes. Header, mobile lockup, favicon, and legacy route branding use the same geometry. The old **1.31MB raster logo is no longer emitted by the build**. A 1200×630 social image uses the site’s own wordmark and vector artwork.

Privacy and Terms pages use the same carbon/mineral system, readable document typography, accessible links, and footer navigation. Copyright and the existing published privacy email are available. Both forms and the estimator/qualification flow disclose their collection/storage behavior. The Privacy page can clear only this site’s project-choice and motion keys, preserves unrelated data, and explains that this does not delete submitted records.

Actual discovered flows:

- homepage inquiry: name/email/message/source to Django;
- detailed inquiry: optional company and saved qualification/routing as well;
- database: inquiry fields, timestamps, IP, user agent, status and notification result;
- optional Telegram: inquiry content and qualification/source to configured recipients; no IP/user agent in its message;
- localStorage: qualification and estimate choices; sessionStorage: entrance flags;
- analytics: a temporary in-memory event queue, with no analytics transmission found;
- restricted Django admin: session/security cookies;
- self-hosted fonts and project media; external project links open only on request.

Legacy automatic Google/DuckDuckGo favicon lookups were removed. No fake cookie banner or marketing enrollment was added. Production providers, countries, recipients, logging, and operational retention remain owner-confirmation items. Official Alberta/Canada sources and the complete evidence table are in [PRIVACY_AUDIT.md](../audits/PRIVACY_AUDIT.md). Upstream SIL OFL notices matching the fonts’ embedded metadata were added beside the font files.

Static HTML has RACCN title/description, canonical, OpenGraph/Twitter basics, favicon, and social image. Public route titles/descriptions/canonicals now update consistently. Robots and sitemap are present. Unknown/prototype routes have noindex behavior. This remains a client-rendered React site; route-specific raw HTML/social previews beyond the homepage still use the shared initial document until JavaScript executes.

## Performance

Measured with the production Django build in fresh Chromium contexts, cache disabled, no CPU/network throttling. These are single local lab samples, not field Core Web Vitals or a claimed comparison to earlier runs.

| Profile | FCP | LCP | CLS after full scroll |
| --- | ---: | ---: | ---: |
| Desktop 1440×1000 | 476ms | 476ms | 0.00001 |
| Touch mobile 390×844, DPR 3 | 420ms | 1804ms | 0 |
| Reduced-motion desktop | 520ms | 520ms | 0.00001 |

- Initial encoded body: **441.6KiB**; after all deferred images: **683.1KiB** (local Django responses are not gzip-compressed).
- Four project images: **247,312 bytes** total; no hero image request.
- Homepage chunk: approximately **9.97kB gzip JS / 10.58kB gzip CSS**.
- Six seconds visible desktop idle: **44.95ms total main-thread task time**, **0.49ms script**, zero root style mutations and two class changes for one finite signal pass.
- Touch, reduced-motion, and all offscreen idle intervals: **zero measured script CPU / root mutations**.
- Zero >50ms long tasks or unexpected errors in the final samples; roughly 3.1–3.2MB JS heap after scroll.
- SVG/DOM/CSS only; no canvas, WebGL, Three.js, or new graphics runtime.

[Full measurements and method](homepage-review/refinement/PERFORMANCE.md), [raw data](homepage-review/refinement/performance.json), and [reproduction script](homepage-review/refinement/measure-performance.py). The final project-copy correction followed the measurements; it does not change runtime behavior and adds only a few bytes to the homepage chunk.

## Verification and remaining limits

Passed:

- production build and complete frontend ESLint;
- 19 Django validation/static-serving/routing tests, isolated from external delivery;
- 75 homepage checks across five viewport sizes, including mouse, touch, Enter/Space, tab order, focus, anchors, all images, forms, contrast checks, reduced motion, and overflow;
- every Systems mode/node, ArrowLeft/Right/Home/End tabs, selection, and connector geometry;
- form local/server validation, loading, duplicate prevention, timeout, server failure, real local database submission, success, and optional continuation;
- homepage plus 14 public destinations on desktop/mobile, deep refresh, title/canonical, images and legal links;
- legal storage clearing with keyboard/touch and unavailable storage; privacy hash deep link;
- integrated Django build assets, public 404, and all three API endpoints;
- rendered homepage and legal external links: four read-only checks returned 200;
- separate visual review of hero, motion frames, Work evidence, Systems, Approach, Start, footer, legal pages, laptop wrapping, mobile layout, and social artwork.

Evidence: [homepage QA](homepage-review/refinement/home-qa.json), [contact QA](homepage-review/refinement/contact-qa.json), [Django assets](homepage-review/refinement/django-build-qa.json), [Django browser QA](homepage-review/refinement/django-browser-qa.json), [legal/routes](homepage-review/legal-qa/results.json), [legal follow-up](homepage-review/legal-qa/followup.json), [external links](homepage-review/legal-qa/external-links.json).

Remaining limits:

1. Owner facts below must be resolved before legal text is published. No formal legal or accessibility certification is claimed.
2. Physical Safari/iOS/Android and low-end GPU testing remain. Headless Chromium did not expose a genuinely hidden tab, so the visibility pause was inspected in code; offscreen/touch/reduced behavior was measured.
3. Real production CMS content and enabled Telegram delivery require staging review with owner-approved configuration. Local notifications stayed disabled. Notification delivery is still synchronous; provider latency can outlast the browser timeout, whose copy correctly says delivery could not be confirmed.
4. Deeper engineering routes retain their existing visual system. Their links, branding, metadata and relevant notices were repaired; this was not a full-site replacement.
5. Production processor access, retention/deletion, rate limiting, proxy logging, backups, and permissions cannot be established by these local tests. Source-based findings and unresolved operational controls are listed in the privacy audit.

## OWNER INPUT REQUIRED


Every item below is unverified from repository evidence. Resolve facts relevant to publication and operations; do not add fictitious detail to make a policy look complete.

1. **Legal operator:** the person or legal entity operating under RACCN Code; exact legal/trade name, business form, and any legally required business/contact disclosures. Alberta/Canada is established by the user, but a street address, registration number, incorporation status, or governing venue is not.
2. **Accountable privacy contact:** the person or position responsible for privacy and cross-border service-provider questions. Confirm that the published Gmail address is actively monitored and appropriate for access/correction/withdrawal/complaint requests, or supply an approved alternative.
3. **Actual hosting infrastructure:** host/vendor, data centre country/countries, database provider/region, storage/CDN/reverse proxy/WAF, subprocessors, and any production-injected scripts or cookies not in source.
4. **Telegram use:** whether enabled in production; approved recipients and their access; whether recipient accounts/chats are organizationally controlled; countries involved in handling/storage; retention/deletion settings; vendor terms and safeguards; whether message previews or linked devices create additional copies.
5. **Email handling:** receiving mailbox/provider, who can access it, forwarding rules, countries, linked CRM or other tools, retention and deletion practices. No external mailbox configuration was inspected.
6. **Record retention:** justified timeframes and disposal procedures for inquiries, qualification/source metadata, IP/user-agent data, Telegram copies, email copies, administrative logs, hosting logs, and backups; any records needed for contracts or legal obligations. The code has no automatic expiry schedule for inquiry records.
7. **Purpose for technical inquiry metadata:** confirm the business/security purpose and necessity of retaining IP addresses and user-agent strings with every inquiry; remove unnecessary collection rather than inventing a purpose.
8. **Privacy operations:** request identity verification, access/correction and consent-withdrawal process, deletion process, exception handling, complaint escalation, breach response, and who performs each task.
9. **Security controls outside source:** production admin access, least privilege, MFA/access controls at providers, TLS/proxy settings, secret handling, backups, restore testing, encryption, and retention controls. No certification or compliance guarantee is inferred from examples.
10. **Additional data sharing:** whether submissions are manually copied into other messaging, CRM, AI, task-management, accounting, or contractor systems. None can be inferred solely from the API’s current code.
11. **Marketing operations:** confirm project inquiries are not later imported into mailing lists without a separate appropriate process. No automatic subscription exists in the inspected application; this does not establish practices outside the repository.
12. **Project and media rights:** permission for all named businesses, screenshots, logos, marks, and any personal information visible in media; exact role/contribution; permission to discuss private architecture; ownership/licensing of Renter material and other portfolio items.
13. **Asset licensing:** origin and applicable licence requirements for the logo, raster media, and other externally sourced assets. Font metadata establishes SIL Open Font License provenance for the self-hosted fonts; keep the corresponding licence notices with distributed files.
14. **Business claims:** actual team structure and seniority, supported services, client relationships, testimonials if ever introduced, claimed results, support hours, reply/estimate timing, availability, pricing/currency/tax assumptions, and guarantees. Remove or qualify unsupported commitments.
15. **Contract terms:** intended operator-specific limitation language, any governing-law/venue clause, and consistency with the separate service agreement. No unestablished jurisdiction has been added to the terms.

This work remains local for owner review. No deployment is authorized by this audit.
