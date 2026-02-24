    </main><!-- #content -->
</div><!-- #page -->

<!-- ════════════ FOOTER ════════════ -->
<footer class="site-footer">

    <!-- Footer Main -->
    <div class="footer-main">
        <div class="container">
            <div class="footer-grid">

                <!-- Brand Column -->
                <div class="footer-brand">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
                        <img
                            src="<?php echo esc_url( GD_URI . '/assets/images/logo.svg' ); ?>"
                            alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"
                            class="logo-img"
                            width="180"
                            height="40"
                        />
                    </a>
                    <p>Creating stunning smiles and delivering exceptional care for the whole family in Payson, Utah.</p>

                    <div class="footer-address">
                        <i class="fa-solid fa-location-dot"></i>
                        33 W 300 South<br>
                        Payson, Utah 84651
                    </div>

                    <a href="tel:+13854383887" class="footer-phone">
                        <i class="fa-solid fa-phone"></i>
                        (385) 438-3887
                    </a>

                    <div class="footer-social">
                        <a href="https://www.facebook.com/gunnersondental" aria-label="Facebook" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/gunnersondental" aria-label="Instagram" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a>
                        <a href="https://www.google.com/maps/place/Gunnerson+Dental" aria-label="Google" target="_blank" rel="noopener"><i class="fa-brands fa-google"></i></a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="footer-col">
                    <h4>About</h4>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/about-us/' ) ); ?>">About Us</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Blog</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/community-involvement/' ) ); ?>">Community Involvement</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/k-cheyn-gunnerson-dmd/' ) ); ?>">Meet Dr. Gunnerson</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/jakob-b-bradford-dds/' ) ); ?>">Meet Dr. Bradford</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/patient-testimonials/' ) ); ?>">Patient Stories</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/membership-club/' ) ); ?>">Membership Club</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/payment-options/' ) ); ?>">Payment Options</a></li>
                    </ul>
                </div>

                <!-- Services -->
                <div class="footer-col">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/general-dentistry/' ) ); ?>">General Dentistry</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family-dentistry/' ) ); ?>">Family Dentistry</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/cosmetic-dentistry/' ) ); ?>">Cosmetic Dentistry</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/restorative-dentistry/' ) ); ?>">Restorative Dentistry</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/dental-implants/' ) ); ?>">Dental Implants</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/oral-surgery/' ) ); ?>">Oral Surgery</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/clear-aligners/' ) ); ?>">Clear Aligners</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/relieving-dental-anxiety/' ) ); ?>">Dental Anxiety</a></li>
                    </ul>
                </div>

                <!-- Contact & Hours -->
                <div class="footer-col">
                    <h4>Office Hours</h4>
                    <ul class="footer-hours">
                        <li>Monday: 9AM&ndash;5PM</li>
                        <li>Tuesday: 9AM&ndash;5PM</li>
                        <li>Wednesday: 9AM&ndash;5PM</li>
                        <li>Thursday: 9AM&ndash;5PM</li>
                        <li>Friday: Closed</li>
                        <li>Saturday: Closed</li>
                        <li>Sunday: Closed</li>
                    </ul>
                    <div style="margin-top: 1.25rem;">
                        <a href="mailto:office@gunnersondental.com" style="color: var(--theme-main-light); font-size: 0.85rem;">
                            <i class="fa-solid fa-envelope" style="margin-right: 0.35rem;"></i>
                            office@gunnersondental.com
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
        <div class="container">
            <p>&copy; <?php echo date( 'Y' ); ?> <?php bloginfo( 'name' ); ?>. All rights reserved.</p>
            <div class="footer-bottom-links">
                <a href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>">Privacy Policy</a>
                <a href="<?php echo esc_url( home_url( '/site-index/' ) ); ?>">Site Index</a>
            </div>
        </div>
    </div>

</footer>

<?php wp_footer(); ?>
</body>
</html>
