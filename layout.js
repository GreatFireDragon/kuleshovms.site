document.addEventListener("DOMContentLoaded", function () {
  // Page has finished loading. Now, do things.
  loadLayoutByPetraPixel();  
});

function loadLayoutByPetraPixel() {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  mainEl.insertAdjacentHTML("beforebegin", headerHTML());

  mainEl.insertAdjacentHTML("afterbegin", sidebarHTML_normal());
  
  mainEl.insertAdjacentHTML("afterend", footerHTML());
  giveActiveClassToCurrentPage();
}

function headerHTML() {
  
    return `
    <!-- =============================================== -->
<!-- HEADER -->
<!-- =============================================== -->

<header>
  <a href="/index.html">
    <img src="/images/me/avatar-pixel.png" alt="KuleshovMS" width="70" height="70" class="pixel-avatar" fetchpriority="high" />
  </a>
  <h1>KuleshovMS</h1>
</header>
    `;
}

function sidebarHTML_normal() {
  // тот же адрес, что в <link rel="preload"> страницы — иначе предзагрузка пропадает зря
  let fileUrl = '/Layout/sidebar.html?v=23';

  fetch(fileUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(htmlContent => {
      document.querySelector('div.layout').insertAdjacentHTML('afterbegin', htmlContent);
      makeTickers();
    })
    .catch(error => {
      console.error('Error loading the sidebar:', error);
    });

  return ``;
}

function footerHTML() {

  const currentYear = new Date().getFullYear();

  return `

      <!-- =============================================== -->
      <!-- FOOTER -->
      <!-- =============================================== -->

      <footer>
           KuleshovMS &copy; 2020-${currentYear} 
      </footer>`;
}

/* Do not edit anything below this line unless you know what you're doing. */

function giveActiveClassToCurrentPage() {
  const els = document.querySelectorAll("nav a");
  [...els].forEach((el) => {
    const href = el.getAttribute("href").replace(".html", "").replace("#", "");
    const pathname = window.location.pathname.replace("/public/", "");
    const currentHref = window.location.href.replace(".html", "") + "END";

	/* Homepage */
    if (href == "/" || href == "/index.html") {
      if (pathname == "/") {
        el.classList.add("active");
      }
    } else {
      /* Other pages */
      if (currentHref.includes(href + "END")) {
        el.classList.add("active");

        /* Subnavigation: */
		
        if (el.closest("details")) {
          el.closest("details").setAttribute("open", "open");
          el.closest("details").classList.add("active");
        }

        if (el.closest("ul")) {
          if (el.closest("ul").closest("ul")) {
          	el.closest("ul").closest("ul").classList.add("active");
          }
        }
      }
    }
  });
}

/* Бесконечная лента 88x31 вместо <marquee>: содержимое дублируется,
   лента сдвигается ровно на половину своей ширины и начинается заново —
   разрыва в конце не видно. */
function makeTickers() {
  document.querySelectorAll('marquee.img88x31, marquee.tech-stack-icons').forEach(function (mq) {
    var items = Array.prototype.slice.call(mq.children);
    var ticker = document.createElement('div');
    ticker.className = 'ticker88' + (mq.classList.contains('tech-stack-icons') ? ' tech-stack-icons' : '') + (mq.classList.contains('reverse') ? ' reverse' : '');
    var track = document.createElement('div');
    track.className = 'ticker88-track';
    // минимум 6 значков в половине ленты, чтобы она была шире сайдбара
    var copies = Math.max(1, Math.ceil(6 / items.length));
    for (var half = 0; half < 2; half++) {
      for (var c = 0; c < copies; c++) {
        items.forEach(function (el) {
          var clone = el.cloneNode(true);
          if (half === 1) clone.setAttribute('aria-hidden', 'true');
          // картинки ленты качаем, только когда лента подъехала к экрану (см. ниже)
          var imgs = clone.tagName === 'IMG' ? [clone] : Array.prototype.slice.call(clone.querySelectorAll('img'));
          imgs.forEach(function (i) { i.dataset.src = i.getAttribute('src'); i.removeAttribute('src'); i.loading = 'eager'; });
          track.appendChild(clone);
        });
      }
    }
    track.style.animationDuration = (items.length * copies * (mq.classList.contains('tech-stack-icons') ? 1.5 : 2.5)) + 's';
    ticker.appendChild(track);
    mq.replaceWith(ticker);
    watchTicker(ticker);
  });
}

// Лента вне экрана: картинки не грузим, анимацию ставим на паузу.
function watchTicker(ticker) {
  function load() {
    ticker.querySelectorAll('img[data-src]').forEach(function (i) { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  }
  if (!('IntersectionObserver' in window)) return load();
  ticker.classList.add('off');
  new IntersectionObserver(function (es) {
    var on = es[0].isIntersecting;
    ticker.classList.toggle('off', !on);
    if (on) load();
  }, { rootMargin: '300px 0px' }).observe(ticker);
}
