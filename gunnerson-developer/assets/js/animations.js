/**
 * Animations — GSAP character reveal, SVG stroke, fade-in
 * Requires: gsap.min.js + ScrollTrigger.min.js
 */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        // Fallback: just show everything
        document.querySelectorAll(".char-reveal, .fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .stagger-children").forEach(function (el) {
            el.classList.add("is-animated");
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Character Reveal ───────────────────────────
    document.querySelectorAll(".char-reveal").forEach(function (el) {
        // Split text into characters
        var text = el.textContent;
        el.innerHTML = "";
        el.style.opacity = "1";

        for (var i = 0; i < text.length; i++) {
            var span = document.createElement("span");
            span.className = "char";
            span.textContent = text[i] === " " ? "\u00A0" : text[i];
            el.appendChild(span);
        }

        var chars = el.querySelectorAll(".char");

        gsap.fromTo(chars,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onComplete: function () {
                    el.classList.add("is-animated");
                }
            }
        );
    });

    // ── SVG Stroke Draw ────────────────────────────
    document.querySelectorAll(".svg-draw").forEach(function (el) {
        var paths = el.querySelectorAll("path, line, circle, polyline");

        paths.forEach(function (path) {
            var length = path.getTotalLength ? path.getTotalLength() : 1000;
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
        });

        gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            onComplete: function () {
                el.classList.add("is-animated");
            }
        });
    });

    // ── Fade In Up ─────────────────────────────────
    document.querySelectorAll(".fade-in-up").forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onComplete: function () {
                    el.classList.add("is-animated");
                }
            }
        );
    });

    // ── Fade In Left ───────────────────────────────
    document.querySelectorAll(".fade-in-left").forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onComplete: function () {
                    el.classList.add("is-animated");
                }
            }
        );
    });

    // ── Fade In Right ──────────────────────────────
    document.querySelectorAll(".fade-in-right").forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, x: 30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onComplete: function () {
                    el.classList.add("is-animated");
                }
            }
        );
    });

    // ── Scale In ───────────────────────────────────
    document.querySelectorAll(".scale-in").forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onComplete: function () {
                    el.classList.add("is-animated");
                }
            }
        );
    });

    // ── Stagger Children ───────────────────────────
    document.querySelectorAll(".stagger-children").forEach(function (el) {
        var children = el.children;

        gsap.fromTo(children,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                onComplete: function () {
                    el.classList.add("is-animated");
                }
            }
        );
    });
});
