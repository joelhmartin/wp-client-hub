<?php
/**
 * Custom Navigation Header
 * Loaded via wp_body_open hook in functions.php
 *
 * INSTALLATION: Place this file at:
 *   wp-content/themes/{your-child-theme}/template-parts/custom-nav.php
 *
 * CUSTOMIZATION:
 *   1. Replace logo <img> src URLs with your own (white + dark versions)
 *   2. Update all navigation links to match your site structure
 *   3. Update the CTA button URL and text
 */
?>
<!-- Navigation Overlay (Mobile) -->
<div class="nav-overlay" id="navOverlay"></div>

<!-- Navigation -->
<header class="nav-wrapper" id="navWrapper">
  <div class="nav-container">
    <!-- Logo -->
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo">
      <img src="https://mainstage2.kinsta.cloud/wp-content/uploads/2026/01/WISCs-LOGO.svg" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" class="logo-img logo-img--white" />
      <img src="https://mainstage2.kinsta.cloud/wp-content/uploads/2026/01/WISC-LOGO-BLACK.svg" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" class="logo-img logo-img--black" />
    </a>

    <!-- Mobile Menu Toggle -->
    <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">
      <div class="menu-toggle-inner">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- Main Navigation -->
    <nav class="main-nav" id="mainNav" aria-label="Main navigation">
      <ul class="nav-menu">

        <li class="has-dropdown">
          <a href="/about/">
            About
            <svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <ul class="dropdown">
            <li><a href="/about/">What Sets Us Apart</a></li>
            <li><a href="/get-to-know-dr-brunner/">Get to Know Dr. Brunner</a></li>
            <li><a href="/tour-our-office/">Tour Our Office</a></li>
            <li><a href="/advanced-technology-services/">Advanced Technology &amp; Services</a></li>
            <li><a href="/blog/">Blog</a></li>
          </ul>
        </li>

        <li class="has-dropdown">
          <a href="/services/">
            Services
            <svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <ul class="dropdown">
            <li class="has-dropdown">
              <a href="/what-is-tmj-tmd/">
                What is TMJ/TMD?
                <svg class="submenu-arrow" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
              </a>
              <ul class="dropdown">
                <li><a href="/take-our-tmj-quiz/">Take Our TMJ Quiz</a></li>
              </ul>
            </li>
            <li><a href="/headaches-migraines/">Headaches &amp; Migraines</a></li>
            <li><a href="/ear-neck-pain/">Ear &amp; Neck Pain</a></li>
            <li><a href="/face-jaw-pain/">Face &amp; Jaw Pain</a></li>
            <li class="has-dropdown">
              <a href="/always-tired-snoring/">
                Always Tired &amp; Snoring
                <svg class="submenu-arrow" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
              </a>
              <ul class="dropdown">
                <li><a href="/take-our-sleep-apnea-quiz/">Take Our Sleep Apnea Quiz</a></li>
              </ul>
            </li>
            <li><a href="/diagnosing-tmj/">Diagnosing TMJ</a></li>
          </ul>
        </li>

        <li class="has-dropdown">
          <a href="/for-patients/">
            For Patients
            <svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <ul class="dropdown">
            <li><a href="/for-patients/">Your First Visit</a></li>
            <li><a href="/for-patients/#forms">Patient Forms</a></li>
            <li><a href="/for-patients/#insurance">Insurance &amp; Financing</a></li>
            <li><a href="/faqs/">FAQs</a></li>
          </ul>
        </li>

        <li class="has-dropdown">
          <a href="/reviews/">
            Reviews
            <svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <ul class="dropdown">
            <li><a href="/reviews/">Written Reviews</a></li>
            <li><a href="/video-testimonials/">Video Testimonials</a></li>
          </ul>
        </li>

        <li>
          <a href="/refer-a-patient/">Refer a Patient</a>
        </li>

        <li class="has-dropdown">
          <a href="/contact/">
            Contact
            <svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <ul class="dropdown">
            <li><a href="/contact/">Office Info</a></li>
            <li><a href="/request-an-appointment/">Request an Appointment</a></li>
          </ul>
        </li>
      </ul>

      <a href="/request-an-appointment/" class="nav-cta">
        <span>Book Now</span>
      </a>
    </nav>
  </div>
</header>
