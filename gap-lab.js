// Вставки между блоками: при каждой загрузке страницы случайно раскладываем
// разные варианты из <template id="gap-pool"> по всем .gap-slot и оживляем их.
(function () {
  var pool = document.getElementById("gap-pool");
  var slots = document.querySelectorAll(".gap-slot");
  if (!pool || !slots.length) return;

  // дополнительные вставки из gap-lab2.js
  var EXTRA = {};
  (window.GAP_EXTRA || []).forEach(function (x) {
    var wrap = document.createElement("div");
    wrap.innerHTML = x.html;
    var el = wrap.firstElementChild;
    el.classList.add("gap-v");
    el.dataset.v = x.v;
    el.dataset.extra = "1";
    pool.content.appendChild(el);
    EXTRA[x.v] = x;
  });

  window.GAP_TYPER = function (el, lines, speed) { typer(el, lines, speed); };

  var variants = Array.prototype.slice.call(pool.content.querySelectorAll(".gap-v"));
  // перемешать (Фишер–Йетс)
  for (var i = variants.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = variants[i]; variants[i] = variants[j]; variants[j] = t;
  }
  // ?gap=loading,rack — принудительно поставить эти варианты первыми (для проверки)
  var force = (location.search.match(/[?&]gap=([\w,]+)/) || [])[1];
  if (force) {
    force.split(",").reverse().forEach(function (name) {
      var idx = variants.findIndex(function (x) { return x.dataset.v === name; });
      if (idx > -1) variants.unshift(variants.splice(idx, 1)[0]);
    });
  }

  // консольные вставки — не больше одной на странице
  var CONSOLE = window.GAP_CONSOLE || [];
  var seenConsole = false;
  variants = variants.filter(function (x) {
    if (CONSOLE.indexOf(x.dataset.v) < 0) return true;
    if (seenConsole) return false;
    seenConsole = true; return true;
  });

  slots.forEach(function (slot, k) {
    var v = variants[k % variants.length].cloneNode(true);
    slot.appendChild(v);
    init(v);
  });

  function pad(n) { return String(n).padStart(2, "0"); }

  function init(v) {
    var ex = EXTRA[v.dataset.v];
    if (ex && ex.init) ex.init(v);
    var extraInit = (window.GAP_INIT || {})[v.dataset.v];
    if (extraInit) extraInit(v);
    // аптайм с даты выхода на работу
    var up = v.querySelector(".js-uptime");
    if (up) {
      var START = new Date("2026-01-12T09:00:00+03:00");
      var tick = function () {
        if (up.dataset.frozen) return;
        var s = Math.max(0, Math.floor((Date.now() - START) / 1000));
        var d = Math.floor(s / 86400); s %= 86400;
        up.textContent = d + " days, " + pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
      };
      tick(); setInterval(tick, 1000);
    }

    var term = v.querySelector(".js-term");
    if (term) typer(term, [
      "$ ping kuleshovms.site",
      "64 bytes from 91.218.228.13: time=4 ms",
      "$ sudo fix --everything",
      "[ok] all systems online"
    ], 60);

    var bios = v.querySelector(".js-bios");
    if (bios) typer(bios, [
      "Award Modular BIOS v6.00PG",
      "Memory Test: 640K OK",
      "Detecting experience ... 3 years found",
      "Booting KuleshovMS ... done"
    ], 30);

    if (v.classList.contains("gap-loading")) copyDialog(v);
  }

  // «Копирование опыта» как в Windows: быстро до 99%, а дальше
  // застревает навсегда, и оценка оставшегося времени сходит с ума.
  function copyDialog(v) {
    var bar = v.querySelector(".load-bar i");
    var pct = v.querySelector(".load-pct");
    var eta = v.querySelector(".load-eta");
    var p = 0;
    var etas = [
      "осталось: 5 секунд", "осталось: 2 секунды", "осталось: 1 секунда",
      "осталось: 3 минуты", "осталось: 14 часов", "осталось: 2 дня",
      "осталось: почти всё", "осталось: 1 секунда", "осталось: 7 лет",
      "осталось: спроси у админа", "осталось: 1 секунда"
    ];
    var k = 0;
    function grow() {
      if (v.dataset.done) return;
      p += p < 60 ? 7 : p < 90 ? 3 : 1;
      if (p >= 99) {
        p = 99;
        render();
        var etaTimer = setInterval(function () { if (v.dataset.done) return clearInterval(etaTimer); eta.textContent = etas[k++ % etas.length]; }, 1600);
        return;
      }
      render();
      eta.textContent = "осталось: " + Math.max(1, Math.round((99 - p) / 9)) + " сек";
      setTimeout(grow, 120 + p * 4);
    }
    function render() {
      bar.style.width = p + "%";
      pct.textContent = p + "%";
    }
    grow();
  }


  // ---------- Футер (выбранный вариант; пока не выбран — ничего) ----------
  var FOOTER_DEFAULT = window.FOOTER_DEFAULT || null;
  function renderFooter(name) {
    var footer = document.querySelector("footer");
    if (!footer) return;
    var old = footer.querySelector(".footer-extra");
    if (old) old.remove();
    var f = (window.FOOTER_VARIANTS || {})[name];
    if (!f) return;
    var box = document.createElement("div");
    box.className = "footer-extra";
    box.innerHTML = f.html;
    footer.appendChild(box);
    if (f.init) f.init(box);
  }

  // ---------- Панель обзора (только localhost) ----------
  function render(slot, name) {
    var src = pool.content.querySelector('.gap-v[data-v="' + name + '"]');
    if (!src) return;
    slot.innerHTML = "";
    var v = src.cloneNode(true);
    slot.appendChild(v);
    init(v);
  }

  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  document.addEventListener("DOMContentLoaded", function () {
    var tryFooter = function (n) {
      if (document.querySelector("footer")) return renderFooter(localFooter() || FOOTER_DEFAULT);
      if (n < 40) setTimeout(function () { tryFooter(n + 1); }, 100);
    };
    tryFooter(0);
    if (!isLocal) return;
    buildPanel();
  });
  function localFooter() { if (!isLocal) return null; try { return localStorage.getItem("gapReview.footer"); } catch (e) { return null; } }

  function buildPanel() {
    var panel = document.createElement("div");
    panel.id = "gap-review";
    var all = Array.prototype.slice.call(pool.content.querySelectorAll(".gap-v"));
    panel.innerHTML = '<button class="hide" type="button">свернуть</button>' +
      "<b>✅ Одобрено</b><div class=\"row ins ok-row\"></div>" +
      "<b>🛠 Доработано и новое — на проверку</b><div class=\"row ins rev-row\"></div>" +
      "<b>Футер</b><div class=\"row foot\"></div>";
    var okRow = panel.querySelector(".ok-row"), revRow = panel.querySelector(".rev-row"), foot = panel.querySelector(".foot");
    var STATUS = window.GAP_STATUS || { approved: [], review: [] };
    var labels = {};
    (window.GAP_EXTRA || []).forEach(function (x) { labels[x.v] = x.label; });
    all.forEach(function (src, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = (i + 1) + " " + (labels[src.dataset.v] || src.dataset.v);
      var isOk = STATUS.approved.indexOf(src.dataset.v) > -1;
      b.classList.add(isOk ? "ok" : "new");
      b.addEventListener("click", function () {
        var slot = document.querySelector(".gap-slot");
        render(slot, src.dataset.v);
        panel.querySelectorAll(".ins button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        slot.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      (isOk ? okRow : revRow).appendChild(b);
    });
    var fv = window.FOOTER_VARIANTS || {};
    [["", "нет"]].concat(Object.keys(fv).map(function (k) { return [k, fv[k].label]; })).forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = o[1];
      b.setAttribute("aria-pressed", String((localFooter() || "") === o[0]));
      b.addEventListener("click", function () {
        try { localStorage.setItem("gapReview.footer", o[0]); } catch (e) {}
        renderFooter(o[0]);
        foot.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        document.querySelector("footer").scrollIntoView({ block: "end", behavior: "smooth" });
      });
      foot.appendChild(b);
    });
    var hidden = false;
    panel.querySelector(".hide").addEventListener("click", function () {
      hidden = !hidden;
      panel.querySelectorAll(".row, b").forEach(function (x) { x.style.display = hidden ? "none" : ""; });
      this.textContent = hidden ? "панель" : "свернуть";
    });
    document.body.appendChild(panel);
  }

  function typer(el, lines, speed) {
    var li = 0, ci = 0;
    function step() {
      if (li >= lines.length) {
        setTimeout(function () { el.textContent = ""; li = 0; ci = 0; step(); }, 3500);
        return;
      }
      var line = lines[li];
      if (ci <= line.length) {
        el.textContent = lines.slice(0, li).join("\n") + (li ? "\n" : "") + line.slice(0, ci);
        ci++;
        setTimeout(step, line.charAt(0) === "$" ? speed : 8);
      } else {
        li++; ci = 0;
        setTimeout(step, 400);
      }
    }
    step();
  }
})();
