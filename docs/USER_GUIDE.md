# User guide

## Opening the app

Double-click **`index.html`** or open it from your browser’s **File → Open** menu.

Ensure you allow network access so Cytoscape.js can load from the CDN.

## Analyzing a query

1. Choose **EN** or **PT** in the header for interface language.
2. Paste **one** SQL query into the text area (typically a `SELECT` with `FROM` and joins).
3. Click **Analyze relationships** / **Analisar relações**.
4. Explore the graph:
   - **Drag** nodes to rearrange.
   - **Scroll** to zoom.
   - **Pan** by dragging the background.
5. Read the textual list below the graph for a compact summary of each link.

Use **Clear** / **Limpar** to reset the editor and graph.

## Reading the graph

| Visual | Meaning |
|--------|---------|
| Blue solid edge | `INNER` join |
| Green | `LEFT` join |
| Orange | `RIGHT` join |
| Purple | `FULL` join |
| Gray | `CROSS` join |
| Pink dashed | Implicit equi-join from `WHERE` |
| Teal | `NATURAL` join |
| Dashed node border | Subquery source |
| Purple node border | CTE |

Edge labels show join type and, when available, column equality expressions.

## What the app does **not** do

- It does **not** tell you if the SQL is valid.
- It does **not** execute the query against a database.
- It does **not** analyze multiple queries at once.
- It does **not** infer foreign keys that are not expressed in `ON`, `USING`, or `WHERE` equi-joins.

## Tips for best results

- Use table **aliases** consistently in `ON` and `WHERE` clauses.
- Prefer explicit `JOIN ... ON` over comma joins when possible — both are supported.
- For CTEs, the `WITH` name appears as its own node; join it like any other table in the outer query.

## Privacy

All processing happens in your browser. Queries are not sent to any server unless you choose to share them yourself.

## Credits & license

QueryAnalyzer by **William Marques** ([github.com/willmarkz](https://github.com/willmarkz)). MIT license: free use and copying with **mandatory attribution** to the author. See [LICENSE](../LICENSE).
