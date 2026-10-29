# Contributing

Thank you for your interest in QueryAnalyzer.

## Principles

- QueryAnalyzer is MIT-licensed; forks and contributions must **keep author credit** to William Marques ([github.com/willmarkz](https://github.com/willmarkz)) as stated in [LICENSE](LICENSE).
- Keep the app **install-free** — no mandatory build tooling for end users.
- Preserve **single-query** analysis and **relationship-only** scope (no SQL error diagnostics).
- Match existing code style: vanilla JS IIFEs, `QueryAnalyzer` namespace, CSS variables for theming.

## Local changes

1. Edit sources under `src/`.
2. Reload `index.html` in the browser (hard refresh if cached).
3. Optionally run `node tests/parser-smoke.js` when Node.js is available.

## Pull requests

- Describe the SQL pattern you are improving with a short example.
- Update `docs/USER_GUIDE.md` or `docs/ARCHITECTURE.md` when behavior changes.
- Keep diffs focused; avoid unrelated formatting churn.

## Reporting limitations

If the parser misses a join, include:

- The minimal SQL reproducer
- Expected nodes and edges
- SQL dialect (PostgreSQL, SQL Server, MySQL, etc.)
