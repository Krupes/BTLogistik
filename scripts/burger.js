/* ===== Бургер-меню ===== */
(() => {
    const header = document.querySelector('.header');
    const btn = document.getElementById('burgerBtn');
    const nav = document.getElementById('headerNav');
    if (!header || !btn || !nav) return;

    const desktop = window.matchMedia('(min-width: 1101px)');

    const setOpen = (open) => {
        header.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    // открыть / закрыть по кнопке
    btn.addEventListener('click', () => {
        setOpen(!header.classList.contains('is-open'));
    });

    // закрыть после клика по пункту меню
    nav.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
    });

    // закрыть по клику вне шапки
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) setOpen(false);
    });

    // закрыть по Escape (фокус возвращается на бургер)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('is-open')) {
            setOpen(false);
            btn.focus();
        }
    });

    // при переходе на десктопную ширину сбросить состояние
    const onChange = (e) => { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
})();
