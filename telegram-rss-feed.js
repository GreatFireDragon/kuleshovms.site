async function loadTelegramPosts() {
    const container = document.getElementById("telegram-feed");

    // Переменные для управления пагинацией
    let allPosts = []; // Здесь будем хранить все загруженные посты
    let currentIndex = 0; // Сколько постов уже показано
    const postsStep = 3; // Сколько постов загружать за раз

    // ПЕРЕД ПУШЕМ ПОМЕНЯТЬ НА БОЕВУЮ ССЫЛКУ!
    const url = "/rss/?action=display&bridge=TelegramBridge&username=gfd_channel&format=Json";
    // const url = "/test-rss-feed.json";

    // Функция для отрисовки порции постов
    const renderPosts = () => {
    // Берем кусочек массива от текущего индекса + 5 штук
    const nextPosts = allPosts.slice(
        currentIndex,
        currentIndex + postsStep
    );

    nextPosts.forEach((item) => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";

        const date = new Date(item.date_modified).toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        }
        );

        // Обработка замен в HTML (как в оригинале)
        item.content_html = item.content_html.replace(
        "Media is too big<br><br>\nVIEW IN TELEGRAM<br><br>",
        "<div class='watch-in-tg'>Смотреть в телеграме</div>"
        );

        item.content_html = item.content_html.replace(
        /<video /g,
        "<video autoplay muted "
        );

        postDiv.innerHTML = `
<a href="${item.url}" target="_blank" class="post-title">${item.title}</a>
<div class="post-content">${item.content_html}</div>
<div class="post-date">${date}</div>
`;

        container.appendChild(postDiv);
    });

    // Обновляем счетчик показанных постов
    currentIndex += postsStep;

    // Управление кнопкой: если показали все посты, скрываем кнопку
    const loadMoreBtn = document.getElementById("tg-load-more-btn");
    if (currentIndex >= allPosts.length && loadMoreBtn) {
        loadMoreBtn.style.display = "none";
    }
    };

    try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка сети");

    const data = await response.json();

    // Сохраняем все полученные элементы в переменную
    allPosts = data.items;

    // Очищаем контейнер от надписи "Загрузка..."
    container.innerHTML = "";

    // Если постов нет вообще
    if (allPosts.length === 0) {
        container.innerHTML = "<p>Нет новостей</p>";
        return;
    }

    renderPosts();

    if (allPosts.length > currentIndex) {
        const button = document.createElement("button");
        button.id = "tg-load-more-btn";
        button.innerHTML = "Загрузить еще посты из моего <a href='https://t.me/gfd_channel'>телеграм канала</a>";
        button.onclick = renderPosts;

        container.parentNode.insertBefore(
        button,
        container.nextSibling
        );
    }
    } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Не удалось загрузить новости :(</p>";
    }
}

// Запускаем функцию после загрузки страницы
loadTelegramPosts();