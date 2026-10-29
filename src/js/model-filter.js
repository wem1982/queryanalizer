(function (global) {
  "use strict";

  /**
   * @param {{ nodes: Array, edges: Array, meta?: Object }} model
   * @param {boolean} includeCtes
   */
  function filterModel(model, includeCtes) {
    if (!model) return { nodes: [], edges: [], meta: {} };
    if (includeCtes) {
      return {
        nodes: model.nodes.slice(),
        edges: model.edges.slice(),
        meta: model.meta || {},
      };
    }

    var nodes = model.nodes.filter(function (n) {
      return n.kind !== "cte";
    });
    var allowed = {};
    nodes.forEach(function (n) {
      allowed[n.id] = true;
    });
    var edges = model.edges.filter(function (e) {
      return allowed[e.source] && allowed[e.target];
    });

    return {
      nodes: nodes,
      edges: edges,
      meta: model.meta || {},
    };
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.ModelFilter = { filter: filterModel };
})(typeof window !== "undefined" ? window : this);
