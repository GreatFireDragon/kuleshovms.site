// Таймкод на стене видеонаблюдения
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var d = new Date(), t = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    document.querySelectorAll(".cctv-wall .ts").forEach(function (el) { el.textContent = t; });
  }
  tick(); setInterval(tick, 1000);
})();
