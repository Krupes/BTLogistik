/* ===== Бургер-меню и адаптивное подменю «Услуги склада» ===== */
(() => {
    const header = document.querySelector('.header');
    const btn = document.getElementById('burgerBtn');
    const nav = document.getElementById('headerNav');
    if (!header || !btn || !nav) return;

    const desktop = window.matchMedia('(min-width: 1101px)');
    const mobileQuery = window.matchMedia('(max-width: 1100px)');

    const setOpen = (open) => {
        header.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        if (!open) {
            document.querySelectorAll('.nav-dropdown.is-sub-open').forEach((dd) => {
                dd.classList.remove('is-sub-open');
                const trig = dd.querySelector('.nav-dropdown-trigger');
                if (trig) trig.setAttribute('aria-expanded', 'false');
            });
        }
    };

    // Открыть / закрыть бургер по кнопке
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(!header.classList.contains('is-open'));
    });

    // Логика для «Услуги склада» в мобильном бургере:
    // - Клик по тонкому ТЕКСТУ (.nav-dropdown-text) -> переход по ссылке на страницу склада
    // - Клик по любой другой части элемента (.nav-dropdown-trigger или стрелке) -> раскрытие подменю СВХ/СОХ
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach((dd) => {
        const trigger = dd.querySelector('.nav-dropdown-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            if (!mobileQuery.matches) return; // На десктопе работает обычный переход и hover

            const clickedText = e.target.closest('.nav-dropdown-text');
            if (clickedText) {
                // Пользователь нажал прямо на текст «Услуги склада» — разрешаем переход по ссылке
                setOpen(false);
                return;
            }

            // Пользователь нажал на саму плашку или стрелочку — раскрываем/скрываем подменю
            e.preventDefault();
            e.stopPropagation();
            const isOpen = dd.classList.toggle('is-sub-open');
            trigger.setAttribute('aria-expanded', String(isOpen));
        }, true);
    });

    // Закрыть бургер после клика по любому обычному пункту меню или подпункту
    nav.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        if (mobileQuery.matches && link.classList.contains('nav-dropdown-trigger')) {
            // Обрабатывается выше
            return;
        }
        setOpen(false);
    });

    // Закрыть по клику вне шапки
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) setOpen(false);
    });

    // Закрыть по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('is-open')) {
            setOpen(false);
            btn.focus();
        }
    });

    // При переходе на десктопную ширину сбросить состояние
    const onChange = (e) => { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
})();







/* ===== Раскрывающиеся блоки (Спойлер / Аккордеон) ===== */

/* ===== Раскрывающиеся блоки (Спойлер / Аккордеон) + Автооткрытие из навигации ===== */
(() => {
    const openSpoiler = (spoiler) => {
        if (!spoiler) return;
        spoiler.classList.add('is-open');
        const trigger = spoiler.querySelector('.btl-spoiler-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
    };

    document.addEventListener('click', (e) => {
        // 1. Обычный клик по самой шапке спойлера (открыть / закрыть)
        const trigger = e.target.closest('.btl-spoiler-trigger');
        if (trigger) {
            const spoiler = trigger.closest('[data-btl-spoiler]');
            if (spoiler) {
                const isOpen = spoiler.classList.toggle('is-open');
                trigger.setAttribute('aria-expanded', String(isOpen));
            }
            return;
        }

        // 2. Клик по якорной ссылке в навигации (например, #tocLinkSpoiler / href="#documents")
        const anchorLink = e.target.closest('a[href^="#"]');
        if (!anchorLink) return;

        const targetId = anchorLink.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        // Ищем спойлер: либо сам элемент с этим id, либо спойлер внутри секции #documents
        const spoiler = targetEl.matches('[data-btl-spoiler]')
            ? targetEl
            : (targetEl.querySelector('[data-btl-spoiler]') || targetEl.closest('[data-btl-spoiler]'));

        if (spoiler) {
            openSpoiler(spoiler);
        }
    });

    // 3. Бонус: если перешли по прямой ссылке с якорем в URL (например, index.html#documents)
    if (window.location.hash) {
        const hashEl = document.querySelector(window.location.hash);
        if (hashEl) {
            const spoiler = hashEl.matches('[data-btl-spoiler]')
                ? hashEl
                : (hashEl.querySelector('[data-btl-spoiler]') || hashEl.closest('[data-btl-spoiler]'));
            if (spoiler) openSpoiler(spoiler);
        }
    }
})();
