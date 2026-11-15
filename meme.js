// Мемные субтитры поверх фото «Рабочие будни»: монолог сисадмина (18+).
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
    var frame = document.querySelector("#work-photos .zoom-frame");
    if (!frame || frame.querySelector(".meme-subs")) return;
    frame.classList.add("meme-host");
    frame.insertAdjacentHTML("beforeend",
      '<div class="meme-rec">🔴 REC · Сборка сервера</div>' +
      '<div class="meme-subs" aria-live="polite"></div>' +
      '<button type="button" class="meme-play">▶ Как я собираю сервер <small>18+, со звуком в голове</small></button>');
    var subs = frame.querySelector(".meme-subs"), btn = frame.querySelector(".meme-play"), playing = false;

    btn.addEventListener("click", function () {
      if (playing) return;
      playing = true;
      frame.classList.add("meme-on");
      var i = 0;
      (function next() {
        if (i >= LINES.length) {
          setTimeout(function () { subs.textContent = ""; frame.classList.remove("meme-on", "meme-shake", "meme-final"); playing = false; }, 2200);
          return;
        }
        var line = LINES[i++];
        subs.textContent = line;
        subs.classList.remove("pop"); void subs.offsetWidth; subs.classList.add("pop");
        var mat = (line.match(/нахуй|блять|ёбан/g) || []).length;
        frame.classList.toggle("meme-shake", mat >= 3);
        frame.classList.toggle("meme-final", i === LINES.length);
        setTimeout(next, Math.max(1400, line.length * 55));
      })();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
