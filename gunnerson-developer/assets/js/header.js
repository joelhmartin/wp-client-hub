/**
 * Header — Scroll effect, mobile menu, dropdowns
 * Adapted from header-template-package
 */
document.addEventListener("DOMContentLoaded", function () {
    var navWrapper = document.getElementById("navWrapper");
    var menuToggle = document.getElementById("menuToggle");
    var mainNav = document.getElementById("mainNav");
    var navOverlay = document.getElementById("navOverlay");
    var dropdownParents = document.querySelectorAll(".has-dropdown");

    if (!navWrapper) return;

    // ── Scroll Behavior ────────────────────────────
    function handleScroll() {
        if (window.scrollY > 50) {
            navWrapper.classList.add("scrolled");
        } else {
            navWrapper.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // ── Mobile Menu Toggle ─────────────────────────
    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            var isOpen = mainNav.classList.contains("open");
            mainNav.classList.toggle("open");
            menuToggle.classList.toggle("active");
            navOverlay.classList.toggle("active");
            menuToggle.setAttribute("aria-expanded", !isOpen);
            document.body.style.overflow = isOpen ? "" : "hidden";
        });
    }

    // Close on overlay click
    if (navOverlay) {
        navOverlay.addEventListener("click", closeMenu);
    }

    function closeMenu() {
        mainNav.classList.remove("open");
        menuToggle.classList.remove("active");
        navOverlay.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    // ── Mobile Dropdown Toggles ────────────────────
    dropdownParents.forEach(function (parent) {
        var link = parent.querySelector(":scope > a");

        link.addEventListener("click", function (e) {
            if (window.innerWidth <= 1100) {
                var dropdown = parent.querySelector(":scope > .dropdown");
                if (dropdown) {
                    e.preventDefault();

                    // Close sibling dropdowns
                    var siblings = parent.parentElement.querySelectorAll(
                        ":scope > .has-dropdown.dropdown-open"
                    );
                    siblings.forEach(function (sibling) {
                        if (sibling !== parent) {
                            sibling.classList.remove("dropdown-open");
                        }
                    });

                    parent.classList.toggle("dropdown-open");
                }
            }
        });
    });

    // ── Keyboard Navigation ────────────────────────
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeMenu();
        }
    });

    // ── Reset on Resize ────────────────────────────
    window.addEventListener("resize", function () {
        if (window.innerWidth > 1100) {
            closeMenu();
            dropdownParents.forEach(function (parent) {
                parent.classList.remove("dropdown-open");
            });
        }
    });
});
