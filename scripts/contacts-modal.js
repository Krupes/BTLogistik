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

    const modalBody = modal.querySelector('.btl-modal-body');

    // Автоматически создаём панель Политики обработки персональных данных РБ внутри модалки, если её ещё нет
    let policyPane = document.getElementById('btl-tab-policy');
    if (!policyPane && modalBody) {
        policyPane = document.createElement('div');
        policyPane.className = 'btl-tab-pane';
        policyPane.id = 'btl-tab-policy';
        policyPane.setAttribute('role', 'tabpanel');
        policyPane.setAttribute('hidden', '');
        policyPane.innerHTML = `
            <div class="btl-policy-view-header">
                <div>
                    <span class="btl-policy-meta">Закон Республики Беларусь № 99-З «О защите персональных данных»</span>
                    <h3 class="btl-modal-title" style="margin-top:8px;">Политика обработки персональных данных</h3>
                </div>
                <button type="button" class="btl-policy-back-btn" data-policy-back>
                    ← Вернуться назад
                </button>
            </div>
            <div class="btl-policy-doc">
                <h4>1. Общие положения и статус Оператора</h4>
                <p>1.1. Настоящая Политика в отношении обработки персональных данных (далее — Политика) разработана во исполнение требований <strong>Закона Республики Беларусь от 7 мая 2021 г. № 99-З «О защите персональных данных»</strong> и определяет порядок обработки персональных данных и меры по обеспечению их безопасности в <strong>Обществе с ограниченной ответственностью «Белтаможлогистик»</strong> (далее — Оператор).</p>
                <p>1.2. <strong>Сведения об Операторе:</strong> ООО «Белтаможлогистик», место нахождения: Республика Беларусь, Минская обл., г. Вилейка, ул. Шубина, 103. Электронная почта: <a href="mailto:info@btlogistik.by" style="color:#ebd085;">info@btlogistik.by</a>, тел.: +375 (17) 123-45-67, +375 (29) 987-65-43.</p>
                <p>1.3. Политика применяется ко всей информации, которую Оператор получает о пользователях веб-сайта Белтаможлогистик при заполнении форм обратной связи, использовании онлайн-калькулятора, а также при обращении через подключённые мессенджеры (Telegram, WhatsApp, Viber, WeChat, Max) и по телефонной связи.</p>

                <h4>2. Цели, объём, правовые основания и сроки обработки данных</h4>
                <ul>
                    <li><strong>Обработка заявок на консультацию и расчёт стоимости услуг (СВХ, СОХ, таможенное оформление, маркировка, Ж/Д логистика):</strong> обрабатываются имя (при указании), номер контактного телефона, выбранный способ связи, сведения о грузе в комментарии. <em>Правовое основание:</em> согласие субъекта персональных данных (ст. 5 Закона № 99-З) либо совершение действий для заключения договора по инициативе субъекта (абз. 15 ст. 6 Закона № 99-З). <em>Срок хранения:</em> 1 год с момента последнего взаимодействия либо до отзыва согласия.</li>
                    <li><strong>Коммуникация через мессенджеры и по электронной почте:</strong> обрабатываются идентификатор пользователя (username/номер телефона), текст обращения и прикреплённые товаросопроводительные документы. <em>Срок хранения:</em> в течение срока ведения преддоговорной работы и 3 года после исполнения договорных обязательств.</li>
                    <li><strong>Обеспечение корректной работы сайта (технические данные):</strong> IP-адрес, файлы cookie, параметры браузера и устройства. <em>Срок хранения:</em> до 12 месяцев.</li>
                </ul>

                <h4>3. Порядок и условия обработки персональных данных</h4>
                <p>3.1. Обработка осуществляется с использованием средств автоматизации и без их использования путём сбора, систематизации, хранения, изменения, использования, обезличивания, блокирования и удаления персональных данных.</p>
                <p>3.2. Оператор не передаёт персональные данные третьим лицам, за исключением случаев, прямо предусмотренных законодательством Республики Беларусь (в том числе таможенным органам при заключении договора поручения/таможенного представительства).</p>
                <p>3.3. При переходе пользователя по ссылкам или QR-кодам во внешние мессенджеры (Telegram, WhatsApp, Viber, WeChat, Max) возможна трансграничная передача данных на серверы соответствующих платформ. Проставляя отметку о согласии и инициируя диалог, пользователь подтверждает, что проинформирован о возможных рисках трансграничной передачи данных в соответствии со ст. 9 Закона № 99-З.</p>

                <h4>4. Права субъекта персональных данных (ст. 10–13 Закона № 99-З)</h4>
                <p>Субъект персональных данных имеет право в любое время:</p>
                <ul>
                    <li><strong>Отозвать своё согласие</strong> на обработку персональных данных (ст. 10 Закона № 99-З);</li>
                    <li><strong>Получить информацию</strong>, касающуюся обработки своих персональных данных, в течение 5 рабочих дней с момента подачи заявления (ст. 11 Закона № 99-З);</li>
                    <li><strong>Требовать внесения изменений</strong> в свои данные в случае их неполноты, устаревания или неточности (в 15-дневный срок);</li>
                    <li><strong>Получать информацию о предоставлении</strong> своих персональных данных третьим лицам один раз в календарный год бесплатно (ст. 12 Закона № 99-З);</li>
                    <li><strong>Требовать бесплатного прекращения обработки и (или) удаления</strong> своих персональных данных при отсутствии оснований для обработки (ст. 13 Закона № 99-З);</li>
                    <li><strong>Обжаловать действия (бездействие) Оператора</strong> в Национальный центр защиты персональных данных Республики Беларусь (НЦЗПД).</li>
                </ul>

                <h4>5. Механизм реализации прав</h4>
                <p>Для реализации одного или нескольких прав субъекту необходимо направить Оператору заявление в письменной форме по адресу: <strong>222410, Республика Беларусь, Минская обл., г. Вилейка, ул. Шубина, 103</strong>, либо в виде электронного документа на адрес <strong>info@btlogistik.by</strong>. Заявление должно содержать ФИО, адрес места жительства (места пребывания), дату рождения, суть требований и личную (либо электронную цифровую) подпись согласно ст. 14 Закона № 99-З.</p>
            </div>
            <div style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;">
                <button type="button" class="btl-submit-gold-btn" data-policy-accept style="padding: 10px 24px; font-size: 0.8rem;">
                    <span>Принять и вернуться</span>
                </button>
            </div>
        `;
        modalBody.appendChild(policyPane);
    }

    const tabBtns = modal.querySelectorAll('[data-tab-target]');
    const tabPanes = {
        contacts: document.getElementById('btl-tab-contacts'),
        form: document.getElementById('btl-tab-form'),
        info: document.getElementById('btl-tab-info'),
        policy: document.getElementById('btl-tab-policy')
    };

    let lastActiveTabBeforePolicy = 'contacts';

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

    // Переключение между главными вкладками (contacts / form / info / policy)
    const switchMainTab = (targetKey) => {
        const validKey = tabPanes[targetKey] ? targetKey : 'contacts';

        if (validKey !== 'policy') {
            lastActiveTabBeforePolicy = validKey;
        }

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
        if (validKey === 'info' && mapIframe && !mapIframe.getAttribute('src') && mapIframe.dataset.src) {
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

    // Кнопка калькулятора на главной странице открывает сразу форму заявки
    const calcOrderBtn = document.getElementById('openOrderModalBtn');
    if (calcOrderBtn) {
        calcOrderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(tabPanes.form ? 'form' : 'contacts');
        });
    }

    // Обработка кликов по триггерам открытия, закрытия и ссылкам Политики
    document.addEventListener('click', (e) => {
        // Перехват клика по кнопке/ссылке Политики обработки персональных данных
        const policyLink = e.target.closest('a[href*="privacy-policy"], [data-open-policy]');
        if (policyLink) {
            e.preventDefault();
            openModal('policy');
            return;
        }

        if (e.target.closest('[data-policy-back]')) {
            e.preventDefault();
            switchMainTab(lastActiveTabBeforePolicy);
            return;
        }

        if (e.target.closest('[data-policy-accept]')) {
            e.preventDefault();
            if (policyCheckbox) {
                policyCheckbox.checked = true;
                policyCheckbox.dispatchEvent(new Event('change'));
            }
            if (formPolicyCheckbox) {
                formPolicyCheckbox.checked = true;
                formPolicyCheckbox.dispatchEvent(new Event('change'));
            }
            switchMainTab(lastActiveTabBeforePolicy);
            return;
        }

        const openTrigger = e.target.closest('[data-open-contact-modal]');
        if (openTrigger) {
            e.preventDefault();
            const targetTab = openTrigger.dataset.openContactModal || 'contacts';
            openModal(targetTab);
            return;
        }
        const contactsTabHiddenInHero = document.getElementsByClassName('btl-tab-btn')[0];
        const openTriggerHero = e.target.closest('[data-open-contact-modal-hero]');
        if (openTriggerHero) {
            e.preventDefault();
            console.log('hello');
            contactsTabHiddenInHero.style.display = 'none';
            const targetTab = openTriggerHero.dataset.openContactModal || 'form';
            openModal(targetTab);
            return;


        }

        // Внутренние кнопки быстрого переключения на вкладку формы (учитываем регистр data-tab-trigger)
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
        if (!item || !qrImg || !qrCaption) return;

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

    // ================= ОТПРАВКА ЗАЯВОК (EMAIL + TELEGRAM READY + СЛЕПОК КАЛЬКУЛЯТОРА) =================
    const LEAD_CONFIG = {
        // Для мгновенной работы без бэкенда можно использовать https://formsubmit.co/ajax/info@btlogistik.by
        // либо указать путь к своему скрипту: '/send-mail.php'
        EMAIL_ENDPOINT: 'https://formsubmit.co/ajax/info@btlogistik.by',
        TELEGRAM_ENABLED: false,
        TELEGRAM_WEBHOOK_URL: '' // Сюда при необходимости вставляется URL Cloudflare Worker / Telegram API
    };

    const getSavedCalculation = () => {
        try {
            const raw = localStorage.getItem('btl_last_calculation');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    };

    // Готовый адаптер под Telegram-бота (совместимость заложена)
    const sendToTelegramBot = async (payload) => {
        if (!LEAD_CONFIG.TELEGRAM_ENABLED || !LEAD_CONFIG.TELEGRAM_WEBHOOK_URL) return;

        const calc = payload.hiddenCalculation;
        const calcBlock = calc
            ? [
                `\n📊 <b>Данные последнего расчёта калькулятора:</b>`,
                `• Направление: ${calc.serviceName || '-'}`,
                calc.pallets ? `• Паллет: ${calc.pallets} шт. | Дней: ${calc.days}` : '',
                calc.category ? `• Категория: ${calc.category} | Кодов: ${calc.quantity} шт.` : '',
                `• Экспресс: ${calc.expressOption || 'Нет'}`,
                calc.manualUnloadOption ? `• Ручная выгрузка: ${calc.manualUnloadOption}` : '',
                `• Формула: ${calc.formula || '-'}`,
                `• <b>Расчётная сумма: ~${calc.estimatedTotalBYN || '-'}</b> (${calc.timestamp || ''})`
            ].filter(Boolean).join('\n')
            : '\n📊 <i>Калькулятор не использовался</i>';

        const text = [
            `🔥 <b>Новая заявка с сайта Белтаможлогистик</b>`,
            `👤 Имя: ${payload.name || 'Не указано'}`,
            `📞 Телефон: <b>${payload.phone}</b>`,
            `💬 Способ связи: ${payload.contact_method || 'Звонок'}`,
            `📝 Комментарий: ${payload.comment || '—'}`,
            `🌐 Страница: ${payload.pageUrl}`,
            calcBlock
        ].join('\n');

        try {
            await fetch(LEAD_CONFIG.TELEGRAM_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, parse_mode: 'HTML', rawPayload: payload })
            });
        } catch (err) {
            console.warn('Ошибка отправки в Telegram:', err);
        }
    };

    // Отправка на Email со скрытыми результатами калькулятора
    const sendLeadToEmail = async (payload) => {
        const calc = payload.hiddenCalculation;

        // Плоская структура полей, чтобы письмо на почте читалось идеально
        const emailBody = {
            _subject: `Заявка с сайта Белтаможлогистик: ${payload.phone} (${payload.name || 'Клиент'})`,
            _template: 'table',
            'Имя клиента': payload.name || 'Не указано',
            'Телефон': payload.phone,
            'Предпочтительный способ связи': payload.contact_method || 'Обычный звонок',
            'Комментарий клиента': payload.comment || 'Не указан',
            'Страница отправки': payload.pageUrl,
            '--- ДАННЫЕ КАЛЬКУЛЯТОРА (СКРЫТЫЕ) ---': calc ? 'Прикреплены ниже' : 'Пользователь не считал на калькуляторе',
            'Калькулятор — Услуга': calc?.serviceName || '—',
            'Калькулятор — Параметры': calc?.pallets
                ? `${calc.pallets} палл. × ${calc.days} дн. (тариф ${calc.ratePerPalletDay})`
                : (calc?.category ? `${calc.category}, ${calc.quantity} шт. (${calc.ratePerUnit})` : '—'),
            'Калькулятор — Экспресс-обработка': calc?.expressOption || '—',
            'Калькулятор — Ручная выгрузка': calc?.manualUnloadOption || '—',
            'Калькулятор — Формула расчёта': calc?.formula || '—',
            'Калькулятор — ИТОГОВАЯ СУММА': calc?.estimatedTotalBYN || '—',
            'Время расчёта': calc?.timestamp || '—'
        };

        try {
            await fetch(LEAD_CONFIG.EMAIL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailBody)
            });
        } catch (err) {
            console.warn('Email endpoint warning:', err);
        }
    };

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!leadForm.checkValidity()) {
                leadForm.reportValidity();
                return;
            }

            const formData = new FormData(leadForm);
            const savedCalc = getSavedCalculation();

            const fullLeadPayload = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                contact_method: formData.get('contact_method'),
                comment: formData.get('comment'),
                pageUrl: window.location.href,
                hiddenCalculation: savedCalc ? savedCalc.detailsForStaff : null
            };

            if (formSubmitBtn) {
                formSubmitBtn.disabled = true;
                formSubmitBtn.querySelector('span').textContent = 'ОТПРАВКА...';
            }

            // Параллельная отправка на Почту и в ТГ-бота (если включён)
            await Promise.allSettled([
                sendLeadToEmail(fullLeadPayload),
                sendToTelegramBot(fullLeadPayload)
            ]);

            if (formSubmitBtn) {
                formSubmitBtn.disabled = false;
                formSubmitBtn.querySelector('span').textContent = 'ОТПРАВИТЬ ЗАЯВКУ';
            }

            leadForm.setAttribute('hidden', '');
            if (formSuccessBox) formSuccessBox.removeAttribute('hidden');
        });
    }
});