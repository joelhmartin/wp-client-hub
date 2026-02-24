<?php
/**
 * Enqueue stylesheets and scripts
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {

    // ── External Fonts & Libraries ──────────────────

    // Adobe Typekit (stolzl)
    wp_enqueue_style(
        'gd-typekit',
        'https://use.typekit.net/svp3hrm.css',
        [],
        null
    );

    // Google Fonts — Plus Jakarta Sans + Nanum Myeongjo
    wp_enqueue_style(
        'gd-google-fonts',
        'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap',
        [],
        null
    );

    // Font Awesome 6.5
    wp_enqueue_style(
        'gd-fontawesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
        [],
        '6.5.0'
    );

    // GSAP 3.12.5
    wp_enqueue_script(
        'gsap',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        [],
        '3.12.5',
        true
    );

    // GSAP ScrollTrigger
    wp_enqueue_script(
        'gsap-scrolltrigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        [ 'gsap' ],
        '3.12.5',
        true
    );

    // ── Theme CSS ───────────────────────────────────

    $css_files = [
        'gd-variables'  => 'assets/css/variables.css',
        'gd-base'       => 'assets/css/base.css',
        'gd-layout'     => 'assets/css/layout.css',
        'gd-header'     => 'assets/css/header.css',
        'gd-footer'     => 'assets/css/footer.css',
        'gd-buttons'    => 'assets/css/buttons.css',
        'gd-hero'       => 'assets/css/hero.css',
        'gd-sections'   => 'assets/css/sections.css',
        'gd-forms'      => 'assets/css/forms.css',
        'gd-animations' => 'assets/css/animations.css',
    ];

    $prev = [];
    foreach ( $css_files as $handle => $path ) {
        wp_enqueue_style(
            $handle,
            GD_URI . '/' . $path,
            $prev,
            filemtime( GD_DIR . '/' . $path )
        );
        $prev = [ $handle ];
    }

    // Page-specific CSS
    if ( is_front_page() ) {
        wp_enqueue_style( 'gd-page-home', GD_URI . '/assets/css/pages/home.css', [ 'gd-sections' ], filemtime( GD_DIR . '/assets/css/pages/home.css' ) );
    } elseif ( is_page( 'about-us' ) ) {
        wp_enqueue_style( 'gd-page-about', GD_URI . '/assets/css/pages/about.css', [ 'gd-sections' ], filemtime( GD_DIR . '/assets/css/pages/about.css' ) );
    } elseif ( is_page( 'contact-us' ) ) {
        wp_enqueue_style( 'gd-page-contact', GD_URI . '/assets/css/pages/contact.css', [ 'gd-sections' ], filemtime( GD_DIR . '/assets/css/pages/contact.css' ) );
    } elseif ( is_page_template( 'page-service.php' ) || is_page( 'general-dentistry' ) ) {
        wp_enqueue_style( 'gd-page-service', GD_URI . '/assets/css/pages/service.css', [ 'gd-sections' ], filemtime( GD_DIR . '/assets/css/pages/service.css' ) );
    }

    // ── Theme JS ────────────────────────────────────

    wp_enqueue_script(
        'gd-header',
        GD_URI . '/assets/js/header.js',
        [],
        filemtime( GD_DIR . '/assets/js/header.js' ),
        true
    );

    wp_enqueue_script(
        'gd-animations',
        GD_URI . '/assets/js/animations.js',
        [ 'gsap', 'gsap-scrolltrigger' ],
        filemtime( GD_DIR . '/assets/js/animations.js' ),
        true
    );

    // Conditional scripts
    if ( is_front_page() ) {
        wp_enqueue_script(
            'gd-hero-carousel',
            GD_URI . '/assets/js/hero-carousel.js',
            [],
            filemtime( GD_DIR . '/assets/js/hero-carousel.js' ),
            true
        );
    }

    if ( is_page( 'contact-us' ) ) {
        wp_enqueue_script(
            'gd-form-labels',
            GD_URI . '/assets/js/form-labels.js',
            [],
            filemtime( GD_DIR . '/assets/js/form-labels.js' ),
            true
        );
    }
}, 20 );

// Remove WordPress emoji scripts (performance)
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
