// Стена видеонаблюдения и чат «всё легло» в «Опыте»
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var d = new Date(), t = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    document.querySelectorAll(".cctv-wall .ts").forEach(function (el) { el.textContent = t; });
  }
  tick(); setInterval(tick, 1000);

  // камеры: всё NO SIGNAL, раз в пару секунд одна оживает на 1,5 с; изредка в кадре кто-то есть
  var POOL = { zal: ["m1", "m2"], sklad: ["w1", "w2", "c4"], street: ["u1", "u2", "p1"], server: ["s4", "s1", "c3", "c2"] };
  var SCARY = { zal: "m1-x", street: "u2-x", server: "c2-x" };
  function src(n) { return "/images/cams/" + n + ".webp"; }
  document.querySelectorAll(".cctv-wall").forEach(function (wall) {
    var cams = wall.querySelectorAll(".cam"), last = null, started = false, count = 0;
    function wake() {
      var cam; do { cam = cams[Math.floor(Math.random() * cams.length)]; } while (cam === last && cams.length > 1);
      last = cam; count++;
      var key = cam.dataset.cam, pool = POOL[key] || [], scary = SCARY[key] && count > 3 && Math.random() < 0.15;
      var name = scary ? SCARY[key] : pool[Math.floor(Math.random() * pool.length)];
      cam.querySelector(".scene").innerHTML = '<img src="' + src(name) + '" alt="" />' + (scary ? '<span class="cap alarm">ДВИЖЕНИЕ ОБНАРУЖЕНО</span>' : "");
      cam.classList.remove("lost");
      setTimeout(function () { cam.classList.add("lost"); }, scary ? 1100 : 1500 + Math.random() * 600);
      setTimeout(wake, 2600 + Math.random() * 1800);
    }
    // качаем кадры, только когда стену видно
    var io = new IntersectionObserver(function (es) {
      if (started || !es[0].isIntersecting) return;
      started = true; io.disconnect();
      Object.keys(POOL).forEach(function (k) { POOL[k].concat(SCARY[k] || []).forEach(function (n) { new Image().src = src(n); }); });
      setTimeout(wake, 800);
    });
    io.observe(wall);
  });

  // чат: сообщения сыплются, счётчик растёт
  var WHO = ["Магазин", "Склад", "Сервисный центр", "Офис", "Неизвестный номер", "Директор", "Бухгалтерия"];
  var WHAT = ["всё легло", "интернет не работает", "принтер опять", "а можно срочно?", "ничего не трогали, само", "у нас всё красное",
    "камеры не показывают", "а вы видели моё сообщение?", "ПОЗВОНИТЕ", "скинул скрин", "перезагружали, не помогло", "уже не надо, заработало",
    "а теперь опять", "+", "у соседей тоже", "это вирус?", "😭😭😭", "а когда починят?"];
  document.querySelectorAll(".chat-flood").forEach(function (box) {
    var list = box.querySelector(".cf-list"), badge = box.querySelector(".cf-badge"), n = 0;
    function add(html, me) {
      var m = document.createElement("div"); m.className = "cf-msg" + (me ? " me" : ""); m.innerHTML = html;
      list.appendChild(m);
      while (list.children.length > 8) list.removeChild(list.firstChild);
    }
    (function next() {
      if (n >= 120) {
        add("Сейчас посмотрю 👀", true); n = 0; badge.textContent = "0";
        return setTimeout(next, 2500);
      }
      n += 1 + Math.floor(Math.random() * 3);
      badge.textContent = n > 99 ? "99+" : n;
      add("<b>" + WHO[Math.floor(Math.random() * WHO.length)] + "</b>" + WHAT[Math.floor(Math.random() * WHAT.length)]);
      setTimeout(next, Math.max(180, 900 - n * 7));
    })();
  });
})();
