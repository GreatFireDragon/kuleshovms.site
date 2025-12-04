document.addEventListener("DOMContentLoaded", function () {
  // Page has finished loading. Now, do things.
  loadLayoutByPetraPixel();

  // Background shadow movement
  document.addEventListener('mousemove', (e) => {
    // 1. Get the mouse position
    const x = e.clientX;
    const y = e.clientY;

    // 2. Get the center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 3. Define sensitivity (lower = subtler movement, higher = more movement)
    const sensitivity = 0.01;

    // 4. Calculate the offset
    // We subtract center so movement is relative to the middle of the screen
    const deltaX = (x - centerX) * sensitivity;
    const deltaY = (y - centerY) * sensitivity;

    // 5. Update the CSS variables on the body
    document.body.style.setProperty('--move-x', `${deltaX}px`);
    document.body.style.setProperty('--move-y', `${deltaY}px`);
  });

  
  
});

function loadLayoutByPetraPixel() {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;
  mainEl.insertAdjacentHTML("beforebegin", headerHTML());
  mainEl.insertAdjacentHTML("afterend", footerHTML());
  giveActiveClassToCurrentPage();
}

const nesting = getNesting();

function headerHTML() {
  let fileUrl = nesting + '/Layout/sidebar.html';

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

  return `


      <!-- =============================================== -->
      <!-- FOOTER -->
      <!-- =============================================== -->

      <footer>
            <div>GreatFireDragon
            <br/>
            Template generated with <a href="https://petrapixel.neocities.org/coding/layout-generator.html">petrapixel's layout generator</a>.</div>
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







