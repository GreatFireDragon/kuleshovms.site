// Вставки-разбивки между блоками: варианты (GAP_EXTRA), интерактив (GAP_INIT), футер F-клавиш.
// Исторически собрано из нескольких раундов правок; каждый раунд — свой IIFE, порядок важен:
// поздние блоки перекрывают одноимённые варианты/обработчики ранних. Ядро — gaps-core.js.


// ===== раунд 1: базовые вставки =====
// ping, matrix, traceroute, ports, clippy, rj45, dvd → window.GAP_EXTRA
(function () {
  var X = (window.GAP_EXTRA = []);
  function add(v, label, html, init) { X.push({ v: v, label: label, html: html, init: init }); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function every(el, ms, fn) {
    // работает только пока элемент в документе
    var id = setInterval(function () { if (!el.isConnected) return clearInterval(id); fn(); }, ms);
    fn();
  }

  // 1. Пинг-график
  add("ping", "пинг-график",
    '<div class="gl-panel gl-ping"><span>ping 8.8.8.8</span><svg viewBox="0 0 300 40" preserveAspectRatio="none"><polyline points=""/></svg><b class="ms">4 ms</b><em class="note"></em></div>',
    function (el) {
      var pts = []; for (var i = 0; i < 60; i++) pts.push(rnd(4, 9));
      var pl = el.querySelector("polyline"), ms = el.querySelector(".ms"), note = el.querySelector(".note");
      every(el, 300, function () {
        var spike = Math.random() < 0.06;
        var val = spike ? rnd(30, 38) : rnd(3, 9);
        pts.shift(); pts.push(val);
        pl.setAttribute("points", pts.map(function (p, i) { return (i * 5) + "," + (40 - p) }).join(" "));
        ms.textContent = Math.round(val * 3) + " ms";
        if (spike) { note.textContent = "опять провайдер"; setTimeout(function () { note.textContent = ""; }, 1500); }
      });
    });

  // 2. Янтарная «матрица»
  add("matrix", "матрица",
    '<div class="gl-panel gl-matrix"><canvas height="70"></canvas></div>',
    function (el) {
      var c = el.querySelector("canvas"), ctx = c.getContext("2d");
      var words = ["DNS", "ping", "sudo", "ssh", "404", "OK"];
      var cols, drops, visible = true;
      function size() { c.width = c.clientWidth || 600; cols = Math.floor(c.width / 12); drops = []; for (var i = 0; i < cols; i++) drops.push(rnd(-10, 6)); }
      size();
      if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(c);
      every(el, 70, function () {
        if (!visible) return;
        ctx.fillStyle = "rgba(23,17,10,0.25)"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = "12px monospace";
        for (var i = 0; i < cols; i++) {
          var ch = Math.random() < 0.02 ? pick(words) : String.fromCharCode(0x30A0 + Math.random() * 96);
          ctx.fillStyle = ch.length > 1 ? "#fff1c1" : "#ffb347";
          ctx.fillText(ch, i * 12, drops[i] * 12);
          if (drops[i] * 12 > c.height && Math.random() > 0.9) drops[i] = 0;
          drops[i] += 1;
        }
      });
    });

  // 17. Traceroute
  add("traceroute", "traceroute",
    '<div class="gl-panel gl-trace"><pre class="js-trace"></pre></div>',
    function (el) {
      window.GAP_TYPER(el.querySelector(".js-trace"), [
        "$ traceroute kuleshovms.site",
        " 1  office-gw        1 ms",
        " 2  провайдер        6 ms",
        " 3  * * *  (тут кто-то спит)",
        " 4  kuleshovms.site  4 ms  ✓"
      ], 45);
    });

  // 22. Сканер портов
  var ports = [22, 23, 53, 80, 161, 443, 3389, 5432, 8080, 8291, 9090, 10050];
  add("ports", "сканер портов",
    '<div class="gl-panel gl-ports"><span>$ nmap office.lan</span><div class="grid">' + ports.map(function (p) { return "<i>" + p + "</i>"; }).join("") + "</div></div>",
    function (el) {
      var cells = el.querySelectorAll(".grid i");
      every(el, 500, function () { if (el.dataset.done) return; var c = pick(cells); c.className = Math.random() < 0.75 ? "open" : "closed"; });
    });

  // 24. Скрепка-помощник
  add("clippy", "скрепка-помощник",
    '<div class="gl-clippy"><span class="clip">📎</span><div class="bubble">Похоже, вы читаете резюме. Хотите нанять этого человека?<div><a href="https://t.me/dnsit1" target="_blank">Да</a><a href="https://t.me/dnsit1" target="_blank">Конечно да</a></div></div></div>');

  // 26. Порт RJ45
  add("rj45", "порт RJ45",
    '<div class="gl-panel gl-rj45"><span class="jack"><i class="link"></i><i class="act"></i><b></b></span><span>link up · 1000 Мбит/с · full-duplex · кабель: обжат с любовью</span></div>');

  // 29. DVD-логотип
  add("dvd", "DVD-заставка",
    '<div class="gl-dvd"><b class="logo">KuleshovMS</b><span class="corner">в угол: 0</span></div>',
    function (el) {
      var b = el.querySelector(".logo"), cnt = el.querySelector(".corner"), x = 10, y = 5, vx = 2, vy = 1, hits = 0;
      var colors = ["#ffb347", "#8dff9d", "#4fc3ff", "#ff7ab6", "#fff1c1"];
      every(el, 30, function () {
        var W = el.clientWidth - b.offsetWidth, H = el.clientHeight - b.offsetHeight, hx = false, hy = false;
        if (el.dataset.corner) { delete el.dataset.corner; x = W; y = H; vx = Math.abs(vx); vy = Math.abs(vy); }
        x += vx; y += vy;
        if (x <= 0 || x >= W) { vx = -vx; hx = true; x = Math.max(0, Math.min(W, x)); }
        if (y <= 0 || y >= H) { vy = -vy; hy = true; y = Math.max(0, Math.min(H, y)); }
        if (hx || hy) b.style.color = pick(colors);
        if (hx && hy) cnt.textContent = "в угол: " + (++hits) + " 🎉";
        b.style.transform = "translate(" + x + "px," + y + "px)";
      });
    });

})();

// ===== раунд 2 =====
// htop, morse; список «консольных» вставок (GAP_CONSOLE)
(function () {
  var X = window.GAP_EXTRA || (window.GAP_EXTRA = []);
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function every(el, ms, fn) {
    var id = setInterval(function () { if (!el.isConnected) return clearInterval(id); fn(); }, ms);
    fn();
  }
  function frame(el, fn) {
    // requestAnimationFrame, пока элемент в документе
    (function loop(t) { if (!el.isConnected) return; fn(t); requestAnimationFrame(loop); })(performance.now());
  }

  function put(v, label, html, init) {
    var item = { v: v, label: label, html: html, init: init };
    var idx = X.findIndex(function (x) { return x.v === v; });
    if (idx > -1) X[idx] = item; else X.push(item);
  }

  // 18. htop: плотная раскладка, полосы во всю ширину
  put("htop", "htop",
    '<div class="gl-panel gl-htop2"><div class="cores"></div><table class="procs"><thead><tr><th>PID</th><th>CPU%</th><th>COMMAND</th></tr></thead><tbody></tbody></table></div>',
    function (el) {
      var cores = el.querySelector(".cores"), tb = el.querySelector("tbody");
      cores.innerHTML = [1, 2, 3, 4].map(function (i) { return '<div class="core"><span>' + i + '</span><b><i></i></b><em>0%</em></div>'; }).join("");
      var names = ["fix_kassa.exe", "coffee.service", "zabbix_agentd", "ping_everything", "cursor --vibe", "nginx: worker", "panic.sh"];
      every(el, 900, function () {
        cores.querySelectorAll(".core").forEach(function (c) {
          var p = rnd(3, 99); c.querySelector("i").style.width = p + "%"; c.querySelector("em").textContent = Math.round(p) + "%";
          c.querySelector("i").className = p > 85 ? "hot" : "";
        });
        tb.innerHTML = names.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4).map(function (n) {
          return "<tr><td>" + Math.floor(rnd(1000, 9999)) + "</td><td>" + rnd(0, 99).toFixed(1) + "</td><td>" + n + "</td></tr>";
        }).join("");
      });
    });

  // 38. Морзянка: «ПОШЁЛ НАХ…» и обрыв связи
  var MORSE = { "П": ".--.", "О": "---", "Ш": "----", "Ё": ".", "Л": ".-..", "Н": "-.", "А": ".-", "Х": "...." };
  put("morse", "морзянка",
    '<div class="gl-panel gl-morse"><i class="lamp"></i><span class="code"></span><b class="decoded"></b></div>',
    function (el) {
      var lamp = el.querySelector(".lamp"), code = el.querySelector(".code"), dec = el.querySelector(".decoded");
      var msg = "ПОШЁЛ НАХ", seq = [];
      msg.split("").forEach(function (ch) {
        if (ch === " ") { seq.push([" ", " "]); return; }
        MORSE[ch].split("").forEach(function (s) { seq.push([s, ch]); });
        seq.push(["/", ch]);
      });
      var k = 0, shown = "";
      (function step() {
        if (!el.isConnected) return;
        if (k >= seq.length) {
          lamp.classList.remove("on"); lamp.classList.add("dead");
          dec.textContent = shown + "…"; code.textContent += "  — — — [ОБРЫВ СВЯЗИ] 📡✂";
          setTimeout(function () { k = 0; shown = ""; code.textContent = ""; dec.textContent = ""; lamp.classList.remove("dead"); step(); }, 4000);
          return;
        }
        var x = seq[k++];
        if (x[0] === "/") { shown += x[1]; dec.textContent = shown; return setTimeout(step, 300); }
        if (x[0] === " ") { shown += " "; code.textContent += " / "; return setTimeout(step, 500); }
        code.textContent += x[0];
        lamp.classList.add("on");
        setTimeout(function () { lamp.classList.remove("on"); setTimeout(step, 140); }, x[0] === "-" ? 330 : 120);
      })();
    });

  // консольные: на странице одновременно только одна из них
  window.GAP_CONSOLE = ["term", "bios", "traceroute", "log"];
})();

// ===== раунд 3 + футер =====
// packets, snake, crtpower, sticky + футер F-клавиш (FOOTER_VARIANTS.fkeys)
(function () {
  var X = window.GAP_EXTRA;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function every(el, ms, fn) { var id = setInterval(function () { if (!el.isConnected) return clearInterval(id); fn(); }, ms); fn(); }
  function frame(el, fn) { (function loop(t) { if (!el.isConnected) return; fn(t); requestAnimationFrame(loop); })(performance.now()); }
  function put(v, label, html, init) {
    var item = { v: v, label: label, html: html, init: init };
    var idx = X.findIndex(function (x) { return x.v === v; });
    if (idx > -1) X[idx] = item; else X.push(item);
  }

  // ===== 22. Сеть: красивые узлы, события по кнопкам, шторм с лагами =====
  put("packets", "сеть офиса",
    '<div class="gl-net2"><div class="net-stage"><div class="node n-kassa"><span class="ico">💻</span><small>Компьютер</small></div><div class="link l1"><i></i></div><div class="node n-sw"><span class="sw-box"><b>SW-01</b><span class="sw-leds"><i></i><i></i><i></i><i></i><i></i><i></i></span></span><small>Коммутатор</small></div><div class="link l2"><i></i></div><div class="node n-srv"><span class="ico">🌐</span><small>Интернет</small></div><div class="cpu-meter">CPU <b>4%</b></div></div><div class="net-btns"><button type="button" data-e="storm">🌪 Шторм</button><button type="button" data-e="dns">🔤 Сломать DNS</button><button type="button" data-e="cable">✂ Выдернуть кабель</button><button type="button" data-e="fw">💾 Обновить прошивку</button><button type="button" data-e="fix">🔧 Починить всё</button></div><em class="net-msg">Сеть работает. Пока.</em></div>',
    function (el) {
      var stage = el.querySelector(".net-stage"), msg = el.querySelector(".net-msg"), cpu = el.querySelector(".cpu-meter b");
      var mode = "ok", load = 4;
      function setMode(m, text) { mode = m; el.dataset.mode = m; msg.textContent = text; }
      function send() {
        if (!el.isConnected) return;
        var p = document.createElement("span");
        p.className = "pkt"; p.textContent = mode === "dns" ? "куда?" : pick(["HTTP", "DNS", "ping", "мем"]);
        stage.appendChild(p);
        var frames;
        if (mode === "cable") frames = [{ left: "10%", top: "45%" }, { left: "30%", top: "45%", opacity: 1 }, { left: "32%", top: "120%", opacity: 0 }];
        else if (mode === "dns") frames = [{ left: "10%", top: "45%" }, { left: "50%", top: "45%" }, { left: pick(["70%", "20%", "90%"]), top: pick(["-20%", "130%"]), opacity: 0 }];
        else if (mode === "fw") frames = [{ left: "10%", top: "45%" }, { left: "46%", top: "45%", opacity: 1 }, { left: "48%", top: "45%", opacity: 0 }];
        else frames = [{ left: "10%", top: "45%" }, { left: "50%", top: "45%" }, { left: "88%", top: "45%" }];
        var dur = mode === "storm" ? rnd(250, 600) : 1800;
        var a = p.animate(frames, { duration: dur, easing: "linear" });
        a.onfinish = function () { p.remove(); };
        setTimeout(send, mode === "storm" ? 40 : rnd(450, 900));
      }
      send();
      every(el, 300, function () {
        var target = mode === "storm" ? 100 : mode === "fw" ? 60 : 4;
        load += (target - load) * 0.3 + (mode === "storm" ? rnd(-5, 5) : 0);
        cpu.textContent = Math.round(Math.max(0, Math.min(100, load))) + "%";
        el.classList.toggle("hot", load > 80);
      });
      el.querySelectorAll(".net-btns button").forEach(function (b) {
        b.addEventListener("click", function () {
          var e = b.dataset.e;
          if (e === "storm") setMode("storm", "🌪 Широковещательный шторм! Кто воткнул кабель в два порта?! Всё лагает…");
          if (e === "dns") setMode("dns", "🔤 DNS сломан. Пакеты не знают, куда идти. It was DNS.");
          if (e === "cable") setMode("cable", "✂ Кабель выдернут. Пакеты падают на пол. Уборщица недовольна.");
          if (e === "fw") { setMode("fw", "💾 Обновление прошивки… НЕ ВЫКЛЮЧАЙТЕ… 37%…"); setTimeout(function () { if (mode === "fw") setMode("ok", "💾 Прошивка обновлена. Ничего не поменялось, но теперь версия 2.0."); }, 4000); }
          if (e === "fix") setMode("ok", "🔧 Всё починил. Можно идти пить кофе.");
        });
      });
    });

  // ===== 28. Змейка: еда рисуется пикселями (эмодзи на канвасе не везде) =====
  put("snake", "змейка",
    '<div class="gl-snake2"><canvas></canvas><div class="sn-bar"><b class="sn-score">SCORE 0</b><span class="sn-speed"><button type="button" data-ms="130" class="on">1×</button><button type="button" data-ms="45">3×</button><button type="button" data-ms="13">10×</button></span><b class="sn-best">BEST 0</b></div></div>',
    function (el) {
      var c = el.querySelector("canvas"), ctx = c.getContext("2d"), sc = el.querySelector(".sn-score"), best = el.querySelector(".sn-best");
      var S = 14, W, H = 6, snake, food, score = 0, hi = 0, speed = 130;
      function newFood() { do { food = [Math.floor(rnd(0, W)), Math.floor(rnd(0, H))]; } while (snake.some(function (p) { return p[0] === food[0] && p[1] === food[1]; })); }
      function reset() { W = Math.max(20, Math.floor((c.clientWidth || el.clientWidth || 600) / S)); c.width = W * S; c.height = H * S; snake = [[5, 3], [4, 3], [3, 3]]; newFood(); score = 0; }
      reset();
      el.querySelectorAll(".sn-speed button").forEach(function (b) {
        b.addEventListener("click", function () {
          speed = +b.dataset.ms;
          el.querySelectorAll(".sn-speed button").forEach(function (x) { x.classList.toggle("on", x === b); });
        });
      });
      (function tick() {
        if (!el.isConnected) return;
        var h = snake[0], dx = Math.sign(food[0] - h[0]), dy = Math.sign(food[1] - h[1]);
        var nx = dx ? [h[0] + dx, h[1]] : [h[0], h[1] + dy];
        if (snake.some(function (p) { return p[0] === nx[0] && p[1] === nx[1]; })) nx = [h[0], (h[1] + 1) % H];
        snake.unshift(nx);
        if (nx[0] === food[0] && nx[1] === food[1]) { score++; hi = Math.max(hi, score); if (snake.length > 25) reset(); else newFood(); }
        else snake.pop();
        sc.textContent = "SCORE " + score; best.textContent = "BEST " + hi;
        ctx.fillStyle = "#17110a"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "rgba(255,179,71,0.06)";
        for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) if ((x + y) % 2) ctx.fillRect(x * S, y * S, S, S);
        // яблоко: красный квадрат + зелёный листик
        var fx = food[0] * S, fy = food[1] * S;
        ctx.fillStyle = "#ff3b30"; ctx.fillRect(fx + 2, fy + 4, S - 4, S - 5);
        ctx.fillStyle = "#ff8a80"; ctx.fillRect(fx + 4, fy + 6, 2, 2);
        ctx.fillStyle = "#3dff6a"; ctx.fillRect(fx + S / 2, fy + 1, 3, 3);
        snake.forEach(function (p, i) {
          ctx.fillStyle = i ? "#d99a2b" : "#ffb347";
          ctx.fillRect(p[0] * S + 1, p[1] * S + 1, S - 2, S - 2);
        });
        ctx.fillStyle = "#17110a"; ctx.fillRect(snake[0][0] * S + 4, snake[0][1] * S + 4, 2, 2); ctx.fillRect(snake[0][0] * S + 8, snake[0][1] * S + 4, 2, 2);
        setTimeout(tick, speed);
      })();
    });

  // ===== 33. CRT: панель монитора с кнопкой, ручками яркости/контраста =====
  put("crtpower", "панель CRT-монитора",
    '<div class="gl-crt2"><span class="brand">KuleshovTron 15″ <small>Flatron-ish</small></span><span class="knobs"><label><button type="button" class="knob" data-k="b">☼</button><small>ЯРК</small></label><label><button type="button" class="knob" data-k="c">◐</button><small>КОНТР</small></label><label><button type="button" class="knob" data-k="d">⟲</button><small>DEGAUSS</small></label></span><span class="pwr-wrap"><i class="pwr-led"></i><button type="button" class="pwr-btn" aria-label="Питание монитора">⏻</button></span><em class="crt-msg">Не трогайте кнопку питания. Серьёзно.</em></div>',
    function (el) {
      var msg = el.querySelector(".crt-msg"), html = document.documentElement, b = 1, c = 1;
      function apply() { document.body.style.filter = "brightness(" + b + ") contrast(" + c + ")"; }
      el.querySelector('[data-k="b"]').addEventListener("click", function () { b = b >= 1.4 ? 0.7 : +(b + 0.15).toFixed(2); apply(); msg.textContent = "Яркость: " + Math.round(b * 100) + "%"; });
      el.querySelector('[data-k="c"]').addEventListener("click", function () { c = c >= 1.6 ? 0.8 : +(c + 0.2).toFixed(2); apply(); msg.textContent = "Контраст: " + Math.round(c * 100) + "%"; });
      el.querySelector('[data-k="d"]').addEventListener("click", function () { html.classList.add("degauss"); msg.textContent = "ВЖЖЖУУУМ! Размагничивание"; setTimeout(function () { html.classList.remove("degauss"); }, 900); });
      el.querySelector(".pwr-btn").addEventListener("click", function () {
        if (html.classList.contains("crt-off")) return;
        html.classList.add("crt-off"); el.classList.add("off");
        setTimeout(function () { html.classList.remove("crt-off"); html.classList.add("crt-on"); el.classList.remove("off"); }, 1700);
        setTimeout(function () { html.classList.remove("crt-on"); b = 1; c = 1; document.body.style.filter = ""; msg.textContent = "Я же просил не трогать 😑 (настройки сброшены)"; }, 2600);
      });
    });

  // ===== 34. Стикеры на мониторе: сорви — под ним ещё один =====
  var STICKERS = [
    "Это временное решение (2019)",
    "Работает? НЕ ЛЕЗЬ.",
    "Пятница. Ничего. Не. Трогать.",
    "Тут был пароль. Безопасник его съел.",
    "Звонить только если горит. Буквально.",
    "Кофемашина — тоже критическая инфраструктура",
    "Под этим стикером ничего нет. Хватит."
  ];
  put("sticky", "стикеры на мониторе",
    '<div class="gl-sticky3"><div class="monitor"><div class="screen">C:\\&gt;_</div><div class="pile"></div></div><em class="st-msg">👆 сорви стикер</em></div>',
    function (el) {
      var pile = el.querySelector(".pile"), msg = el.querySelector(".st-msg"), k = 0, colors = ["#fff475", "#ffb3c7", "#b5f5a6", "#a7d8ff", "#ffd59e"];
      function addSticker() {
        var s = document.createElement("button");
        s.type = "button"; s.className = "stk";
        s.style.background = colors[k % colors.length];
        s.style.zIndex = 100 - k;
        s.style.transform = "rotate(" + rnd(-8, 8).toFixed(1) + "deg)";
        s.textContent = STICKERS[k % STICKERS.length];
        pile.appendChild(s);
        k++;
        s.addEventListener("click", function () {
          if (s.classList.contains("fall")) return;
          s.classList.add("fall");
          msg.textContent = k >= STICKERS.length ? "Стикеры кончились. Монитор впервые увидел свет ☀" : "Под ним — ещё один стикер. Классика.";
          setTimeout(function () { s.remove(); }, 900);
          if (k < STICKERS.length) addSticker();
        });
      }
      addSticker(); addSticker();
    });

  // ===== Футер: F-клавиши в стиле Norton Commander =====
  window.FOOTER_VARIANTS = window.FOOTER_VARIANTS || {};
  window.FOOTER_VARIANTS.fkeys = {
    label: "A F-клавиши",
    html: '<nav class="ft-nc" aria-label="Быстрые клавиши">' +
      '<a href="#about-intro" data-key="F1"><b>1</b><span>Обо мне</span></a>' +
      '<a href="#experience" data-key="F2"><b>2</b><span>Опыт</span></a>' +
      '<a href="/projects/" data-key="F3"><b>3</b><span>Проекты</span></a>' +
      '<a href="https://t.me/dnsit1" target="_blank" data-key="F4"><b>4</b><span>Telegram</span></a>' +
      '<a href="#top" data-key="F10" data-top="1"><b>10</b><span>Наверх</span></a>' +
      '</nav>',
    init: function (box) {
      function goTop(e) { if (e) e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
      box.querySelector('[data-top]').addEventListener("click", goTop);
      document.addEventListener("keydown", function (e) {
        if (e.target.closest && e.target.closest("input, textarea")) return;
        var a = box.querySelector('[data-key="' + e.key + '"]');
        if (!a) return;
        e.preventDefault();
        a.classList.add("pressed"); setTimeout(function () { a.classList.remove("pressed"); }, 200);
        if (a.dataset.top) return goTop();
        if (a.target === "_blank") window.open(a.href, "_blank"); else location.href = a.href;
      });
    }
  };
  window.FOOTER_DEFAULT = "fkeys";
})();

// ===== интерактив: DVD =====
// gaps-core.js вызывает GAP_INIT[имя](элемент) для шаблонных и доп. вставок
(function () {
  var I = (window.GAP_INIT = window.GAP_INIT || {});
  function hint(el, text) {
    var h = document.createElement("small");
    h.className = "gl-hint";
    h.textContent = "👆 " + text;
    el.appendChild(h);
  }

  I.dvd = function (el) {
    hint(el, "кликни — попадём в угол");
    el.addEventListener("click", function () { el.dataset.corner = "1"; });
  };
})();

// ===== интерактив шаблонных вставок =====
// стойка, кабель, лог, загрузка, аптайм, RJ45, матрица, пинг
(function () {
  var I = (window.GAP_INIT = window.GAP_INIT || {});
  function hint(el, text) {
    var h = document.createElement("small");
    h.className = "gl-hint";
    h.textContent = "👆 " + text;
    el.appendChild(h);
    return h;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // ===== Стойка: стакан кофе, который можно опрокинуть. Насовсем. =====
  I.rack = function (el) {
    var frame = el.querySelector(".rack-frame");
    var status = document.createElement("div");
    status.className = "rack-status";
    status.textContent = "Все системы в норме";
    frame.appendChild(status);
    var cup = document.createElement("button");
    cup.type = "button";
    cup.className = "rack-cup";
    cup.title = "Не трогай кофе";
    cup.innerHTML = '<span class="cup">☕</span><span class="spill"></span>';
    frame.appendChild(cup);
    hint(el, "диски, порты, ИБП… и кофе на стойке");
    var dead = false;
    function say(t) { status.textContent = t; }

    el.querySelectorAll(".ports").forEach(function (ports, s) {
      ports.querySelectorAll("i").forEach(function (p, k) {
        p.addEventListener("click", function () {
          if (dead) return;
          p.classList.toggle("down");
          say("SW-0" + (s + 1) + " порт " + (k + 1) + ": " + (p.classList.contains("down") ? "link down 😱 камеры ослепли" : "link up ✓"));
        });
      });
    });
    var nvr = el.querySelector(".u-server b");
    el.querySelectorAll(".bays i").forEach(function (d, k) {
      d.addEventListener("click", function () {
        if (dead) return;
        d.classList.toggle("pulled");
        var n = el.querySelectorAll(".bays i.pulled").length;
        nvr.textContent = n ? "NVR ⚠" : "NVR";
        say(n === 0 ? "RAID восстановлен ✓" : n === 1 ? "Диск " + (k + 1) + " выдернут: RAID degraded" : "Выдернуто дисков: " + n + ". Видеоархив: всё, прощай 💀");
      });
    });
    el.querySelector(".u-ups").addEventListener("click", function () {
      if (dead || frame.classList.contains("off")) return;
      frame.classList.add("off");
      say("ИБП выключен. Тишина… слышно, как плачет дежурный");
      setTimeout(function () { frame.classList.remove("off"); frame.classList.add("boot"); say("Загрузка…"); }, 1800);
      setTimeout(function () { frame.classList.remove("boot"); say("Всё поднялось. Почти всё."); }, 3200);
    });
    cup.addEventListener("click", function () {
      if (dead) return;
      dead = true;
      el.classList.add("spilling");
      say("Ой.");
      setTimeout(function () { say("Кофе затекает в коммутаторы…"); el.classList.add("shorting"); }, 900);
      setTimeout(function () { say("⚡ КЗ! ⚡ КЗ! ⚡"); }, 1900);
      setTimeout(function () { el.classList.add("boom"); say("💥"); }, 2700);
      setTimeout(function () {
        el.classList.remove("boom", "shorting");
        el.classList.add("dead");
        say("💀 Стойка мертва. Кофе был без сахара. Обновите страницу, чтобы купить новую.");
      }, 3700);
    });
  };

  // ===== Кабель: много пакетов, цвет натяжения, рвётся навсегда =====
  I.cable = function (el) {
    el.innerHTML = '<canvas class="rope" height="90"></canvas><em class="rope-msg">👆 схвати кабель и тяни. Сильно.</em>';
    el.classList.add("rope-wrap");
    var c = el.querySelector("canvas"), ctx = c.getContext("2d"), msg = el.querySelector(".rope-msg");
    var N = 28, pts = [], cons = [], grab = -1, broken = false, sparks = [], packets = [], W;
    W = c.width = c.clientWidth || 600;
    for (var i = 0; i < N; i++) { var x = 24 + (W - 48) * i / (N - 1); pts.push({ x: x, y: 26, px: x, py: 26 }); }
    var seg = (W - 48) / (N - 1) * 1.012;
    for (var j = 0; j < N - 1; j++) cons.push({ a: j, b: j + 1, len: seg });
    for (var k = 0; k < 7; k++) packets.push(k * (N - 1) / 7);

    function pos(e) { var r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; }
    c.addEventListener("pointerdown", function (e) {
      if (broken) return;
      var p = pos(e), best = -1, bd = 900;
      pts.forEach(function (q, i) { var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y); if (d < bd && i > 0 && i < N - 1) { bd = d; best = i; } });
      if (best > -1) { grab = best; try { c.setPointerCapture(e.pointerId); } catch (x) {} }
    });
    c.addEventListener("pointermove", function (e) { if (grab < 0) return; var p = pos(e); pts[grab].x = p.x; pts[grab].y = p.y; });
    c.addEventListener("pointerup", function () { grab = -1; });

    function tensionColor(t) {
      // t: 1 = норма, 1.45 = разрыв
      var f = Math.max(0, Math.min(1, (t - 1.0) / 0.45));
      var r = Math.round(74 + (255 - 74) * f), g = Math.round(144 + (60 - 144) * Math.max(0, f * 2 - 1) + (200 - 144) * Math.min(f * 2, 1) * (1 - f)), b = Math.round(217 * (1 - f));
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    function snap(at) {
      broken = true;
      cons = cons.filter(function (k2) { return k2.a !== at; });
      for (var i2 = 0; i2 < 40; i2++) sparks.push({ x: pts[at].x, y: pts[at].y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.9) * 8, life: 50 });
      msg.textContent = "💀 Кабель порван. Офис без интернета навсегда. Бухгалтерия плачет. (Обновите страницу)";
      el.classList.add("rope-dead");
      grab = -1;
    }
    (function loop() {
      if (!el.isConnected) return;
      pts.forEach(function (p, i) {
        if (i === 0 || i === N - 1 || i === grab) return;
        var vx = (p.x - p.px) * 0.98, vy = (p.y - p.py) * 0.98;
        p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + 0.45;
        if (p.y > 84) p.y = 84;
      });
      for (var it = 0; it < 8; it++) cons.forEach(function (k2) {
        var A = pts[k2.a], B = pts[k2.b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, diff = (d - k2.len) / d / 2;
        var lockA = k2.a === 0 || k2.a === grab, lockB = k2.b === N - 1 || k2.b === grab;
        if (!lockA) { A.x += dx * diff * (lockB ? 2 : 1); A.y += dy * diff * (lockB ? 2 : 1); }
        if (!lockB) { B.x -= dx * diff * (lockA ? 2 : 1); B.y -= dy * diff * (lockA ? 2 : 1); }
      });
      var worst = 1, worstAt = N >> 1;
      cons.forEach(function (k2) {
        var t = Math.hypot(pts[k2.b].x - pts[k2.a].x, pts[k2.b].y - pts[k2.a].y) / k2.len;
        k2.t = t; if (t > worst) { worst = t; worstAt = k2.a; }
      });
      if (!broken) {
        if (worst > 1.45) snap(worstAt);
        else if (worst > 1.22) msg.textContent = "⚠ Натяжение! Кабель краснеет от стыда…";
        else if (grab > -1) msg.textContent = "Тянешь кабель. Бухгалтерия нервничает.";
        else msg.textContent = "👆 схвати кабель и тяни. Сильно.";
      }
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineCap = "round";
      cons.forEach(function (k2) {
        ctx.strokeStyle = "#1d3f66"; ctx.lineWidth = 9;
        ctx.beginPath(); ctx.moveTo(pts[k2.a].x, pts[k2.a].y); ctx.lineTo(pts[k2.b].x, pts[k2.b].y); ctx.stroke();
        ctx.strokeStyle = broken ? "#6b6b6b" : tensionColor(k2.t || 1); ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(pts[k2.a].x, pts[k2.a].y); ctx.lineTo(pts[k2.b].x, pts[k2.b].y); ctx.stroke();
      });
      ctx.fillStyle = "#3d3831"; ctx.fillRect(4, 16, 20, 20); ctx.fillRect(W - 24, 16, 20, 20);
      ctx.fillStyle = broken ? "#ff3b30" : "#3dff6a"; ctx.fillRect(8, 12, 5, 4); ctx.fillRect(W - 13, 12, 5, 4);
      if (!broken) {
        ctx.shadowColor = "#fff6a8"; ctx.shadowBlur = 8; ctx.fillStyle = "#fff6a8";
        packets = packets.map(function (p) {
          p = (p + 0.22) % (N - 1);
          var i0 = Math.floor(p), f = p - i0, A = pts[i0], B = pts[i0 + 1];
          ctx.fillRect(A.x + (B.x - A.x) * f - 3, A.y + (B.y - A.y) * f - 3, 6, 6);
          return p;
        });
        ctx.shadowBlur = 0;
      }
      sparks = sparks.filter(function (s3) { return s3.life-- > 0; });
      sparks.forEach(function (s3) { s3.x += s3.vx; s3.y += s3.vy; s3.vy += 0.3; ctx.fillStyle = s3.life > 25 ? "#fff1c1" : "#ff8c00"; ctx.fillRect(s3.x, s3.y, 3, 3); });
      requestAnimationFrame(loop);
    })();
  };

  // ===== Лог: кликай по [WARN] — чини =====
  I.log = function (el) {
    var h = hint(el, "кликни по [WARN], чтобы починить");
    el.addEventListener("click", function (e) {
      var s = e.target.closest("span");
      if (!s || s.textContent.indexOf("[WARN]") < 0 && s.textContent.indexOf("[INFO]") < 0) return;
      var t = s.textContent.replace(/\[(WARN|INFO)\]/, "[ OK ]").replace(/ — .*$/, " — починил");
      el.querySelectorAll(".txt-track span").forEach(function (x) { if (x.textContent === s.textContent) x.textContent = t; });
      h.textContent = "✓ Починено. Следующий!";
    });
  };

  // ===== Загрузка: кнопка «Ускорить» =====
  I.loading = function (el) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "load-go"; b.textContent = "⏩ ускорить";
    el.appendChild(b);
    b.addEventListener("click", function () {
      var bar = el.querySelector(".load-bar i"), pct = el.querySelector(".load-pct"), eta = el.querySelector(".load-eta");
      el.dataset.done = "1";
      bar.style.width = "100%"; pct.textContent = "100%";
      eta.textContent = "Готово! Ошибка: опыт не помещается ни в одну вакансию";
      b.textContent = "😎"; b.disabled = true;
    });
  };

  // ===== Аптайм: кнопка reboot =====
  I.uptime = function (el) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "up-reboot"; b.textContent = "⏻ reboot";
    el.appendChild(b);
    b.addEventListener("click", function () {
      var v = el.querySelector(".js-uptime"), ok = el.querySelector(".up-ok");
      v.dataset.frozen = "1";
      v.textContent = "0 days, 00:00:00";
      ok.textContent = "● ЗАЧЕМ?! 412 дней аптайма… 😭";
      b.disabled = true;
      setTimeout(function () { delete v.dataset.frozen; ok.textContent = "● load average: стабильно"; b.disabled = false; }, 4000);
    });
  };

  // ===== RJ45: выдернуть / вставить =====
  I.rj45 = function (el) {
    var jack = el.querySelector(".jack"), txt = el.querySelector(".jack + span");
    var orig = txt.textContent;
    hint(el, "кликни по порту — выдерни кабель");
    jack.style.cursor = "pointer";
    jack.addEventListener("click", function () {
      el.classList.toggle("unplugged");
      txt.textContent = el.classList.contains("unplugged") ? "link down · офис без интернета · бухгалтерия звонит в IT 📞📞📞" : orig;
    });
  };

  // ===== Матрица: «Wake up, Neo» =====
  I.matrix = function (el) {
    var h = hint(el, "кликни");
    el.addEventListener("click", function () {
      var o = document.createElement("div");
      o.className = "neo";
      o.textContent = "Wake up, Neo… The Matrix has you… Follow the white rabbit 🐇";
      el.appendChild(o);
      setTimeout(function () { o.remove(); }, 3500);
    });
  };

  // ===== Пинг: клик — устроить DDoS =====
  I.ping = function (el) {
    hint(el, "кликни — устрой провайдеру DDoS");
    el.addEventListener("click", function () {
      var note = el.querySelector(".note");
      el.classList.add("ddos");
      note.textContent = "🔥 DDoS! Провайдер в шоке";
      setTimeout(function () { el.classList.remove("ddos"); note.textContent = ""; }, 2500);
    });
  };
})();

// ===== раунд 4: игры, салют, падажжи, монолог =====
// лампочки и порты как игры, кофе на стойке, салют за победу (GAP_CONFETTI), padazhi, rant
(function () {
  var X = window.GAP_EXTRA;

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

  // ===== Вставки раунда 4 =====
  function put(v, label, html, init) {
    var item = { v: v, label: label, html: html, init: init };
    var idx = X.findIndex(function (x) { return x.v === v; });
    if (idx > -1) X[idx] = item; else X.push(item);
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
})();
