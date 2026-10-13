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