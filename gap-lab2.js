// 30 дополнительных вставок + 4 варианта футера.
// Регистрируются в window.GAP_EXTRA (вставки) и window.FOOTER_VARIANTS (футер);
// gap-lab.js подмешивает их в общий пул и раскладывает по .gap-slot.
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

  // 3. Окно ошибки Windows 98
  add("win98", "ошибка Win98",
    '<div class="gl-win98"><div class="w98-title">Опыт.exe<span>✕</span></div><div class="w98-body"><span class="w98-icon">⚠</span><p>Программа «Опыт.exe» выполнила недопустимую операцию и будет… принята на работу.</p></div><div class="w98-btns"><a class="w98-btn" href="https://t.me/dnsit1" target="_blank">Нанять</a><button class="w98-btn w98-run" type="button">Отмена</button><button class="w98-btn" type="button">Подробнее &gt;&gt;</button></div></div>',
    function (el) {
      var run = el.querySelector(".w98-run");
      run.addEventListener("mouseenter", function () { run.style.transform = "translate(" + rnd(-60, 60) + "px," + rnd(-14, 14) + "px)"; });
      run.addEventListener("click", function () { run.textContent = "Не-а 🙂"; });
    });

  // 4. Тетрис из 88x31
  var aiBadges = ["allow", "claude", "grok", "hotgpus", "pelican", "smile", "vibes", "wrapper", "moat"];
  add("tetris", "тетрис 88x31",
    '<div class="gl-tetris">' + aiBadges.map(function (b, i) {
      return '<img src="/images/88x31/ai/' + b + '.gif" style="left:' + (i * 92) + 'px;animation-delay:' + (i * 0.45) + 's" width="88" height="31" alt="" loading="lazy" />';
    }).join("") + '</div>');

  // 5. Wi-Fi сигнал
  add("wifi", "Wi-Fi сигнал",
    '<div class="gl-panel gl-wifi"><div class="bars"><i></i><i></i><i></i><i></i></div><span>Wi-Fi в ТЦ: <b>стабильно нестабилен</b></span><em></em></div>',
    function (el) {
      var bars = el.querySelectorAll(".bars i"), em = el.querySelector("em");
      every(el, 700, function () {
        var lvl = Math.floor(rnd(0, 5));
        bars.forEach(function (b, i) { b.classList.toggle("on", i < lvl); });
        em.textContent = ["нет сети", "-89 dBm", "-76 dBm", "-61 dBm", "-48 dBm"][lvl];
      });
    });

  // 6. Тамагочи-сервер
  add("tamagotchi", "тамагочи-сервер",
    '<div class="gl-tama"><div class="tama-face"><i class="eye"></i><i class="eye"></i><b class="mouth"></b></div><div class="tama-stats"><label>RAM <span><i class="ram"></i></span></label><label>Uptime <span><i class="up"></i></span></label><label>Кофе <span><i class="coffee"></i></span></label><em>Покорми меня патчами</em></div></div>',
    function (el) {
      var r = el.querySelector(".ram"), u = el.querySelector(".up"), c = el.querySelector(".coffee");
      every(el, 1200, function () { r.style.width = rnd(40, 95) + "%"; u.style.width = rnd(85, 100) + "%"; c.style.width = rnd(5, 30) + "%"; });
    });

  // 7. htop
  add("htop", "htop",
    '<div class="gl-panel gl-htop"><pre class="cpu"></pre><pre class="procs"></pre></div>',
    function (el) {
      var cpu = el.querySelector(".cpu"), procs = el.querySelector(".procs");
      var names = ["fix_kassa.exe", "coffee.service", "zabbix_agentd", "ping_everything", "cursor --vibe", "nginx: worker"];
      function bar(p) { var n = Math.round(p / 5); return "[" + "|".repeat(n) + " ".repeat(20 - n) + Math.round(p) + "%]"; }
      every(el, 900, function () {
        cpu.textContent = [1, 2, 3, 4].map(function (i) { return i + " " + bar(rnd(3, 99)); }).join("\n");
        procs.textContent = "  PID  CPU%  COMMAND\n" + names.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3).map(function (n) {
          return "  " + Math.floor(rnd(1000, 9999)) + "  " + rnd(0, 99).toFixed(1).padStart(4) + "  " + n;
        }).join("\n");
      });
    });

  // 8. Котик
  add("cat", "котик на кабеле",
    '<div class="gl-cat"><div class="cable-line"></div><span class="kitty">🐈</span><span class="zzz">💤</span></div>');

  // 9. Капча
  add("captcha", "капча «я не робот»",
    '<div class="gl-captcha"><button type="button" class="cap-box" aria-label="Я не робот"></button><span class="cap-text">Я не робот</span><span class="cap-logo">reCAPTCHA*<small>*почти</small></span></div>',
    function (el) {
      var box = el.querySelector(".cap-box"), t = el.querySelector(".cap-text");
      box.addEventListener("click", function () {
        box.classList.add("spin");
        setTimeout(function () { box.classList.remove("spin"); box.classList.add("ok"); t.textContent = "Вы не робот. А вот Cursor — робот 🤖"; }, 1100);
      });
    });

  // 10. Тикет Jira
  add("jira", "тикет Jira",
    '<div class="gl-jira"><span class="j-key">HD-1770740</span><b>Пинпад не работает, касса плачет</b><span class="j-status"></span><span class="j-who">👤 Кулешов М.</span></div>',
    function (el) {
      var st = el.querySelector(".j-status"), s = [["ОТКРЫТ", "open"], ["В РАБОТЕ", "work"], ["РЕШЕНО", "done"]], k = 0;
      every(el, 1500, function () { var x = s[k++ % 3]; st.textContent = x[0]; st.className = "j-status " + x[1]; });
    });

  // 11. Пакеты через коммутатор
  add("packets", "пакеты через свитч",
    '<div class="gl-packets"><span class="sw">SWITCH</span><i>📦</i><i>📦</i><i>📦</i><i class="lost">📦</i></div>');

  // 12. Ctrl+Alt+Del
  add("keys", "Ctrl+Alt+Del",
    '<div class="gl-keys"><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Del</kbd><em>универсальное решение с 1995 года</em></div>');

  // 13. BSOD
  add("bsod", "синий экран",
    '<div class="gl-bsod"><b>:(</b><p>Ваш опыт столкнулся с проблемой: его слишком много. Собираем сведения об ошибке… <span class="pct">0</span>% выполнено</p></div>',
    function (el) {
      var p = el.querySelector(".pct"), v = 0;
      every(el, 400, function () { v = v >= 100 ? 0 : Math.min(100, v + Math.floor(rnd(1, 9))); p.textContent = v; });
    });

  // 14. Дискета
  add("floppy", "дискета",
    '<div class="gl-panel gl-floppy"><span class="disk"><i></i></span><span class="fl-text">Сохранение резюме.doc на A:\\</span><div class="fl-bar"><i></i></div><em class="fl-msg"></em></div>',
    function (el) {
      var bar = el.querySelector(".fl-bar i"), msg = el.querySelector(".fl-msg"), w = 0;
      every(el, 250, function () {
        w += 4;
        if (w > 100) { msg.textContent = "Недостаточно места на диске: опыт > 1,44 МБ"; if (w > 140) { w = 0; msg.textContent = ""; } }
        bar.style.width = Math.min(w, 100) + "%";
      });
    });

  // 15. Dial-up модем
  add("dialup", "dial-up модем",
    '<div class="gl-panel gl-dialup"><span class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><b class="dial-text"></b></div>',
    function (el) {
      var t = el.querySelector(".dial-text"), s = ["Набор номера…", "пиии-пиу-кшшшш-ДЖЖЖЖ", "Проверка имени пользователя…", "Соединение установлено: 56 Кбит/с"], k = 0;
      every(el, 1600, function () { t.textContent = s[k++ % s.length]; });
    });

  // 16. Осциллограф
  add("scope", "осциллограф",
    '<div class="gl-panel gl-scope"><svg viewBox="0 0 300 50" preserveAspectRatio="none"><path d=""/></svg><span>сигнал: <b>стабильный</b></span></div>',
    function (el) {
      var path = el.querySelector("path"), ph = 0;
      every(el, 60, function () {
        ph += 0.25; var d = "M0 25";
        for (var x = 0; x <= 300; x += 5) d += " L" + x + " " + (25 + Math.sin(x / 18 + ph) * 15 * Math.sin(x / 90 + ph / 3)).toFixed(1);
        path.setAttribute("d", d);
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

  // 18. git log
  add("gitlog", "git log",
    '<div class="gl-panel gl-git"><pre>' +
    '<i class="g">*</i> <i class="h">a1b2c3</i> fix: касса\n' +
    '<i class="g">*</i> <i class="h">d4e5f6</i> fix: касса (теперь точно)\n' +
    '<i class="g">|\\</i>\n' +
    '<i class="g">| *</i> <i class="h">0badf00d</i> hotfix: пятница 18:00\n' +
    '<i class="g">*</i> <i class="h">c0ffee</i> final_final_v2_ПРАВДА_ФИНАЛ' +
    '</pre></div>');

  // 19. Дежурство
  add("oncall", "график дежурств",
    '<div class="gl-oncall">' + ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(function (d, i) {
      return '<span class="' + (i === 4 ? "fri" : i > 4 ? "wk" : "") + '"><b>' + d + '</b>' + (i === 4 ? "18:00 — всё ложится 🔥" : i > 4 ? "на связи 📱" : "✓") + "</span>";
    }).join("") + "</div>");

  // 20. Погода для серверов
  var weather = ["Москва ☀ 0 инцидентов", "Тверь 🌧 Wi-Fi осадки", "Пушкино ⛈ гроза на складе", "Химки 🌫 туман в серверной", "Одинцово 🌤 местами пинг", "Балашиха ❄ похолодание касс"];
  add("weather", "погода для серверов",
    '<div class="gl-weather"><b>🌦 Прогноз по дивизиону</b><div class="txt-ticker"><div class="txt-track">' + weather.concat(weather).map(function (w) { return "<span>" + w + "</span>"; }).join("") + "</div></div></div>");

  // 21. Спидтест
  add("speedtest", "спидтест",
    '<div class="gl-speed"><svg viewBox="0 0 100 56"><path class="arc" d="M8 50 A42 42 0 0 1 92 50"/><line class="needle" x1="50" y1="50" x2="50" y2="14"/></svg><div><b>Download: <span class="dl">0</span> Мбит/с</b><br/>Upload: ну такое</div></div>',
    function (el) {
      var n = el.querySelector(".needle"), dl = el.querySelector(".dl");
      every(el, 900, function () { var v = rnd(600, 950); n.style.transform = "rotate(" + ((v / 1000) * 180 - 90) + "deg)"; dl.textContent = Math.round(v); });
    });

  // 22. Сканер портов
  var ports = [22, 23, 53, 80, 161, 443, 3389, 5432, 8080, 8291, 9090, 10050];
  add("ports", "сканер портов",
    '<div class="gl-panel gl-ports"><span>$ nmap office.lan</span><div class="grid">' + ports.map(function (p) { return "<i>" + p + "</i>"; }).join("") + "</div></div>",
    function (el) {
      var cells = el.querySelectorAll(".grid i");
      every(el, 500, function () { if (el.dataset.done) return; var c = pick(cells); c.className = Math.random() < 0.75 ? "open" : "closed"; });
    });

  // 23. Змейка
  add("snake", "змейка",
    '<div class="gl-panel gl-snake"><canvas width="300" height="60"></canvas><span class="score">score: 0</span></div>',
    function (el) {
      var c = el.querySelector("canvas"), ctx = c.getContext("2d"), sc = el.querySelector(".score");
      var W = 30, H = 6, S = 10, snake = [[5, 3], [4, 3], [3, 3]], food = [20, 2], score = 0;
      every(el, 140, function () {
        var h = snake[0], dx = Math.sign(food[0] - h[0]), dy = Math.sign(food[1] - h[1]);
        var nx = [h[0] + (dx || 0), h[1] + (dx ? 0 : dy)];
        if (snake.some(function (p) { return p[0] === nx[0] && p[1] === nx[1]; })) nx = [h[0], (h[1] + 1) % H];
        snake.unshift(nx);
        if (nx[0] === food[0] && nx[1] === food[1]) { score++; food = [Math.floor(rnd(0, W)), Math.floor(rnd(0, H))]; if (snake.length > 18) snake = snake.slice(0, 4); }
        else snake.pop();
        sc.textContent = "score: " + score;
        ctx.fillStyle = "#17110a"; ctx.fillRect(0, 0, 300, 60);
        ctx.fillStyle = "#ff5a3c"; ctx.fillRect(food[0] * S, food[1] * S, S - 1, S - 1);
        ctx.fillStyle = "#ffb347"; snake.forEach(function (p) { ctx.fillRect(p[0] * S, p[1] * S, S - 1, S - 1); });
      });
    });

  // 24. Скрепка-помощник
  add("clippy", "скрепка-помощник",
    '<div class="gl-clippy"><span class="clip">📎</span><div class="bubble">Похоже, вы читаете резюме. Хотите нанять этого человека?<div><a href="https://t.me/dnsit1" target="_blank">Да</a><a href="https://t.me/dnsit1" target="_blank">Конечно да</a></div></div></div>');

  // 25. Без инцидентов
  add("stopwatch", "без инцидентов",
    '<div class="gl-panel gl-stopwatch"><span>Без инцидентов:</span><b class="sw-time">00:00:00</b><em class="sw-msg"></em></div>',
    function (el) {
      var t = el.querySelector(".sw-time"), m = el.querySelector(".sw-msg"), s = 0, limit = rnd(4, 12);
      every(el, 1000, function () {
        s++;
        if (s > limit) { s = 0; limit = rnd(4, 12); m.textContent = "🔥 инцидент! сброс"; el.classList.add("flash"); setTimeout(function () { m.textContent = ""; el.classList.remove("flash"); }, 900); }
        t.textContent = "00:00:" + String(s).padStart(2, "0");
      });
    });

  // 26. Порт RJ45
  add("rj45", "порт RJ45",
    '<div class="gl-panel gl-rj45"><span class="jack"><i class="link"></i><i class="act"></i><b></b></span><span>link up · 1000 Мбит/с · full-duplex · кабель: обжат с любовью</span></div>');

  // 27. Морзянка
  var MORSE = { H: "....", I: "..", R: ".-.", E: ".", M: "--", " ": " " };
  add("morse", "морзянка",
    '<div class="gl-panel gl-morse"><i class="lamp"></i><span class="code"></span><b class="decoded"></b></div>',
    function (el) {
      var lamp = el.querySelector(".lamp"), code = el.querySelector(".code"), dec = el.querySelector(".decoded");
      var msg = "HIRE ME", seq = [];
      msg.split("").forEach(function (ch) { (MORSE[ch] || "").split("").forEach(function (s) { seq.push([s, ch]); }); seq.push(["/", ch]); });
      var k = 0, shown = "";
      every(el, 380, function () {
        var x = seq[k++ % seq.length];
        if (k % seq.length === 1) { shown = ""; code.textContent = ""; }
        if (x[0] === "/") { shown += x[1]; dec.textContent = shown; lamp.classList.remove("on"); return; }
        code.textContent += x[0] === " " ? " / " : x[0];
        lamp.classList.add("on"); setTimeout(function () { lamp.classList.remove("on"); }, x[0] === "-" ? 300 : 120);
      });
    });

  // 28. Пейджер
  add("pager", "пейджер",
    '<div class="gl-pager"><span class="pg-body">📟</span><span class="pg-lcd"></span></div>',
    function (el) {
      var l = el.querySelector(".pg-lcd"), s = ["АЛЕРТ: всё хорошо", "Касса №3: снова пинпад", "Кофе: критически мало", "Пятница 17:59: не трогай прод", "Вас ищет HR. Хорошо"], k = 0;
      every(el, 2200, function () { l.textContent = s[k++ % s.length]; });
    });

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

  // 30. Мудрость сисадмина
  var wisdom = ["Работает — не трогай.", "Бэкапов много не бывает.", "Сначала проверь кабель.", "Это всегда DNS.", "Нет ничего более постоянного, чем временное решение.", "Не выкатывай в пятницу.", "Перезагрузка лечит 80% проблем. Остальные 20% — тоже."];
  add("fortune", "мудрость сисадмина",
    '<div class="gl-fortune"><span>🥠</span><q class="f-text"></q></div>',
    function (el) {
      var t = el.querySelector(".f-text"), k = Math.floor(rnd(0, wisdom.length));
      every(el, 5000, function () { t.classList.remove("show"); setTimeout(function () { t.textContent = wisdom[k++ % wisdom.length]; t.classList.add("show"); }, 300); });
    });

  // ===================== ФУТЕР: 4 варианта =====================
  window.FOOTER_VARIANTS = {
    fkeys: {
      label: "A F-клавиши",
      html: '<div class="ft-fkeys"><a href="#about-intro"><b>F1</b>Помощь</a><a href="#experience"><b>F2</b>Опыт</a><a href="javascript:location.reload()"><b>F5</b>Обновить</a><a href="https://t.me/dnsit1" target="_blank"><b>F10</b>Связь в ТГ</a><a href="#top" onclick="scrollTo({top:0,behavior:\'smooth\'});return false"><b>ESC</b>Наверх</a></div>'
    },
    visits: {
      label: "B счётчик визитов",
      html: '<div class="ft-visits">Вы заходили сюда: <span class="odo"></span> раз</div>',
      init: function (el) {
        var n = 1; try { n = +(localStorage.getItem("ftVisits") || 0) + 1; localStorage.setItem("ftVisits", n); } catch (e) {}
        el.querySelector(".odo").innerHTML = String(n).padStart(6, "0").split("").map(function (d) { return "<i>" + d + "</i>"; }).join("");
      }
    },
    cli: {
      label: "C командная строка",
      html: '<div class="ft-cli"><pre class="cli-out">Введите help, чтобы узнать команды</pre><label>kuleshovms@site:~$ <input type="text" spellcheck="false" autocomplete="off" aria-label="Командная строка" /></label></div>',
      init: function (el) {
        var out = el.querySelector(".cli-out"), inp = el.querySelector("input");
        var cmds = {
          help: "Команды: whoami, contacts, skills, sudo hire, uptime, clear",
          whoami: "Кулешов Михаил — инженер IT-инфраструктуры. По трудовой — сисадмин.",
          contacts: "Telegram: @dnsit1",
          skills: "сети, серверы, видеонаблюдение, автоматизация, Cursor",
          "sudo hire": "[sudo] пароль: ******** … Доступ разрешён. Пишите в ТГ: @dnsit1 🎉",
          hire: "Permission denied. Попробуйте sudo 😉",
          uptime: "Стабильно. Как и я.",
          "rm -rf /": "Хорошая попытка 🙂"
        };
        inp.addEventListener("keydown", function (e) {
          if (e.key !== "Enter") return;
          var c = inp.value.trim().toLowerCase(); inp.value = "";
          if (c === "clear") { out.textContent = ""; return; }
          out.textContent = "$ " + c + "\n" + (cmds[c] || "command not found: " + c + " (попробуйте help)");
        });
      }
    },
    badges: {
      label: "D значки + 800×600",
      html: '<div class="ft-badges"><img src="/images/88x31/get-firefox.gif" width="88" height="31" alt="" loading="lazy" /><img src="/images/88x31/best_viewed_with_eyes.gif" width="88" height="31" alt="" loading="lazy" /><img src="/images/88x31/ai/vibes.gif" width="88" height="31" alt="" loading="lazy" /><span>Best viewed in 800×600 · Сделано вручную… ну почти</span></div>'
    }
  };
})();
