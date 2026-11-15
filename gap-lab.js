// Вставки между блоками: при каждой загрузке страницы случайно раскладываем
// разные варианты из <template id="gap-pool"> по всем .gap-slot и оживляем их.
(function () {
  var pool = document.getElementById("gap-pool");
  var slots = document.querySelectorAll(".gap-slot");
  if (!pool || !slots.length) return;

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

  slots.forEach(function (slot, k) {
    var v = variants[k % variants.length].cloneNode(true);
    slot.appendChild(v);
    init(v);
  });

  function pad(n) { return String(n).padStart(2, "0"); }

  function init(v) {
    // аптайм с даты выхода на работу
    var up = v.querySelector(".js-uptime");
    if (up) {
      var START = new Date("2026-01-12T09:00:00+03:00");
      var tick = function () {
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
      "[ok] 350 stores online"
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
      "осталось: спроси у DNS", "осталось: 1 секунда"
    ];
    var k = 0;
    function grow() {
      p += p < 60 ? 7 : p < 90 ? 3 : 1;
      if (p >= 99) {
        p = 99;
        render();
        setInterval(function () { eta.textContent = etas[k++ % etas.length]; }, 1600);
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
