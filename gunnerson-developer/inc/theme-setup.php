<?php
/**
 * Theme Setup — menus, theme supports, image sizes
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', function () {

    // Let WordPress manage the <title> tag
    add_theme_support( 'title-tag' );

    // Post thumbnails
    add_theme_support( 'post-thumbnails' );

    // HTML5 markup for core components
    add_theme_support( 'html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ] );

    // Register nav menus
    register_nav_menus( [
        'primary'  => __( 'Primary Menu', 'gunnerson-developer' ),
        'services' => __( 'Services Menu', 'gunnerson-developer' ),
        'mobile'   => __( 'Mobile Menu', 'gunnerson-developer' ),
        'footer'   => __( 'Footer Menu', 'gunnerson-developer' ),
    ] );

    // Custom image sizes
    add_image_size( 'hero-slide', 1920, 900, true );
    add_image_size( 'team-card', 600, 700, true );
    add_image_size( 'service-card', 800, 600, true );
});
