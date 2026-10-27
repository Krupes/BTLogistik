
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


// /* ==========================================================================
//    ЧАСТЬ 1 И 2: ПАРАЛЛАКС ЛОГИСТИЧЕСКИХ ЭЛЕМЕНТОВ + WOW SCROLL REVEAL
//    ========================================================================== */
// (() => {
//     // 1. Создаём фоновый слой с тематическими объектами (коробки, декларация, DataMatrix, пломба, вагон)
//     const parallaxLayer = document.createElement('div');
//     parallaxLayer.className = 'logistics-parallax-layer';
//     parallaxLayer.setAttribute('aria-hidden', 'true');
//
//     parallaxLayer.innerHTML = `
//         <!-- 1. 3D Картонная коробка с золотым скотчем -->
//         <div class="parallax-item p-box-1" data-speed="0.22" data-rot="0.18" data-wave="18">
//             <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <polygon points="50,8 92,28 50,48 8,28" fill="rgba(212,175,55,0.18)" stroke="#f3df9d" stroke-width="2"/>
//                 <polygon points="8,28 50,48 50,90 8,70" fill="rgba(11,46,38,0.65)" stroke="#d4af37" stroke-width="2"/>
//                 <polygon points="92,28 50,48 50,90 92,70" fill="rgba(6,28,23,0.8)" stroke="#d4af37" stroke-width="2"/>
//                 <line x1="29" y1="18" x2="71" y2="38" stroke="#fff7d6" stroke-width="3" stroke-linecap="round"/>
//                 <rect x="58" y="55" width="18" height="12" transform="skewY(-25)" fill="rgba(243,223,157,0.25)" stroke="#f3df9d" stroke-width="1.2"/>
//             </svg>
//         </div>
//
//         <!-- 2. Таможенная декларация с гербовой печатью -->
//         <div class="parallax-item p-decl-1" data-speed="-0.18" data-rot="-0.14" data-wave="22">
//             <svg viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <rect x="8" y="6" width="74" height="98" rx="6" fill="rgba(8,42,34,0.72)" stroke="#f3df9d" stroke-width="2"/>
//                 <path d="M22 24H68M22 36H68M22 48H54M22 60H62" stroke="rgba(243,223,157,0.7)" stroke-width="2.5" stroke-linecap="round"/>
//                 <circle cx="60" cy="80" r="13" fill="rgba(212,175,55,0.25)" stroke="#fff7d6" stroke-width="2" stroke-dasharray="3 2"/>
//                 <circle cx="60" cy="80" r="7" stroke="#d4af37" stroke-width="1.5"/>
//                 <path d="M56 80L59 83L65 77" stroke="#fff7d6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//             </svg>
//         </div>
//
//         <!-- 3. Стикер маркировки DataMatrix / Честный Знак -->
//         <div class="parallax-item p-qr-1" data-speed="0.28" data-rot="0.24" data-wave="15">
//             <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <rect x="10" y="10" width="80" height="80" rx="12" fill="rgba(7,35,28,0.75)" stroke="#d4af37" stroke-width="2.2"/>
//                 <rect x="22" y="22" width="16" height="16" fill="#f3df9d"/>
//                 <rect x="62" y="22" width="16" height="16" stroke="#f3df9d" stroke-width="3"/>
//                 <rect x="22" y="62" width="16" height="16" stroke="#f3df9d" stroke-width="3"/>
//                 <rect x="44" y="22" width="10" height="10" fill="rgba(243,223,157,0.6)"/>
//                 <rect x="44" y="44" width="14" height="14" fill="#d4af37"/>
//                 <rect x="22" y="44" width="12" height="10" fill="rgba(243,223,157,0.75)"/>
//                 <rect x="64" y="46" width="14" height="12" fill="rgba(243,223,157,0.8)"/>
//                 <rect x="46" y="66" width="12" height="12" fill="#f3df9d"/>
//                 <rect x="66" y="66" width="12" height="12" fill="rgba(212,175,55,0.5)"/>
//             </svg>
//         </div>
//
//         <!-- 4. Таможенная пломба / Замок безопасности -->
//         <div class="parallax-item p-seal-1" data-speed="-0.25" data-rot="0.20" data-wave="20">
//             <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M50 10L84 25V52C84 74 69 88 50 94C31 88 16 74 16 52V25L50 10Z" fill="rgba(9,45,36,0.7)" stroke="#f3df9d" stroke-width="2.2"/>
//                 <path d="M36 52L46 62L66 40" stroke="#fff7d6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
//             </svg>
//         </div>
//
//         <!-- 5. Вторая паллета / Коробка -->
//         <div class="parallax-item p-box-2" data-speed="0.16" data-rot="-0.22" data-wave="25">
//             <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <polygon points="50,12 88,30 50,48 12,30" fill="rgba(243,223,157,0.22)" stroke="#d4af37" stroke-width="2"/>
//                 <polygon points="12,30 50,48 50,86 12,68" fill="rgba(8,38,30,0.75)" stroke="#f3df9d" stroke-width="2"/>
//                 <polygon points="88,30 50,48 50,86 88,68" fill="rgba(5,24,19,0.85)" stroke="#d4af37" stroke-width="2"/>
//                 <line x1="31" y1="21" x2="69" y2="39" stroke="#f3df9d" stroke-width="2.5"/>
//             </svg>
//         </div>
//
//         <!-- 6. Ж/Д Контейнер -->
//         <div class="parallax-item p-train-1" data-speed="-0.15" data-rot="0.10" data-wave="14">
//             <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <rect x="8" y="14" width="104" height="46" rx="5" fill="rgba(8,44,35,0.72)" stroke="#f3df9d" stroke-width="2"/>
//                 <line x1="28" y1="22" x2="28" y2="52" stroke="rgba(243,223,157,0.5)" stroke-width="2.5"/>
//                 <line x1="48" y1="22" x2="48" y2="52" stroke="rgba(243,223,157,0.5)" stroke-width="2.5"/>
//                 <line x1="68" y1="22" x2="68" y2="52" stroke="rgba(243,223,157,0.5)" stroke-width="2.5"/>
//                 <line x1="88" y1="22" x2="88" y2="52" stroke="rgba(243,223,157,0.5)" stroke-width="2.5"/>
//                 <circle cx="30" cy="66" r="7" fill="#06231c" stroke="#d4af37" stroke-width="2.2"/>
//                 <circle cx="90" cy="66" r="7" fill="#06231c" stroke="#d4af37" stroke-width="2.2"/>
//             </svg>
//         </div>
//     `;
//
//     document.body.prepend(parallaxLayer);
//
//     const parallaxItems = Array.from(parallaxLayer.querySelectorAll('.parallax-item'));
//     let currentScroll = window.scrollY;
//     let targetScroll = window.scrollY;
//
//     window.addEventListener('scroll', () => {
//         targetScroll = window.scrollY;
//     }, { passive: true });
//
//     // Плавный цикл параллакса (работает на ПК и смартфонах с инерцией)
//     function updateParallax() {
//         currentScroll += (targetScroll - currentScroll) * 0.08;
//         const isMobile = window.innerWidth <= 768;
//         const mobileFactor = isMobile ? 0.65 : 1; // На мобилках амплитуда аккуратнее
//
//         parallaxItems.forEach((item, index) => {
//             const speed = parseFloat(item.dataset.speed) || 0.2;
//             const rot = parseFloat(item.dataset.rot) || 0.15;
//             const wave = parseFloat(item.dataset.wave) || 15;
//
//             const yOffset = currentScroll * speed * mobileFactor * 1.4;
//             const xOffset = Math.sin((currentScroll * 0.004) + index) * wave * mobileFactor;
//             const rotateZ = currentScroll * rot * mobileFactor;
//             const rotateX = Math.cos((currentScroll * 0.005) + index) * 18;
//             const rotateY = Math.sin((currentScroll * 0.005) + index) * 18;
//
//             item.style.transform = `translate3d(${xOffset.toFixed(1)}px, ${yOffset.toFixed(1)}px, 0) rotateZ(${rotateZ.toFixed(1)}deg) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)`;
//         });
//
//         requestAnimationFrame(updateParallax);
//     }
//     requestAnimationFrame(updateParallax);
//
//     // 2. Автоматическая разметка блоков для ВАУ-появления при скролле (Scroll Reveal)
//     const addReveal = (selector, revealClass, stagger = 0) => {
//         const elements = document.querySelectorAll(selector);
//         elements.forEach((el, idx) => {
//             el.classList.add(revealClass);
//             if (stagger > 0) {
//                 el.style.setProperty('--reveal-delay', `${(idx * stagger).toFixed(2)}s`);
//             }
//         });
//     };
//
//     // Назначаем эффектные выезды всем ключевым секциям сайта
//     addReveal('.hero-info-title', 'reveal-left', 0);
//     addReveal('.hero-info-text-item', 'reveal-left', 0.12);
//     addReveal('.hero-info-button', 'reveal-up', 0.35);
//     addReveal('.hero-render', 'reveal-right', 0.15);
//
//     addReveal('.section-title, .section-subtitle', 'reveal-up', 0.08);
//     addReveal('.catalog-item', 'reveal-up', 0.12);
//     addReveal('.advantages-section .scene', 'reveal-scale', 0.1);
//     addReveal('.calc-card', 'reveal-up', 0.1);
//     addReveal('.contacts-info', 'reveal-left', 0.1);
//     addReveal('.contacts-map-wrapper', 'reveal-right', 0.2);
//     addReveal('.footer-top > div', 'reveal-up', 0.1);
//
//     const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
//
//     const revealObserver = new IntersectionObserver((entries) => {
//         entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('is-visible');
//             }
//         });
//     }, {
//         threshold: 0.12,
//         rootMargin: '0px 0px -40px 0px'
//     });
//
//     revealElements.forEach((el) => revealObserver.observe(el));
// })();

document.addEventListener('DOMContentLoaded', () => {
    const headerElements = document.querySelectorAll('[data-parallax-header]');
    if (!headerElements.length) return;

    // Кэшируем DOM-узлы и скорости один раз при старте
    const headersData = new Map();
    const activeHeaders = new Set();

    headerElements.forEach(header => {
        const layers = Array.from(header.querySelectorAll('[data-parallax-speed]')).map(el => ({
            el,
            speed: parseFloat(el.dataset.parallaxSpeed) || 0
        }));
        headersData.set(header, layers);
    });

    let ticking = false;

    const updateActiveHeaders = () => {
        const windowHeight = window.innerHeight;

        activeHeaders.forEach(header => {
            const rect = header.getBoundingClientRect();
            const layers = headersData.get(header);

            // 1. Считаем параллакс для слоев текущего заголовка
            const centerOffset = (rect.top + rect.height / 2) - (windowHeight / 2);
            layers.forEach(({ el, speed }) => {
                const yPos = (centerOffset * speed).toFixed(1);
                el.style.setProperty('--py', `${yPos}px`);
            });

            // 2. Считаем позицию блика
            const totalTravel = windowHeight + rect.height;
            const currentPos = windowHeight - rect.top;
            const progress = Math.min(Math.max(currentPos / totalTravel, 0), 1);

            const shinePercentage = (130 - progress * 160).toFixed(1);
            header.style.setProperty('--shine-pos', `${shinePercentage}%`);
        });

        ticking = false;
    };

    const requestTick = () => {
        if (!ticking && activeHeaders.size > 0) {
            window.requestAnimationFrame(updateActiveHeaders);
            ticking = true;
        }
    };

    // Отслеживаем только видимые на экране заголовки (с запасом 100px сверху/снизу)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeHeaders.add(entry.target);
            } else {
                activeHeaders.delete(entry.target);
            }
        });
        requestTick();
    }, { rootMargin: '100px 0px' });

    headerElements.forEach(header => observer.observe(header));

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
});