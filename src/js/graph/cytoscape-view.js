(function (global) {
  "use strict";

  var cyInstance = null;

  var JOIN_COLORS = {
    INNER: "#3b82f6",
    LEFT: "#22c55e",
    RIGHT: "#f59e0b",
    FULL: "#a855f7",
    CROSS: "#64748b",
    IMPLICIT: "#ec4899",
    NATURAL: "#14b8a6",
  };

  function joinLabel(joinType, i18n) {
    var map = {
      INNER: i18n.t("joinInner"),
      LEFT: i18n.t("joinLeft"),
      RIGHT: i18n.t("joinRight"),
      FULL: i18n.t("joinFull"),
      CROSS: i18n.t("joinCross"),
      IMPLICIT: i18n.t("joinImplicit"),
      NATURAL: i18n.t("joinNatural"),
    };
    return map[joinType] || joinType;
  }

  function formatConditions(conditions) {
    if (!conditions || !conditions.length) return "";
    return conditions
      .map(function (c) {
        if (c.using) return c.left;
        return c.left + " = " + c.right;
      })
      .join(", ");
  }

  function buildElements(model, i18n) {
    var elements = [];
    model.nodes.forEach(function (n) {
      elements.push({
        data: {
          id: n.id,
          label: n.label,
          kind: n.kind,
        },
      });
    });

    model.edges.forEach(function (e) {
      var cond = formatConditions(e.conditions);
      var label = joinLabel(e.joinType, i18n);
      if (cond) label += "\n" + cond;
      elements.push({
        classes: "join-" + e.joinType.toLowerCase(),
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          joinType: e.joinType,
          edgeLabel: label,
          conditions: cond,
        },
      });
    });

    return elements;
  }

  function getStylesheet(isLight) {
    var nodeBg = isLight ? "#ffffff" : "#243044";
    var nodeBorder = isLight ? "#2563eb" : "#3b82f6";
    var text = isLight ? "#0f172a" : "#e8edf4";

    return [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          "background-color": nodeBg,
          "border-width": 2,
          "border-color": nodeBorder,
          color: text,
          "font-size": 12,
          "font-weight": 600,
          padding: "12px",
          shape: "roundrectangle",
          width: "label",
          height: "label",
        },
      },
      {
        selector: 'node[kind = "subquery"]',
        style: {
          "border-style": "dashed",
          "background-color": isLight ? "#f1f5f9" : "#1e293b",
        },
      },
      {
        selector: 'node[kind = "cte"]',
        style: {
          "border-color": "#8b5cf6",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          label: "data(edgeLabel)",
          "font-size": 9,
          "text-rotation": "autorotate",
          "text-margin-y": -8,
          color: text,
          "line-color": "#94a3b8",
          "target-arrow-color": "#94a3b8",
        },
      },
      { selector: ".join-inner", style: { "line-color": JOIN_COLORS.INNER, "target-arrow-color": JOIN_COLORS.INNER } },
      { selector: ".join-left", style: { "line-color": JOIN_COLORS.LEFT, "target-arrow-color": JOIN_COLORS.LEFT } },
      { selector: ".join-right", style: { "line-color": JOIN_COLORS.RIGHT, "target-arrow-color": JOIN_COLORS.RIGHT } },
      { selector: ".join-full", style: { "line-color": JOIN_COLORS.FULL, "target-arrow-color": JOIN_COLORS.FULL } },
      { selector: ".join-cross", style: { "line-color": JOIN_COLORS.CROSS, "target-arrow-color": JOIN_COLORS.CROSS } },
      {
        selector: ".join-implicit",
        style: { "line-color": JOIN_COLORS.IMPLICIT, "target-arrow-color": JOIN_COLORS.IMPLICIT, "line-style": "dashed" },
      },
      {
        selector: ".join-natural",
        style: { "line-color": JOIN_COLORS.NATURAL, "target-arrow-color": JOIN_COLORS.NATURAL },
      },
    ];
  }

  function render(container, model, i18n, isLight) {
    if (!global.cytoscape) {
      console.error("Cytoscape.js not loaded");
      return null;
    }

    if (cyInstance) {
      cyInstance.destroy();
      cyInstance = null;
    }

    var elements = buildElements(model, i18n);
    cyInstance = global.cytoscape({
      container: container,
      elements: elements,
      style: getStylesheet(isLight),
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 400,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        padding: 40,
      },
      wheelSensitivity: 0.2,
    });

    cyInstance.on("tap", "edge", function (evt) {
      var edge = evt.target;
      edge.select();
    });

    return cyInstance;
  }

  function destroy() {
    if (cyInstance) {
      cyInstance.destroy();
      cyInstance = null;
    }
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.GraphView = {
    render: render,
    destroy: destroy,
    JOIN_COLORS: JOIN_COLORS,
  };
})(typeof window !== "undefined" ? window : this);
