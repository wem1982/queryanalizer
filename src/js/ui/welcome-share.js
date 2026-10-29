(function (global) {
  "use strict";

  var STORAGE_WELCOME = "queryanalyzer.welcomeDismissed";
  var SHARE_URL = "https://willmarkz.github.io/queryanalizer/";

  var state = {
    i18n: null,
    menuOpen: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function isWelcomeDismissed() {
    try {
      return localStorage.getItem(STORAGE_WELCOME) === "1";
    } catch (e) {
      return false;
    }
  }

  function dismissWelcome() {
    try {
      localStorage.setItem(STORAGE_WELCOME, "1");
    } catch (e) {
      /* ignore */
    }
    var banner = $("welcome-banner");
    if (banner) banner.classList.add("is-hidden");
  }

  function initWelcome() {
    var banner = $("welcome-banner");
    if (!banner) return;
    if (isWelcomeDismissed()) {
      banner.classList.add("is-hidden");
      return;
    }
    banner.classList.remove("is-hidden");
    var closeBtn = $("welcome-dismiss");
    if (closeBtn) {
      closeBtn.addEventListener("click", dismissWelcome);
    }
  }

  function buildShareHref(network) {
    var url = encodeURIComponent(SHARE_URL);
    var text = encodeURIComponent(state.i18n ? state.i18n.t("shareMessage") : "QueryAnalyzer");
    switch (network) {
      case "facebook":
        return "https://www.facebook.com/sharer/sharer.php?u=" + url;
      case "twitter":
        return "https://twitter.com/intent/tweet?url=" + url + "&text=" + text;
      case "linkedin":
        return "https://www.linkedin.com/sharing/share-offsite/?url=" + url;
      case "whatsapp":
        return "https://wa.me/?text=" + text + "%20" + url;
      case "telegram":
        return "https://t.me/share/url?url=" + url + "&text=" + text;
      case "reddit":
        return "https://www.reddit.com/submit?url=" + url + "&title=" + text;
      default:
        return SHARE_URL;
    }
  }

  function renderShareMenu() {
    var list = $("share-menu-list");
    if (!list || !state.i18n) return;
    list.innerHTML = "";

    var networks = [
      { id: "whatsapp", key: "shareWhatsApp" },
      { id: "facebook", key: "shareFacebook" },
      { id: "twitter", key: "shareTwitter" },
      { id: "linkedin", key: "shareLinkedIn" },
      { id: "telegram", key: "shareTelegram" },
      { id: "reddit", key: "shareReddit" },
    ];

    networks.forEach(function (net) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = buildShareHref(net.id);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = state.i18n.t(net.key);
      li.appendChild(a);
      list.appendChild(li);
    });

    var copyLi = document.createElement("li");
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.id = "share-copy-link";
    copyBtn.setAttribute("data-share-copy", "true");
    copyBtn.textContent = state.i18n.t("shareCopyLink");
    copyLi.appendChild(copyBtn);
    list.appendChild(copyLi);
  }

  function handleCopyLink(copyBtn) {
    var done = function () {
      copyBtn.textContent = state.i18n.t("shareCopied");
      window.setTimeout(function () {
        copyBtn.textContent = state.i18n.t("shareCopyLink");
      }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SHARE_URL).then(done).catch(function () {
        window.prompt(state.i18n.t("shareCopyLink"), SHARE_URL);
      });
    } else {
      window.prompt(state.i18n.t("shareCopyLink"), SHARE_URL);
      done();
    }
  }

  function setMenuOpen(open) {
    state.menuOpen = open;
    var menu = $("share-menu");
    var fab = $("share-fab");
    if (menu) menu.classList.toggle("is-hidden", !open);
    if (fab) fab.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function initShare() {
    var fab = $("share-fab");
    if (!fab) return;

    fab.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenuOpen(!state.menuOpen);
    });

    document.addEventListener("click", function () {
      if (state.menuOpen) setMenuOpen(false);
    });

    var menu = $("share-menu");
    if (menu) {
      menu.addEventListener("click", function (e) {
        e.stopPropagation();
        var copyBtn = e.target.closest("[data-share-copy]");
        if (copyBtn) handleCopyLink(copyBtn);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.menuOpen) setMenuOpen(false);
    });

    renderShareMenu();
  }

  function refreshLabels(i18n) {
    state.i18n = i18n;
    var fab = $("share-fab");
    var label = $("share-fab-label");
    if (label) label.textContent = i18n.t("shareButton");
    if (fab) {
      fab.setAttribute("aria-label", i18n.t("shareButton"));
    }
    var title = $("share-menu-title");
    if (title) title.textContent = i18n.t("shareMenuTitle");
    renderShareMenu();
  }

  function init(i18n) {
    state.i18n = i18n;
    initWelcome();
    initShare();
    refreshLabels(i18n);
  }

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.WelcomeShare = {
    init: init,
    refreshLabels: refreshLabels,
    SHARE_URL: SHARE_URL,
  };
})(typeof window !== "undefined" ? window : this);
