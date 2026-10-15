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

////КАЛЬКУЛЯТОР ///

document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('#servicePills .pill-btn');
    const categorySelect = document.getElementById('cargoCategory');
    const amountInput = document.getElementById('cargoAmount');
    const amountLabel = document.getElementById('cargoAmountLabel');
    const amountGroup = document.getElementById('cargoAmountGroup');
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
            amountGroup.style.display = 'block';
            btn.classList.add('active');

            if (amountLabel) {
                if (btn.textContent.includes('Маркировка')) {
                    amountLabel.textContent = 'Количество DataMatrix';
                } else {
                    amountLabel.textContent = 'Количество паллет';
                }
            }

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
const advSection = document.getElementById('advSection');
const cards = Array.from(document.querySelectorAll('.adv-card'));
const dots = Array.from(document.querySelectorAll('.dot'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const goldenThreads = document.getElementById('goldenThreads');
const globeSphere = document.getElementById('globeSphere');


const totalCards = cards.length;
const stepAngle = 360 / totalCards; // 90 градусов на 1 карточку

let currentAngle = 0;
let targetAngle = 0;
let velocity = 0;
let snapTimer = null;

// Стабильное отслеживание координат мыши и математических центров карточек
let pointerClientX = -1000;
let pointerClientY = -1000;
let hoveredCardIndex = -1;
let isOrbitScrollActive = false;
let hoverStartTimestamp = 0; // Точное время начала наведения на карточку

// Хранилище стабильных (не зависящих от наклона!) координат и наклонов каждой карточки
const cardState = cards.map(() => ({
    centerX: 0,
    centerY: 0,
    scale: 1,
    zOrder: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0
}));

// Логика автопрокрутки (Autoplay)
let autoplayTimer = null;
let isSectionHovered = false;

function startAutoplay() {
    clearInterval(autoplayTimer);
    if (isSectionHovered || isOrbitScrollActive) return;

    autoplayTimer = setInterval(() => {
        targetAngle -= stepAngle;
    }, 5000);
}

function stopAutoplay() {
    clearInterval(autoplayTimer);
}

function activateOrbitScroll() {
    if (isOrbitScrollActive) return;
    isOrbitScrollActive = true;
    stopAutoplay();

}

function deactivateOrbitScroll() {
    isOrbitScrollActive = false;
    hoverStartTimestamp = 0;
    scene.classList.remove('scroll-unlocked');

    if (!isSectionHovered) {
        startAutoplay();
    }
}

// Функция проверяет, находится ли курсор в стабильном хитбоксе карточки (без учёта её 3D-наклона!)
// Это полностью исключает дрожание и ложные сбросы таймера на краях карточки.
function updatePointerAndTilt() {
    const sceneRect = scene.getBoundingClientRect();
    const sceneCenterX = sceneRect.left + sceneRect.width / 2;
    const sceneCenterY = sceneRect.top + sceneRect.height / 2;

    const isMobile = window.innerWidth <= 900;
    const baseW = isMobile ? 320 : 450;
    const baseH = isMobile ? 185 : 210;

    let foundIndex = -1;
    let bestZ = -Infinity;

    for (let i = 0; i < totalCards; i++) {
        const st = cardState[i];
        const halfW = (baseW * st.scale) / 2;
        const halfH = (baseH * st.scale) / 2;

        const cardScreenCenterX = sceneCenterX + st.centerX;
        const cardScreenCenterY = sceneCenterY + st.centerY;

        const dx = pointerClientX - cardScreenCenterX;
        const dy = pointerClientY - cardScreenCenterY;

        if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
            // Если карточки перекрываются, выбираем ту, которая ближе к зрителю
            if (st.zOrder > bestZ) {
                bestZ = st.zOrder;
                foundIndex = i;
            }
        }
    }

    hoveredCardIndex = foundIndex;

    // Обновляем наклон и свечение для всех карточек
    for (let i = 0; i < totalCards; i++) {
        const st = cardState[i];
        const card = cards[i];

        if (i === hoveredCardIndex) {
            card.classList.add('is-hovered');

            const halfW = (baseW * st.scale) / 2;
            const halfH = (baseH * st.scale) / 2;
            const cardScreenCenterX = sceneCenterX + st.centerX;
            const cardScreenCenterY = sceneCenterY + st.centerY;

            // Нормализованное положение мыши от -0.5 до +0.5 относительно НЕПОДВИЖНОЙ рамки карточки
            const pctX = Math.max(-0.5, Math.min(0.5, (pointerClientX - cardScreenCenterX) / (halfW * 2)));
            const pctY = Math.max(-0.5, Math.min(0.5, (pointerClientY - cardScreenCenterY) / (halfH * 2)));

            // Координаты для радиального свечения в процентах
            const glowX = ((pctX + 0.5) * 100).toFixed(1);
            const glowY = ((pctY + 0.5) * 100).toFixed(1);
            card.style.setProperty('--mouse-x', `${glowX}%`);
            card.style.setProperty('--mouse-y', `${glowY}%`);

            // Мягкий 3D-наклон без обратной связи
            st.targetTiltX = -pctY * 16;
            st.targetTiltY = pctX * 18;
        } else {
            card.classList.remove('is-hovered');
            st.targetTiltX = 0;
            st.targetTiltY = 0;
        }
    }

    // Железобетонная логика таймера 1 секунды
    if (hoveredCardIndex !== -1) {
        if (!isOrbitScrollActive) {
            if (hoverStartTimestamp === 0) {
                hoverStartTimestamp = performance.now();
            } else if (performance.now() - hoverStartTimestamp >= 250) {
                activateOrbitScroll();
            }
        }
    } else {
        // Если курсор ушёл с карточки — сбрасываем отсчёт ожидания
        hoverStartTimestamp = 0;
        // Если курсор вообще покинул пределы сцены — выключаем активный режим прокрутки
        const inScene =
            pointerClientX >= sceneRect.left &&
            pointerClientX <= sceneRect.right &&
            pointerClientY >= sceneRect.top &&
            pointerClientY <= sceneRect.bottom;

        if (!inScene && isOrbitScrollActive) {
            deactivateOrbitScroll();
        }
    }
}

// Глобальное отслеживание положения курсора
window.addEventListener('mousemove', (e) => {
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
}, { passive: true });

// Переход к карточке по клику / пагинации
function goToCard(index) {
    activateOrbitScroll();
    const currentCardAngle = index * stepAngle + targetAngle;
    const remainder = ((currentCardAngle % 360) + 540) % 360 - 180;
    targetAngle -= remainder;
    targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
}

dots.forEach((dot) => {
    dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        goToCard(idx);
    });
});

prevBtn.addEventListener('click', () => {
    targetAngle += stepAngle;
    targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
    activateOrbitScroll();
});

nextBtn.addEventListener('click', () => {
    targetAngle -= stepAngle;
    targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
    activateOrbitScroll();
});

cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        goToCard(index);
    });
});

advSection.addEventListener('mouseenter', () => {
    isSectionHovered = true;
    stopAutoplay();
});

advSection.addEventListener('mouseleave', () => {
    isSectionHovered = false;
    pointerClientX = -1000;
    pointerClientY = -1000;
    deactivateOrbitScroll();
});

function animate() {
    let diff = targetAngle - currentAngle;

    if (Math.abs(diff) < 0.04) {
        currentAngle = targetAngle;
        velocity = 0;
    } else {
        velocity = diff * 0.09;
        currentAngle += velocity;
    }

    const speed = Math.abs(velocity);
    const isSpinning = speed > 0.35;

    scene.classList.toggle('is-spinning', isSpinning);

    const globeScale = 1 + Math.min(speed * 0.008, 0.05);
    globeSphere.style.transform = `scale(${globeScale.toFixed(3)})`;
    goldenThreads.style.transform = `rotateY(${-currentAngle * 1.3}deg) rotateZ(${velocity * 1.8}deg)`;

    const isMobile = window.innerWidth <= 900;
    const radiusX = isMobile ? 250 : 450;
    const radiusZ = isMobile ? 165 : 290;
    const tiltY   = isMobile ? 35  : 52;

    const snappedIndex = ((-Math.round(currentAngle / stepAngle) % totalCards) + totalCards) % totalCards;

    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === snappedIndex);
    });

    // Сначала вычисляем базовые центры всех карточек
    cards.forEach((card, index) => {
        const cardAngleDeg = index * stepAngle + currentAngle;
        const angleRad = (cardAngleDeg * Math.PI) / 180;

        const rawX = Math.sin(angleRad) * radiusX;
        const rawZ = Math.cos(angleRad) * radiusZ;
        const rawY = Math.cos(angleRad) * tiltY + 22;
        const depthNormalized = rawZ / radiusZ;
        const scale = 0.72 + (depthNormalized + 1) * 0.14;

        cardState[index].centerX = rawX;
        cardState[index].centerY = rawY;
        cardState[index].scale = scale;
        cardState[index].zOrder = rawZ;
    });

    // Проверяем курсор и 1-секундный таймер каждый кадр (60 раз в секунду!)
    updatePointerAndTilt();

    // Применяем единую плавную трансформацию без резких переключений режима
    cards.forEach((card, index) => {
        const st = cardState[index];
        const cardAngleDeg = index * stepAngle + currentAngle;
        const angleRad = (cardAngleDeg * Math.PI) / 180;

        const rawX = st.centerX;
        const rawY = st.centerY;
        const rawZ = st.zOrder;
        const z = rawZ - radiusZ; // Передняя карточка ровно на Z = 0px для чёткости шрифта

        // Плавное сглаживание наклона (Lerp)
        st.currentTiltX += (st.targetTiltX - st.currentTiltX) * 0.12;
        st.currentTiltY += (st.targetTiltY - st.currentTiltY) * 0.12;

        const baseRotateY = Math.sin(angleRad) * -28;
        const totalRotateY = baseRotateY + st.currentTiltY;
        const totalRotateX = st.currentTiltX;
        const bankTiltZ = Math.max(-10, Math.min(10, velocity * -0.9));

        const depthNormalized = rawZ / radiusZ;
        const scale = st.scale;
        const opacity = 0.32 + (depthNormalized + 1) * 0.34;

        const depthBlur = Math.max(0, (1 - depthNormalized) * 2.2);
        const motionBlur = Math.min(4.5, speed * 0.32);
        const isFrontCardSettled = (index === snappedIndex && speed < 0.8);
        const totalBlur = isFrontCardSettled ? 0 : depthBlur + motionBlur;

        // Всегда используем единую формулу transform, чтобы не было скачка при наведении мыши
        card.style.transform = `translate3d(${rawX.toFixed(2)}px, ${rawY.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${totalRotateY.toFixed(2)}deg) rotateX(${totalRotateX.toFixed(2)}deg) rotateZ(${bankTiltZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

        card.style.opacity = isFrontCardSettled ? '1' : opacity.toFixed(2);
        card.style.filter = totalBlur < 0.15 ? 'none' : `blur(${totalBlur.toFixed(1)}px)`;
        card.style.zIndex = rawZ >= 0 ? 15 : 2;

        card.classList.toggle('active', index === snappedIndex && speed < 1.8);
    });

    requestAnimationFrame(animate);
}

// Перехват колёсика на уровне window с capture: true гарантирует срабатывание после 1 секунды
window.addEventListener('wheel', (e) => {
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
    updatePointerAndTilt();

    if (!isOrbitScrollActive) {
        return; // До истечения 1 секунды страница спокойно скроллится
    }

    e.preventDefault();
    stopAutoplay();

    const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 110);
    targetAngle -= delta * 0.85;

    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
        targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
    }, 140);
}, { passive: false, capture: true });

// Свайпы на мобильных
let touchStartX = 0;
scene.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
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
startAutoplay();