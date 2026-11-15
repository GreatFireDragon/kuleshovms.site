// Интерактив для вставок: стойка (диски, порты, ИБП, красная кнопка), кабель,
// лампочки, тамагочи, синий экран, DVD. gap-lab.js вызывает GAP_INIT[имя](элемент).
(function () {
  var I = (window.GAP_INIT = window.GAP_INIT || {});
  function hint(el, text) {
    var h = document.createElement("small");
    h.className = "gl-hint";
    h.textContent = "👆 " + text;
    el.appendChild(h);
  }

  I.rack = function (el) {
    var frame = el.querySelector(".rack-frame");
    var status = document.createElement("div");
    status.className = "rack-status";
    status.textContent = "Все системы в норме";
    frame.appendChild(status);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rack-red";
    btn.textContent = "НЕ НАЖИМАТЬ";
    frame.querySelector(".rack-label").appendChild(btn);
    hint(el, "диски, порты и ИБП кликабельны");

    function say(t) { status.textContent = t; }
    el.querySelectorAll(".ports").forEach(function (ports, s) {
      ports.querySelectorAll("i").forEach(function (p, k) {
        p.addEventListener("click", function () {
          p.classList.toggle("down");
          say("SW-0" + (s + 1) + " порт " + (k + 1) + ": " + (p.classList.contains("down") ? "link down 😱 магазин без камер" : "link up ✓"));
        });
      });
    });
    var nvr = el.querySelector(".u-server b");
    el.querySelectorAll(".bays i").forEach(function (d, k) {
      d.addEventListener("click", function () {
        d.classList.toggle("pulled");
        var n = el.querySelectorAll(".bays i.pulled").length;
        nvr.textContent = n ? "NVR ⚠" : "NVR";
        say(n === 0 ? "RAID восстановлен ✓" : n === 1 ? "Диск " + (k + 1) + " выдернут: RAID degraded" : "Выдернуто дисков: " + n + ". Видеоархив: всё, прощай 💀");
      });
    });
    el.querySelector(".u-ups").addEventListener("click", function () {
      if (frame.classList.contains("off")) return;
      frame.classList.add("off");
      say("ИБП выключен. Тишина… слышно, как плачет дежурный");
      setTimeout(function () { frame.classList.remove("off"); frame.classList.add("boot"); say("Загрузка…"); }, 1800);
      setTimeout(function () { frame.classList.remove("boot"); say("Всё поднялось. Почти всё."); }, 3200);
    });
    btn.addEventListener("click", function () {
      if (el.classList.contains("boom")) return;
      el.classList.add("boom");
      say("💥💥💥");
      setTimeout(function () { say("…шутка. Бэкапы же есть 🙂"); }, 1800);
      setTimeout(function () { el.classList.remove("boom"); say("Все системы в норме"); }, 3400);
    });
  };

  // Кабель с физикой: тяни мышкой, перетянешь — порвётся с искрами
  I.cable = function (el) {
    el.innerHTML = '<canvas class="rope" height="90"></canvas><em class="rope-msg">👆 схвати кабель и тяни. Сильно.</em>';
    el.classList.add("rope-wrap");
    var c = el.querySelector("canvas"), ctx = c.getContext("2d"), msg = el.querySelector(".rope-msg");
    var N = 26, pts, cons, grab = -1, broken = false, sparks = [], packet = 0, W;
    function build() {
      W = c.width = c.clientWidth || 600;
      pts = []; cons = [];
      for (var i = 0; i < N; i++) { var x = 24 + (W - 48) * i / (N - 1); pts.push({ x: x, y: 26, px: x, py: 26 }); }
      var seg = (W - 48) / (N - 1) * 1.012;
      for (var j = 0; j < N - 1; j++) cons.push({ a: j, b: j + 1, len: seg });
      broken = false; msg.textContent = "👆 схвати кабель и тяни. Сильно.";
    }
    build();
    function pos(e) { var r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; }
    c.addEventListener("pointerdown", function (e) {
      var p = pos(e), best = -1, bd = 900;
      pts.forEach(function (q, i) { var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y); if (d < bd && i > 0 && i < N - 1) { bd = d; best = i; } });
      if (best > -1) { grab = best; c.setPointerCapture(e.pointerId); }
    });
    c.addEventListener("pointermove", function (e) { if (grab < 0) return; var p = pos(e); pts[grab].x = p.x; pts[grab].y = p.y; });
    c.addEventListener("pointerup", function () { grab = -1; });
    function snap() {
      broken = true;
      var at = grab > 0 ? grab : N >> 1;
      cons = cons.filter(function (k) { return k.a !== at; });
      for (var i = 0; i < 30; i++) sparks.push({ x: pts[at].x, y: pts[at].y, vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.9) * 7, life: 40 });
      msg.textContent = "💥 Кабель порван! Магазин без интернета. Чиню…";
      grab = -1;
      setTimeout(function () { if (el.isConnected) build(); }, 2600);
    }
    (function loop() {
      if (!el.isConnected) return;
      // verlet
      pts.forEach(function (p, i) {
        if (i === 0 || i === N - 1 || i === grab) return;
        var vx = (p.x - p.px) * 0.98, vy = (p.y - p.py) * 0.98;
        p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + 0.45;
        if (p.y > 84) p.y = 84;
      });
      for (var it = 0; it < 8; it++) cons.forEach(function (k) {
        var A = pts[k.a], B = pts[k.b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, diff = (d - k.len) / d / 2;
        var lockA = k.a === 0 || k.a === grab, lockB = k.b === N - 1 || k.b === grab;
        if (!lockA) { A.x += dx * diff * (lockB ? 2 : 1); A.y += dy * diff * (lockB ? 2 : 1); }
        if (!lockB) { B.x -= dx * diff * (lockA ? 2 : 1); B.y -= dy * diff * (lockA ? 2 : 1); }
      });
      if (!broken) {
        var total = 0; cons.forEach(function (k) { total += Math.hypot(pts[k.b].x - pts[k.a].x, pts[k.b].y - pts[k.a].y); });
        var rest = cons.reduce(function (s2, k) { return s2 + k.len; }, 0);
        if (total > rest * 1.45) snap();
        else if (total > rest * 1.25) msg.textContent = "⚠ Осторожно, натяжение! Ещё чуть-чуть…";
        else if (grab > -1) msg.textContent = "Тянешь кабель. Магазин нервничает.";
      }
      // отрисовка
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      [["#2d6db0", 9], ["#4a90d9", 6]].forEach(function (st) {
        ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
        cons.forEach(function (k) { ctx.beginPath(); ctx.moveTo(pts[k.a].x, pts[k.a].y); ctx.lineTo(pts[k.b].x, pts[k.b].y); ctx.stroke(); });
      });
      ctx.fillStyle = "#3d3831";
      ctx.fillRect(4, 16, 20, 20); ctx.fillRect(W - 24, 16, 20, 20);
      ctx.fillStyle = broken ? "#ff3b30" : "#3dff6a";
      ctx.fillRect(8, 12, 5, 4); ctx.fillRect(W - 13, 12, 5, 4);
      if (!broken) {
        packet = (packet + 0.25) % (N - 1);
        var i0 = Math.floor(packet), f = packet - i0, A = pts[i0], B = pts[i0 + 1];
        ctx.fillStyle = "#fff6a8"; ctx.shadowColor = "#fff6a8"; ctx.shadowBlur = 8;
        ctx.fillRect(A.x + (B.x - A.x) * f - 4, A.y + (B.y - A.y) * f - 4, 8, 8);
        ctx.shadowBlur = 0;
      }
      sparks = sparks.filter(function (s3) { return s3.life-- > 0; });
      sparks.forEach(function (s3) { s3.x += s3.vx; s3.y += s3.vy; s3.vy += 0.3; ctx.fillStyle = s3.life > 20 ? "#fff1c1" : "#ff8c00"; ctx.fillRect(s3.x, s3.y, 3, 3); });
      requestAnimationFrame(loop);
    })();
  };

  I.leds = function (el) {
    hint(el, "кликни по лампочке");
    el.querySelectorAll(".led").forEach(function (l) {
      l.addEventListener("click", function () {
        l.classList.add("broken");
        setTimeout(function () { l.classList.remove("broken"); }, 2200);
      });
    });
  };

  I.dvd = function (el) {
    hint(el, "кликни — попадём в угол");
    el.addEventListener("click", function () { el.dataset.corner = "1"; });
  };
})();
