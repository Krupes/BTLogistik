document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('btlContactModal');
    if (!modal) return;

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
        form: document.getElementById('btl-tab-form'),
        info: document.getElementById('btl-tab-info')
    };

    const qrMiniBtns = modal.querySelectorAll('[data-qr-messenger]');
    const qrImg = document.getElementById('btlQrImage');
    const qrCaption = document.getElementById('btlQrCaption');
    const policyCheckbox = document.getElementById('btlPolicyConsent');
    const interactiveZone = document.getElementById('btlInteractiveZone');
    const mapIframe = modal.querySelector('.btl-yandex-iframe');

    // Элементы формы
    const leadForm = document.getElementById('btlLeadForm');
    const formPolicyCheckbox = document.getElementById('btlFormPolicyConsent');
    const formSubmitBtn = document.getElementById('btlFormSubmitBtn');
    const formSuccessBox = document.getElementById('btlFormSuccess');
    const resetFormBtn = document.getElementById('btlResetFormBtn');

    // Переключение между 3 главными вкладками (contacts / form / info)
    const switchMainTab = (targetKey) => {
        const validKey = tabPanes[targetKey] ? targetKey : 'contacts';

        tabBtns.forEach(btn => {
            const isMatch = btn.dataset.tabTarget === validKey;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-selected', isMatch);
        });

        Object.entries(tabPanes).forEach(([key, pane]) => {
            if (!pane) return;
            if (key === validKey) {
                pane.classList.add('active');
                pane.removeAttribute('hidden');
            } else {
                pane.classList.remove('active');
                pane.setAttribute('hidden', '');
            }
        });

        // Ленивая загрузка карты при переходе на "Инфо"
        if (validKey === 'info' && mapIframe && !mapIframe.getAttribute('src')) {
            mapIframe.setAttribute('src', mapIframe.dataset.src);
        }
    };

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

    // Обработка кликов по триггерам открытия и закрытия
    document.addEventListener('click', (e) => {
        const openTrigger = e.target.closest('[data-open-contact-modal]');
        if (openTrigger) {
            e.preventDefault();
            const targetTab = openTrigger.dataset.openContactModal || 'contacts';
            openModal(targetTab);
            return;
        }

        // Внутренние кнопки быстрого переключения на вкладку формы
        const internalSwitch = e.target.closest('[data-tab-trigger]');
        if (internalSwitch) {
            switchMainTab(internalSwitch.dataset.tabTrigger);
            return;
        }

        if (e.target.closest('[data-close-contact-modal]') || e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMainTab(btn.dataset.tabTarget));
    });

    // Логика смены QR-кодов
    const setActiveMessenger = (key) => {
        const item = qrData[key];
        if (!item) return;

        qrMiniBtns.forEach(b => b.classList.toggle('active', b.dataset.qrMessenger === key));
        qrImg.style.opacity = '0.3';
        qrImg.style.transform = 'scale(0.95)';

        setTimeout(() => {
            qrImg.src = item.img;
            qrImg.alt = `QR-код для связи в ${item.name}`;
            qrCaption.innerHTML = `Камера откроет <strong>${item.name}</strong>`;
            qrImg.style.opacity = '1';
            qrImg.style.transform = 'scale(1)';
        }, 120);
    };

    qrMiniBtns.forEach(btn => {
        btn.addEventListener('click', () => setActiveMessenger(btn.dataset.qrMessenger));
    });

    modal.querySelectorAll('[data-messenger-sync]').forEach(link => {
        link.addEventListener('mouseenter', () => setActiveMessenger(link.dataset.messengerSync));
    });

    // Блокировка мессенджеров при снятии галочки на 1 вкладке
    if (policyCheckbox && interactiveZone) {
        policyCheckbox.addEventListener('change', () => {
            interactiveZone.classList.toggle('is-disabled', !policyCheckbox.checked);
        });
    }

    // Блокировка кнопки отправки формы при снятии галочки на 2 вкладке
    if (formPolicyCheckbox && formSubmitBtn) {
        formPolicyCheckbox.addEventListener('change', () => {
            formSubmitBtn.disabled = !formPolicyCheckbox.checked;
        });
    }

    // Обработка отправки формы
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!leadForm.checkValidity()) {
                leadForm.reportValidity();
                return;
            }

            const formData = new FormData(leadForm);
            const payload = Object.fromEntries(formData.entries());
            console.log('Заявка Белтаможлогистик:', payload);

            // Показываем экран успеха
            leadForm.setAttribute('hidden', '');
            formSuccessBox.removeAttribute('hidden');
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            leadForm.reset();
            formSubmitBtn.disabled = false;
            formSuccessBox.setAttribute('hidden', '');
            leadForm.removeAttribute('hidden');
        });
    }
});