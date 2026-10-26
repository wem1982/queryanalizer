(function (global) {
  "use strict";

  /**
   * Removes comments and normalizes whitespace without altering string literals.
   * @param {string} sql
   * @returns {string}
   */
  function normalizeSql(sql) {
    if (!sql || typeof sql !== "string") return "";

    var out = "";
    var i = 0;
    var len = sql.length;
    var inSingle = false;
    var inDouble = false;
    var inBracket = false;
    var inBacktick = false;

    while (i < len) {
      var ch = sql[i];
      var next = sql[i + 1];

      if (!inSingle && !inDouble && !inBracket && !inBacktick) {
        if (ch === "-" && next === "-") {
          while (i < len && sql[i] !== "\n") i++;
          out += " ";
          continue;
        }
        if (ch === "/" && next === "*") {
          i += 2;
          while (i < len - 1 && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
          i += 2;
          out += " ";
          continue;
        }
      }

      if (ch === "'" && !inDouble && !inBracket && !inBacktick) {
        if (inSingle && next === "'") {
          out += "''";
          i += 2;
          continue;
        }
        inSingle = !inSingle;
        out += ch;
        i++;
        continue;
      }

      if (ch === '"' && !inSingle && !inBracket && !inBacktick) {
        inDouble = !inDouble;
        out += ch;
        i++;
        continue;
      }

      if (ch === "[" && !inSingle && !inDouble && !inBacktick) {
        inBracket = true;
        out += ch;
        i++;
        continue;
      }

      if (ch === "]" && inBracket) {
        inBracket = false;
        out += ch;
        i++;
        continue;
      }

      if (ch === "`" && !inSingle && !inDouble && !inBracket) {
        inBacktick = !inBacktick;
        out += ch;
        i++;
        continue;
      }

      if (!inSingle && !inDouble && !inBracket && !inBacktick && /\s/.test(ch)) {
        if (out.length && out[out.length - 1] !== " ") out += " ";
        while (i < len && /\s/.test(sql[i])) i++;
        continue;
      }

      out += ch;
      i++;
    }

    return out.trim();
  }

  /**
   * @param {string} sql
   * @returns {string}
   */
  function toUpperKeywordsOutsideStrings(sql) {
    return sql;
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.SqlNormalizer = {
    normalizeSql: normalizeSql,
    toUpperKeywordsOutsideStrings: toUpperKeywordsOutsideStrings,
  };
})(typeof window !== "undefined" ? window : this);
