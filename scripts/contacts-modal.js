document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('btlContactModal');
    if (!modal) return;

    // 1. Словарь твоих QR-кодов (потом просто подставишь сюда пути к своим SVG/PNG)
    const qrData = {
        telegram: {
            name: 'Telegram',
            img: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://t.me/btlogistik&color=08221b&bgcolor=ffffff'
        },
        whatsapp: {
            name: 'WhatsApp',
            img: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://wa.me/375299876543&color=08221b&bgcolor=ffffff'
        },
        viber: {
            name: 'Viber',
            img: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=viber://chat?number=375299876543&color=08221b&bgcolor=ffffff'
        },
        wechat: {
            name: 'WeChat',
            img: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=weixin://dl/chat?btlogistik&color=08221b&bgcolor=ffffff'
        },
        max: {
            name: 'Max',
            img: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://max.ru/btlogistik&color=08221b&bgcolor=ffffff'
        }
    };

    const tabBtns = modal.querySelectorAll('[data-tab-target]');
    const tabPanes = {
        contacts: document.getElementById('btl-tab-contacts'),
        info: document.getElementById('btl-tab-info')
    };

    const qrMiniBtns = modal.querySelectorAll('[data-qr-messenger]');
    const qrImg = document.getElementById('btlQrImage');
    const qrCaption = document.getElementById('btlQrCaption');
    const policyCheckbox = document.getElementById('btlPolicyConsent');
    const interactiveZone = document.getElementById('btlInteractiveZone');
    const mapIframe = modal.querySelector('.btl-yandex-iframe');

    // Функция переключения главных вкладок (Контакты / Инфо)
    const switchMainTab = (targetKey) => {
        tabBtns.forEach(btn => {
            const isMatch = btn.dataset.tabTarget === targetKey;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-selected', isMatch);
        });

        Object.entries(tabPanes).forEach(([key, pane]) => {
            if (key === targetKey) {
                pane.classList.add('active');
                pane.removeAttribute('hidden');
            } else {
                pane.classList.remove('active');
                pane.setAttribute('hidden', '');
            }
        });

        // Ленивая подгрузка Яндекс.Карты только при первом открытии вкладки "Инфо"
        if (targetKey === 'info' && mapIframe && !mapIframe.getAttribute('src')) {
            mapIframe.setAttribute('src', mapIframe.dataset.src);
        }
    };

    // Функция открытия и закрытия модалки
    const openModal = (initialTab = 'contacts') => {
        switchMainTab(initialTab);
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // Делегирование клика для любых кнопок открытия на сайте
    document.addEventListener('click', (e) => {
        const openTrigger = e.target.closest('[data-open-contact-modal]');
        if (openTrigger) {
            e.preventDefault();
            const targetTab = openTrigger.dataset.openContactModal || 'contacts';
            openModal(targetTab === 'info' ? 'info' : 'contacts');
            return;
        }

        // Закрытие по крестику, нижней кнопке "Закрыть" или клику по темному фону
        if (e.target.closest('[data-close-contact-modal]') || e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // Клик по верхним вкладкам
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMainTab(btn.dataset.tabTarget));
    });

    // Переключение мини-вкладок QR-кодов
    const setActiveMessenger = (key) => {
        const item = qrData[key];
        if (!item) return;

        qrMiniBtns.forEach(b => b.classList.toggle('active', b.dataset.qrMessenger === key));

        qrImg.style.opacity = '0.3';
        qrImg.style.transform = 'scale(0.95)';

        setTimeout(() => {
            qrImg.src = item.img;
            qrImg.alt = `QR-код для связи в ${item.name}`;
            qrCaption.innerHTML = `Наведите камеру для перехода в <strong>${item.name}</strong>`;
            qrImg.style.opacity = '1';
            qrImg.style.transform = 'scale(1)';
        }, 120);
    };

    qrMiniBtns.forEach(btn => {
        btn.addEventListener('click', () => setActiveMessenger(btn.dataset.qrMessenger));
    });

    // Приятная деталь: при наведении курсора на правую кнопку мессенджера синхронно меняем и QR слева
    modal.querySelectorAll('[data-messenger-sync]').forEach(link => {
        link.addEventListener('mouseenter', () => setActiveMessenger(link.dataset.messengerSync));
    });

    // Реакция на галочку согласия с политикой обработки персональных данных
    if (policyCheckbox && interactiveZone) {
        policyCheckbox.addEventListener('change', () => {
            interactiveZone.classList.toggle('is-disabled', !policyCheckbox.checked);
        });
    }
});