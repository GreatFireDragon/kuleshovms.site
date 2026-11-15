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

const nesting = getNesting();

function headerHTML() {
  
    return `
    <!-- =============================================== -->
<!-- HEADER -->
<!-- =============================================== -->

<header>
  <a href="/index.html">
    <img src="/images/GFD Logo.svg" alt="KuleshovMS" fetchpriority="high" />
  </a>
  <h1>KuleshovMS</h1>
</header>
    `;
}

function sidebarHTML_normal() {
  let fileUrl = nesting + '/Layout/sidebar.html?v=15';

  fetch(fileUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(htmlContent => {
      const randomPhotoId = Math.floor(Math.random() * 200) + 1;
      const modifiedHtmlContent = htmlContent.replace(/{{photo-id}}/g, randomPhotoId);
      document.querySelector('div.layout').insertAdjacentHTML('afterbegin', modifiedHtmlContent);
      makeTickers();
    })
    .catch(error => {
      console.error('Error loading the sidebar:', error);
    });

  return ``;
}

function footerHTML() {
  // ${nesting} outputs "./" or "../" depending on current page depth.
  // You can use it to refer to images etc.
  // Example: <img src="${nesting}img/logo.png"> might output <img src="../img/logo.png">

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

function getNesting() {
  const numberOfSlashes = window.location.pathname.split("/").length - 1;
  if (numberOfSlashes == 1) return "./";
  return "../".repeat(numberOfSlashes - 1);
}









/* Бесконечная лента 88x31 вместо <marquee>: содержимое дублируется,
   лента сдвигается ровно на половину своей ширины и начинается заново —
   разрыва в конце не видно. */
function makeTickers() {
  document.querySelectorAll('marquee.img88x31, marquee.tech-stack-icons').forEach(function (mq) {
    var items = Array.prototype.slice.call(mq.children);
    var ticker = document.createElement('div');
    ticker.className = 'ticker88' + (mq.classList.contains('tech-stack-icons') ? ' tech-stack-icons' : '');
    var track = document.createElement('div');
    track.className = 'ticker88-track';
    // минимум 6 значков в половине ленты, чтобы она была шире сайдбара
    var copies = Math.max(1, Math.ceil(6 / items.length));
    for (var half = 0; half < 2; half++) {
      for (var c = 0; c < copies; c++) {
        items.forEach(function (el) {
          var clone = el.cloneNode(true);
          if (half === 1) clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; });
          if (clone.tagName === 'IMG') clone.loading = 'eager';
          track.appendChild(clone);
        });
      }
    }
    track.style.animationDuration = (items.length * copies * (mq.classList.contains('tech-stack-icons') ? 1.5 : 2.5)) + 's';
    ticker.appendChild(track);
    mq.replaceWith(ticker);
  });
}
