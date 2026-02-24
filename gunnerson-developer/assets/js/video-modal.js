/**
 * Video Modal — YouTube/Vimeo lightbox player
 */
document.addEventListener("DOMContentLoaded", function () {
    var triggers = document.querySelectorAll("[data-video-url]");

    if (triggers.length === 0) return;

    // Create modal
    var modal = document.createElement("div");
    modal.className = "video-modal";
    modal.innerHTML = '<div class="video-modal__backdrop"></div>' +
        '<div class="video-modal__content">' +
        '<button class="video-modal__close" aria-label="Close video">&times;</button>' +
        '<div class="video-modal__player"></div>' +
        '</div>';
    document.body.appendChild(modal);

    var backdrop = modal.querySelector(".video-modal__backdrop");
    var closeBtn = modal.querySelector(".video-modal__close");
    var player = modal.querySelector(".video-modal__player");

    function openModal(url) {
        var embedUrl = getEmbedUrl(url);
        if (!embedUrl) return;

        player.innerHTML = '<iframe src="' + embedUrl + '" ' +
            'frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("active");
        player.innerHTML = "";
        document.body.style.overflow = "";
    }

    function getEmbedUrl(url) {
        // YouTube
        var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
        if (ytMatch) return "https://www.youtube.com/embed/" + ytMatch[1] + "?autoplay=1";

        // Vimeo
        var vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return "https://player.vimeo.com/video/" + vimeoMatch[1] + "?autoplay=1";

        return null;
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function (e) {
            e.preventDefault();
            openModal(trigger.getAttribute("data-video-url"));
        });
    });

    backdrop.addEventListener("click", closeModal);
    closeBtn.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });
});
