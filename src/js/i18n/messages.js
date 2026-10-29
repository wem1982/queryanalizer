(function (global) {
  "use strict";

  var MESSAGES = {
    en: {
      appName: "QueryAnalyzer",
      appTitle: "QueryAnalyzer by Will Markz",
      authorName: "Will Markz",
      seoTitle: "QueryAnalyzer — SQL Join & Relationship Graph Visualizer | Will Markz",
      seoDescription:
        "Paste complex SQL and instantly visualize table joins, CTEs, and relationships in an interactive graph. Free browser tool by Will Markz — private, no install, export PDF.",
      welcomeMessage:
        "Know that super complex query that takes a long time to understand? Paste it in this text box and watch the magic happen! In a few seconds you will see the relationships and understand the details.",
      welcomeDismiss: "Got it",
      shareButton: "Share",
      shareMenuTitle: "Share QueryAnalyzer",
      shareMessage:
        "QueryAnalyzer — visualize SQL joins and relationships in seconds. Try it free in your browser:",
      shareFacebook: "Facebook",
      shareTwitter: "X (Twitter)",
      shareLinkedIn: "LinkedIn",
      shareWhatsApp: "WhatsApp",
      shareTelegram: "Telegram",
      shareReddit: "Reddit",
      shareCopyLink: "Copy link",
      shareCopied: "Link copied!",
      tagline: "SQL relationship visualization",
      heroTitle: "Map table relationships in your SQL",
      heroDescription:
        "Paste a single SELECT-style query. QueryAnalyzer extracts joins and column links and renders an interactive graph. Syntax validation is out of scope — only structural relationships are shown.",
      panelQuery:
        "Paste or write your SQL query here (processed only in your browser, fully private)",
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
        "On https://willmarkz.github.io/queryanalizer/, your SQL stays in the browser and is not saved on any server.",
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
      viewModeLabel: "Graph view mode",
      viewIncludeCte: "Include CTEs",
      viewPhysicalOnly: "Physical tables only",
      viewModeIncludeCte: "View: include CTEs",
      viewModePhysicalOnly: "View: physical tables only",
      fullscreenOn: "Fullscreen graph",
      fullscreenOff: "Exit fullscreen",
      exportPdf: "Export PDF",
      exportPdfNoData: "Run an analysis before exporting.",
      exportPdfError: "Could not generate the PDF. Try again.",
      pdfTitle: "QueryAnalyzer — Relationship report",
      pdfGenerated: "Generated",
      pdfSqlSection: "SQL query",
      pdfGraphSection: "Relationship graph",
      pdfRelationsSection: "Detected links",
      pdfFooter: "QueryAnalyzer by Will Markz — https://github.com/willmarkz/queryanalizer",
    },
    pt: {
      appName: "QueryAnalyzer",
      appTitle: "QueryAnalyzer by Will Markz",
      authorName: "Will Markz",
      seoTitle: "QueryAnalyzer — Visualizador de joins e relações SQL | Will Markz",
      seoDescription:
        "Cole SQL complexa e visualize joins, CTEs e relações entre tabelas em um grafo interativo. Ferramenta gratuita no navegador por Will Markz — privada, sem instalação, exporte PDF.",
      welcomeMessage:
        "Sabe aquela query super complexa que precisa de um bom tempo para ser compreendida? Coloque ela aqui nessa caixa de texto e veja a mágica acontecer! Em poucos segundos você poderá ver as relações existentes e compreender os detalhes.",
      welcomeDismiss: "Entendi",
      shareButton: "Compartilhe",
      shareMenuTitle: "Compartilhar QueryAnalyzer",
      shareMessage:
        "QueryAnalyzer — visualize joins e relações SQL em segundos. Teste grátis no navegador:",
      shareFacebook: "Facebook",
      shareTwitter: "X (Twitter)",
      shareLinkedIn: "LinkedIn",
      shareWhatsApp: "WhatsApp",
      shareTelegram: "Telegram",
      shareReddit: "Reddit",
      shareCopyLink: "Copiar link",
      shareCopied: "Link copiado!",
      tagline: "Visualização de relações SQL",
      heroTitle: "Mapeie relações entre tabelas na sua SQL",
      heroDescription:
        "Cole uma única consulta no estilo SELECT. O QueryAnalyzer extrai joins e vínculos por coluna e exibe um grafo interativo. Validação de sintaxe não faz parte do escopo — apenas relações estruturais.",
      panelQuery:
        "Cole aqui ou escreva sua consulta SQL (Será processada apenas no seu navegador com total privacidade)",
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
        "Em https://willmarkz.github.io/queryanalizer/, sua SQL é processada no navegador e não é salva em nenhum servidor.",
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
      viewModeLabel: "Modo de visualização do grafo",
      viewIncludeCte: "Incluir CTEs",
      viewPhysicalOnly: "Só tabelas físicas",
      viewModeIncludeCte: "Visualização: incluir CTEs",
      viewModePhysicalOnly: "Visualização: só tabelas físicas",
      fullscreenOn: "Grafo em tela cheia",
      fullscreenOff: "Sair da tela cheia",
      exportPdf: "Exportar PDF",
      exportPdfNoData: "Execute uma análise antes de exportar.",
      exportPdfError: "Não foi possível gerar o PDF. Tente novamente.",
      pdfTitle: "QueryAnalyzer — Relatório de relações",
      pdfGenerated: "Gerado em",
      pdfSqlSection: "Consulta SQL",
      pdfGraphSection: "Grafo de relações",
      pdfRelationsSection: "Vínculos detectados",
      pdfFooter: "QueryAnalyzer by Will Markz — https://github.com/willmarkz/queryanalizer",
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

        if (pack.seoTitle) document.title = pack.seoTitle;
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && pack.seoDescription) metaDesc.setAttribute("content", pack.seoDescription);
        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && pack.seoTitle) ogTitle.setAttribute("content", pack.seoTitle);
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && pack.seoDescription) ogDesc.setAttribute("content", pack.seoDescription);
        var twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle && pack.seoTitle) twTitle.setAttribute("content", pack.seoTitle);
        var twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc && pack.seoDescription) twDesc.setAttribute("content", pack.seoDescription);
      },
    };
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.I18n = { create: createI18n, MESSAGES: MESSAGES };
})(typeof window !== "undefined" ? window : this);
