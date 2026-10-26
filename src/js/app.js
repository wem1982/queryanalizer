(function (global) {
  "use strict";

  var STORAGE_LOCALE = "queryanalyzer.locale";
  var STORAGE_THEME = "queryanalyzer.theme";

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

  function formatRelationLine(edge, i18n) {
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

  var app = {
    i18n: null,
    theme: "dark",
    lastModel: null,

    init: function () {
      this.i18n = global.QueryAnalyzer.I18n.create(loadStoredLocale());
      this.theme = loadStoredTheme();
      applyTheme(this.theme);
      this.i18n.applyToDocument();
      this.updateFooterPrivacy();
      this.bindEvents();
      this.updateLangButtons();
    },

    updateFooterPrivacy: function () {
      var el = $("footer-privacy");
      if (!el) return;
      var onPages =
        typeof location !== "undefined" &&
        location.hostname === "wem1982.github.io" &&
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
        if (self.lastModel) self.renderGraph(self.lastModel);
      });
    },

    setLocale: function (locale) {
      this.i18n.setLocale(locale);
      saveLocale(locale);
      this.i18n.applyToDocument();
      this.updateFooterPrivacy();
      this.updateLangButtons();
      applyTheme(this.theme);
      if (this.lastModel) {
        this.updateStats(this.lastModel);
        this.renderGraph(this.lastModel);
        this.renderRelationList(this.lastModel);
      }
    },

    updateLangButtons: function () {
      var loc = this.i18n.getLocale();
      $("lang-en").classList.toggle("is-active", loc === "en");
      $("lang-pt").classList.toggle("is-active", loc === "pt");
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

      var model = global.QueryAnalyzer.RelationshipExtractor.extractRelationships(sql, labels);
      this.lastModel = model;
      this.updateStats(model);

      if (!model.nodes.length) {
        this.showNoRelations();
        return;
      }

      $("graph-empty").classList.add("is-hidden");
      $("graph-container").classList.remove("is-hidden");
      this.renderGraph(model);
      this.renderRelationList(model);
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
      var listedEdges = {};
      list.innerHTML = "";

      model.nodes.forEach(function (node) {
        var nodeEdges = model.edges.filter(function (e) {
          return (
            !listedEdges[e.id] && (e.source === node.id || e.target === node.id)
          );
        });

        if (!nodeEdges.length) {
          var isolated = document.createElement("li");
          isolated.textContent =
            node.label + " — " + app.i18n.t("noRelationshipFound");
          list.appendChild(isolated);
          return;
        }

        nodeEdges.forEach(function (edge) {
          listedEdges[edge.id] = true;
          var li = document.createElement("li");
          li.textContent = formatRelationLine(edge, app.i18n);
          list.appendChild(li);
        });
      });

      model.edges.forEach(function (edge) {
        if (listedEdges[edge.id]) return;
        listedEdges[edge.id] = true;
        var li = document.createElement("li");
        li.textContent = formatRelationLine(edge, app.i18n);
        list.appendChild(li);
      });

      if (!list.children.length) {
        var empty = document.createElement("li");
        empty.textContent = app.i18n.t("noRelationshipFound");
        list.appendChild(empty);
      }

      list.classList.remove("is-hidden");
    },

    showEmpty: function () {
      global.QueryAnalyzer.GraphView.destroy();
      this.lastModel = null;
      $("stat-tables").textContent = "0";
      $("stat-relations").textContent = "0";
      $("graph-container").classList.add("is-hidden");
      $("graph-empty").classList.remove("is-hidden");
      $("graph-empty-title").textContent = this.i18n.t("emptyTitle");
      $("graph-empty-desc").textContent = this.i18n.t("emptyDescription");
      $("relations-list").classList.add("is-hidden");
    },

    showNoRelations: function () {
      global.QueryAnalyzer.GraphView.destroy();
      $("graph-container").classList.add("is-hidden");
      $("graph-empty").classList.remove("is-hidden");
      $("graph-empty-title").textContent = this.i18n.t("noRelationsFound");
      $("graph-empty-desc").textContent = "";
      $("relations-list").classList.add("is-hidden");
    },

    clear: function () {
      $("sql-input").value = "";
      this.showEmpty();
    },
  };

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.App = app;
})(typeof window !== "undefined" ? window : this);
