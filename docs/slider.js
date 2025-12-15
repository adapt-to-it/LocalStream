document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.querySelector('.slides');
    const slides = document.querySelectorAll('.slide');

    if (!slidesContainer || slides.length === 0) return;

    let currentSlide = 0;
    const slideInterval = 4000; // 4 seconds per slide

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        const offset = currentSlide * -100;
        slidesContainer.style.transform = `translateX(${offset}%)`;
    }

    setInterval(nextSlide, slideInterval);
});
