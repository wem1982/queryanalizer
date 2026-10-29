(function (global) {
  "use strict";

  function formatGeneratedAt(locale) {
    var loc = locale === "pt" ? "pt-BR" : "en-US";
    try {
      return new Date().toLocaleString(loc, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return new Date().toISOString();
    }
  }

  function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
    var lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  /**
   * @param {Object} options
   * @param {string} options.title
   * @param {string} options.generatedLabel
   * @param {string} options.generatedAt
   * @param {string} options.sqlLabel
   * @param {string} options.sql
   * @param {string} options.graphLabel
   * @param {string|null} options.pngDataUrl
   * @param {string} options.relationsLabel
   * @param {string[]} options.relationLines
   * @param {string} options.footerCredit
   * @param {string} options.viewModeLabel
   */
  function exportDocumentationPdf(options) {
    if (!global.jspdf || !global.jspdf.jsPDF) {
      throw new Error("jsPDF not loaded");
    }

    var doc = new global.jspdf.jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    var margin = 14;
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var contentW = pageW - margin * 2;
    var y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(options.title, margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(options.generatedLabel + ": " + options.generatedAt, margin, y);
    y += 5;
    doc.text(options.viewModeLabel, margin, y);
    y += 8;
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(options.sqlLabel, margin, y);
    y += 6;

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    y = addWrappedText(doc, options.sql || "—", margin, y, contentW, 3.6);
    y += 6;

    if (y > pageH - 40) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(options.graphLabel, margin, y);
    y += 4;

    if (options.pngDataUrl) {
      var imgW = contentW;
      var imgH = imgW * 0.55;
      if (y + imgH > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.addImage(options.pngDataUrl, "PNG", margin, y, imgW, imgH);
      y += imgH + 8;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      y = addWrappedText(doc, "—", margin, y, contentW, 5);
      y += 4;
    }

    if (y > pageH - 30) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(options.relationsLabel, margin, y);
    y += 6;

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    options.relationLines.forEach(function (line, index) {
      var numbered = index + 1 + ". " + line;
      var blockH = doc.splitTextToSize(numbered, contentW).length * 3.6;
      if (y + blockH > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      y = addWrappedText(doc, numbered, margin, y, contentW, 3.6);
      y += 1.5;
    });

    var pageCount = doc.getNumberOfPages();
    for (var p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(options.footerCredit, margin, pageH - 8);
      doc.text(String(p) + " / " + String(pageCount), pageW - margin, pageH - 8, {
        align: "right",
      });
    }

    doc.save("queryanalyzer-report.pdf");
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.PdfExport = {
    exportDocumentationPdf: exportDocumentationPdf,
    formatGeneratedAt: formatGeneratedAt,
  };
})(typeof window !== "undefined" ? window : this);
