// Раунд 3: переделанные вставки и футер F-клавиш. Подключается после gap-lab3.js.
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

  // ===== 21. Jira: 11 тикетов, решаются по очереди =====
  var TICKETS = [
    ["IT-101", "ВСЁ СЛОМАЛОСЬ НИЧЕГО НЕ РАБОТАЕТ ААААА", "blocker", "Включили монитор."],
    ["IT-102", "Принтер печатает иероглифы", "minor", "Это был документ на китайском."],
    ["IT-103", "Мышка не двигается", "trivial", "Перевернули мышку."],
    ["IT-104", "Интернет медленный", "trivial", "Закрыли 47 вкладок с YouTube."],
    ["IT-105", "Нужен доступ к почте СРОЧНО!!!", "blocker", "Логин тот же. Пароль тот же. Caps Lock — выключили."],
    ["IT-106", "Wi-Fi пропадает каждые 5 минут", "major", "Роутер стоял в микроволновке. Буквально."],
    ["IT-107", "Компьютер не включается", "critical", "Включили в розетку."],
    ["IT-108", "Excel всё посчитал неправильно", "major", "Формулу писал человек. Excel невиновен."],
    ["IT-109", "Поднять сеть в новом офисе за 1 день", "critical", "Сделано. Офис открылся вовремя. 🎉"],
    ["IT-110", "Перевезти серверную на выходных", "critical", "Перевезли. Сервер даже не заметил."],
    ["IT-111", "Пахнет горелым из серверной", "blocker", "Это был обед. Сервер в порядке."]
  ];
  put("jira", "тикеты Jira",
    '<div class="gl-jira2"><div class="j-card"><div class="j-top"><span class="j-key"></span><span class="j-prio"></span><span class="j-status"></span></div><b class="j-title"></b><div class="j-prog"><i></i></div><p class="j-sol"></p><span class="j-stamp">РЕШЕНО</span></div><div class="j-side"><button type="button" class="j-solve">⚡ Решить</button><small class="j-count">Закрыто: 0</small></div></div>',
    function (el) {
      var card = el.querySelector(".j-card"), k = Math.floor(rnd(0, TICKETS.length)), closed = 0, timer;
      var q = function (s) { return el.querySelector(s); };
      function load() {
        var t = TICKETS[k++ % TICKETS.length];
        card.classList.remove("solved", "leave"); card.classList.add("enter");
        q(".j-key").textContent = t[0]; q(".j-title").textContent = t[1];
        q(".j-prio").textContent = t[2].toUpperCase(); q(".j-prio").className = "j-prio p-" + t[2];
        q(".j-status").textContent = "ОТКРЫТ"; q(".j-status").className = "j-status open";
        q(".j-sol").textContent = ""; q(".j-prog i").style.width = "0";
        card.dataset.sol = t[3];
        setTimeout(function () { card.classList.remove("enter"); }, 400);
        clearTimeout(timer);
        timer = setTimeout(work, 1400);
      }
      function work() {
        if (!el.isConnected) return;
        q(".j-status").textContent = "В РАБОТЕ"; q(".j-status").className = "j-status work";
        q(".j-prog i").style.width = "100%";
        timer = setTimeout(solve, 2600);
      }
      function solve() {
        if (!el.isConnected) return;
        clearTimeout(timer);
        q(".j-status").textContent = "РЕШЕНО"; q(".j-status").className = "j-status done";
        q(".j-prog i").style.width = "100%";
        q(".j-sol").textContent = "Решение: " + card.dataset.sol;
        card.classList.add("solved");
        closed++; q(".j-count").textContent = "Закрыто: " + closed;
        timer = setTimeout(function () { card.classList.add("leave"); setTimeout(load, 400); }, 2400);
      }
      q(".j-solve").addEventListener("click", function () { if (!card.classList.contains("solved")) solve(); });
      load();
    });

  // ===== 14. Win98: аккуратное окно, «Отмена» гуляет по всему окну =====
  put("win98", "ошибка Win98",
    '<div class="gl-win98 v3"><div class="w98-title"><span>⚠ Опыт.exe</span><span class="w98-tb"><i>_</i><i>□</i><i>✕</i></span></div><div class="w98-arena"><div class="w98-body"><span class="w98-icon">⚠</span><p>Программа «Опыт.exe» выполнила недопустимую операцию и будет… <b>принята на работу</b>.</p></div><div class="w98-btns"><a class="w98-btn" href="https://t.me/dnsit1" target="_blank">Нанять</a><button class="w98-btn w98-more" type="button">Подробнее &gt;&gt;</button></div><button class="w98-btn w98-run" type="button" tabindex="-1">Отмена</button><small class="w98-tries"></small></div></div>',
    function (el) {
      var arena = el.querySelector(".w98-arena"), run = el.querySelector(".w98-run"), tries = el.querySelector(".w98-tries"), n = 0;
      var x, y;
      function clamp() {
        var w = arena.clientWidth - run.offsetWidth - 4, h = arena.clientHeight - run.offsetHeight - 4;
        x = Math.max(4, Math.min(w, x)); y = Math.max(4, Math.min(h, y));
        run.style.left = x + "px"; run.style.top = y + "px";
      }
      x = arena.clientWidth - 90; y = arena.clientHeight - 34; clamp();
      arena.addEventListener("pointermove", function (e) {
        var r = run.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = cx - e.clientX, dy = cy - e.clientY, d = Math.hypot(dx, dy);
        if (d < 85) {
          x += dx / (d || 1) * (90 - d) * 0.9; y += dy / (d || 1) * (90 - d) * 0.9;
          var w = arena.clientWidth - run.offsetWidth, h = arena.clientHeight - run.offsetHeight;
          if (x < 6 || x > w - 6) x = e.clientX - arena.getBoundingClientRect().left < w / 2 ? w - 10 : 10;
          if (y < 6 || y > h - 6) y = rnd(6, h - 6);
          clamp();
          n++; if (n % 15 === 0) tries.textContent = pick(["Не поймаешь 😏", "Отмена отменена", "Ещё чуть-чуть… нет", "Сдавайся, жми «Нанять»"]);
        }
      });
      run.addEventListener("pointerdown", function (e) { e.preventDefault(); x = rnd(0, arena.clientWidth); y = rnd(0, arena.clientHeight); clamp(); tries.textContent = "Телепорт! 🌀"; });
      el.querySelector(".w98-more").addEventListener("click", function () {
        el.querySelector(".w98-body p").innerHTML = "Подробнее: 350+ магазинов, сети, серверы, свои сервисы. Кнопка «Отмена» <b>временно недоступна</b>.";
      });
    });

  // ===== 15. Тетрис: исправлено поле (было шириной 0) =====
  var badges = ["allow", "claude", "grok", "hotgpus", "pelican", "smile", "vibes", "wrapper", "moat", "yc", "arcade", "robots"];
  put("tetris", "тетрис 88x31",
    '<div class="gl-tetris v3"><div class="t-head"><b>TETRIS 88×31</b><span class="t-score">LINES: 0</span></div><div class="t-field"></div></div>',
    function (el) {
      var field = el.querySelector(".t-field"), score = el.querySelector(".t-score");
      var W = 92, H = 35, rows = 2, cols, grid, lines = 0;
      function setup() {
        cols = Math.max(4, Math.floor((field.clientWidth || el.clientWidth || 600) / W));
        field.style.width = cols * W + "px";
        grid = []; for (var r = 0; r < rows; r++) grid.push(new Array(cols).fill(null));
      }
      function drop() {
        if (!el.isConnected) return;
        if (!grid) setup();
        var free = [];
        for (var c = 0; c < cols; c++) if (!grid[rows - 1][c] || !grid[0][c]) free.push(c);
        if (!free.length) { field.innerHTML = ""; grid = null; return setTimeout(drop, 300); }
        var col = pick(free), row = grid[rows - 1][col] ? 0 : rows - 1;
        var img = document.createElement("img");
        img.src = "/images/88x31/ai/" + pick(badges) + ".gif"; img.width = 88; img.height = 31; img.alt = "";
        img.style.left = (col * W) + "px"; img.style.top = "-40px";
        field.appendChild(img);
        setTimeout(function () { img.style.top = (row * H + 2) + "px"; }, 40);
        grid[row][col] = img;
        setTimeout(check, 480);
      }
      function check() {
        if (grid[rows - 1].every(Boolean)) {
          var full = grid[rows - 1];
          full.forEach(function (im) { im.classList.add("flash"); });
          setTimeout(function () {
            full.forEach(function (im) { im.remove(); });
            lines++; score.textContent = "LINES: " + lines;
            for (var c = 0; c < cols; c++) { var up = grid[0][c]; grid[1][c] = up; grid[0][c] = null; if (up) up.style.top = (H + 2) + "px"; }
            setTimeout(drop, 450);
          }, 600);
          return;
        }
        setTimeout(drop, 320);
      }
      setTimeout(drop, 50);
    });

  // ===== 19. Котик: нормальный SVG-кот бьёт лапой болтающийся штекер =====
  put("cat", "котик и кабель",
    '<div class="gl-cat3"><svg viewBox="0 0 300 110" class="scene">' +
    '<line class="hook" x1="150" y1="0" x2="150" y2="4"/>' +
    '<g class="pend"><line class="cord" x1="150" y1="0" x2="150" y2="62"/><rect class="rj" x="143" y="60" width="14" height="16" rx="2"/><rect class="rj-clip" x="146" y="74" width="8" height="4"/></g>' +
    '<g class="cat" transform="translate(196 44)">' +
    '<path class="tail" d="M58 52 C78 46 84 22 70 10"/>' +
    '<ellipse class="body" cx="34" cy="48" rx="30" ry="18"/>' +
    '<circle class="head" cx="8" cy="26" r="16"/>' +
    '<path class="ear" d="M-4 14 L-2 -2 L8 10 Z"/><path class="ear" d="M10 10 L20 -2 L22 14 Z"/>' +
    '<circle class="eye" cx="2" cy="24" r="3.4"/><circle class="eye" cx="15" cy="24" r="3.4"/>' +
    '<circle class="pupil p1" cx="1" cy="24" r="1.6"/><circle class="pupil p2" cx="14" cy="24" r="1.6"/>' +
    '<path class="nose" d="M7 31 L10 31 L8.5 33 Z"/>' +
    '<g class="arm"><path class="leg" d="M6 46 L-14 40"/><circle class="toe" cx="-15" cy="40" r="4"/></g>' +
    '<path class="leg back" d="M40 62 L40 66 M54 62 L54 66"/>' +
    '</g></svg><em class="meow"></em><small class="gl-hint">👆 кликни по коту — он ударит</small></div>',
    function (el) {
      var pend = el.querySelector(".pend"), arm = el.querySelector(".arm"), meow = el.querySelector(".meow");
      var p1 = el.querySelector(".p1"), p2 = el.querySelector(".p2"), cat = el.querySelector(".cat");
      var ang = 0, vel = 0, unplugged = false;
      function bat(force) {
        arm.classList.remove("hit"); void arm.getBoundingClientRect(); arm.classList.add("hit");
        setTimeout(function () {
          vel -= force;
          if (Math.abs(vel) > 6 && !unplugged && Math.random() < 0.3) {
            unplugged = true; el.classList.add("fallen"); meow.textContent = "link down 😼 (это не я, это гравитация)";
            setTimeout(function () { unplugged = false; el.classList.remove("fallen"); ang = 0; vel = 0; meow.textContent = ""; }, 3000);
          }
        }, 160);
      }
      frame(el, function () {
        if (!unplugged) { vel += -ang * 0.012; vel *= 0.985; ang += vel; }
        pend.setAttribute("transform", "rotate(" + ang.toFixed(2) + " 150 0)");
        var dx = Math.max(-1.2, Math.min(1.2, -ang / 12));
        p1.setAttribute("cx", 1 + dx); p2.setAttribute("cx", 14 + dx);
      });
      setInterval(function () { if (el.isConnected && !unplugged && Math.abs(ang) < 6 && Math.random() < 0.7) bat(rnd(2.5, 5)); }, 1900);
      cat.style.cursor = "pointer";
      cat.addEventListener("click", function () { bat(7); meow.textContent = pick(["мяу!", "МЯУ!!", "мррр 😼"]); setTimeout(function () { if (!unplugged) meow.textContent = ""; }, 900); });
    });

  // ===== 17. Тамагочи: пиксельный спрайт на канвасе =====
  var SPRITE = {
    ok: ["..########..", ".#........#.", ".#.##..##.#.", ".#.##..##.#.", ".#........#.", ".#..####..#.", ".#........#.", ".##########.", ".#.o.o..==#.", ".##########."],
    sad: ["..########..", ".#........#.", ".#.##..##.#.", ".#........#.", ".#........#.", ".#..####..#.", ".#.#....#.#.", ".##########.", ".#.o.o..==#.", ".##########."],
    dead: ["..########..", ".#........#.", ".#.#.##.#.#.", ".#..#..#..#.", ".#.#.##.#.#.", ".#........#.", ".#.######.#.", ".##########.", ".#........#.", ".##########."]
  };
  put("tamagotchi", "тамагочи-сервер",
    '<div class="gl-tama3"><div class="egg"><div class="brand">SERVERGOTCHI</div><canvas width="96" height="72"></canvas><div class="btns"><button type="button" data-a="coffee">A</button><button type="button" data-a="patch">B</button><button type="button" data-a="reboot">C</button></div><div class="btn-labels"><span>КОФЕ</span><span>ПАТЧ</span><span>РЕБУТ</span></div></div><div class="tside"><b class="tmsg">Привет! Я сервер. Не дай мне умереть.</b><small>Возраст: <span class="age">0</span> дн. · Рекорд: <span class="best">0</span></small></div></div>',
    function (el) {
      var c = el.querySelector("canvas"), ctx = c.getContext("2d"), msg = el.querySelector(".tmsg"), ageEl = el.querySelector(".age"), bestEl = el.querySelector(".best");
      var st = { coffee: 70, patch: 60, mood: 80 }, dead = false, age = 0, best = 0, bob = 0, eating = 0, ghost = 0;
      var DARK = "#0f380f", MID = "#306230", BG = "#9bbc0f";
      function px(x, y, s, col) { ctx.fillStyle = col; ctx.fillRect(x, y, s, s); }
      function draw() {
        ctx.fillStyle = BG; ctx.fillRect(0, 0, 96, 72);
        // шкалы сверху
        [["☕", st.coffee], ["🔧", st.patch], ["♥", st.mood]].forEach(function (s, i) {
          ctx.fillStyle = DARK; ctx.font = "7px monospace"; ctx.fillText(s[0], 2 + i * 32, 8);
          ctx.fillStyle = MID; ctx.fillRect(11 + i * 32, 3, 18, 5);
          ctx.fillStyle = s[1] < 25 ? "#8b0000" : DARK; ctx.fillRect(11 + i * 32, 3, Math.round(18 * s[1] / 100), 5);
        });
        var spr = dead ? SPRITE.dead : (st.mood < 35 || st.coffee < 20 ? SPRITE.sad : SPRITE.ok);
        var oy = dead ? 14 - (ghost % 20) : 16 + (Math.sin(bob) > 0 ? 1 : 0) * 2;
        spr.forEach(function (row, y) { row.split("").forEach(function (ch, x) {
          if (ch === "#") px(30 + x * 3, oy + y * 3, 3, dead ? MID : DARK);
          if (ch === "o") px(30 + x * 3, oy + y * 3, 3, Math.sin(bob * 4) > 0 ? "#2f8f2f" : DARK);
          if (ch === "=") px(30 + x * 3, oy + y * 3, 3, MID);
        }); });
        if (eating > 0) { px(70, 30, 4, DARK); px(74, 32, 2, DARK); px(70, 26 - (eating % 6), 2, MID); }
        if (!dead && st.coffee < 20) { ctx.fillStyle = DARK; ctx.font = "8px monospace"; ctx.fillText("z", 70 + (bob % 3), 22); ctx.fillText("Z", 76, 16); }
        if (dead) { ctx.fillStyle = DARK; ctx.font = "8px monospace"; ctx.fillText("R.I.P.", 32, 68); }
      }
      el.querySelectorAll(".btns button").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.dataset.a;
          if (dead && a !== "reboot") { msg.textContent = "Он умер. Только ребут (C), только хардкор."; return; }
          if (a === "coffee") { st.coffee = Math.min(100, st.coffee + 45); st.mood = Math.min(100, st.mood + 10); eating = 18; msg.textContent = pick(["☕ Ммм, эспрессо!", "☕ Ещё! ЕЩЁ!", "☕ Аптайм +100500"]); }
          if (a === "patch") { st.patch = 100; st.mood = Math.max(0, st.mood - 12); msg.textContent = pick(["🔧 Патч установлен. Ничего не сломалось. Подозрительно.", "🔧 Обновился. Теперь всё по-новому не работает."]); }
          if (a === "reboot") {
            if (dead) { dead = false; st = { coffee: 60, patch: 50, mood: 70 }; age = 0; msg.textContent = "🔁 Воскрес! Аптайм обнулён."; }
            else { st.mood = Math.max(0, st.mood - 30); msg.textContent = "🔁 Зачем ты меня перезагрузил?! Я же работал! 😤"; }
          }
          draw();
        });
      });
      every(el, 120, function () { bob += 0.3; if (eating > 0) eating--; if (dead) ghost++; draw(); });
      every(el, 1500, function () {
        if (dead) return;
        age++; ageEl.textContent = age; if (age > best) { best = age; bestEl.textContent = best; }
        st.coffee = Math.max(0, st.coffee - 5); st.patch = Math.max(0, st.patch - 2);
        st.mood = Math.max(0, st.mood - (st.coffee < 25 ? 7 : st.patch < 25 ? 4 : 1));
        if (st.mood === 0) { dead = true; msg.textContent = "💀 Сервер умер. Причина: " + (st.coffee < 25 ? "недостаток кофе" : "непатченные уязвимости") + ". Жми C."; }
        else if (st.coffee < 20) msg.textContent = "Кооофе… сервер засыпает… (жми A)";
        else if (st.patch < 25) msg.textContent = "Меня взламывают! Нужен патч! (жми B)";
      });
    });

  // ===== 20. Капча: жёстче =====
  var tiles = ["🧾💥", "🧾🔥", "🧾😵", "🧾🫠", "🧾⛔", "🧾💀", "🧾🤡", "🧾🚽", "🧾🪦"];
  put("captcha", "капча",
    '<div class="gl-captcha3"><div class="cap-head">Выберите все изображения, где касса <b>НЕ в жопе</b><small>Если таких нет — жмите «Пропустить». Удачи, блин.</small></div><div class="cap-grid">' +
    tiles.map(function (t) { return '<button type="button">' + t + "</button>"; }).join("") +
    '</div><div class="cap-foot"><span class="cap-res">Я не робот ☐</span><button type="button" class="cap-skip">Пропустить</button></div></div>',
    function (el) {
      var res = el.querySelector(".cap-res"), fails = 0;
      el.querySelectorAll(".cap-grid button").forEach(function (b) {
        b.addEventListener("click", function () {
          b.classList.toggle("sel"); fails++;
          res.textContent = pick(["Ты, блин, серьёзно? Она горит.", "Нет. Это касса после обновления, она в жопе.", "Робот бы знал. Ты не робот. Ты хуже.", "Эта касса в полной жопе, вообще-то.", "Мимо. Вы точно из IT?"]);
          if (fails > 4) res.textContent = "Хватит тыкать, касса и так страдает 😤";
        });
      });
      el.querySelector(".cap-skip").addEventListener("click", function () { res.textContent = "✅ Правильно. Нормальных касс не бывает. Поэтому я, сука, и нужен."; });
    });

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

  // ===== 23. BSOD: интерактив с перезагрузкой =====
  put("bsod", "синий экран",
    '<div class="gl-bsod3" tabindex="0"><div class="b-screen"><b class="sad">:(</b><div><p class="b-text">Ваш опыт столкнулся с проблемой: его слишком много для одной вакансии. Собираем сведения об ошибке…</p><p class="pct-line"><span class="pct">0</span>% завершено</p><div class="qrrow"><span class="qr"></span><small>Код остановки: CAREER_OVERFLOW<br/>Что пошло не так: всё пошло так</small></div><p class="b-press">👆 Нажмите сюда, чтобы перезагрузить</p></div></div></div>',
    function (el) {
      var qr = el.querySelector(".qr"), cells = "";
      for (var i = 0; i < 49; i++) cells += "<i" + (Math.random() < 0.5 ? ' class="b"' : "") + "></i>";
      qr.innerHTML = cells;
      var p = el.querySelector(".pct"), v = 0, stage = 0, txt = el.querySelector(".b-text"), press = el.querySelector(".b-press"), scr = el.querySelector(".b-screen");
      every(el, 350, function () { if (stage === 0) { v = v >= 100 ? 0 : Math.min(100, v + Math.floor(rnd(1, 8))); p.textContent = v; } });
      var steps = [
        ["Вы уверены? Компьютер может обидеться.", "👆 Да, перезагрузить"],
        ["Точно уверены? Несохранённые мемы будут утеряны.", "👆 Да, блин!"],
        ["Ладно. Перезагрузка…", ""]
      ];
      function go() {
        if (stage < 2) { txt.textContent = steps[stage][0]; press.textContent = steps[stage][1]; stage++; return; }
        if (stage === 2) {
          stage = 3; txt.textContent = steps[2][0]; press.textContent = "";
          setTimeout(function () { el.classList.add("black"); scr.innerHTML = '<pre class="boot">Starting Windows…\n▒▒▒▒▒░░░░░</pre>'; }, 900);
          setTimeout(function () {
            el.classList.remove("black");
            scr.innerHTML = '<b class="sad">:(</b><div><p>Windows не смогла загрузиться.<br/>Причина: кандидат слишком хорош для этого компьютера.</p><p class="b-press">👆 Попробовать ещё раз</p></div>';
            stage = 4;
          }, 3200);
          return;
        }
        if (stage === 4) { stage = 0; v = 0; el.dispatchEvent(new Event("reinit")); }
      }
      el.addEventListener("click", go);
      el.addEventListener("keydown", go);
      el.addEventListener("reinit", function () {
        scr.innerHTML = '<b class="sad">:(</b><div><p class="b-text">Ваш опыт снова столкнулся с проблемой. Собираем сведения…</p><p class="pct-line"><span class="pct">0</span>% завершено</p><p class="b-press">👆 Нажмите сюда, чтобы перезагрузить</p></div>';
        p = el.querySelector(".pct"); txt = el.querySelector(".b-text"); press = el.querySelector(".b-press");
      });
    });

  // ===== 24. Dial-up: медленно, мама, картинка грузится построчно =====
  put("dialup", "dial-up модем",
    '<div class="gl-win98 gl-dial3"><div class="w98-title"><span>📠 Подключение к Интернет — 56k</span><span class="w98-tb"><i>✕</i></span></div><div class="w98-body"><div class="d-left"><p class="d-status">Нажмите «Подключиться»</p><div class="d-bar"><i></i></div><small class="d-speed">Скорость: 0 бит/с</small><div class="d-btns"><button class="w98-btn d-go" type="button">Подключиться</button><button class="w98-btn d-mom" type="button">👩 Мама берёт трубку</button></div></div><div class="d-img"><img src="/images/me/avatar-pixel.png" alt="" width="80" height="80" /><small>резюме.jpg</small></div></div></div>',
    function (el) {
      var s = el.querySelector(".d-status"), bar = el.querySelector(".d-bar i"), sp = el.querySelector(".d-speed"), img = el.querySelector(".d-img img");
      var timers = [], loaded = 0, online = false, imgTimer;
      function clear() { timers.forEach(clearTimeout); timers = []; clearInterval(imgTimer); }
      function at(ms, fn) { timers.push(setTimeout(function () { if (el.isConnected) fn(); }, ms)); }
      function setImg(pct) { img.style.clipPath = "inset(0 0 " + (100 - pct) + "% 0)"; }
      setImg(0);
      el.querySelector(".d-go").addEventListener("click", function () {
        clear(); online = false; loaded = 0; setImg(0);
        s.textContent = "Набор номера 8-800-555-35-35…"; bar.style.width = "10%"; sp.textContent = "Скорость: 0 бит/с";
        at(3000, function () { s.textContent = "пиии-пиу-кшшшш-ДЖЖЖЖЖ-бип-бип…"; bar.style.width = "35%"; el.classList.add("screech"); });
        at(6500, function () { el.classList.remove("screech"); s.textContent = "Проверка имени пользователя и пароля…"; bar.style.width = "60%"; });
        at(9500, function () { s.textContent = "Регистрация компьютера в сети…"; bar.style.width = "85%"; });
        at(12000, function () {
          s.textContent = "Подключено! Загружаю резюме.jpg… (осталось ~4 часа)"; bar.style.width = "100%"; sp.textContent = "Скорость: 33 600 бит/с"; online = true;
          imgTimer = setInterval(function () {
            if (!el.isConnected || !online) return clearInterval(imgTimer);
            loaded = Math.min(100, loaded + 2.5); setImg(loaded);
            if (loaded >= 100) { clearInterval(imgTimer); s.textContent = "Загружено! Целых 2 КБ за 2 минуты. Технологии!"; }
          }, 1000);
        });
      });
      el.querySelector(".d-mom").addEventListener("click", function () {
        clear(); online = false;
        s.textContent = "👩 «Алло? Кто это? Почему там пищит?!» — СВЯЗЬ РАЗОРВАНА";
        bar.style.width = "0"; sp.textContent = "Скорость: 0 бит/с. Мама: 1, интернет: 0";
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

  // ===== Статусы для панели =====
  window.GAP_STATUS = {
    approved: ["log", "news", "badges", "brands", "uptime", "term", "loading", "leds", "bios", "ping", "matrix", "ports", "clippy", "rj45", "dvd", "traceroute", "wifi", "htop", "speedtest", "morse"],
    review: ["rack", "cable", "jira", "win98", "tetris", "cat", "tamagotchi", "captcha", "packets", "bsod", "dialup", "snake", "crtpower", "sticky"]
  };

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
