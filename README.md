# QueryAnalyzer

**Live demo:** [https://wem1982.github.io/queryanalizer/](https://wem1982.github.io/queryanalizer/) — ative o Pages uma vez conforme [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md).

QueryAnalyzer is a **zero-install**, browser-only tool that turns a SQL query into an **interactive relationship graph**. Paste one query, explore tables and joins visually, and switch the interface between **English** and **Portuguese**.

> **Scope:** relationship discovery only. The app does **not** validate SQL syntax or report errors.

![QueryAnalyzer concept](docs/assets/demo-placeholder.svg)

## Features

- Single-query analysis with a clear editor + graph layout
- Detects explicit `JOIN` chains (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`, `NATURAL`, `USING`)
- Detects **implicit** equi-joins in `WHERE` (comma-style `FROM` or extra predicates)
- Recognizes **CTEs** (`WITH`) as graph nodes
- Subqueries in `FROM` / `JOIN` with optional aliases
- Interactive graph: pan, zoom, drag nodes (powered by [Cytoscape.js](https://js.cytoscape.org/) via CDN)
- Light / dark theme and persisted language preference (`localStorage`)

## Quick start

1. Clone or download this repository.
2. Open **`index.html`** in a modern browser (Chrome, Edge, Firefox, Safari).
3. Paste a SQL query and click **Analyze relationships** / **Analisar relações**, or use **View example** / **Ver exemplo** for a fictional complex demo query.

**Network:** the graph library loads from jsDelivr CDN. An internet connection is required for that script; all application logic runs locally in the browser.

No Node.js, bundler, or backend is required.

## Example query

```sql
SELECT o.id, c.name
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id
LEFT JOIN regions r ON r.id = c.region_id
WHERE o.status = 'open';
```

## Project structure

```
QueryAnalyzer/
├── index.html              # Application entry point
├── LICENSE
├── README.md
├── docs/
│   ├── ARCHITECTURE.md     # Design and module boundaries
│   ├── USER_GUIDE.md       # End-user instructions
│   └── assets/
├── src/
│   ├── css/                # Layout, theme tokens, graph panel
│   └── js/
│       ├── app.js          # UI orchestration
│       ├── main.js         # Bootstrap
│       ├── i18n/           # EN / PT strings
│       ├── parser/         # SQL normalization + relationship extraction
│       └── graph/          # Cytoscape rendering
└── tests/
    └── parser-smoke.js     # Optional local smoke test (Node)
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Parser pipeline, graph model, i18n |
| [User guide](docs/USER_GUIDE.md) | How to use the app and interpret the graph |

## Limitations (by design)

- **One query at a time** — no batch or multi-tab analysis
- **No syntax checking** — invalid SQL may yield incomplete or empty graphs
- Heuristic parser — optimized for common `SELECT` / `JOIN` / `WHERE` patterns, not every dialect edge case
- Does not infer relationships absent from `ON`, `USING`, or equi-join predicates

## Tech stack

- HTML5, CSS3, vanilla JavaScript (ES5-style IIFE modules for broad `file://` compatibility)
- Cytoscape.js 3.x (CDN)

## License

[MIT](LICENSE) — free to use, copy, modify, and distribute. You must **always credit the author** William Marques ([github.com/wem1982](https://github.com/wem1982)) and include the license notice in copies or derivatives.

## Author

**William Marques** — [github.com/wem1982](https://github.com/wem1982) · [queryanalizer](https://github.com/wem1982/queryanalizer)
