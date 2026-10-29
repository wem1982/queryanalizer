(function (global) {
  "use strict";

  var cyInstance = null;

  var JOIN_COLORS = {
    INNER: "#38bdf8",
    LEFT: "#4ade80",
    RIGHT: "#fbbf24",
    FULL: "#e879f9",
    CROSS: "#cbd5e1",
    IMPLICIT: "#fb7185",
    NATURAL: "#5eead4",
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

  function buildElements(model, i18n) {
    var nodeIds = {};
    var elements = [];

    model.nodes.forEach(function (n) {
      nodeIds[n.id] = true;
      elements.push({
        data: {
          id: n.id,
          label: n.label,
          kind: n.kind,
        },
      });
    });

    model.edges.forEach(function (e) {
      if (!nodeIds[e.source] || !nodeIds[e.target]) return;
      var shortLabel = joinLabel(e.joinType, i18n);
      elements.push({
        classes: "join-" + e.joinType.toLowerCase(),
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          joinType: e.joinType,
          edgeLabel: shortLabel,
        },
      });
    });

    return elements;
  }

  function getStylesheet(isLight) {
    var nodeBg = isLight ? "#ffffff" : "#243044";
    var nodeBorder = isLight ? "#2563eb" : "#60a5fa";
    var text = isLight ? "#0f172a" : "#f8fafc";
    var edgeLabelBg = isLight ? "#ffffff" : "#0f172a";
    var edgeLabelBorder = isLight ? "#cbd5e1" : "#475569";

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
          "border-color": "#c084fc",
        },
      },
      {
        selector: "edge",
        style: {
          width: 3.5,
          "curve-style": "bezier",
          "target-arrow-shape": "triangle",
          "arrow-scale": 1.2,
          "line-color": "#94a3b8",
          "target-arrow-color": "#94a3b8",
          opacity: 0.95,
          label: "data(edgeLabel)",
          "font-size": 11,
          "font-weight": 700,
          "text-rotation": "autorotate",
          "text-margin-y": -10,
          color: text,
          "text-background-color": edgeLabelBg,
          "text-background-opacity": 1,
          "text-background-padding": "5px",
          "text-background-shape": "roundrectangle",
          "text-border-color": edgeLabelBorder,
          "text-border-width": 1,
          "text-border-opacity": 1,
        },
      },
      {
        selector: "edge:selected",
        style: {
          width: 5,
          opacity: 1,
        },
      },
      {
        selector: ".join-inner",
        style: {
          "line-color": JOIN_COLORS.INNER,
          "target-arrow-color": JOIN_COLORS.INNER,
          color: isLight ? "#0369a1" : "#e0f2fe",
        },
      },
      {
        selector: ".join-left",
        style: {
          "line-color": JOIN_COLORS.LEFT,
          "target-arrow-color": JOIN_COLORS.LEFT,
          color: isLight ? "#15803d" : "#dcfce7",
        },
      },
      {
        selector: ".join-right",
        style: {
          "line-color": JOIN_COLORS.RIGHT,
          "target-arrow-color": JOIN_COLORS.RIGHT,
          color: isLight ? "#b45309" : "#fef3c7",
        },
      },
      {
        selector: ".join-full",
        style: {
          "line-color": JOIN_COLORS.FULL,
          "target-arrow-color": JOIN_COLORS.FULL,
          color: isLight ? "#7e22ce" : "#fae8ff",
        },
      },
      {
        selector: ".join-cross",
        style: {
          "line-color": JOIN_COLORS.CROSS,
          "target-arrow-color": JOIN_COLORS.CROSS,
        },
      },
      {
        selector: ".join-implicit",
        style: {
          "line-color": JOIN_COLORS.IMPLICIT,
          "target-arrow-color": JOIN_COLORS.IMPLICIT,
          "line-style": "dashed",
          "line-dash-pattern": [8, 4],
          color: isLight ? "#be123c" : "#ffe4e6",
        },
      },
      {
        selector: ".join-natural",
        style: {
          "line-color": JOIN_COLORS.NATURAL,
          "target-arrow-color": JOIN_COLORS.NATURAL,
          color: isLight ? "#0f766e" : "#ccfbf1",
        },
      },
    ];
  }

  function alignIsolatedNodesRight(cy) {
    var isolated = cy.nodes().filter(function (n) {
      return n.degree(false) === 0;
    });
    if (!isolated.length) return;

    var connected = cy.nodes().filter(function (n) {
      return n.degree(false) > 0;
    });

    var bb = connected.length > 0 ? connected.boundingBox() : { x1: 0, y1: 0, x2: 320, y2: 320 };
    var bbW = bb.x2 - bb.x1;
    var bbH = bb.y2 - bb.y1;

    var rightX = bb.x2 + Math.max(140, bbW * 0.25);
    var step = 72;
    var totalHeight = (isolated.length - 1) * step;
    var startY = bb.y1 + (bbH - totalHeight) / 2;

    isolated.forEach(function (node, index) {
      node.position({
        x: rightX,
        y: startY + index * step,
      });
    });
  }

  function finalizeLayout(cy) {
    alignIsolatedNodesRight(cy);
    cy.resize();
    cy.fit(undefined, 48);
  }

  function runLayout(cy) {
    var layout = cy.layout({
      name: "cose",
      animate: false,
      fit: false,
      padding: 48,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      edgeElasticity: 100,
      numIter: 500,
    });

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      finalizeLayout(cy);
    }

    layout.one("layoutstop", finish);
    layout.run();
    global.setTimeout(finish, 800);
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
    if (!elements.length) {
      return null;
    }

    cyInstance = global.cytoscape({
      container: container,
      elements: elements,
      style: getStylesheet(isLight),
      wheelSensitivity: 0.2,
    });

    cyInstance.on("tap", "edge", function (evt) {
      cyInstance.$("edge:selected").unselect();
      evt.target.select();
    });

    runLayout(cyInstance);

    return cyInstance;
  }

  function destroy() {
    if (cyInstance) {
      cyInstance.destroy();
      cyInstance = null;
    }
  }

  function exportPng(isLight) {
    if (!cyInstance) return null;
    cyInstance.resize();
    cyInstance.fit(undefined, 48);
    return cyInstance.png({
      output: "base64uri",
      bg: isLight ? "#f1f5f9" : "#0f1419",
      full: true,
      scale: 2,
    });
  }

  function refreshLayout() {
    if (!cyInstance) return;
    cyInstance.resize();
    finalizeLayout(cyInstance);
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.GraphView = {
    render: render,
    destroy: destroy,
    exportPng: exportPng,
    refreshLayout: refreshLayout,
    JOIN_COLORS: JOIN_COLORS,
  };
})(typeof window !== "undefined" ? window : this);
