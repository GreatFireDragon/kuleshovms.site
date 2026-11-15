// Раунд 2: удаляем отбракованные вставки, заменяем доработанные, добавляем новые.
// Подключается после gap-lab2.js и до gap-lab.js.
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

  // ---- 1. Удалить отбракованные ----
  var DROP = ["keys", "floppy", "scope", "gitlog", "oncall", "weather", "stopwatch", "pager", "fortune"];
  for (var i = X.length - 1; i >= 0; i--) if (DROP.indexOf(X[i].v) > -1) X.splice(i, 1);

  function put(v, label, html, init) {
    var item = { v: v, label: label, html: html, init: init };
    var idx = X.findIndex(function (x) { return x.v === v; });
    if (idx > -1) X[idx] = item; else X.push(item);
  }

  // ---- 2. Доработанные ----

  // 14. Win98: «Отмена» невозможно поймать
  put("win98", "ошибка Win98",
    '<div class="gl-win98 v2"><div class="w98-title">Опыт.exe<span>✕</span></div><div class="w98-body"><span class="w98-icon">⚠</span><p>Программа «Опыт.exe» выполнила недопустимую операцию и будет… принята на работу.</p></div><div class="w98-btns"><a class="w98-btn" href="https://t.me/dnsit1" target="_blank">Нанять</a><button class="w98-btn w98-more" type="button">Подробнее &gt;&gt;</button><button class="w98-btn w98-run" type="button" tabindex="-1">Отмена</button></div></div>',
    function (el) {
      var box = el.querySelector(".w98-btns"), run = el.querySelector(".w98-run");
      var x = 0, y = 0;
      function place() {
        var w = box.clientWidth - run.offsetWidth, h = box.clientHeight - run.offsetHeight;
        x = Math.max(0, Math.min(w, x)); y = Math.max(0, Math.min(h, y));
        run.style.left = x + "px"; run.style.top = y + "px";
      }
      x = box.clientWidth - run.offsetWidth - 10; y = 8; place();
      el.addEventListener("pointermove", function (e) {
        var r = run.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = cx - e.clientX, dy = cy - e.clientY, d = Math.hypot(dx, dy);
        if (d < 90) {
          var k = (90 - d) / 90 * 40 + 6;
          x += (dx / (d || 1)) * k; y += (dy / (d || 1)) * k;
          var w = box.clientWidth - run.offsetWidth, h = box.clientHeight - run.offsetHeight;
          if (x <= 0 || x >= w) x = x <= 0 ? w - rnd(0, 40) : rnd(0, 40);
          if (y <= 0 || y >= h) y = rnd(0, h);
          place();
        }
      });
      run.addEventListener("pointerdown", function (e) { e.preventDefault(); x = rnd(0, box.clientWidth); y = rnd(0, box.clientHeight); place(); });
      el.querySelector(".w98-more").addEventListener("click", function () {
        el.querySelector(".w98-body p").textContent = "Подробнее: опыт 3 года, сети, серверы, 350+ магазинов. Кнопка «Отмена» временно недоступна.";
      });
    });

  // 15. Тетрис: значки падают, ряд заполняется, вспышка, очистка
  var badges = ["allow", "claude", "grok", "hotgpus", "pelican", "smile", "vibes", "wrapper", "moat", "yc", "arcade", "robots"];
  put("tetris", "тетрис 88x31",
    '<div class="gl-tetris v2"><div class="t-field"></div><span class="t-score">LINES: 0</span></div>',
    function (el) {
      var field = el.querySelector(".t-field"), score = el.querySelector(".t-score");
      var W = 92, H = 35, cols = Math.max(4, Math.floor((field.clientWidth || 600) / W)), rows = 2, lines = 0;
      var grid = []; for (var r = 0; r < rows; r++) grid.push(new Array(cols).fill(null));
      function drop() {
        if (!el.isConnected) return;
        var free = [];
        for (var c = 0; c < cols; c++) if (!grid[rows - 1][c] || !grid[0][c]) free.push(c);
        var col = pick(free);
        var row = grid[rows - 1][col] ? 0 : rows - 1;
        var img = document.createElement("img");
        img.src = "/images/88x31/ai/" + pick(badges) + ".gif"; img.width = 88; img.height = 31; img.alt = "";
        img.style.left = (col * W) + "px"; img.style.top = "-40px";
        field.appendChild(img);
        requestAnimationFrame(function () { img.style.top = (row * H + 2) + "px"; });
        grid[row][col] = img;
        setTimeout(check, 450);
      }
      function check() {
        for (var r = rows - 1; r >= 0; r--) {
          if (grid[r].every(Boolean)) {
            grid[r].forEach(function (im) { im.classList.add("flash"); });
            var full = grid[r];
            setTimeout(function () {
              full.forEach(function (im) { im.remove(); });
              lines++; score.textContent = "LINES: " + lines;
              // сдвинуть верхний ряд вниз
              for (var c = 0; c < cols; c++) { var up = grid[0][c]; grid[1][c] = up; grid[0][c] = null; if (up) up.style.top = (H + 2) + "px"; }
              setTimeout(drop, 400);
            }, 500);
            return;
          }
        }
        setTimeout(drop, 350);
      }
      drop();
    });

  // 16. Wi-Fi: список сетей с юмором
  var nets = [
    ["Office_5G", 4, "🔒", "Подключено. Интернет: где-то там"],
    ["Guest", 3, "🔒", "Неверный пароль. Пароль на бумажке под клавиатурой"],
    ["iPhone (Вася)", 2, "🔒", "Вася отключил раздачу"],
    ["FREE_WIFI_NOT_A_VIRUS", 4, "", "Подключение… Ваши пароли отправлены. Шутка."],
    ["HP-Printer-Setup", 1, "", "Подключено к принтеру. Он тоже не знает, где интернет"]
  ];
  put("wifi", "Wi-Fi сети",
    '<div class="gl-wifi2"><div class="wf-head"><span class="wf-icon"><i></i><i></i><i></i></span><b>Доступные сети</b><em class="wf-msg">Выберите сеть</em></div><ul>' +
    nets.map(function (n, i) {
      return '<li data-i="' + i + '"><span class="wf-bars">' + [1, 2, 3, 4].map(function (k) { return "<i" + (k <= n[1] ? ' class="on"' : "") + "></i>"; }).join("") + "</span>" + n[0] + " <small>" + n[2] + "</small></li>";
    }).join("") + "</ul></div>",
    function (el) {
      var msg = el.querySelector(".wf-msg");
      el.querySelectorAll("li").forEach(function (li) {
        li.addEventListener("click", function () {
          el.querySelectorAll("li").forEach(function (x) { x.classList.remove("sel"); });
          li.classList.add("sel");
          msg.textContent = "Подключение…";
          setTimeout(function () { msg.textContent = nets[+li.dataset.i][3]; }, 700);
        });
      });
      every(el, 1400, function () {
        var li = pick(el.querySelectorAll("li")), bars = li.querySelectorAll(".wf-bars i"), lvl = Math.floor(rnd(1, 5));
        bars.forEach(function (b, k) { b.classList.toggle("on", k < lvl); });
      });
    });

  // 17. Тамагочи: настоящий тамагочи с кнопками и смертью
  put("tamagotchi", "тамагочи-сервер",
    '<div class="gl-tama2"><div class="egg"><div class="lcd"><div class="srv"><i class="e"></i><i class="e"></i><b class="m"></b></div><div class="mood">😊</div></div><div class="btns"><button type="button" data-a="coffee">☕</button><button type="button" data-a="patch">🔧</button><button type="button" data-a="reboot">🔁</button></div></div><div class="tstats"><label>☕ Кофе<span><i class="s-coffee"></i></span></label><label>🛠 Патчи<span><i class="s-patch"></i></span></label><label>😊 Настроение<span><i class="s-mood"></i></span></label><em class="tmsg">Я сервер. Ухаживай за мной.</em></div></div>',
    function (el) {
      var st = { coffee: 70, patch: 60, mood: 80 }, dead = false;
      var bars = { coffee: el.querySelector(".s-coffee"), patch: el.querySelector(".s-patch"), mood: el.querySelector(".s-mood") };
      var msg = el.querySelector(".tmsg"), srv = el.querySelector(".srv"), mood = el.querySelector(".mood");
      function draw() {
        Object.keys(bars).forEach(function (k) { bars[k].style.width = st[k] + "%"; bars[k].classList.toggle("low", st[k] < 25); });
        var avg = (st.coffee + st.patch + st.mood) / 3;
        srv.className = "srv" + (dead ? " dead" : avg > 60 ? " happy" : avg < 30 ? " sad" : "");
        mood.textContent = dead ? "💀" : avg > 60 ? "😊" : avg > 30 ? "😐" : "😫";
      }
      el.querySelectorAll(".btns button").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.dataset.a;
          if (dead && a !== "reboot") { msg.textContent = "Он умер. Только ребут, только хардкор."; return; }
          if (a === "coffee") { st.coffee = 100; st.mood = Math.min(100, st.mood + 15); msg.textContent = "☕ Ммм… эспрессо. Аптайм +100500"; }
          if (a === "patch") { st.patch = 100; st.mood = Math.max(0, st.mood - 10); msg.textContent = "🔧 Патч установлен. Требуется перезагрузка (врёт)."; }
          if (a === "reboot") { dead = false; st = { coffee: 50, patch: 50, mood: 60 }; msg.textContent = "🔁 Включите и выключите… то есть наоборот. Жив!"; }
          draw();
        });
      });
      every(el, 1500, function () {
        if (dead) return;
        st.coffee = Math.max(0, st.coffee - 4); st.patch = Math.max(0, st.patch - 2); st.mood = Math.max(0, st.mood - (st.coffee < 25 ? 6 : 2));
        if (st.coffee === 0 && st.mood === 0) { dead = true; msg.textContent = "💀 Сервер умер от недостатка кофе. Нажми 🔁"; }
        else if (st.coffee < 25) msg.textContent = "Кооофе… дайте кофе…";
        draw();
      });
    });

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

  // 19. Котик играет с кабелем лапкой (кабель раскачивается)
  put("cat", "котик и кабель",
    '<div class="gl-cat2"><svg viewBox="0 0 600 70" preserveAspectRatio="none"><path class="cord" d=""/><circle class="plug-a" cx="8" cy="12" r="7"/><circle class="plug-b" cx="592" cy="12" r="7"/></svg><span class="kitty">🐈</span><span class="paw"></span><em class="meow"></em></div>',
    function (el) {
      var path = el.querySelector(".cord"), paw = el.querySelector(".paw"), meow = el.querySelector(".meow"), kitty = el.querySelector(".kitty");
      var sag = 30, v = 0, target = 30, unplugged = false;
      function hit(power) {
        v += power; paw.classList.remove("swipe"); void paw.offsetWidth; paw.classList.add("swipe");
        if (Math.abs(v) > 22 && !unplugged && Math.random() < 0.35) {
          unplugged = true; el.classList.add("unplugged"); meow.textContent = "link down 😼 (это не я)";
          setTimeout(function () { unplugged = false; el.classList.remove("unplugged"); meow.textContent = ""; }, 2500);
        }
      }
      frame(el, function () {
        var a = (target - sag) * 0.06; v += a; v *= 0.92; sag += v;
        var endY = unplugged ? 62 : 12;
        path.setAttribute("d", "M8 12 Q300 " + (12 + sag * 1.6).toFixed(1) + " 592 " + endY);
        el.querySelector(".plug-b").setAttribute("cy", endY);
      });
      setInterval(function () { if (el.isConnected && Math.random() < 0.6) hit(rnd(10, 26)); }, 1600);
      el.addEventListener("click", function () { hit(30); meow.textContent = "мяу!"; kitty.classList.add("jump"); setTimeout(function () { kitty.classList.remove("jump"); if (!unplugged) meow.textContent = ""; }, 700); });
    });

  // 20. Капча: шутка видна сразу, обидно и иронично
  var tiles = ["🧾💥", "🧾🔥", "🧾😵", "🧾🫠", "🧾⛔", "🧾💀"];
  put("captcha", "капча",
    '<div class="gl-captcha2"><div class="cap-head">Выберите все изображения с <b>работающей кассой</b><small>Если их нет — нажмите «Пропустить». Удачи.</small></div><div class="cap-grid">' +
    tiles.map(function (t) { return '<button type="button">' + t + "</button>"; }).join("") +
    '</div><div class="cap-foot"><span class="cap-res"></span><button type="button" class="cap-skip">Пропустить</button></div></div>',
    function (el) {
      var res = el.querySelector(".cap-res");
      el.querySelectorAll(".cap-grid button").forEach(function (b) {
        b.addEventListener("click", function () { b.classList.toggle("sel"); res.textContent = pick(["Серьёзно? Она же горит.", "Нет. Это касса после обновления.", "Вы точно не робот? Робот бы знал."]); });
      });
      el.querySelector(".cap-skip").addEventListener("click", function () { res.textContent = "Правильно. Работающих касс не существует. Поэтому я и нужен."; });
    });

  // 22. Пакеты: касса → коммутатор → сервер; клик по свитчу — шторм
  put("packets", "пакеты: касса → сервер",
    '<div class="gl-net"><div class="node n-kassa">🧾<small>Касса</small></div><div class="link l1"></div><div class="node n-sw"><b>SW</b><span class="sw-leds"><i></i><i></i><i></i><i></i></span><small>Коммутатор</small></div><div class="link l2"></div><div class="node n-srv">🖥️<small>ОФД</small></div><em class="net-msg">👆 кликни по коммутатору</em></div>',
    function (el) {
      var msg = el.querySelector(".net-msg"), storm = false;
      var labels = ["чек", "ОФД", "чек", "пинг", "чек"];
      function send() {
        if (!el.isConnected) return;
        var p = document.createElement("span");
        p.className = "pkt"; p.textContent = pick(labels);
        el.appendChild(p);
        var lost = !storm && Math.random() < 0.15;
        var anim = p.animate(lost
          ? [{ left: "8%", top: "40%", opacity: 1 }, { left: "48%", top: "40%" }, { left: "52%", top: "-10%", opacity: 0 }]
          : [{ left: "8%", top: "40%" }, { left: "48%", top: "40%" }, { left: "88%", top: "40%" }],
          { duration: storm ? 700 : 2200, easing: "linear" });
        anim.onfinish = function () {
          p.remove();
          if (lost) { msg.textContent = "ОФД: таймаут. Касса: «а я что?»"; setTimeout(function () { if (!storm) msg.textContent = "👆 кликни по коммутатору"; }, 1600); }
        };
        setTimeout(send, storm ? 90 : rnd(500, 1100));
      }
      send();
      el.querySelector(".n-sw").addEventListener("click", function () {
        storm = !storm; el.classList.toggle("storm", storm);
        msg.textContent = storm ? "Широковещательный шторм! Кто воткнул кабель в два порта?!" : "STP включён. Порядок.";
      });
    });

  // 24. BSOD как в Windows 10
  put("bsod", "синий экран",
    '<div class="gl-bsod2"><b class="sad">:(</b><div><p>Ваш опыт столкнулся с проблемой: его слишком много для одной вакансии. Мы собираем сведения об ошибке и затем пригласим вас на собеседование.</p><p class="pct-line"><span class="pct">0</span>% завершено</p><div class="qrrow"><span class="qr"></span><small>Код остановки: CAREER_OVERFLOW<br/>Что пошло не так: всё пошло так</small></div></div></div>',
    function (el) {
      var qr = el.querySelector(".qr"), cells = "";
      for (var i = 0; i < 49; i++) cells += "<i" + (Math.random() < 0.5 ? ' class="b"' : "") + "></i>";
      qr.innerHTML = cells;
      var p = el.querySelector(".pct"), v = 0;
      every(el, 350, function () { v = v >= 100 ? 0 : Math.min(100, v + Math.floor(rnd(1, 8))); p.textContent = v; });
    });

  // 26. Dial-up: окно «Удалённый доступ к сети»
  put("dialup", "dial-up модем",
    '<div class="gl-win98 gl-dial2"><div class="w98-title">Подключение к Интернет<span>✕</span></div><div class="w98-body"><span class="modem">📠<i></i><i></i></span><div><p class="d-status">Набор номера…</p><div class="d-bar"><i></i></div><small class="d-speed">Скорость: —</small></div></div><div class="w98-btns"><button class="w98-btn" type="button">Отмена</button></div></div>',
    function (el) {
      var s = el.querySelector(".d-status"), bar = el.querySelector(".d-bar i"), sp = el.querySelector(".d-speed");
      var steps = [["Набор номера 8-800-555-35-35…", 15, "—"], ["пиии-пиу-кшшшш-ДЖЖЖЖЖ", 40, "—"], ["Проверка имени пользователя и пароля…", 65, "—"], ["Регистрация компьютера в сети…", 85, "—"], ["Подключено. Мама, не снимай трубку!", 100, "56 000 бит/с"]], k = 0;
      every(el, 1500, function () { var x = steps[k++ % steps.length]; s.textContent = x[0]; bar.style.width = x[1] + "%"; sp.textContent = "Скорость: " + x[2]; });
      el.querySelector(".w98-btn").addEventListener("click", function () { s.textContent = "Связь разорвана: кто-то поднял трубку"; bar.style.width = "0"; });
    });

  // 32. Спидтест: большой спидометр
  put("speedtest", "спидтест",
    '<div class="gl-speed2"><svg viewBox="0 0 200 120"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#4fc3ff"/><stop offset="1" stop-color="#ff7ab6"/></linearGradient></defs><path class="track" d="M20 100 A80 80 0 0 1 180 100"/><path class="fill" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"/><line class="needle" x1="100" y1="100" x2="100" y2="34"/><circle cx="100" cy="100" r="6"/><text class="val" x="100" y="86">0</text><text class="unit" x="100" y="116">Мбит/с</text></svg><div class="sp-side"><div><small>PING</small><b class="sp-ping">4</b></div><div><small>DOWNLOAD</small><b class="sp-dl">—</b></div><div><small>UPLOAD</small><b>ну такое</b></div><button type="button" class="sp-go">ПОЕХАЛИ</button></div></div>',
    function (el) {
      var fill = el.querySelector(".fill"), n = el.querySelector(".needle"), val = el.querySelector(".val"), dl = el.querySelector(".sp-dl"), ping = el.querySelector(".sp-ping");
      function show(v) { var f = Math.min(1, v / 1000); fill.style.strokeDasharray = (f * 100) + " 100"; n.style.transform = "rotate(" + (f * 180 - 90) + "deg)"; val.textContent = Math.round(v); }
      function run() {
        var t0 = performance.now(), target = rnd(780, 960);
        ping.textContent = Math.round(rnd(3, 9));
        frame(el, function (t) {
          var k = Math.min(1, (t - t0) / 2500);
          if (k >= 1) return; show(target * (1 - Math.pow(1 - k, 3)) + rnd(-25, 25));
        });
        setTimeout(function () { show(target); dl.textContent = Math.round(target); }, 2600);
      }
      el.querySelector(".sp-go").addEventListener("click", run);
      run();
    });

  // 34. Змейка: сетка во всю ширину, голова с глазами, табло
  put("snake", "змейка",
    '<div class="gl-snake2"><canvas></canvas><div class="sn-bar"><b class="sn-score">SCORE 0</b><span>🤖 играет сама · кликни, чтобы ускорить</span><b class="sn-best">BEST 0</b></div></div>',
    function (el) {
      var c = el.querySelector("canvas"), ctx = c.getContext("2d"), sc = el.querySelector(".sn-score"), best = el.querySelector(".sn-best");
      var S = 14, W, H = 6, snake, food, score = 0, hi = 0, speed = 130;
      function reset() { W = Math.max(20, Math.floor((c.clientWidth || 600) / S)); c.width = W * S; c.height = H * S; snake = [[5, 3], [4, 3], [3, 3]]; food = [W - 5, 2]; score = 0; }
      reset();
      el.addEventListener("click", function () { speed = speed === 130 ? 60 : 130; });
      (function tick() {
        if (!el.isConnected) return;
        var h = snake[0], dx = Math.sign(food[0] - h[0]), dy = Math.sign(food[1] - h[1]);
        var nx = dx ? [h[0] + dx, h[1]] : [h[0], h[1] + dy];
        if (snake.some(function (p) { return p[0] === nx[0] && p[1] === nx[1]; })) nx = [h[0], (h[1] + 1) % H];
        snake.unshift(nx);
        if (nx[0] === food[0] && nx[1] === food[1]) { score++; hi = Math.max(hi, score); food = [Math.floor(rnd(0, W)), Math.floor(rnd(0, H))]; if (snake.length > 25) reset(); }
        else snake.pop();
        sc.textContent = "SCORE " + score; best.textContent = "BEST " + hi;
        ctx.fillStyle = "#17110a"; ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "rgba(255,179,71,0.06)";
        for (var x = 0; x < W; x++) for (var y = 0; y < H; y++) if ((x + y) % 2) ctx.fillRect(x * S, y * S, S, S);
        ctx.font = (S - 2) + "px serif"; ctx.fillText("🍎", food[0] * S, food[1] * S + S - 2);
        snake.forEach(function (p, i) {
          ctx.fillStyle = i ? "#d99a2b" : "#ffb347";
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(p[0] * S + 1, p[1] * S + 1, S - 2, S - 2, 4) : ctx.rect(p[0] * S + 1, p[1] * S + 1, S - 2, S - 2); ctx.fill();
        });
        ctx.fillStyle = "#17110a"; ctx.fillRect(snake[0][0] * S + 4, snake[0][1] * S + 4, 2, 2); ctx.fillRect(snake[0][0] * S + 8, snake[0][1] * S + 4, 2, 2);
        setTimeout(tick, speed);
      })();
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

  // ---- 3. Новые идеи ----

  // Кнопка питания CRT: выключает «монитор» — весь экран схлопывается в полоску
  put("crtpower", "кнопка питания CRT",
    '<div class="gl-crtpwr"><button type="button" class="pwr-btn" aria-label="Выключить монитор">⏻</button><span>Не нажимайте кнопку питания монитора. Серьёзно.</span></div>',
    function (el) {
      el.querySelector(".pwr-btn").addEventListener("click", function () {
        if (document.documentElement.classList.contains("crt-off")) return;
        document.documentElement.classList.add("crt-off");
        setTimeout(function () { document.documentElement.classList.remove("crt-off"); document.documentElement.classList.add("crt-on"); }, 1700);
        setTimeout(function () { document.documentElement.classList.remove("crt-on"); }, 2600);
      });
    });

  // Стикер с паролем на мониторе
  put("sticky", "стикер с паролем",
    '<div class="gl-sticky"><div class="note"><b>Wi-Fi: DNS_Guest</b><span>пароль: <i class="pw">qwerty123</i></span><small>не трогать! — админ</small></div><em class="sec">👆 наведи на пароль</em></div>',
    function (el) {
      var pw = el.querySelector(".pw"), sec = el.querySelector(".sec");
      pw.addEventListener("mouseenter", function () { pw.textContent = "********"; sec.textContent = "Служба ИБ: стикер изъят, админ оштрафован 🚨"; });
      pw.addEventListener("mouseleave", function () { setTimeout(function () { pw.textContent = "qwerty123"; sec.textContent = "👆 наведи на пароль"; }, 1500); });
    });

  // ---- 4. Статусы для панели обзора ----
  window.GAP_STATUS = {
    approved: ["log", "news", "badges", "brands", "uptime", "term", "loading", "leds", "rack", "bios", "ping", "matrix", "jira", "ports", "clippy", "rj45", "dvd", "traceroute"],
    review: ["cable", "win98", "tetris", "wifi", "tamagotchi", "htop", "cat", "captcha", "packets", "bsod", "dialup", "speedtest", "snake", "morse", "crtpower", "sticky"]
  };
  // консольные: на странице одновременно только одна из них
  window.GAP_CONSOLE = ["term", "bios", "traceroute", "log"];
})();
