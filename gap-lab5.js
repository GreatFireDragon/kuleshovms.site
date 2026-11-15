// Раунд 4: убираем отбракованное, доводим игры (лампочки, порты, кофе на стойке),
// общий «салют» за победу. Подключается после gap-lab4.js и gap-interact2.js.
(function () {
  var X = window.GAP_EXTRA;
  var DROP = ["tetris", "tamagotchi", "cat", "captcha", "bsod", "dialup", "win98", "jira", "wifi"];
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
  put("speedtest", "спидтест",
    '<div class="gl-speed3"><div class="sp-gauge"><svg viewBox="0 0 200 120"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#4fc3ff"/><stop offset="1" stop-color="#ff7ab6"/></linearGradient></defs><path class="track" d="M20 100 A80 80 0 0 1 180 100"/><path class="fill" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"/>' +
    [0, 1, 5, 10, 50, 100, 500, 1000].map(function (t) { var f = Math.log10(1 + t) / 3, a = Math.PI * (1 - f); return '<text class="tick" x="' + (100 + Math.cos(a) * 64).toFixed(1) + '" y="' + (100 - Math.sin(a) * 64 + 3).toFixed(1) + '">' + t + "</text>"; }).join("") +
    '<line class="needle" x1="100" y1="100" x2="100" y2="30"/><circle cx="100" cy="100" r="6"/></svg><button type="button" class="sp-go">GO</button></div>' +
    '<div class="sp-panel"><div class="sp-row"><div><small>PING</small><b class="sp-ping">—</b><em>мс</em></div><div><small>DOWNLOAD</small><b class="sp-dl">0</b><em>Мбит/с</em></div></div><p class="sp-phase">Нажмите GO, чтобы начать тест</p><div class="sp-info"></div></div></div>',
    function (el) {
      var fill = el.querySelector(".fill"), n = el.querySelector(".needle"), dl = el.querySelector(".sp-dl"), ping = el.querySelector(".sp-ping"), go = el.querySelector(".sp-go"), phase = el.querySelector(".sp-phase"), info = el.querySelector(".sp-info");
      info.innerHTML = "Сервер: <b>kuleshovms.site</b><br/>Вы: " + browserInfo();
      function show(v) {
        var f = Math.min(1, Math.log10(1 + v) / 3);
        fill.style.strokeDasharray = (f * 100) + " 100";
        n.style.transform = "rotate(" + (f * 180 - 90) + "deg)";
        dl.textContent = v >= 100 ? Math.round(v) : v.toFixed(1);
      }
      show(0); dl.textContent = "0";
      function measurePing(done) {
        var best = Infinity, k = 0;
        (function one() {
          var t0 = performance.now();
          fetch("/favicon-32.png?p=" + Math.random(), { cache: "no-store" }).then(function () {
            best = Math.min(best, performance.now() - t0);
            ping.textContent = Math.round(best);
            if (++k < 5) one(); else done();
          }).catch(function () { ping.textContent = "—"; done(); });
        })();
      }
      go.addEventListener("click", function () {
        if (el.classList.contains("running")) return;
        el.classList.add("running"); go.textContent = "…";
        show(0); dl.textContent = "0"; ping.textContent = "—";
        phase.textContent = "Измеряю пинг…";
        measurePing(function () {
          phase.textContent = "Скачиваю тестовый файл (1 МБ)…";
          var t0 = performance.now(), got = 0;
          fetch("/speedtest.bin?r=" + Math.random(), { cache: "no-store" }).then(function (res) {
            var reader = res.body.getReader();
            return (function read() {
              return reader.read().then(function (r) {
                if (r.done) return;
                got += r.value.length;
                var sec = (performance.now() - t0) / 1000;
                if (sec > 0.03) show(got * 8 / sec / 1e6);
                return read();
              });
            })();
          }).then(function () {
            var mbps = got * 8 / ((performance.now() - t0) / 1000) / 1e6;
            show(mbps);
            phase.textContent = "Готово! " + (mbps > 300 ? "Быстрее, чем Wi-Fi в любом офисе 🚀" : mbps > 50 ? "Неплохо. Сериалы потянет 📺" : "Ну такое. Как dial-up, только дороже 🐢");
          }).catch(function () { phase.textContent = "Не удалось скачать тестовый файл"; }).then(function () {
            el.classList.remove("running"); go.textContent = "ЕЩЁ";
          });
        });
      });
    });

  put("packets", "сеть офиса",
    '<div class="gl-net3"><div class="net-stage"><div class="node"><span class="ico">💻</span><small>Компьютер</small></div><div class="link l1"><i></i></div><button type="button" class="node n-sw" title="Починить"><span class="sw-box"><b>SW-01</b><span class="sw-leds"><i></i><i></i><i></i><i></i><i></i><i></i></span></span><small>👆 починить</small></button><div class="link l2"><i></i></div><div class="node"><span class="ico">🌐</span><small>Интернет</small></div><span class="cpu-meter">CPU <b>4%</b></span></div><em class="net-msg">Сеть работает. Пока.</em></div>',
    function (el) {
      var stage = el.querySelector(".net-stage"), msg = el.querySelector(".net-msg"), cpu = el.querySelector(".cpu-meter b");
      var PROBLEMS = [
        ["storm", "🌪 Широковещательный шторм! Кто воткнул кабель в два порта?!"],
        ["dns", "🔤 DNS сломан. Пакеты не знают, куда идти. It was DNS."],
        ["cable", "✂ Кабель выдернут. Пакеты падают на пол."],
        ["fw", "💾 Свитч сам решил обновить прошивку. Прямо сейчас."]
      ];
      var mode = "ok", load = 4, k = 0, fixedUntil = 0;
      function setMode(m, text) { mode = m; el.dataset.mode = m; msg.textContent = text; }
      (function send() {
        if (!el.isConnected) return;
        var p = document.createElement("span");
        p.className = "pkt"; p.textContent = mode === "dns" ? "куда?" : ["HTTP", "DNS", "ping", "мем"][Math.floor(Math.random() * 4)];
        stage.appendChild(p);
        var frames;
        if (mode === "cable") frames = [{ left: "10%", top: "45%" }, { left: "30%", top: "45%", opacity: 1 }, { left: "32%", top: "120%", opacity: 0 }];
        else if (mode === "dns") frames = [{ left: "10%", top: "45%" }, { left: "50%", top: "45%" }, { left: ["70%", "20%", "90%"][Math.floor(Math.random() * 3)], top: Math.random() < 0.5 ? "-20%" : "130%", opacity: 0 }];
        else if (mode === "fw") frames = [{ left: "10%", top: "45%" }, { left: "46%", top: "45%", opacity: 1 }, { left: "48%", top: "45%", opacity: 0 }];
        else frames = [{ left: "10%", top: "45%" }, { left: "50%", top: "45%" }, { left: "88%", top: "45%" }];
        p.animate(frames, { duration: mode === "storm" ? rnd(250, 600) : 1800, easing: "linear" }).onfinish = function () { p.remove(); };
        setTimeout(send, mode === "storm" ? 40 : rnd(450, 900));
      })();
      var cycle = setInterval(function () {
        if (!el.isConnected) return clearInterval(cycle);
        if (Date.now() < fixedUntil) return;
        if (mode === "ok") { var pr = PROBLEMS[k++ % PROBLEMS.length]; setMode(pr[0], pr[1] + " — жми на свитч"); }
        else setMode("ok", "Само прошло. Подозрительно.");
      }, 4500);
      setInterval(function () {
        if (!el.isConnected) return;
        var target = mode === "storm" ? 100 : mode === "fw" ? 60 : 4;
        load += (target - load) * 0.3 + (mode === "storm" ? rnd(-5, 5) : 0);
        cpu.textContent = Math.round(Math.max(0, Math.min(100, load))) + "%";
        el.classList.toggle("hot", load > 80);
      }, 300);
      el.querySelector(".n-sw").addEventListener("click", function () {
        var was = mode;
        setMode("ok", was === "ok" ? "Всё и так работает. Не трогай 😑" : "🔧 Починил! Можно пить кофе ☕");
        fixedUntil = Date.now() + 6000;
        if (was !== "ok" && window.GAP_CONFETTI) window.GAP_CONFETTI(el, ["🔧", "☕", "✅"]);
      });
    });


  // ===== «Так, падажжи, ёбана»: мелкий текст сценария, в конце — крупно =====
  var PADAZHI = [
    "Сервак пилим бля, шкаф собрал, коммутаторы настроил, SFP воткнул, роутер заводим бля, сетевикам написал, VLAN-ы прописал, DHCP поднял, камеры по портам раскидал, пинг есть, трассировка есть, мониторинг зелёный, бэкап настроил, документацию даже написал бля, всё работает, иду домой…",
    "Обновление накатил, перезагрузил, сервисы поднялись, логи чистые, мониторинг молчит, пользователи молчат, телефон молчит, начальник молчит, все молчат, даже принтер молчит бля, никто не звонит уже час, тишина полная, красота…",
    "Кабели уложил, стяжечки подрезал, маркировку наклеил, патч-панель подписал, схему нарисовал, фото сделал, в чат скинул, все лайкнули, иду пить кофе, захожу обратно в серверную, а там кто-то ноутбук подключает прямо из середины бля…",
    "Пароль сменили, политики раскатили, двухфакторку включили, доступы раздали, инструкцию написали, всем разослали, все прочитали, все поняли, все подтвердили, вопросов ноль, звонков ноль, тикетов ноль…",
    "Перевёз сервер в новую стойку, подключил, включил, загрузился, сеть есть, диски есть, RAID зелёный, виртуалки стартанули, сайт открывается, почта ходит, база отвечает, всё быстрее чем было, вообще ни одной ошибки…"
  ];
  put("padazhi", "так, падажжи",
    '<div class="gl-padazhi"><img src="/images/work/padazhi.webp" alt="Так, падажжи, ёбана" width="300" height="298" loading="lazy" /><div class="pz-text"><p class="pz-flow"></p><b class="pz-punch">ТАК, ПАДАЖЖИ, ЁБАНА</b></div></div>',
    function (el) {
      var flow = el.querySelector(".pz-flow"), k = Math.floor(rnd(0, PADAZHI.length));
      function play() {
        if (!el.isConnected) return;
        var text = PADAZHI[k++ % PADAZHI.length], i = 0;
        el.classList.remove("punch"); flow.textContent = "";
        (function type() {
          if (!el.isConnected) return;
          if (i <= text.length) { flow.textContent = text.slice(0, i); i += 2; return setTimeout(type, 28); }
          setTimeout(function () { el.classList.add("punch"); setTimeout(play, 4200); }, 500);
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
    approved: ["log", "news", "badges", "brands", "uptime", "term", "loading", "leds", "bios", "ping", "matrix", "ports", "clippy", "rj45", "dvd", "traceroute", "htop", "speedtest", "morse", "rack", "cable", "packets", "snake", "crtpower", "sticky", "padazhi", "rant"],
    review: []
  };
})();
