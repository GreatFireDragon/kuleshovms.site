// Вставки между блоками: варианты из <template id="gap-pool"> + window.GAP_EXTRA
// раскладываются по .gap-slot по кругу (позиция в localStorage) и оживляются.
(function () {
  var pool = document.getElementById("gap-pool");
  var slots = document.querySelectorAll(".gap-slot");
  if (!pool || !slots.length) return;

  // дополнительные вставки (gaps-variants.js)
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
  // «Так, падажжи» показываем всегда, в первом слоте; остальные идут по кругу
  var ALWAYS = ["padazhi"];
  var pinned = variants.filter(function (x) { return ALWAYS.indexOf(x.dataset.v) > -1; });
  variants = variants.filter(function (x) { return ALWAYS.indexOf(x.dataset.v) < 0; });
  // по порядку по кругу: каждая загрузка продолжает с места, где остановилась прошлая
  var POS_KEY = "gapPos", pos = 0;
  try { pos = (+localStorage.getItem(POS_KEY) || 0) % variants.length; } catch (e) {}
  variants = variants.slice(pos).concat(variants.slice(0, pos));
  try { localStorage.setItem(POS_KEY, String((pos + slots.length - ALWAYS.length) % variants.length)); } catch (e) {}
  // ?gap=loading,rack — принудительно поставить эти варианты первыми (для проверки)
  var force = (location.search.match(/[?&]gap=([\w,]+)/) || [])[1];
  if (force) {
    force.split(",").reverse().forEach(function (name) {
      var idx = variants.findIndex(function (x) { return x.dataset.v === name; });
      if (idx > -1) variants.unshift(variants.splice(idx, 1)[0]);
    });
  }

  if (!force) variants = pinned.concat(variants);
  else variants = variants.concat(pinned);

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

  // ---------- Футер: F-клавиши (window.FOOTER_DEFAULT) ----------
  function renderFooter(name) {
    var f = (window.FOOTER_VARIANTS || {})[name];
    var footer = document.querySelector("footer");
    if (!f || !footer || footer.querySelector(".footer-extra")) return;
    var box = document.createElement("div");
    box.className = "footer-extra";
    box.innerHTML = f.html;
    footer.appendChild(box);
    if (f.init) f.init(box);
  }
  // футер вставляет layout.js — ждём его появления (до 4 с)
  document.addEventListener("DOMContentLoaded", function () {
    (function tryFooter(n) {
      if (document.querySelector("footer")) return renderFooter(window.FOOTER_DEFAULT);
      if (n < 40) setTimeout(function () { tryFooter(n + 1); }, 100);
    })(0);
  });

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
