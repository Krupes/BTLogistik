
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
const paginationBar = document.getElementById('paginationBar');
const cards = Array.from(document.querySelectorAll('.adv-card'));
const dots = Array.from(document.querySelectorAll('.dot'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const goldenThreads = document.getElementById('goldenThreads');
const globeSphere = document.getElementById('globeSphere');

const totalCards = cards.length;
const stepAngle = 360 / totalCards; // 90 градусов на 1 карточку
const AUTOPLAY_DELAY = 5000;        // 5 секунд между автопрокруткой
const PERSPECTIVE = 1400;           // Соответствует CSS perspective: 1400px

let currentAngle = 0;
let targetAngle = 0;
let velocity = 0;
let snapTimer = null;

let pointerClientX = -1000;
let pointerClientY = -1000;
let hoveredCardIndex = -1;
let isPointerInCardOrbitZone = false;
let isPaginationHovered = false;
let isTouchActive = false;
let isOrbitScrollActive = false;
let hoverStartTimestamp = 0;

let lastAutoplayTick = performance.now();

const cardState = cards.map((card) => ({
    screenX: 0,
    screenY: 0,
    halfW: 225,
    halfH: 105,
    rawZ: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    baseW: card.offsetWidth || 450,
    baseH: card.offsetHeight || 210
}));

// Обновляем реальные базовые размеры карточек при ресайзе
function measureCards() {
    cards.forEach((card, i) => {
        cardState[i].baseW = card.offsetWidth || 450;
        cardState[i].baseH = card.offsetHeight || 210;
    });
}
window.addEventListener('resize', measureCards);
measureCards();

function resetAutoplayClock() {
    lastAutoplayTick = performance.now();
}

function activateOrbitScroll() {
    if (isOrbitScrollActive) return;
    isOrbitScrollActive = true;
    scene.classList.add('scroll-unlocked');
    resetAutoplayClock();
}

function deactivateOrbitScroll() {
    if (!isOrbitScrollActive && hoverStartTimestamp === 0) return;
    isOrbitScrollActive = false;
    hoverStartTimestamp = 0;
    scene.classList.remove('scroll-unlocked');
    resetAutoplayClock();
}

function updatePointerAndTilt(now, snappedIndex) {
    const sceneRect = scene.getBoundingClientRect();
    const sceneCenterX = sceneRect.left + sceneRect.width / 2;
    const sceneCenterY = sceneRect.top + sceneRect.height / 2;

    const isMobile = window.innerWidth <= 900;
    const tiltY = isMobile ? 35 : 52;

    let foundIndex = -1;
    let bestZ = -Infinity;

    // 1. Проверяем попадание курсора ТОЛЬКО по видимым спереди/сбоку карточкам!
    // Карточка, спрятанная за глобусом (rawZ < -10), полностью игнорируется!
    for (let i = 0; i < totalCards; i++) {
        const st = cardState[i];
        if (st.rawZ < -10) continue; // Исключаем заднюю карточку за глобусом!

        const cardScreenCenterX = sceneCenterX + st.screenX;
        const cardScreenCenterY = sceneCenterY + st.screenY;

        const dx = pointerClientX - cardScreenCenterX;
        const dy = pointerClientY - cardScreenCenterY;

        if (Math.abs(dx) <= st.halfW && Math.abs(dy) <= st.halfH) {
            if (st.rawZ > bestZ) {
                bestZ = st.rawZ;
                foundIndex = i;
            }
        }
    }

    hoveredCardIndex = foundIndex;

    // 2. Скролл колёсиком активируется ТОЛЬКО на центральной (передней) карточке
    // или в её точном прямоугольнике, пока она вращается:
    const frontSt = cardState[snappedIndex];
    const frontSlotCenterX = sceneCenterX;
    const frontSlotCenterY = sceneCenterY + tiltY + 22;
    const inFrontCardExactBox =
        Math.abs(pointerClientX - frontSlotCenterX) <= frontSt.baseW / 2 &&
        Math.abs(pointerClientY - frontSlotCenterY) <= frontSt.baseH / 2;

    const isHoveredFrontCard = (hoveredCardIndex === snappedIndex);
    const isCurrentlyMoving = Math.abs(targetAngle - currentAngle) > 0.5;

    // Зона прокрутки строго ограничена рамками передней карточки (никакой зоны выше карточки над глобусом!)
    isPointerInCardOrbitZone =
        (isHoveredFrontCard && inFrontCardExactBox) ||
        (isOrbitScrollActive && isCurrentlyMoving && inFrontCardExactBox);

    // 3. Обновляем 3D-наклон и свечение
    for (let i = 0; i < totalCards; i++) {
        const st = cardState[i];
        const card = cards[i];

        if (i === hoveredCardIndex) {
            card.classList.add('is-hovered');

            const cardScreenCenterX = sceneCenterX + st.screenX;
            const cardScreenCenterY = sceneCenterY + st.screenY;

            const pctX = Math.max(-0.5, Math.min(0.5, (pointerClientX - cardScreenCenterX) / (st.halfW * 2)));
            const pctY = Math.max(-0.5, Math.min(0.5, (pointerClientY - cardScreenCenterY) / (st.halfH * 2)));

            const glowX = ((pctX + 0.5) * 100).toFixed(1);
            const glowY = ((pctY + 0.5) * 100).toFixed(1);
            card.style.setProperty('--mouse-x', `${glowX}%`);
            card.style.setProperty('--mouse-y', `${glowY}%`);

            st.targetTiltX = -pctY * 16;
            st.targetTiltY = pctX * 18;
        } else {
            card.classList.remove('is-hovered');
            st.targetTiltX = 0;
            st.targetTiltY = 0;
        }
    }

    // 4. Таймер 1 секунды работает строго внутри передней карточки
    if (isPointerInCardOrbitZone) {
        if (!isOrbitScrollActive) {
            if (hoverStartTimestamp === 0) {
                hoverStartTimestamp = now;
            } else if (now - hoverStartTimestamp >= 350) {
                activateOrbitScroll();
            }
        }
    } else {
        deactivateOrbitScroll();
    }

    // 5. Безотказный Autoplay: пауза при наведении на карточку или пагинацию
    if (hoveredCardIndex !== -1 || isPaginationHovered || isTouchActive) {
        lastAutoplayTick = now;
    } else if (now - lastAutoplayTick >= AUTOPLAY_DELAY) {
        lastAutoplayTick = now;
        targetAngle = Math.round((targetAngle - stepAngle) / stepAngle) * stepAngle;
    }
}

window.addEventListener('mousemove', (e) => {
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
}, { passive: true });

document.addEventListener('mouseleave', () => {
    pointerClientX = -1000;
    pointerClientY = -1000;
    deactivateOrbitScroll();
});

paginationBar.addEventListener('mouseenter', () => {
    isPaginationHovered = true;
    resetAutoplayClock();
});

paginationBar.addEventListener('mouseleave', () => {
    isPaginationHovered = false;
    resetAutoplayClock();
});

function goToCard(index) {
    resetAutoplayClock();
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
    resetAutoplayClock();
    targetAngle = Math.round((targetAngle + stepAngle) / stepAngle) * stepAngle;
});

nextBtn.addEventListener('click', () => {
    resetAutoplayClock();
    targetAngle = Math.round((targetAngle - stepAngle) / stepAngle) * stepAngle;
});

cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        if (cardState[index].rawZ < -10) return; // Игнорируем клики по задней карточке за глобусом
        goToCard(index);
    });
});

function animate(now) {
    if (!now) now = performance.now();

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

    // Вычисляем точные экранные проекции карточек с учётом 3D перспективы
    cards.forEach((card, index) => {
        const cardAngleDeg = index * stepAngle + currentAngle;
        const angleRad = (cardAngleDeg * Math.PI) / 180;

        const rawX = Math.sin(angleRad) * radiusX;
        const rawZ = Math.cos(angleRad) * radiusZ;
        const rawY = Math.cos(angleRad) * tiltY + 22;
        const z = rawZ - radiusZ; // Для передней карточки z = 0

        const depthNormalized = rawZ / radiusZ;
        const scale = 0.72 + (depthNormalized + 1) * 0.14;

        // Учитываем коэффициент перспективного сжатия CSS perspective (1400px)
        const perspectiveFactor = PERSPECTIVE / (PERSPECTIVE - z);

        const st = cardState[index];
        st.rawX = rawX;
        st.rawY = rawY;
        st.rawZ = rawZ;
        st.z = z;
        st.scale = scale;

        // Реальные координаты центра и половин ширины/высоты карточки на 2D-экране
        st.screenX = rawX * perspectiveFactor;
        st.screenY = rawY * perspectiveFactor;
        st.halfW = (st.baseW * scale * perspectiveFactor * Math.cos((Math.sin(angleRad) * -28 * Math.PI) / 180)) / 2;
        st.halfH = (st.baseH * scale * perspectiveFactor) / 2;
    });

    updatePointerAndTilt(now, snappedIndex);

    cards.forEach((card, index) => {
        const st = cardState[index];
        const cardAngleDeg = index * stepAngle + currentAngle;
        const angleRad = (cardAngleDeg * Math.PI) / 180;

        st.currentTiltX += (st.targetTiltX - st.currentTiltX) * 0.12;
        st.currentTiltY += (st.targetTiltY - st.currentTiltY) * 0.12;

        const baseRotateY = Math.sin(angleRad) * -28;
        const totalRotateY = baseRotateY + st.currentTiltY;
        const totalRotateX = st.currentTiltX;
        const bankTiltZ = Math.max(-10, Math.min(10, velocity * -0.9));

        const depthNormalized = st.rawZ / radiusZ;
        const opacity = 0.32 + (depthNormalized + 1) * 0.34;

        const depthBlur = Math.max(0, (1 - depthNormalized) * 2.2);
        const motionBlur = Math.min(4.5, speed * 0.32);
        const isFrontCardSettled = (index === snappedIndex && speed < 0.8);
        const totalBlur = isFrontCardSettled ? 0 : depthBlur + motionBlur;

        card.style.transform = `translate3d(${st.rawX.toFixed(2)}px, ${st.rawY.toFixed(2)}px, ${st.z.toFixed(2)}px) rotateY(${totalRotateY.toFixed(2)}deg) rotateX(${totalRotateX.toFixed(2)}deg) rotateZ(${bankTiltZ.toFixed(2)}deg) scale(${st.scale.toFixed(3)})`;

        card.style.opacity = isFrontCardSettled ? '1' : opacity.toFixed(2);
        card.style.filter = totalBlur < 0.15 ? 'none' : `blur(${totalBlur.toFixed(1)}px)`;
        card.style.zIndex = st.rawZ >= 0 ? 15 : 2;
        // Отключаем pointer-events у задней карточки, чтобы она никогда не перехватывала мышь сквозь глобус
        card.style.pointerEvents = st.rawZ >= 0 ? 'auto' : 'none';

        card.classList.toggle('active', index === snappedIndex && speed < 1.8);
    });

    requestAnimationFrame(animate);
}

window.addEventListener('wheel', (e) => {
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
    const snappedIndex = ((-Math.round(currentAngle / stepAngle) % totalCards) + totalCards) % totalCards;
    updatePointerAndTilt(performance.now(), snappedIndex);

    if (!isOrbitScrollActive || !isPointerInCardOrbitZone) {
        return;
    }

    e.preventDefault();
    resetAutoplayClock();

    const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 110);
    targetAngle -= delta * 0.85;

    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
        targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
        resetAutoplayClock();
    }, 140);
}, { passive: false, capture: true });

let touchStartX = 0;
scene.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isTouchActive = true;
    resetAutoplayClock();
}, { passive: true });

scene.addEventListener('touchmove', (e) => {
    const currentX = e.changedTouches[0].screenX;
    const dx = currentX - touchStartX;
    touchStartX = currentX;
    targetAngle += dx * 0.65;
    resetAutoplayClock();
}, { passive: true });

scene.addEventListener('touchend', () => {
    isTouchActive = false;
    targetAngle = Math.round(targetAngle / stepAngle) * stepAngle;
    resetAutoplayClock();
}, { passive: true });

requestAnimationFrame(animate);
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