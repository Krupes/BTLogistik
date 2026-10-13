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

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Получаем данные для демонстрации
    const product = document.getElementById('product').value;
    const quantity = document.getElementById('quantity').value;
    const isGiftWrapped = document.getElementById('giftWrap').checked;

    // Визуальный эффект при нажатии (меняем текст кнопки)
    const btn = document.querySelector('.submit-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Успешно!';
    btn.style.background = 'rgba(52, 199, 89, 0.4)'; // Зеленый оттенок

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = '';
        this.reset();
    }, 2000);
});