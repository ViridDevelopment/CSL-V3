// hamburger menu
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navbarLinks = document.querySelector('.navbar-links');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navbarLinks.classList.toggle('active');
    });
}); 

let currentIndex = 0;

function moveCarousel(direction, carouselId) {
    const carousel = document.getElementById(carouselId);
    const items = carousel.querySelectorAll('.carousel-item');
    const totalItems = items.length;
    let currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

    items[currentIndex].classList.remove('active');

    currentIndex = (currentIndex + direction + totalItems) % totalItems;

    items[currentIndex].classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        const items = carousel.querySelectorAll('.carousel-item');
        items[0].classList.add('active'); 
    });
});