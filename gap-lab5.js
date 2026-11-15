// Раунд 4: убираем отбракованное, доводим игры (лампочки, порты, кофе на стойке),
// общий «салют» за победу. Подключается после gap-lab4.js и gap-interact2.js.
(function () {
  var X = window.GAP_EXTRA;
  var DROP = ["speedtest", "tetris", "tamagotchi", "cat", "captcha", "bsod", "dialup", "win98", "jira", "wifi"];
  for (var i = X.length - 1; i >= 0; i--) if (DROP.indexOf(X[i].v) > -1) X.splice(i, 1);

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Салют из эмодзи внутри плашки
  window.GAP_CONFETTI = function (el, emojis) {
    emojis = emojis || ["🎉", "✨", "🏆", "💚", "⭐"];
    for (var k = 0; k < 24; k++) {
      var s = document.createElement("span");
      s.className = "confetti";
      s.textContent = emojis[k % emojis.length];
      s.style.left = rnd(10, 90) + "%";
      s.style.setProperty("--dx", rnd(-80, 80) + "px");
      s.style.animationDelay = rnd(0, 0.3) + "s";
      el.appendChild(s);
      setTimeout(function (x) { return function () { x.remove(); }; }(s), 1800);
    }
  };

  // Плашка-тост «победа» поверх плашки
  function toast(el, text) {
    var t = el.querySelector(".win-toast");
    if (!t) { t = document.createElement("div"); t.className = "win-toast"; el.appendChild(t); }
    t.textContent = text;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
  }

  var I = window.GAP_INIT;

  // ===== Лампочки: чини, пока всё не станет зелёным =====
  I.leds = function (el) {
    var leds = el.querySelectorAll(".led"), fixed = 0, pause = false;
    el.classList.add("has-hint"); el.dataset.hint = "чини красные";
    function check() {
      if (!el.querySelector(".led.broken")) {
        pause = true;
        toast(el, "🏆 Всё зелёное! Урааа! +1 к карме админа");
        window.GAP_CONFETTI(el, ["🎉", "💚", "🏆", "✨"]);
        setTimeout(function () { pause = false; }, 5000);
      }
    }
    // стартуем с пары сломанных
    leds[1].classList.add("broken"); leds[3].classList.add("broken");
    setInterval(function () {
      if (!el.isConnected || pause) return;
      var ok = Array.prototype.filter.call(leds, function (l) { return !l.classList.contains("broken"); });
      if (ok.length) ok[Math.floor(rnd(0, ok.length))].classList.add("broken");
    }, 2200);
    leds.forEach(function (l) {
      l.addEventListener("click", function () {
        if (l.classList.contains("broken")) { l.classList.remove("broken"); fixed++; el.dataset.hint = "починено: " + fixed; check(); }
        else { l.classList.add("broken"); toast(el, "Зачем ты сломал рабочую?! 😤"); }
      });
    });
  };

  // ===== Порты: два финала — всё открыто или всё закрыто =====
  I.ports = function (el) {
    var cells = el.querySelectorAll(".grid i");
    el.classList.add("has-hint"); el.dataset.hint = "открой все или закрой все";
    function check() {
      var closed = el.querySelectorAll(".grid i.closed").length, open = el.querySelectorAll(".grid i.open").length;
      if (open === cells.length) { el.dataset.done = "1"; toast(el, "🔓 Всё открыто! Безопасник уже бежит к тебе 🏃 Победа?"); window.GAP_CONFETTI(el, ["🔓", "🏃", "🎉"]); }
      else if (closed === cells.length) { el.dataset.done = "1"; toast(el, "🔒 Полная изоляция. Хакеры плачут. Победа!"); window.GAP_CONFETTI(el, ["🔒", "🛡", "🏆"]); }
      else el.dataset.hint = "открыто " + open + " · закрыто " + closed;
    }
    cells.forEach(function (p) {
      p.style.cursor = "pointer";
      if (!p.className) p.className = "open";
      p.addEventListener("click", function () {
        if (el.dataset.done) { delete el.dataset.done; }
        p.className = p.className === "closed" ? "open" : "closed";
        check();
      });
    });
  };

  // ===== Стойка: нормальная анимация пролитого кофе (капли по фасаду + лужа) =====
  var origRack = I.rack;
  I.rack = function (el) {
    origRack(el);
    var frame = el.querySelector(".rack-frame"), cup = el.querySelector(".rack-cup");
    cup.addEventListener("click", function () {
      var spill = document.createElement("div");
      spill.className = "coffee-spill";
      for (var k = 0; k < 7; k++) {
        var d = document.createElement("i");
        d.style.left = rnd(55, 95) + "%";
        d.style.animationDelay = (0.3 + k * 0.25) + "s";
        d.style.setProperty("--len", rnd(60, 100) + "%");
        spill.appendChild(d);
      }
      var puddle = document.createElement("b");
      spill.appendChild(puddle);
      frame.appendChild(spill);
    });
  };

  // ===== Подсказки: вместо отдельной строки — полупрозрачный значок в углу =====
  var origLog = I.log;
  I.log = function (el) { origLog(el); };


  // ===== Спидтест: настоящий замер (пинг до сайта + скачивание 1 МБ) и инфо о браузере =====
  function put(v, label, html, init) {
    var item = { v: v, label: label, html: html, init: init };
    var idx = X.findIndex(function (x) { return x.v === v; });
    if (idx > -1) X[idx] = item; else X.push(item);
  }
  function browserInfo() {
    var ua = navigator.userAgent, b = "браузер", m;
    if ((m = ua.match(/YaBrowser\/(\d+)/))) b = "Яндекс Браузер " + m[1];
    else if ((m = ua.match(/Edg\/(\d+)/))) b = "Edge " + m[1];
    else if ((m = ua.match(/OPR\/(\d+)/))) b = "Opera " + m[1];
    else if ((m = ua.match(/Firefox\/(\d+)/))) b = "Firefox " + m[1];
    else if ((m = ua.match(/Chrome\/(\d+)/))) b = "Chrome " + m[1];
    else if ((m = ua.match(/Version\/(\d+).*Safari/))) b = "Safari " + m[1];
    var os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "ОС ?";
    var parts = [b, os];
    var hc = navigator.hardwareConcurrency;
    if (hc) parts.push(hc + (hc % 10 === 1 && hc % 100 !== 11 ? " ядро" : hc % 10 >= 2 && hc % 10 <= 4 && (hc % 100 < 10 || hc % 100 >= 20) ? " ядра" : " ядер"));
    if (navigator.deviceMemory) parts.push("≥" + navigator.deviceMemory + " ГБ ОЗУ");
    parts.push(screen.width + "×" + screen.height);
    try { parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch (e) {}
    return parts.join(" · ");
  }
  // ===== «Так, падажжи, ёбана»: мелкий текст сценария, в конце — крупно =====
  var PADAZHI = [
    ["Сервак пилим бля, шкаф собрал, коммутаторы настроил, SFP воткнул, роутер заводим бля, сетевикам написал, пинг есть, мониторинг зелёный…", "а почему на SFP лампочка не горит"],
    ["Обновление накатил, перезагрузил, сервисы поднялись бля, логи чистые, мониторинг молчит, все молчат…", "а почему сайт открывается только у меня"],
    ["Кабели уложил, стяжки подрезал, всё подписал бля, патч-панель как на картинке, фото в чат скинул, все лайкнули…", "а этот кабель откуда остался"],
    ["Бэкап настроил бля, каждую ночь зелёный, полгода крутится, всё стабильно, всё надёжно…", "а восстанавливать из него кто-нибудь пробовал"],
    ["Сервер перевёз, в стойку поставил, включил бля, загрузился, RAID зелёный, всё летает…", "а где второй блок питания"],
    ["Пароли сменил, двухфакторку включил, доступы раздал бля, инструкцию всем разослал…", "а свой пароль я куда записал"]
  ];
  put("padazhi", "так, падажжи",
    '<div class="gl-padazhi2"><div class="pz-meme"><img src="/images/work/padazhi.webp" alt="Так, падажжи, ёбана" width="300" height="298" loading="lazy" /><p class="pz-top"></p><p class="pz-twist"></p><b class="pz-punch">ТАК, ПАДАЖЖИ, ЁБАНА</b></div></div>',
    function (el) {
      var top = el.querySelector(".pz-top"), twist = el.querySelector(".pz-twist"), k = Math.floor(rnd(0, PADAZHI.length));

      function play() {
        if (!el.isConnected) return;
        var sc = PADAZHI[k++ % PADAZHI.length], i = 0;
        el.classList.remove("punch", "twist"); top.textContent = ""; twist.textContent = "";
        (function type() {
          if (!el.isConnected) return;
          if (i <= sc[0].length) { top.textContent = sc[0].slice(0, i); i += 2; return setTimeout(type, 30); }
          setTimeout(function () { twist.textContent = sc[1] + "…"; el.classList.add("twist"); }, 500);
          setTimeout(function () { el.classList.add("punch"); }, 1700);
          setTimeout(play, 6200);
        })();
      }
      play();
    });

  // ===== «Нахуйблять»: монолог сисадмина бегущими субтитрами =====
  var RANT = [
    "Блять, вот свитчи, патч-корды нахуй, блять, нахуй, блять, нахуй,",
    "серверы нахуй, блять, нахуй, ИБП нахуй, блять, нахуй.",
    "А не эта хуета нахуй, блять, обновления ёбаные нахуй,",
    "которые вы накатили нахуй, блять, в пятницу, блять.",
    "Требований дохуя, а доступов нихуя нахуй нету,",
    "нахуйблятьнахуйблятьнахуйблятьнахуй, пошли нахуй."
  ];
  put("rant", "нахуйблять (18+)",
    '<div class="gl-rant"><span class="rant-rec">🔴 REC</span><div class="rant-line"></div><small class="rant-age">18+</small></div>',
    function (el) {
      var line = el.querySelector(".rant-line"), k = 0;
      (function next() {
        if (!el.isConnected) return;
        line.classList.remove("show"); void line.offsetWidth;
        line.textContent = RANT[k++ % RANT.length];
        line.classList.add("show");
        setTimeout(next, k % RANT.length === 0 ? 4200 : 2600);
      })();
    });

  window.GAP_STATUS = {
    approved: ["log", "news", "badges", "brands", "uptime", "term", "loading", "leds", "bios", "ping", "matrix", "ports", "clippy", "rj45", "dvd", "traceroute", "htop", "morse", "rack", "cable", "packets", "snake", "crtpower", "sticky", "padazhi", "rant"],
    review: []
  };
})();
