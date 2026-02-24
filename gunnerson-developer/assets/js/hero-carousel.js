/**
 * Hero Carousel — Vanilla JS slide auto-rotation
 */
document.addEventListener("DOMContentLoaded", function () {
    var slides = document.querySelectorAll(".carousel-slide");
    var dots = document.querySelectorAll(".carousel-dot");

    if (slides.length === 0) return;

    var currentSlide = 0;
    var totalSlides = slides.length;
    var interval = null;
    var INTERVAL_MS = 6000;

    function goToSlide(index) {
        slides[currentSlide].classList.remove("active");
        if (dots[currentSlide]) dots[currentSlide].classList.remove("active");

        currentSlide = index;

        slides[currentSlide].classList.add("active");
        if (dots[currentSlide]) dots[currentSlide].classList.add("active");
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
    }

    function startAutoplay() {
        if (interval) clearInterval(interval);
        interval = setInterval(nextSlide, INTERVAL_MS);
    }

    function stopAutoplay() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    // Dot click handlers
    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            goToSlide(index);
            stopAutoplay();
            startAutoplay();
        });
    });

    // Pause on hover
    var heroEl = document.querySelector(".hero");
    if (heroEl) {
        heroEl.addEventListener("mouseenter", stopAutoplay);
        heroEl.addEventListener("mouseleave", startAutoplay);
    }

    // Start
    if (totalSlides > 1) {
        startAutoplay();
    }
});
