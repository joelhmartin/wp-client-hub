<?php
/**
 * Custom Header Template — functions.php Snippet
 *
 * Add this code to your Divi child theme's functions.php file.
 * Place it AFTER any existing enqueue functions.
 *
 * This does two things:
 *   1. Enqueues header.css and header.js from the child theme
 *   2. Injects the custom-nav.php template via wp_body_open hook
 *      (bypasses Divi Theme Builder header interception)
 */

// ========== Custom Native PHP Header ==========

// Enqueue custom header navigation CSS and JS
function tmj_enqueue_header_assets() {
    wp_enqueue_style(
        'tmj-header',
        get_stylesheet_directory_uri() . '/header.css',
        array(),
        filemtime( get_stylesheet_directory() . '/header.css' )
    );

    wp_enqueue_script(
        'tmj-header',
        get_stylesheet_directory_uri() . '/header.js',
        array(),
        filemtime( get_stylesheet_directory() . '/header.js' ),
        true  // Load in footer
    );
}
add_action( 'wp_enqueue_scripts', 'tmj_enqueue_header_assets', 30 );

// Inject custom navigation header via wp_body_open hook
// (Required because Divi Theme Builder intercepts direct header.php output)
function tmj_inject_custom_nav() {
    get_template_part( 'template-parts/custom-nav' );
}
add_action( 'wp_body_open', 'tmj_inject_custom_nav', 1 );
