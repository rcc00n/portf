> Historical record, preserved during repository consolidation. Paths, findings, commands and approval status describe the phase when written; consult [the current documentation](../README.md) for current contracts. Generated screenshots/recordings remain local and are not shipped.

# RACCN Code — privacy and website terms review

Reviewed 22 September 2026. Scope: this repository’s public React application, Django inquiry handling, project/pricing API, deployment instructions, and linked services. This review distinguishes implemented behavior from production settings that cannot be established from source. It does not certify legal compliance. No production inquiry was submitted and no private recipient, token, database record, or secret was inspected.

## Implemented legal surface

- `app/src/pages/legal/LegalPages.jsx`: `PrivacyPage` and `TermsPage`, intended for `/privacy` and `/terms`. Both use the existing carbon/mineral design and self-hosted typography through `legal.css`.
- The Privacy Policy describes inquiry collection, local choices, optional Telegram forwarding, admin cookies, memory-only event collection, privacy requests, and provider/retention gaps.
- A “Clear saved website choices” control removes only the two project-choice records and two animation flags; it reports success or browser-storage failure accessibly. It does not imply deletion of database records or email/Telegram copies.
- The Terms cover informational material, non-binding estimates, project agreements, demonstration records, intellectual property, third-party marks/links, reasonable use, and qualified limitations. No legal entity, registration number, venue, insurance, or certification is invented.
- Essential unknown facts are visibly marked **OWNER INPUT REQUIRED** on these local-review pages. They should be resolved before publication, not silently replaced with guesses.
- Integrated routes `/privacy` and `/terms`, distinct titles/canonicals, legal navigation in both homepage and legacy footers, and privacy notices beside both inquiry forms are present. The estimator also links to the browser-storage disclosure. Legal hash navigation now scrolls to the requested section on direct visits and SPA navigation.

## Data-flow evidence

| Area | Behavior established from source | Evidence |
| --- | --- | --- |
| Homepage inquiry | POSTs name, email, message, empty company, and `homepage-start` source. It does not attach saved qualification answers. | `app/src/home/HomeStartForm.jsx`, submission payload |
| Detailed inquiry | POSTs name, email, optional company, message, source/routing; saved qualification answers are attached when present. | `app/src/App.jsx`, `ContactForm`, `buildQualificationSnapshot`, `appendRoutingToSource` |
| Qualification | Project type, complexity, budget, timeline, and a save timestamp are written automatically to localStorage under `qualificationGate`. No expiry is implemented. The stored choices can be copied into a later detailed inquiry. | `app/src/App.jsx`, `StartPage`, `getStoredQualification` |
| Estimator | Product, complexity, team, integrations, and save timestamp are stored as `estimateSnapshot`. Calculation happens in the browser. Product/complexity/maturity derived from these selections may be appended to an inquiry source and pre-call URL; the full raw estimate object is not directly saved by the contact API. | `app/src/pages/engineering/Estimate.jsx`; `app/src/App.jsx`, `getLeadRouting`, `buildRoutingParams` |
| Homepage motion | Session storage key `raccn-home-seen` avoids repeating the full entrance sequence in the same tab/session. | `app/src/home/useHomeMotion.js` |
| Prototype motion | Session storage key `raccn-control-plane-seen` serves the same function for the retained prototype. | `app/src/prototype/useControlPlaneMotion.js` |
| Database | Stores submitted name, email, company, message, source, qualification, IP address, user agent, inquiry status, timestamps, Telegram delivery status/error. | `backend/leads/models.py`; `backend/leads/views.py`, `contact_request` |
| IP capture | The first `X-Forwarded-For` value is validated as an IP address, with a valid `REMOTE_ADDR` fallback. Invalid values are not stored. Actual trusted proxy configuration still cannot be proved from these files. | `backend/leads/views.py`, `_get_client_ip` |
| Administration | Inquiry data can be searched/viewed in Django admin. Active Telegram recipients are managed there. Who holds deployed admin credentials is unknown. | `backend/leads/admin.py`; `backend/config/settings.py` |
| Telegram | Only runs with a bot token and active recipients. Sends an inquiry ID plus name, email, optional company, message, qualification values/labels, and source. Message is truncated to 3,500 characters. IP and user agent are not included in `_format_message`. | `backend/leads/views.py`, `_format_message`, `_notify_telegram`, `_send_telegram_message` |
| Analytics | Events include page path, timestamp, CTA labels/destination/context. `trackEvent` appends them to `window.__studioAnalyticsQueue`; development mode logs them in the console. No analytics endpoint, external SDK, cookie, beacon, or persistent event store was found. | `app/src/utils/analytics.js`; call sites |
| Cookies | Public form submission does not intentionally set cookies. Django session and CSRF middleware support restricted admin authentication/security. Production proxy-injected cookies remain unknown. | `backend/config/settings.py`; `backend/config/urls.py`; `app/index.html` |
| Project and pricing APIs | Browser reads `/api/projects/` and `/api/pricing/`; Django returns published project metadata/links/media URLs and pricing content. These endpoints are not inquiry submissions. | `backend/projects/views.py`; `app/src/home/homeData.js`; `app/src/App.jsx` |
| Project fallback images | The original automatic Google/DuckDuckGo/project-favicon requests have been removed. `FaviconPreview` now renders local text initials and a hostname without fetching a remote icon. | `app/src/App.jsx`, `FaviconPreview` |
| Fonts/media | Homepage and prototype fonts, screenshots, and graphics are served from local public paths. No Google Fonts loader, video embed, CAPTCHA provider, payment provider, or ad script was found in the reviewed public implementation. | `app/index.html`; `app/src/home/home.css`; `app/public/`; source search |
| Hosting | Docker builds React, serves Django with Gunicorn and WhiteNoise. Settings accept `DATABASE_URL` with SQLite fallback; Dokku instructions describe Postgres and persistent filesystem media. These facts do not identify the actual host, location, CDN, database region, or backup provider. | `Dockerfile`; `DOKKU.md`; `backend/config/settings.py`; `backend/README.md` |
| Logging | No explicit application access-log retention, processor inventory, or privacy deletion schedule is present. Proxy/host logs may exist outside the repository. | `Dockerfile`; `backend/config/settings.py`; deployment documentation |
| Email | Published contact is `vadrud2016@gmail.com`. `mailto:` opens the visitor’s mail application. The inquiry API does not itself call an email service. Mailbox usage and retention outside this code are unknown. | `app/src/App.jsx`, `CONTACT`; `app/src/home/HomePage.jsx`; `backend/leads/views.py` |

## Collection notice wording

Homepage proposal:

> RACCN Code collects your name, email, and project outline to assess and respond to your inquiry. Requests are stored by this website and may be sent to its inquiry recipients through Telegram. Please leave out sensitive information. Sending this form does not subscribe you to marketing. [Privacy Policy] · Privacy questions: [published email].

For the detailed contact form, also state that saved project choices are included. Link to the policy’s provider/storage sections, especially if Telegram or another processor outside Canada is enabled. The notice must match the final payload after implementation. A general “I agree” checkbox is not a substitute for accurate disclosure.

## Cookie / tracking decision

No advertising or external analytics integration was found, so a generic marketing-cookie consent banner would misdescribe the inspected application. Keep the experience clean. Explain functional browser storage and admin cookies in the Privacy Policy, offer clearing of saved choices, and verify production response headers/scripts before publication. If new non-essential tracking is added later, assess and implement consent for that real behavior before enabling it. Service labels mentioning GA4, Amplitude, Mixpanel, Stripe, or other products are not evidence that this website integrates them.

## Security and operational observations

Final source review confirms these changes without adding new inquiry data flows:

- The POST handler now validates that JSON is a UTF-8 object, validates email, and limits name/email/company/message to 120/254/200/5,000 characters. Malformed and oversized values receive field errors instead of database or parser failures.
- Forwarded IP values are validated before storage and invalid values fall back to the remote address. The trust boundary for headers at the production proxy still needs confirmation before using them as reliable abuse-prevention evidence.
- Telegram transport exceptions are reduced to a generic failure description rather than persisting raw exception text that could contain the token-bearing request URL. Administrative delivery metadata still includes recipient identifiers, so access to it remains restricted.
- A request is saved before optional Telegram delivery. A delivery failure does not turn an already saved request into a frontend failure. Notifications remain synchronous and subject to provider latency; no new external integration was introduced.
- Estimator and qualification storage writes are guarded so blocked browser storage does not crash the tools. The legal-page clearing control reports blocked storage and preserves unrelated keys.
- No deployment-wide abuse/rate-limit mechanism, automatic inquiry expiry, backups deletion policy, provider access review, or incident procedure was established from source. Do not claim these are implemented merely because engineering demonstration pages discuss them.
- Verification uses local data and disabled/mocked notifications. No test inquiry was sent to real Telegram recipients.

## Public claims and third-party material

- Homepage screenshots and names include Renter, Bad Guy Motors, and WorldDoc. The repository provides content/assets; it does not itself prove permission, the author’s exact contribution, project ownership, a paid client relationship, or current product performance.
- The Renter architecture page and admin data are engineering illustrations. Keep demonstrations distinguishable from real customer operational data and verified production claims.
- Legacy copy contains claims such as senior-only teams, a 24-hour estimate/reply, 24/7 support, guarantees, outcome language, and broad platform expertise. Those require owner confirmation; technical capability lists and diagrams are not proof of a service commitment or certification.
- Placeholder project destinations (`#`, `https://example.com`, `https://yourdomain.com`) were removed from the fallback fixtures, and project-link rendering now filters invalid and placeholder destinations. Real GitHub and product links remain.
- Third-party marks are acknowledged as belonging to their owners. That acknowledgement does not replace permission to publish screenshots or trademarks where permission is required.
- Instrument Sans and IBM Plex Mono are self-hosted. Embedded font metadata identifies Instrument (2022) and IBM (2017) and the SIL Open Font License; upstream licence notices are included beside the fonts as `Instrument-Sans-OFL.txt` and `IBM-Plex-OFL.txt`. Other media and logo permissions still require owner confirmation.

## Browser verification

Browser checks ran against `http://127.0.0.1:5173/` with the isolated local backend on port 8001. Evidence is in `homepage-review/legal-qa/results.json`, with full-page screenshots of both legal pages at 1440px and 390px.

- `/privacy` and `/terms`: direct entry and refresh, distinct titles and production canonicals, one document heading, keyboard skip-to-content, visible 2px focus outline, normal link navigation, and zero horizontal overflow at both widths.
- Saved-choice clearing: all four owned records removed, unrelated localStorage and sessionStorage keys preserved, keyboard and touch activation work, and simulated storage denial produces accurate live feedback. No public cookies were set in the checked browsing flow.
- Fixed a discovered legal deep-link bug: `/privacy#browser-storage` now positions the requested section 32px beneath the viewport edge instead of resetting to the document top. Direct refresh and the estimator-to-policy SPA link both pass. Navigating from Privacy to Terms resets to the document top and updates title/canonical correctly. Follow-up evidence: `homepage-review/legal-qa/followup.json`.
- Homepage plus 14 destinations (`/admin-demo`, `/admin-first`, `/architecture-preview`, `/cases/renter-architecture`, `/contact`, `/decisions`, `/estimate`, `/pre-call`, `/privacy`, `/production-ready`, `/projects`, `/start`, `/summary`, `/terms`) were checked at desktop and 390px. The final run found no page errors, failed responses, broken images, literal `#` links, missing anchor targets, automatic external requests, or horizontal overflow. Route titles and canonicals were correct.
- An earlier run caught a temporary stopped-backend proxy failure and a remaining APK placeholder link. Both were resolved before the successful final run; the report JSON contains the successful rerun.
- The unknown-route page presents a meaningful not-found screen and `noindex, follow`. Vite uses an SPA development fallback with HTTP 200. The local Django production-style handler separately returned HTTP 200 for `/privacy` and HTTP 404 for the unknown route, as intended.

## Official sources consulted

- [Alberta OIPC: PIPA overview](https://oipc.ab.ca/legislation/pipa/) establishes the provincial private-sector framework and includes people acting commercially. The user establishes Alberta/Canada business context; this is not evidence of an incorporated entity or a specific registration.
- [Alberta OIPC: PIPA on a Page](https://oipc.ab.ca/resource/pipa-on-a-page/) supports reasonable/minimized collection, disclosure of purposes, access/correction, safeguards, appropriate retention, disposal, and an accountable privacy contact.
- [Alberta OIPC: 10 Steps to Implement PIPA](https://oipc.ab.ca/resource/pipa-implementation/) explains privacy accountability, processor policies, countries/purposes for providers outside Canada, and collection notices that tell people how to find that policy and reach the responsible contact. This is why deployed provider countries and the contact role are essential owner inputs, not details that can be guessed from a Dockerfile.
- [Office of the Privacy Commissioner of Canada: PIPEDA complaint process](https://www.priv.gc.ca/en/report-a-concern/guide/) describes the role of substantially similar provincial laws and PIPEDA’s relevance to commercial personal-information flows across provincial or national borders. The specific applicable-law analysis depends on actual operations.
- [Office of the Privacy Commissioner of Canada: cross-border processing guidelines](https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/) describes ongoing organizational accountability when a processor is used and the importance of transparency. A third-party policy link alone is not a substitute for RACCN’s own processor assessment.
- [CRTC: CASL FAQ](https://crtc.gc.ca/eng/com500/faq500.htm) describes the core obligations for commercial electronic messages. Website project inquiries must remain separate from any future newsletter consent; no subscription mechanism was found or added.
- [Telegram Privacy Policy](https://telegram.org/privacy) describes cloud-message storage. Do not describe the bot notification channel as end-to-end encrypted or infer this account’s storage country from Telegram’s rules for users in another region.

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
