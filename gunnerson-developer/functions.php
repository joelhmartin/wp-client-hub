<?php
/**
 * Gunnerson Developer Theme — functions.php
 *
 * Loads modular includes from inc/ directory.
 * Keep this file lean — logic belongs in inc/ files.
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

// Theme version constant (used for cache-busting)
define( 'GD_VERSION', wp_get_theme()->get( 'Version' ) );
define( 'GD_DIR', get_template_directory() );
define( 'GD_URI', get_template_directory_uri() );

// ── Nav Walker (must load before menus render) ──────
require_once GD_DIR . '/template-parts/nav/class-gd-nav-walker.php';

// ── Includes ────────────────────────────────────────
require_once GD_DIR . '/inc/theme-setup.php';
require_once GD_DIR . '/inc/enqueue.php';
require_once GD_DIR . '/inc/shortcode-helpers.php';
require_once GD_DIR . '/inc/custom-functions.php';
