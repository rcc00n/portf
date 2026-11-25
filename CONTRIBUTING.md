# Contributing

Start with the [README](README.md) and [frontend](app/README.md) and [backend](backend/README.md) guides. Use a fresh local checkout and
private local configuration; never reuse deployed databases or provider accounts.

Keep a change focused on one useful behavior. Preserve existing APIs, migrations,
licences and attribution. Financial, pricing and payment changes need regression
coverage of the affected rules. Do not weaken existing assertions to obtain a green
workflow, edit applied migrations silently, or add simulated results as real data.

Run the maintained isolated release checks from the repository root with:

```bash
python scripts/check_release.py
```

Install the documented backend/browser dependencies and Chromium first.
[CI scope](ci/README.md) points to the exact workflow and runner. For focused
frontend development, use the commands in `app/`:

```bash
npm ci
npm run lint
npm test
npm run build
```

In a pull request, describe the trigger, resulting behavior and actual validation.
State any database, provider or deployment impact. Do not commit environment files,
credentials, customer uploads, database copies, generated caches or nested Git
backups. Report vulnerabilities through [SECURITY.md](SECURITY.md).

A contribution does not choose a new project licence. Existing project and
third-party terms remain applicable; discuss any proposed licensing change first.
