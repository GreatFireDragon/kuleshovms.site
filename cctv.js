// Стена видеонаблюдения и чат «всё легло» в «Опыте»
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var d = new Date(), t = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    document.querySelectorAll(".cctv-wall .ts").forEach(function (el) { el.textContent = t; });
  }
  tick(); setInterval(tick, 1000);

  // камеры: всё NO SIGNAL, раз в пару секунд одна оживает на 1,5 с
  var SCENES = [
    ['<span style="left:28%" class="bob">🦝</span><span style="left:58%">📦</span>', "ИНВЕНТАРИЗАЦИЯ"],
    ['<span style="left:35%;bottom:26px">🐈</span><span style="left:32%">🖥️</span>', "КОТ ГРЕЕТСЯ НА СЕРВЕРЕ"],
    ['<span style="left:35%">😴</span><span class="zz" style="left:58%;bottom:30px">z</span>', "НОЧНАЯ СМЕНА"],
    ['<span style="left:38%" class="bob">🕺</span>', "ОХРАНА НА ПОСТУ"],
    ['<span style="left:40%" class="bob">🐦</span>', "ПОСЕТИТЕЛЬ"],
    ['<span style="left:40%;bottom:24px" class="bob">👻</span>', "ДВИЖЕНИЕ В СЕРВЕРНОЙ"],
    ['<span style="left:40%;bottom:30px" class="bob">🛸</span>', "ДОСТАВКА"],
    ['<span style="left:25%">🧍</span><span style="left:52%">✂️</span><span style="left:70%">🔌</span>', "ЭТО ПРОСТО ЛИШНИЙ ПРОВОД"],
    ['<span class="run" style="font-size:18px">🐀</span>', "ГРЫЗЁТ ПАТЧ-КОРД"],
    ['<span style="left:30%">🦆</span><span style="left:55%">🦆</span>', "ТЕСТ НА ПРОИЗВОДИТЕЛЬНОСТЬ"],
    ['<span style="left:38%" class="bob">🙋</span>', "А МОЖНО МЕНЯ ТОЖЕ В ЧАТ"]
  ];
  var k = Math.floor(Math.random() * SCENES.length);
  document.querySelectorAll(".cctv-wall").forEach(function (wall) {
    var cams = wall.querySelectorAll(".cam");
    (function wake() {
      var cam = cams[Math.floor(Math.random() * cams.length)], sc = SCENES[k++ % SCENES.length];
      cam.querySelector(".scene").innerHTML = sc[0] + '<span class="cap">' + sc[1] + "</span>";
      cam.classList.remove("lost");
      setTimeout(function () { cam.classList.add("lost"); }, 1500 + Math.random() * 600);
      setTimeout(wake, 2600 + Math.random() * 1800);
    })();
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
