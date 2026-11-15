// Раунд 3: игровой интерактив для «шаблонных» вставок (стойка, кабель, лампочки,
// лог, загрузка, аптайм) + добавки к сканеру портов, RJ45, матрице, пингу.
// Перекрывает одноимённые функции из gap-interact.js.
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

  // ===== Лампочки: игра «почини всё» =====
  I.leds = function (el) {
    var leds = el.querySelectorAll(".led"), fixed = 0;
    var h = hint(el, "лампочки ломаются — кликай по красным и чини");
    setInterval(function () {
      if (!el.isConnected) return;
      var l = leds[Math.floor(rnd(0, leds.length))];
      if (!l.classList.contains("broken")) l.classList.add("broken");
    }, 1700);
    leds.forEach(function (l) {
      l.addEventListener("click", function () {
        if (l.classList.contains("broken")) { l.classList.remove("broken"); fixed++; h.textContent = "🔧 Починено: " + fixed + (fixed >= 10 ? " — ты принят на работу!" : ""); }
        else { l.classList.add("broken"); h.textContent = "Зачем ты сломал рабочую?! 😤"; }
      });
    });
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

  // ===== Сканер портов: закрытые открываются кликом =====
  I.ports = function (el) {
    var h = hint(el, "кликай по красным портам — открывай");
    el.querySelectorAll(".grid i").forEach(function (p) {
      p.style.cursor = "pointer";
      p.addEventListener("click", function () {
        p.className = p.className === "closed" ? "open" : "closed";
        var closed = el.querySelectorAll(".grid i.closed").length;
        h.textContent = closed ? "Закрыто портов: " + closed : "Все порты открыты. Безопасник уже бежит к тебе 🏃";
      });
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
