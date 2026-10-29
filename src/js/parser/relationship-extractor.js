(function (global) {
  "use strict";

  var normalizer = global.QueryAnalyzer.SqlNormalizer;

  var JOIN_TYPES = [
    "LEFT OUTER JOIN",
    "RIGHT OUTER JOIN",
    "FULL OUTER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "FULL JOIN",
    "INNER JOIN",
    "CROSS JOIN",
    "OUTER JOIN",
    "JOIN",
    "NATURAL LEFT JOIN",
    "NATURAL RIGHT JOIN",
    "NATURAL INNER JOIN",
    "NATURAL JOIN",
  ];

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findJoinTypeAt(sql, index) {
    var upper = sql.toUpperCase();
    var best = null;
    JOIN_TYPES.forEach(function (jt) {
      var re = new RegExp("\\b" + jt.replace(/\s+/g, "\\s+") + "\\b", "i");
      var slice = upper.slice(index, index + jt.length + 5);
      if (re.test(slice)) {
        if (!best || jt.length > best.raw.length) {
          best = { raw: jt, at: index };
        }
      }
    });
    return best;
  }

  function findMatchingParen(sql, openIndex) {
    var depth = 0;
    var inSingle = false;
    var inDouble = false;
    for (var i = openIndex; i < sql.length; i++) {
      var c = sql[i];
      if (c === "'" && !inDouble) {
        if (inSingle && sql[i + 1] === "'") {
          i++;
          continue;
        }
        inSingle = !inSingle;
        continue;
      }
      if (c === '"' && !inSingle) {
        inDouble = !inDouble;
        continue;
      }
      if (inSingle || inDouble) continue;
      if (c === "(") depth++;
      if (c === ")") {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function extractWhereAfterFrom(sql, fromClauseEndIndex) {
    var slice = sql.slice(fromClauseEndIndex);
    var idx = slice.search(/\bWHERE\b/i);
    if (idx === -1) return "";

    var start = idx + 6;
    var end = slice.length;
    var markers = [
      /\bGROUP BY\b/i,
      /\bHAVING\b/i,
      /\bORDER BY\b/i,
      /\bLIMIT\b/i,
      /\bUNION\b/i,
      /\bINTERSECT\b/i,
      /\bEXCEPT\b/i,
    ];
    markers.forEach(function (re) {
      var m = slice.slice(start).search(re);
      if (m !== -1 && start + m < end) end = start + m;
    });
    return slice.slice(start, end).trim();
  }

  /**
   * @param {string} fragment
   * @returns {{ expression: string, alias: string|null, kind: string }}
   */
  function parseTableSource(fragment) {
    var trimmed = fragment.trim();
    if (!trimmed) return null;

    if (trimmed[0] === "(") {
      var close = findMatchingParen(trimmed, 0);
      if (close === -1) return null;
      var inner = trimmed.slice(1, close).trim();
      var rest = trimmed.slice(close + 1).trim();
      var alias = parseAlias(rest);
      return {
        expression: inner,
        alias: alias || null,
        kind: "subquery",
        displayName: alias || null,
      };
    }

    var aliasMatch = trimmed.match(
      /^((?:[\w]+|\[[^\]]+\]|`[^`]+`|"[^"]+")(?:\.(?:[\w]+|\[[^\]]+\]|`[^`]+`|"[^"]+"))*)\s+(?:AS\s+)?([\w]+)$/i
    );
    if (aliasMatch) {
      return {
        expression: aliasMatch[1],
        alias: aliasMatch[2],
        kind: "table",
        displayName: aliasMatch[2],
      };
    }

    return {
      expression: trimmed.split(/\s+/)[0],
      alias: null,
      kind: "table",
      displayName: trimmed.split(/\s+/)[0],
    };
  }

  function parseAlias(rest) {
    if (!rest) return null;
    var m = rest.match(/^(?:AS\s+)?([\w]+)$/i);
    return m ? m[1] : null;
  }

  function registerNode(registry, source, labels) {
    var id = source.alias || source.displayName || source.expression;
    var label = source.alias || source.displayName || source.expression;
    if (source.kind === "subquery" && !source.alias) {
      label = labels.subquery;
      id = "__subquery_" + Object.keys(registry).length;
    }
    if (!registry[id]) {
      registry[id] = {
        id: id,
        label: label,
        kind: source.kind,
        expression: source.expression,
      };
    }
    return id;
  }

  function splitOnAnd(condition) {
    var parts = [];
    var buf = "";
    var depth = 0;
    var inSingle = false;
    for (var i = 0; i < condition.length; i++) {
      var c = condition[i];
      if (c === "'" && condition[i - 1] !== "\\") {
        if (inSingle && condition[i + 1] === "'") {
          buf += "''";
          i++;
          continue;
        }
        inSingle = !inSingle;
        buf += c;
        continue;
      }
      if (!inSingle) {
        if (c === "(") depth++;
        if (c === ")") depth--;
        if (depth === 0 && condition.slice(i, i + 4).toUpperCase() === " AND") {
          parts.push(buf.trim());
          buf = "";
          i += 3;
          continue;
        }
      }
      buf += c;
    }
    if (buf.trim()) parts.push(buf.trim());
    return parts;
  }

  function parseColumnPair(predicate) {
    var eq = predicate.match(
      /^([\w.`"\[\]]+(?:\.[\w.`"\[\]]+)+)\s*=\s*([\w.`"\[\]]+(?:\.[\w.`"\[\]]+)+)$/i
    );
    if (!eq) return null;
    return { left: eq[1].trim(), right: eq[2].trim() };
  }

  function tableFromColumnRef(ref, registry) {
    var cleaned = ref.replace(/[\[\]`"]/g, "");
    var dot = cleaned.indexOf(".");
    if (dot === -1) return null;
    var prefix = cleaned.slice(0, dot);
    if (registry[prefix]) return prefix;
    return prefix;
  }

  function normalizeJoinKind(raw) {
    var u = raw.toUpperCase();
    if (u.indexOf("CROSS") >= 0) return "CROSS";
    if (u.indexOf("FULL") >= 0) return "FULL";
    if (u.indexOf("RIGHT") >= 0) return "RIGHT";
    if (u.indexOf("LEFT") >= 0) return "LEFT";
    if (u.indexOf("NATURAL") >= 0) return "NATURAL";
    if (u === "JOIN" || u.indexOf("INNER") >= 0 || u.indexOf("OUTER JOIN") >= 0) return "INNER";
    return "INNER";
  }

  function extractCtes(sql) {
    var ctes = {};
    var m = sql.match(/^\s*WITH\s+(?:RECURSIVE\s+)?/i);
    if (!m) return { sql: sql, ctes: ctes };

    var i = m[0].length;
    var body = sql.slice(i).trim();

    while (body.length) {
      body = body.trim();
      var nameMatch = body.match(/^([\w]+)\s+AS\s*\(/i);
      if (!nameMatch) break;
      var name = nameMatch[1];
      var parenStart = body.indexOf("(");
      var parenEnd = findMatchingParen(body, parenStart);
      if (parenEnd === -1) break;
      var sub = body.slice(parenStart + 1, parenEnd);
      ctes[name] = sub;
      body = body.slice(parenEnd + 1).trim();
      if (body[0] === ",") {
        body = body.slice(1).trim();
        continue;
      }
      break;
    }

    return { sql: body, ctes: ctes };
  }

  function findFromClause(sql) {
    var upper = sql.toUpperCase();
    var idx = upper.search(/\bFROM\b/);
    if (idx === -1) return null;

    var start = idx + 4;
    while (start < sql.length && /\s/.test(sql[start])) start++;

    var endMarkers = [
      /\bWHERE\b/i,
      /\bGROUP BY\b/i,
      /\bHAVING\b/i,
      /\bORDER BY\b/i,
      /\bLIMIT\b/i,
      /\bOFFSET\b/i,
      /\bUNION\b/i,
      /\bINTERSECT\b/i,
      /\bEXCEPT\b/i,
    ];

    var end = sql.length;
    endMarkers.forEach(function (re) {
      var m = sql.slice(start).search(re);
      if (m !== -1 && start + m < end) end = start + m;
    });

    return {
      from: sql.slice(start, end).trim(),
      where: extractWhereAfterFrom(sql, end),
      fromEnd: end,
    };
  }

  function splitFromItems(fromClause) {
    var items = [];
    var buf = "";
    var depth = 0;
    for (var i = 0; i < fromClause.length; i++) {
      var c = fromClause[i];
      if (c === "(") depth++;
      if (c === ")") depth--;
      if (c === "," && depth === 0) {
        if (buf.trim()) items.push(buf.trim());
        buf = "";
        continue;
      }
      buf += c;
    }
    if (buf.trim()) items.push(buf.trim());
    return items;
  }

  function findNextJoin(fromClause, startIndex) {
    var upper = fromClause.toUpperCase();
    var best = null;
    JOIN_TYPES.forEach(function (jt) {
      var re = new RegExp("\\b" + jt.replace(/\s+/g, "\\s+") + "\\b", "gi");
      re.lastIndex = startIndex;
      var m = re.exec(fromClause);
      if (m && (best === null || m.index < best.index)) {
        best = { index: m.index, type: jt, length: m[0].length };
      }
    });
    return best;
  }

  function parseUsingColumns(text) {
    var m = text.match(/^\(([^)]+)\)/);
    if (!m) return [];
    return m[1].split(",").map(function (c) {
      return c.trim();
    });
  }

  function analyzeFromBlock(fragment, nodes, labels, addEdge) {
    if (!fragment || !fragment.trim()) return false;

    var fromInfo = findFromClause(fragment);
    if (!fromInfo || !fromInfo.from) return false;

    var fromClause = fromInfo.from;
    var cursor = 0;
    var firstPartEnd = fromClause.length;
    var firstJoin = findNextJoin(fromClause, 0);
    if (firstJoin) firstPartEnd = firstJoin.index;

    var baseFragment = fromClause.slice(0, firstPartEnd).trim();
    var baseSource = parseTableSource(baseFragment);
    var currentId = null;

    if (firstJoin) {
      currentId = baseSource ? registerNode(nodes, baseSource, labels) : null;
    } else {
      splitFromItems(baseFragment).forEach(function (item) {
        var src = parseTableSource(item);
        if (src) registerNode(nodes, src, labels);
      });
      currentId = baseSource ? registerNode(nodes, baseSource, labels) : null;
    }

    cursor = firstPartEnd;
    while (cursor < fromClause.length) {
      var joinInfo = findNextJoin(fromClause, cursor);
      if (!joinInfo) break;

      var joinTypeRaw = joinInfo.type;
      var afterJoin = joinInfo.index + joinInfo.length;
      var nextJoin = findNextJoin(fromClause, afterJoin);
      var segmentEnd = nextJoin ? nextJoin.index : fromClause.length;
      var segment = fromClause.slice(afterJoin, segmentEnd).trim();

      var onMatch = segment.match(/\bON\b/i);
      var usingMatch = segment.match(/\bUSING\b/i);
      var targetOnly = segment;
      var onCondition = "";
      var usingCols = [];

      if (onMatch) {
        targetOnly = segment.slice(0, onMatch.index).trim();
        onCondition = segment.slice(onMatch.index + 2).trim();
      } else if (usingMatch) {
        targetOnly = segment.slice(0, usingMatch.index).trim();
        usingCols = parseUsingColumns(segment.slice(usingMatch.index + 5).trim());
      }

      var targetSource = parseTableSource(targetOnly);
      var targetId = targetSource ? registerNode(nodes, targetSource, labels) : null;
      var kind = normalizeJoinKind(joinTypeRaw);

      if (currentId && targetId) {
        var conditions = [];
        if (onCondition) {
          splitOnAnd(onCondition).forEach(function (pred) {
            var pair = parseColumnPair(pred);
            if (pair) conditions.push(pair);
          });
        }
        if (usingCols.length) {
          conditions = usingCols.map(function (col) {
            return { left: col, right: col, using: true };
          });
        }
        addEdge(currentId, targetId, kind, conditions, usingCols.length ? "USING" : "");
      }

      if (targetId) currentId = targetId;
      cursor = segmentEnd;
    }

    var commaItems = splitFromItems(baseFragment);
    if (commaItems.length > 1 && !firstJoin && fromInfo.where) {
      splitOnAnd(fromInfo.where).forEach(function (pred) {
        var pair = parseColumnPair(pred);
        if (!pair) return;
        var leftTable = tableFromColumnRef(pair.left, nodes);
        var rightTable = tableFromColumnRef(pair.right, nodes);
        if (leftTable && rightTable && leftTable !== rightTable) {
          addEdge(leftTable, rightTable, "IMPLICIT", [pair]);
        }
      });
    }

    if (firstJoin && fromInfo.where) {
      splitOnAnd(fromInfo.where).forEach(function (pred) {
        var pair = parseColumnPair(pred);
        if (!pair) return;
        var leftTable = tableFromColumnRef(pair.left, nodes);
        var rightTable = tableFromColumnRef(pair.right, nodes);
        if (leftTable && rightTable && leftTable !== rightTable) {
          addEdge(leftTable, rightTable, "IMPLICIT", [pair]);
        }
      });
    }

    return true;
  }

  /**
   * @param {string} rawSql
   * @param {{ subquery: string, cte: string }} labels
   * @returns {{ nodes: Array, edges: Array, meta: Object }}
   */
  function extractRelationships(rawSql, labels) {
    labels = labels || { subquery: "Subquery", cte: "CTE" };
    var sql = normalizer.normalizeSql(rawSql);
    var nodes = {};
    var edges = [];
    var edgeKeys = {};
    var hadFrom = false;

    function addEdge(sourceId, targetId, joinType, conditions, extra) {
      if (!sourceId || !targetId || sourceId === targetId) return;
      var key =
        [sourceId, targetId].sort().join("|") +
        "|" +
        joinType +
        "|" +
        JSON.stringify(conditions || []);
      if (edgeKeys[key]) return;
      edgeKeys[key] = true;
      edges.push({
        id: "e" + edges.length,
        source: sourceId,
        target: targetId,
        joinType: joinType,
        conditions: conditions || [],
        detail: extra || "",
      });
    }

    var cteResult = extractCtes(sql);
    Object.keys(cteResult.ctes).forEach(function (name) {
      nodes[name] = {
        id: name,
        label: name,
        kind: "cte",
        expression: cteResult.ctes[name],
      };
    });

    Object.keys(cteResult.ctes).forEach(function (name) {
      if (analyzeFromBlock(cteResult.ctes[name], nodes, labels, addEdge)) {
        hadFrom = true;
      }
    });

    if (analyzeFromBlock(cteResult.sql, nodes, labels, addEdge)) {
      hadFrom = true;
    }

    return {
      nodes: Object.values(nodes),
      edges: edges,
      meta: { hadFrom: hadFrom },
    };
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.RelationshipExtractor = {
    extractRelationships: extractRelationships,
  };
})(typeof window !== "undefined" ? window : this);
