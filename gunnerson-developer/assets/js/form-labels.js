/**
 * Form Labels — Floating label inputs
 */
document.addEventListener("DOMContentLoaded", function () {
    var formGroups = document.querySelectorAll(".form-group");

    formGroups.forEach(function (group) {
        var input = group.querySelector("input, textarea, select");
        var label = group.querySelector("label");

        if (!input || !label) return;

        // Check initial state
        if (input.value) {
            group.classList.add("has-value");
        }

        input.addEventListener("focus", function () {
            group.classList.add("focused");
        });

        input.addEventListener("blur", function () {
            group.classList.remove("focused");
            if (input.value) {
                group.classList.add("has-value");
            } else {
                group.classList.remove("has-value");
            }
        });

        input.addEventListener("input", function () {
            if (input.value) {
                group.classList.add("has-value");
            } else {
                group.classList.remove("has-value");
            }
        });
    });
});
