(function (global) {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (global.QueryAnalyzer && global.QueryAnalyzer.App) {
      global.QueryAnalyzer.App.init();
    }
  });
})(typeof window !== "undefined" ? window : this);
