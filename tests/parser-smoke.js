/**
 * Optional smoke tests — run with: node tests/parser-smoke.js
 */
"use strict";

var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
function load(rel) {
  eval(fs.readFileSync(path.join(root, rel), "utf8"));
}

global.window = global;
load("src/js/parser/sql-normalizer.js");
load("src/js/parser/relationship-extractor.js");

var extract = QueryAnalyzer.RelationshipExtractor.extractRelationships;

function assert(name, fn) {
  try {
    fn();
    console.log("OK  " + name);
  } catch (e) {
    console.error("FAIL " + name + ": " + e.message);
    process.exitCode = 1;
  }
}

assert("inner join", function () {
  var r = extract(
    "SELECT * FROM orders o INNER JOIN customers c ON c.id = o.customer_id",
    { subquery: "Sub", cte: "CTE" }
  );
  if (r.nodes.length !== 2) throw new Error("expected 2 nodes");
  if (r.edges.length !== 1) throw new Error("expected 1 edge");
  if (r.edges[0].joinType !== "INNER") throw new Error("expected INNER");
});

assert("implicit where", function () {
  var r = extract("SELECT * FROM a, b WHERE a.id = b.a_id", { subquery: "Sub", cte: "CTE" });
  if (r.edges.length !== 1) throw new Error("expected 1 edge");
  if (r.edges[0].joinType !== "IMPLICIT") throw new Error("expected IMPLICIT");
});

assert("cte node", function () {
  var r = extract(
    "WITH x AS (SELECT 1) SELECT * FROM x JOIN t ON t.id = x.id",
    { subquery: "Sub", cte: "CTE" }
  );
  if (!r.nodes.some(function (n) { return n.id === "x"; })) throw new Error("missing CTE node x");
});

assert("joins inside cte body", function () {
  var r = extract(
    "WITH base AS (\n" +
      "SELECT * FROM orders o\n" +
      "INNER JOIN customers c ON c.id = o.customer_id\n" +
      ")\n" +
      "SELECT * FROM base",
    { subquery: "Sub", cte: "CTE" }
  );
  if (r.edges.length < 1) throw new Error("expected join inside CTE");
  if (!r.nodes.some(function (n) { return n.id === "o"; })) throw new Error("expected alias o");
});

console.log("Done.");
