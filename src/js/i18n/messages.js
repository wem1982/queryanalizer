(function (global) {
  "use strict";

  var MESSAGES = {
    en: {
      appName: "QueryAnalyzer",
      appTitle: "QueryAnalyzer by William Marques",
      tagline: "SQL relationship visualization",
      heroTitle: "Map table relationships in your SQL",
      heroDescription:
        "Paste a single SELECT-style query. QueryAnalyzer extracts joins and column links and renders an interactive graph. Syntax validation is out of scope — only structural relationships are shown.",
      panelQuery: "SQL query",
      panelGraph: "Relationship graph",
      placeholderSql:
        "SELECT o.id, c.name\nFROM orders o\nINNER JOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'open';",
      analyze: "Analyze relationships",
      viewExample: "View example",
      clear: "Clear",
      tables: "Tables",
      relations: "Relations",
      emptyTitle: "No analysis yet",
      emptyDescription: "Enter a SQL query and click Analyze to see the graph.",
      graphHint: "Drag nodes and scroll to zoom. Edge labels show join type only; column details are in the list below.",
      relationListTitle: "Detected links",
      footerPrefix: "QueryAnalyzer by",
      footerSuffix: "MIT — free use with attribution.",
      footerPrivacy:
        "On https://wem1982.github.io/queryanalizer/, your SQL stays in the browser and is not saved on any server.",
      noRelationshipFound: "NO RELATIONSHIP FOUND",
      joinInner: "INNER",
      joinLeft: "LEFT",
      joinRight: "RIGHT",
      joinFull: "FULL",
      joinCross: "CROSS",
      joinImplicit: "Implicit (WHERE)",
      joinNatural: "NATURAL",
      joinUsing: "USING",
      themeLight: "Switch to light theme",
      themeDark: "Switch to dark theme",
      noRelationsFound:
        "No table relationships were detected. Try adding JOIN or equi-join predicates in WHERE.",
      subqueryLabel: "Subquery",
      cteLabel: "CTE",
    },
    pt: {
      appName: "QueryAnalyzer",
      appTitle: "QueryAnalyzer by William Marques",
      tagline: "Visualização de relações SQL",
      heroTitle: "Mapeie relações entre tabelas na sua SQL",
      heroDescription:
        "Cole uma única consulta no estilo SELECT. O QueryAnalyzer extrai joins e vínculos por coluna e exibe um grafo interativo. Validação de sintaxe não faz parte do escopo — apenas relações estruturais.",
      panelQuery: "Consulta SQL",
      panelGraph: "Grafo de relações",
      placeholderSql:
        "SELECT p.id, c.nome\nFROM pedidos p\nINNER JOIN clientes c ON c.id = p.cliente_id\nWHERE p.status = 'aberto';",
      analyze: "Analisar relações",
      viewExample: "Ver exemplo",
      clear: "Limpar",
      tables: "Tabelas",
      relations: "Relações",
      emptyTitle: "Nenhuma análise ainda",
      emptyDescription: "Informe uma consulta SQL e clique em Analisar para ver o grafo.",
      graphHint: "Arraste os nós e use scroll para zoom. Nas arestas aparece só o tipo de join; os detalhes das colunas estão na lista abaixo.",
      relationListTitle: "Vínculos detectados",
      footerPrefix: "QueryAnalyzer por",
      footerSuffix: "MIT — uso livre com atribuição ao autor.",
      footerPrivacy:
        "Em https://wem1982.github.io/queryanalizer/, sua SQL é processada no navegador e não é salva em nenhum servidor.",
      noRelationshipFound: "NO RELATIONSHIP FOUND",
      joinInner: "INNER",
      joinLeft: "LEFT",
      joinRight: "RIGHT",
      joinFull: "FULL",
      joinCross: "CROSS",
      joinImplicit: "Implícito (WHERE)",
      joinNatural: "NATURAL",
      joinUsing: "USING",
      themeLight: "Alternar para tema claro",
      themeDark: "Alternar para tema escuro",
      noRelationsFound:
        "Nenhuma relação entre tabelas foi detectada. Tente JOINs ou equi-joins no WHERE.",
      subqueryLabel: "Subconsulta",
      cteLabel: "CTE",
    },
  };

  function createI18n(defaultLocale) {
    var locale = defaultLocale || "en";

    return {
      getLocale: function () {
        return locale;
      },
      setLocale: function (next) {
        if (MESSAGES[next]) locale = next;
      },
      t: function (key) {
        var pack = MESSAGES[locale] || MESSAGES.en;
        return pack[key] != null ? pack[key] : key;
      },
      applyToDocument: function () {
        var pack = MESSAGES[locale] || MESSAGES.en;
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
          var key = el.getAttribute("data-i18n");
          if (pack[key] != null) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
              if (el.hasAttribute("placeholder")) el.placeholder = pack[key];
            } else {
              el.textContent = pack[key];
            }
          }
        });
        document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
      },
    };
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.I18n = { create: createI18n, MESSAGES: MESSAGES };
})(typeof window !== "undefined" ? window : this);
