document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  var navWrapper = document.getElementById("navWrapper");
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");
  var navOverlay = document.getElementById("navOverlay");
  var dropdownParents = document.querySelectorAll(".has-dropdown");

  // Scroll behavior - change nav style
  function handleScroll() {
    if (window.scrollY > 50) {
      navWrapper.classList.add("scrolled");
    } else {
      navWrapper.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);

  // Trigger on load in case page is already scrolled
  handleScroll();

  // Mobile menu toggle
  menuToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.contains("open");
    mainNav.classList.toggle("open");
    menuToggle.classList.toggle("active");
    navOverlay.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", !isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
  });

  // Close mobile menu when clicking overlay
  navOverlay.addEventListener("click", closeMenu);

  function closeMenu() {
    mainNav.classList.remove("open");
    menuToggle.classList.remove("active");
    navOverlay.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // Mobile dropdown toggles
  dropdownParents.forEach(function (parent) {
    var link = parent.querySelector(":scope > a");

    link.addEventListener("click", function (e) {
      // Only handle dropdown toggle on mobile
      if (window.innerWidth <= 1100) {
        var dropdown = parent.querySelector(":scope > .dropdown");
        if (dropdown) {
          e.preventDefault();

          // Close other open dropdowns at same level
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

  // Handle keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  // Close mobile menu on resize to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) {
      closeMenu();
      // Reset all mobile dropdown states
      dropdownParents.forEach(function (parent) {
        parent.classList.remove("dropdown-open");
      });
    }
  });
});
