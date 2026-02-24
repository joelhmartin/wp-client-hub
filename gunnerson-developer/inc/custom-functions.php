<?php
/**
 * Custom utility functions
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render an SVG arrow icon used in buttons.
 *
 * @param string $color Stroke color (default: white).
 * @return string SVG markup.
 */
function gd_arrow_svg( $color = 'white' ) {
    return '<svg class="arrow-btn" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.66669 11.3334L11.3334 4.66669" stroke="' . esc_attr( $color ) . '" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.66669 4.66669H11.3334V11.3334" stroke="' . esc_attr( $color ) . '" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>';
}

/**
 * Render a dropdown arrow SVG for navigation.
 */
function gd_dropdown_arrow_svg() {
    return '<svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';
}

/**
 * Render a submenu arrow SVG.
 */
function gd_submenu_arrow_svg() {
    return '<svg class="submenu-arrow" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>';
}

/**
 * Helper to get a template part with data.
 * Passes $args to the template part.
 *
 * @param string $slug Template part slug.
 * @param array  $args Data to pass to the template.
 */
function gd_get_template_part( $slug, $args = [] ) {
    if ( ! empty( $args ) ) {
        set_query_var( 'gd_args', $args );
    }
    get_template_part( $slug, null, $args );
}

/**
 * Check if Anchor Tools plugin is active.
 */
function gd_has_anchor_tools() {
    return defined( 'ANCHOR_TOOLS_VERSION' ) || is_plugin_active( 'Anchor Tools/anchor-tools.php' );
}

/**
 * Get the site's base URL (no trailing slash).
 */
function gd_site_url() {
    return untrailingslashit( home_url() );
}
