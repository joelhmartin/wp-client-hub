<?php
/**
 * Shortcode Helpers — wrappers for Anchor Tools shortcodes
 *
 * These functions provide convenient PHP wrappers for shortcodes
 * provided by the Anchor Tools plugin suite. They allow template
 * files to call e.g. gd_phone() instead of do_shortcode('[phone]').
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render the business phone number.
 */
function gd_phone() {
    return do_shortcode( '[phone]' );
}

/**
 * Render the phone href (tel: link value).
 */
function gd_phone_href() {
    return do_shortcode( '[phone_href]' );
}

/**
 * Render the business email.
 */
function gd_email() {
    return do_shortcode( '[email]' );
}

/**
 * Render the business address.
 */
function gd_address() {
    return do_shortcode( '[address]' );
}

/**
 * Render business hours.
 */
function gd_business_hours() {
    return do_shortcode( '[business_hours]' );
}

/**
 * Render breadcrumbs (Anchor breadcrumbs plugin).
 */
function gd_breadcrumbs() {
    return do_shortcode( '[ac_breadcrumbs]' );
}

/**
 * Render current year.
 */
function gd_current_year() {
    return do_shortcode( '[current_year]' );
}

/**
 * Render site title.
 */
function gd_site_title() {
    return do_shortcode( '[site_title]' );
}

/**
 * Render a CTM form variant.
 */
function gd_ctm_form( $id ) {
    return do_shortcode( '[ctm_form_variant id="' . esc_attr( $id ) . '"]' );
}

/**
 * Render a Google Maps embed.
 */
function gd_google_maps() {
    return do_shortcode( '[google_maps_embed]' );
}

/**
 * Render an Anchor popup trigger.
 */
function gd_popup( $id ) {
    return do_shortcode( '[anchor_popup id="' . esc_attr( $id ) . '"]' );
}
