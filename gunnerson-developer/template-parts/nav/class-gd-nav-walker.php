<?php
/**
 * Custom Nav Walker for Gunnerson Dental
 *
 * Outputs dropdown markup compatible with the header CSS:
 * - Adds .has-dropdown class to parent <li> elements
 * - Outputs dropdown arrow SVGs for items with children
 * - Outputs submenu arrow SVGs for nested items
 * - Uses .dropdown class for <ul> submenus
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

class GD_Nav_Walker extends Walker_Nav_Menu {

    /**
     * Starts the list before the elements are added.
     */
    public function start_lvl( &$output, $depth = 0, $args = null ) {
        $indent = str_repeat( "\t", $depth );
        $output .= "\n{$indent}<ul class=\"dropdown\">\n";
    }

    /**
     * Ends the list after the elements are added.
     */
    public function end_lvl( &$output, $depth = 0, $args = null ) {
        $indent = str_repeat( "\t", $depth );
        $output .= "{$indent}</ul>\n";
    }

    /**
     * Starts the element output.
     */
    public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ) {
        $item   = $data_object;
        $indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

        // Build classes
        $classes   = empty( $item->classes ) ? [] : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;

        // Check if this item has children
        $has_children = in_array( 'menu-item-has-children', $classes, true );
        if ( $has_children ) {
            $classes[] = 'has-dropdown';
        }

        // Check if active
        if ( in_array( 'current-menu-item', $classes, true ) || in_array( 'current-menu-ancestor', $classes, true ) ) {
            $classes[] = 'active';
        }

        $class_names = join( ' ', array_filter( $classes ) );
        $class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';

        $output .= $indent . '<li' . $class_names . '>';

        // Build link attributes
        $atts = [];
        $atts['title']  = ! empty( $item->attr_title ) ? $item->attr_title : '';
        $atts['target'] = ! empty( $item->target ) ? $item->target : '';
        $atts['rel']    = ! empty( $item->xfn ) ? $item->xfn : '';
        $atts['href']   = ! empty( $item->url ) ? $item->url : '';

        $attributes = '';
        foreach ( $atts as $attr => $value ) {
            if ( ! empty( $value ) ) {
                $attributes .= ' ' . $attr . '="' . esc_attr( $value ) . '"';
            }
        }

        // Build the link
        $item_output = '';

        if ( isset( $args->before ) ) {
            $item_output .= $args->before;
        }

        $item_output .= '<a' . $attributes . '>';

        if ( isset( $args->link_before ) ) {
            $item_output .= $args->link_before;
        }

        $item_output .= apply_filters( 'the_title', $item->title, $item->ID );

        if ( isset( $args->link_after ) ) {
            $item_output .= $args->link_after;
        }

        // Add dropdown arrow for parent items
        if ( $has_children ) {
            if ( $depth === 0 ) {
                $item_output .= '<svg class="dropdown-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';
            } else {
                $item_output .= '<svg class="submenu-arrow" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>';
            }
        }

        $item_output .= '</a>';

        if ( isset( $args->after ) ) {
            $item_output .= $args->after;
        }

        $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
    }

    /**
     * Ends the element output.
     */
    public function end_el( &$output, $data_object, $depth = 0, $args = null ) {
        $output .= "</li>\n";
    }
}
