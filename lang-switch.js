/* ============================================================
   lang-switch.js · site-wide language switcher (EN / 中文 / ไทย)
   - Injects a segmented control into .meta-bar-right (top-right),
     falling back to a fixed top-right box if no meta-bar exists.
   - Persists the choice in localStorage ("chula_lang") so the
     selected language carries across every page.
   - Applies static text via an optional per-page window.PAGE_I18N
     dictionary on elements carrying [data-i18n].
   - Dispatches a "langchange" event so pages that render content
     in JS (map.html, conflicts.html) can re-render themselves.
   Self-contained: injects its own CSS, so a single <script> tag
   is all any page needs.
   ============================================================ */
(function () {
  var LS_KEY = "chula_lang";
  var LANGS = ["en", "zh", "th"];
  var LABELS = { en: "EN", zh: "中文", th: "ไทย" };
  var HTML_LANG = { en: "en", zh: "zh", th: "th" };

  function getLang() {
    var l;
    try { l = localStorage.getItem(LS_KEY); } catch (e) { l = null; }
    return LANGS.indexOf(l) > -1 ? l : "en";
  }
  function storeLang(l) { try { localStorage.setItem(LS_KEY, l); } catch (e) {} }

  function injectStyles() {
    if (document.getElementById("lang-switch-style")) return;
    var css = "" +
      ".lang-switch{display:inline-flex;align-items:stretch;border:1px solid currentColor;" +
      "border-radius:3px;overflow:hidden;vertical-align:middle;line-height:1;}" +
      ".lang-switch button{font-family:var(--f-mono,'JetBrains Mono',ui-monospace,monospace),'Noto Sans Thai',sans-serif;" +
      "font-size:10px;letter-spacing:.08em;padding:5px 9px;background:transparent;color:currentColor;" +
      "border:0;border-left:1px solid currentColor;cursor:pointer;opacity:.6;transition:opacity .15s,background .15s,color .15s;}" +
      ".lang-switch button:first-child{border-left:0;}" +
      ".lang-switch button:hover{opacity:1;}" +
      ".lang-switch button.on{background:#5fb892;color:#10231a;opacity:1;font-weight:600;}" +
      ".lang-switch-fixed{position:fixed;top:12px;right:16px;z-index:120;color:#ede4f5;}" +
      "@media(max-width:768px){.lang-switch button{padding:5px 7px;font-size:9px;}}";
    var s = document.createElement("style");
    s.id = "lang-switch-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildSwitch() {
    var host = document.querySelector(".lang-switch");
    if (!host) {
      host = document.createElement("div");
      host.className = "lang-switch";
      var mbr = document.querySelector(".meta-bar-right");
      if (mbr) {
        mbr.appendChild(host);
      } else {
        host.classList.add("lang-switch-fixed");
        document.body.appendChild(host);
      }
    }
    host.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l + '">' + LABELS[l] + "</button>";
    }).join("");
    Array.prototype.forEach.call(host.querySelectorAll("[data-lang]"), function (b) {
      b.addEventListener("click", function () { setLang(b.dataset.lang); });
    });
  }

  function applyStatic(l) {
    // active button state
    Array.prototype.forEach.call(document.querySelectorAll(".lang-switch [data-lang]"), function (b) {
      b.classList.toggle("on", b.dataset.lang === l);
    });
    // per-page static dictionary
    var dict = window.PAGE_I18N;
    if (dict && dict[l]) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
        var k = el.getAttribute("data-i18n");
        var v = dict[l][k];
        if (v == null && dict.en) v = dict.en[k]; // fall back to English
        if (v != null) el.innerHTML = v;
      });
    }
  }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0) l = "en";
    window.I18N.current = l;
    storeLang(l);
    document.documentElement.setAttribute("lang", HTML_LANG[l]);
    document.documentElement.setAttribute("data-lang", l);
    applyStatic(l);
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: l } }));
  }

  // Expose a tiny API so page scripts can read the current language
  // and pick the right string: I18N.t({en:"",zh:"",th:""})
  window.I18N = {
    current: getLang(),
    get: getLang,
    set: setLang,
    LANGS: LANGS,
    t: function (obj) {
      if (obj == null) return "";
      if (typeof obj === "string") return obj;
      var l = window.I18N.current;
      return obj[l] != null ? obj[l] : (obj.en != null ? obj.en : "");
    }
  };

  function init() {
    injectStyles();
    buildSwitch();
    setLang(getLang());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
