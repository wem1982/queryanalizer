(function (global) {
  "use strict";

  var STORAGE_LOCALE = "queryanalyzer.locale";
  var STORAGE_THEME = "queryanalyzer.theme";
  var STORAGE_VIEW_MODE = "queryanalyzer.viewMode";

  function $(id) {
    return document.getElementById(id);
  }

  function loadStoredLocale() {
    try {
      return localStorage.getItem(STORAGE_LOCALE) || "en";
    } catch (e) {
      return "en";
    }
  }

  function loadStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_THEME) || "dark";
    } catch (e) {
      return "dark";
    }
  }

  function loadStoredViewMode() {
    try {
      var v = localStorage.getItem(STORAGE_VIEW_MODE);
      return v === "physical" ? "physical" : "includeCte";
    } catch (e) {
      return "includeCte";
    }
  }

  function saveLocale(locale) {
    try {
      localStorage.setItem(STORAGE_LOCALE, locale);
    } catch (e) {
      /* ignore */
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function saveViewMode(mode) {
    try {
      localStorage.setItem(STORAGE_VIEW_MODE, mode);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    var btn = $("theme-toggle");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "light" ? app.i18n.t("themeDark") : app.i18n.t("themeLight")
      );
      btn.textContent = theme === "light" ? "🌙" : "☀️";
    }
  }

  function formatRelationLine(edge) {
    var type = edge.joinType;
    var cond =
      edge.conditions && edge.conditions.length
        ? edge.conditions
            .map(function (c) {
              return c.using ? c.left : c.left + " = " + c.right;
            })
            .join(", ")
        : "—";
    return edge.source + " → " + edge.target + " [" + type + "]: " + cond;
  }

  function collectRelationLines(model, i18n) {
    var lines = [];
    var listedEdges = {};

    model.nodes.forEach(function (node) {
      var nodeEdges = model.edges.filter(function (e) {
        return !listedEdges[e.id] && (e.source === node.id || e.target === node.id);
      });

      if (!nodeEdges.length) {
        lines.push(node.label + " — " + i18n.t("noRelationshipFound"));
        return;
      }

      nodeEdges.forEach(function (edge) {
        listedEdges[edge.id] = true;
        lines.push(formatRelationLine(edge));
      });
    });

    model.edges.forEach(function (edge) {
      if (listedEdges[edge.id]) return;
      listedEdges[edge.id] = true;
      lines.push(formatRelationLine(edge));
    });

    if (!lines.length) {
      lines.push(i18n.t("noRelationshipFound"));
    }

    return lines;
  }

  var app = {
    i18n: null,
    theme: "dark",
    viewMode: "includeCte",
    lastModel: null,

    init: function () {
      this.i18n = global.QueryAnalyzer.I18n.create(loadStoredLocale());
      this.theme = loadStoredTheme();
      this.viewMode = loadStoredViewMode();
      applyTheme(this.theme);
      this.i18n.applyToDocument();
      this.updateFooterPrivacy();
      this.updateViewModeButtons();
      this.bindEvents();
      this.updateGraphActions();
      this.updateLangButtons();
      if (global.QueryAnalyzer.WelcomeShare) {
        global.QueryAnalyzer.WelcomeShare.init(this.i18n);
      }
    },

    includeCtes: function () {
      return this.viewMode !== "physical";
    },

    getDisplayModel: function () {
      if (!this.lastModel) return null;
      return global.QueryAnalyzer.ModelFilter.filter(this.lastModel, this.includeCtes());
    },

    updateFooterPrivacy: function () {
      var el = $("footer-privacy");
      if (!el) return;
      var onPages =
        typeof location !== "undefined" &&
        location.hostname === "willmarkz.github.io" &&
        location.pathname.indexOf("/queryanalizer") === 0;
      el.classList.toggle("is-hidden", !onPages);
    },

    bindEvents: function () {
      var self = this;
      $("btn-analyze").addEventListener("click", function () {
        self.analyze();
      });
      $("btn-clear").addEventListener("click", function () {
        self.clear();
      });
      $("btn-example").addEventListener("click", function () {
        self.loadDemo();
      });
      $("lang-en").addEventListener("click", function () {
        self.setLocale("en");
      });
      $("lang-pt").addEventListener("click", function () {
        self.setLocale("pt");
      });
      $("theme-toggle").addEventListener("click", function () {
        self.theme = self.theme === "light" ? "dark" : "light";
        saveTheme(self.theme);
        applyTheme(self.theme);
        self.refreshDisplay();
      });
      $("view-include-cte").addEventListener("click", function () {
        self.setViewMode("includeCte");
      });
      $("view-physical-only").addEventListener("click", function () {
        self.setViewMode("physical");
      });
      $("btn-fullscreen").addEventListener("click", function () {
        self.toggleFullscreen();
      });
      $("btn-export-pdf").addEventListener("click", function () {
        self.exportPdf();
      });
      document.addEventListener("fullscreenchange", function () {
        self.onFullscreenChange();
      });
    },

    setViewMode: function (mode) {
      this.viewMode = mode === "physical" ? "physical" : "includeCte";
      saveViewMode(this.viewMode);
      this.updateViewModeButtons();
      this.refreshDisplay();
    },

    updateViewModeButtons: function () {
      var includeCte = this.includeCtes();
      $("view-include-cte").classList.toggle("is-active", includeCte);
      $("view-physical-only").classList.toggle("is-active", !includeCte);
    },

    updateGraphActions: function () {
      var hasGraph =
        this.lastModel &&
        this.lastModel.nodes.length &&
        !$("graph-container").classList.contains("is-hidden");
      $("btn-export-pdf").disabled = !hasGraph;
      $("btn-fullscreen").disabled = !hasGraph;
      this.updateFullscreenButtonLabel();
    },

    updateFullscreenButtonLabel: function () {
      var btn = $("btn-fullscreen");
      if (!btn) return;
      var inFs = document.fullscreenElement === $("graph-stage");
      btn.textContent = this.i18n.t(inFs ? "fullscreenOff" : "fullscreenOn");
    },

    onFullscreenChange: function () {
      this.updateFullscreenButtonLabel();
      global.requestAnimationFrame(function () {
        global.QueryAnalyzer.GraphView.refreshLayout();
      });
    },

    toggleFullscreen: function () {
      var stage = $("graph-stage");
      if (!stage || $("btn-fullscreen").disabled) return;

      if (document.fullscreenElement === stage) {
        document.exitFullscreen().catch(function () {
          /* ignore */
        });
        return;
      }

      stage.requestFullscreen().catch(function () {
        /* ignore */
      });
    },

    setLocale: function (locale) {
      this.i18n.setLocale(locale);
      saveLocale(locale);
      this.i18n.applyToDocument();
      this.updateFooterPrivacy();
      this.updateLangButtons();
      this.updateViewModeButtons();
      applyTheme(this.theme);
      this.refreshDisplay();
      if (global.QueryAnalyzer.WelcomeShare) {
        global.QueryAnalyzer.WelcomeShare.refreshLabels(this.i18n);
      }
    },

    updateLangButtons: function () {
      var loc = this.i18n.getLocale();
      $("lang-en").classList.toggle("is-active", loc === "en");
      $("lang-pt").classList.toggle("is-active", loc === "pt");
    },

    showGraphPanel: function () {
      $("graph-empty").classList.add("is-hidden");
      $("graph-container").classList.remove("is-hidden");
      void $("graph-container").offsetWidth;
    },

    refreshDisplay: function () {
      if (!this.lastModel || !this.lastModel.nodes.length) {
        this.updateGraphActions();
        return;
      }
      var model = this.getDisplayModel();
      this.updateStats(model);
      this.showGraphPanel();
      var self = this;
      global.requestAnimationFrame(function () {
        self.renderGraph(model);
        self.renderRelationList(model);
        self.updateGraphActions();
      });
    },

    analyze: function () {
      var sql = $("sql-input").value.trim();
      if (!sql) {
        this.showEmpty();
        return;
      }

      var labels = {
        subquery: this.i18n.t("subqueryLabel"),
        cte: this.i18n.t("cteLabel"),
      };

      var model;
      try {
        model = global.QueryAnalyzer.RelationshipExtractor.extractRelationships(sql, labels);
      } catch (err) {
        console.error("Relationship extraction failed", err);
        this.showNoRelations();
        return;
      }

      this.lastModel = model;

      if (!model.nodes.length) {
        this.showNoRelations();
        return;
      }

      this.refreshDisplay();
    },

    updateStats: function (model) {
      $("stat-tables").textContent = String(model.nodes.length);
      $("stat-relations").textContent = String(model.edges.length);
    },

    renderGraph: function (model) {
      global.QueryAnalyzer.GraphView.render(
        $("graph-container"),
        model,
        this.i18n,
        this.theme === "light"
      );
    },

    renderRelationList: function (model) {
      var list = $("relations-list");
      list.innerHTML = "";

      collectRelationLines(model, this.i18n).forEach(function (line) {
        var li = document.createElement("li");
        li.textContent = line;
        list.appendChild(li);
      });

      list.classList.remove("is-hidden");
    },

    exportPdf: function () {
      if ($("btn-export-pdf").disabled) {
        window.alert(this.i18n.t("exportPdfNoData"));
        return;
      }

      var display = this.getDisplayModel();
      if (!display) return;

      var png = global.QueryAnalyzer.GraphView.exportPng(this.theme === "light");
      var viewModeLabel = this.includeCtes()
        ? this.i18n.t("viewModeIncludeCte")
        : this.i18n.t("viewModePhysicalOnly");

      try {
        global.QueryAnalyzer.PdfExport.exportDocumentationPdf({
          title: this.i18n.t("pdfTitle"),
          generatedLabel: this.i18n.t("pdfGenerated"),
          generatedAt: global.QueryAnalyzer.PdfExport.formatGeneratedAt(this.i18n.getLocale()),
          sqlLabel: this.i18n.t("pdfSqlSection"),
          sql: $("sql-input").value.trim(),
          graphLabel: this.i18n.t("pdfGraphSection"),
          pngDataUrl: png,
          relationsLabel: this.i18n.t("pdfRelationsSection"),
          relationLines: collectRelationLines(display, this.i18n),
          footerCredit: this.i18n.t("pdfFooter"),
          viewModeLabel: viewModeLabel,
        });
      } catch (err) {
        console.error("PDF export failed", err);
        window.alert(this.i18n.t("exportPdfError"));
      }
    },

    showEmpty: function () {
      if (document.fullscreenElement === $("graph-stage")) {
        document.exitFullscreen().catch(function () {
          /* ignore */
        });
      }
      global.QueryAnalyzer.GraphView.destroy();
      this.lastModel = null;
      $("stat-tables").textContent = "0";
      $("stat-relations").textContent = "0";
      $("graph-container").classList.add("is-hidden");
      $("graph-empty").classList.remove("is-hidden");
      $("graph-empty-title").textContent = this.i18n.t("emptyTitle");
      $("graph-empty-desc").textContent = this.i18n.t("emptyDescription");
      $("relations-list").classList.add("is-hidden");
      this.updateGraphActions();
    },

    showNoRelations: function () {
      this.lastModel = null;
      global.QueryAnalyzer.GraphView.destroy();
      $("stat-tables").textContent = "0";
      $("stat-relations").textContent = "0";
      $("graph-container").classList.add("is-hidden");
      $("graph-empty").classList.remove("is-hidden");
      $("graph-empty-title").textContent = this.i18n.t("noRelationsFound");
      $("graph-empty-desc").textContent = "";
      $("relations-list").classList.add("is-hidden");
      this.updateGraphActions();
    },

    clear: function () {
      $("sql-input").value = "";
      this.showEmpty();
    },

    loadDemo: function () {
      var query =
        global.QueryAnalyzer.DemoQuery && global.QueryAnalyzer.DemoQuery.get
          ? global.QueryAnalyzer.DemoQuery.get()
          : null;
      if (!query) return;
      $("sql-input").value = query;
      this.analyze();
    },
  };

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.App = app;
})(typeof window !== "undefined" ? window : this);
