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


/*ГЛОБУС*/

const scene = document.getElementById('orbitScene');
const cards = document.querySelectorAll('.adv-card');
const goldenThreads = document.getElementById('goldenThreads');
const globeSphere = document.getElementById('globeSphere');


const totalCards = cards.length;
const stepAngle = 360 / totalCards; // 90 градусов на 1 карточку

let currentAngle = 0;
let targetAngle = 0;
let velocity = 0;
let snapTimer = null;

// Логика задержки 1 секунды перед активацией скролла карточек
let isOrbitScrollActive = false;
let hoverIntentTimer = null;
let isHoveringCard = false;

function activateOrbitScroll() {
    isOrbitScrollActive = true;
    scene.classList.add('scroll-unlocked');

}

function deactivateOrbitScroll() {
    clearTimeout(hoverIntentTimer);
    isOrbitScrollActive = false;
    scene.classList.remove('scroll-unlocked');

}

// Состояние наклона (Tilt) для каждой карточки
const cardTilts = Array.from({ length: totalCards }, () => ({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0
}));

cards.forEach((card, index) => {
    // Когда пользователь наводит курсор на карточку — запускаем таймер 1 секунда
    card.addEventListener('mouseenter', () => {
        isHoveringCard = true;
        if (!isOrbitScrollActive) {
            clearTimeout(hoverIntentTimer);
            hoverIntentTimer = setTimeout(() => {
                if (isHoveringCard) {
                    activateOrbitScroll();
                }
            }, 200); // 1000 мс = 1 секунда
        }
    });

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Координаты для свечения за курсором
        card.style.setProperty('--mouse-x', `${mouseX}px`);
        card.style.setProperty('--mouse-y', `${mouseY}px`);

        // Вычисляем наклон карточки
        const pctX = (mouseX / rect.width) - 0.5;
        const pctY = (mouseY / rect.height) - 0.5;

        cardTilts[index].targetX = -pctY * 22;
        cardTilts[index].targetY = pctX * 24;
    });

    card.addEventListener('mouseleave', () => {
        isHoveringCard = false;
        cardTilts[index].targetX = 0;
        cardTilts[index].targetY = 0;

        // Если пользователь увёл мышь с карточки до истечения 1 секунды — отменяем таймер
        if (!isOrbitScrollActive) {
            clearTimeout(hoverIntentTimer);
        }
    });
});

// Когда курсор полностью покидает 3D-сцену — сбрасываем перехват скролла
scene.addEventListener('mouseleave', () => {
    isHoveringCard = false;
    deactivateOrbitScroll();
});

function animate() {
    const diff = targetAngle - currentAngle;
    velocity = diff * 0.09;
    currentAngle += velocity;

    const speed = Math.abs(velocity);
    const isSpinning = speed > 0.35;

    scene.classList.toggle('is-spinning', isSpinning);

    // Картинка внутри #globeTexture теперь стоит неподвижно!
    // Вращаются только золотые нити вокруг глобуса и лёгкая пульсация сферы:
    const globeScale = 1 + Math.min(speed * 0.008, 0.05);
    globeSphere.style.transform = `scale(${globeScale.toFixed(3)})`;
    goldenThreads.style.transform = `rotateY(${-currentAngle * 1.3}deg) rotateZ(${velocity * 1.8}deg)`;

    // Геометрия орбиты
    const isMobile = window.innerWidth <= 900;
    const radiusX = isMobile ? 230 : 420;
    const radiusZ = isMobile ? 165 : 290;
    const tiltY   = isMobile ? 35  : 52;

    const snappedIndex = ((-Math.round(currentAngle / stepAngle) % totalCards) + totalCards) % totalCards;

    cards.forEach((card, index) => {
        const cardAngleDeg = index * stepAngle + currentAngle;
        const angleRad = (cardAngleDeg * Math.PI) / 180;

        const x = Math.sin(angleRad) * radiusX;
        const z = Math.cos(angleRad) * radiusZ;
        const y = Math.cos(angleRad) * tiltY + 22;

        // Плавное сглаживание наклона от мыши
        const tilt = cardTilts[index];
        tilt.currentX += (tilt.targetX - tilt.currentX) * 0.14;
        tilt.currentY += (tilt.targetY - tilt.currentY) * 0.14;

        const baseRotateY = Math.sin(angleRad) * -28;
        const totalRotateY = baseRotateY + tilt.currentY;
        const totalRotateX = tilt.currentX;
        const bankTiltZ = Math.max(-10, Math.min(10, velocity * -0.9));

        const depthNormalized = z / radiusZ;
        const scale = 0.78 + (depthNormalized + 1) * 0.14;
        const opacity = 0.32 + (depthNormalized + 1) * 0.34;

        const depthBlur = Math.max(0, (1 - depthNormalized) * 2.1);
        const motionBlur = Math.min(4.5, speed * 0.32);
        const totalBlur = (index === snappedIndex && speed < 1.2) ? depthBlur : depthBlur + motionBlur;

        card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${totalRotateY.toFixed(2)}deg) rotateX(${totalRotateX.toFixed(2)}deg) rotateZ(${bankTiltZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.filter = `blur(${totalBlur.toFixed(1)}px)`;

        card.style.zIndex = z >= 0 ? 15 : 2;

        if (index === snappedIndex && speed < 1.8) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    requestAnimationFrame(animate);
}

// Обработка колёсика мыши с защитой от случайной остановки скролла страницы
scene.addEventListener('wheel', (e) => {
    // Если пользователь ещё НЕ продержал мышь 1 секунду на карточке:
    if (!isOrbitScrollActive) {
        // Если он просто скроллит страницу мимо — перезапускаем таймер, чтобы страница спокойно ехала дальше
        if (isHoveringCard) {
            clearTimeout(hoverIntentTimer);
            hoverIntentTimer = setTimeout(() => {
                if (isHoveringCard) activateOrbitScroll();
            }, 1000);
        }
        return; // НЕ вызываем e.preventDefault() — браузер спокойно скроллит сайт!
    }

    // Если же 1 секунда прошла и режим активен — крутим орбиту:
    e.preventDefault();

    const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 110);
    targetAngle -= delta * 0.85;

    clearTimeout(snapTimer);

    snapTimer = setTimeout(() => {
        targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
    }, 140);
}, { passive: false });

// Клик по любой карточке тоже сразу включает режим и подтягивает её в центр
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        activateOrbitScroll();
        const currentCardAngle = index * stepAngle + targetAngle;
        const remainder = ((currentCardAngle % 360) + 540) % 360 - 180;
        targetAngle -= remainder;
        targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
    });
});

// Поддержка свайпов на смартфонах
let touchStartX = 0;
scene.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

scene.addEventListener('touchmove', (e) => {
    const currentX = e.changedTouches[0].screenX;
    const dx = currentX - touchStartX;
    touchStartX = currentX;
    targetAngle += dx * 0.65;
}, { passive: true });

scene.addEventListener('touchend', () => {
    targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
}, { passive: true });

requestAnimationFrame(animate);