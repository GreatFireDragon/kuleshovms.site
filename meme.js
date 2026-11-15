// Мемные титры «Как я собираю сервер»: отдельный блок внизу страницы, монолог сисадмина (18+).
// Запуск по клику на кнопку, чтобы не орало само.
(function () {
  var LINES = [
    "Блять, вот свитчи, патч-корды нахуй, блять, нахуй, блять, нахуй",
    "серверы нахуй, блять, нахуй, ИБП нахуй, блять, нахуй.",
    "А не эта хуета нахуй, блять, обновления ёбаные нахуй,",
    "автоматизация ёбаная нахуй — вы своей автоматизацией",
    "уже достали нахуй, блять, я не маленький.",
    "Не молодой, нахуй, чтобы бегать по серверной нахуй,",
    "туда-сюда нахуй, из-за ваших обновлений Windows ёбаных нахуй, блять.",
    "Которые вы накатили нахуй, блять, в пятницу, блять.",
    "Всё нахуй, блять, мне похуй, увольте меня нахуй, блять.",
    "Я не сделал нахуй, потому что тикеты нахуй, блять, не созданы нахуй!",
    "Делайте тикеты нахуй, блять, слушайте, вы, начальники нахуй, блять.",
    "Я буду сидеть нахуй на жопе ровно нахуй, блять,",
    "пока тикетов не будет нахуй, блять.",
    "Требований дохуя, а доступов нихуя нахуй нету,",
    "нахуйблятьнахуйблятьнахуйблятьнахуй, пошли нахуй."
  ];

  function init() {
    // отдельный блок в самом низу страницы
    var main = document.querySelector("main#content");
    if (!main || document.getElementById("server-build")) return;
    main.insertAdjacentHTML("beforeend",
      '<section id="server-build"><h2>🎬 Как я собираю сервер <small class="meme-age">18+</small></h2>' +
      '<div class="meme-frame"><img src="/images/me/me-at-desk-800.webp" alt="Сборка сервера" width="800" height="758" loading="lazy" decoding="async" /></div></section>');
    var frame = document.querySelector("#server-build .meme-frame");
    frame.classList.add("meme-host");
    frame.insertAdjacentHTML("beforeend",
      '<div class="meme-rec">🔴 REC · Сборка сервера</div>' +
      '<div class="meme-subs" aria-live="polite"></div>' +
      '<button type="button" class="meme-play">▶ Как я собираю сервер <small>18+, со звуком в голове</small></button>');
    var subs = frame.querySelector(".meme-subs"), btn = frame.querySelector(".meme-play"), playing = false;

    // титры: весь текст крупно едет снизу вверх, как в конце фильма
    var crawl = document.createElement("div");
    crawl.className = "meme-crawl";
    crawl.innerHTML = LINES.map(function (l) { return "<p>" + l + "</p>"; }).join("");
    subs.appendChild(crawl);
    btn.addEventListener("click", function () {
      if (playing) return;
      playing = true;
      frame.classList.add("meme-on");
      crawl.style.animation = "none"; void crawl.offsetWidth;
      crawl.style.animation = "";
      crawl.style.setProperty("--dist", -(crawl.offsetHeight + frame.offsetHeight) + "px");
      crawl.classList.add("go");
      crawl.addEventListener("animationend", function done() {
        crawl.removeEventListener("animationend", done);
        crawl.classList.remove("go");
        frame.classList.remove("meme-on");
        playing = false;
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
