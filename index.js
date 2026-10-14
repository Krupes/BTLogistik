// document.addEventListener('DOMContentLoaded', () => {
//     // Находим кнопку по классу
//     const changeBtn = document.querySelector('.change-back');
//
//     // Переменная для отслеживания текущего фона (true - background1, false - background2)
//     let isFirstBackground = true;
//
//     // Добавляем слушатель события клика на кнопку
//     changeBtn.addEventListener('click', () => {
//         if (isFirstBackground) {
//             // Если сейчас первый фон, меняем на второй
//             // Обратите внимание на расширение файла (jpg/png), укажите свое
//             document.body.style.backgroundImage = "url('img/background5.png')";
//         } else {
//             // Если сейчас второй фон, возвращаем первый
//             document.body.style.backgroundImage = "url('img/background4.jpg')";
//         }
//
//         // Инвертируем значение флага
//         isFirstBackground = !isFirstBackground;
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('#servicePills .pill-btn');
    const categorySelect = document.getElementById('cargoCategory');
    const amountInput = document.getElementById('cargoAmount');
    const optExpress = document.getElementById('optExpress');
    const optDocs = document.getElementById('optDocs');
    const totalValueEl = document.getElementById('calcTotalValue');

    let baseRate = 180; // Базовая ставка выбранной услуги (BYN)

    function calculateTotal() {
        if (!totalValueEl) return;

        const categoryMultiplier = parseFloat(categorySelect.value) || 1;
        const rawAmount = parseInt(amountInput.value, 10);
        const amount = isNaN(rawAmount) || rawAmount < 1 ? 1 : rawAmount;

        // Формула расчёта: базовая ставка + надбавка за объём партии * коэффициент категории
        let subtotal = (baseRate + amount * 18) * categoryMultiplier;

        // Надбавка за экспресс-обработку (+30%)
        if (optExpress && optExpress.checked) {
            subtotal *= 1.3;
        }

        // Фиксированная надбавка за полное документальное сопровождение
        if (optDocs && optDocs.checked) {
            subtotal += parseFloat(optDocs.value);
        }

        // Плавное округление до десятков
        const finalPrice = Math.round(subtotal / 10) * 10;
        totalValueEl.textContent = finalPrice.toLocaleString('ru-RU');
    }

    // Переключение тегов услуг
    pills.forEach((btn) => {
        btn.addEventListener('click', () => {
            pills.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            baseRate = parseFloat(btn.dataset.base) || 150;
            calculateTotal();
        });
    });

    // Слушатели изменений в полях
    [categorySelect, amountInput, optExpress, optDocs].forEach((el) => {
        if (el) {
            el.addEventListener('input', calculateTotal);
            el.addEventListener('change', calculateTotal);
        }
    });

    // Первичный расчёт при загрузке
    calculateTotal();
});

