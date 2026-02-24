<?php
/**
 * Button Component
 *
 * Usage: gd_get_template_part( 'template-parts/components/button', [
 *     'text'    => 'Get In Touch',
 *     'url'     => '/contact-us/',
 *     'variant' => 'light',    // '', 'light', 'dark', 'outline'
 *     'size'    => '',          // '', 'sm', 'lg'
 *     'class'   => '',          // additional classes
 *     'popup'   => '',          // popup trigger id
 *     'target'  => '',          // '_blank'
 * ] );
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args( $args ?? [], [
    'text'    => 'Learn More',
    'url'     => '#',
    'variant' => '',
    'size'    => '',
    'class'   => '',
    'popup'   => '',
    'target'  => '',
] );

$classes = [ 'btn' ];
if ( $args['variant'] ) $classes[] = $args['variant'];
if ( $args['size'] )    $classes[] = $args['size'];
if ( $args['class'] )   $classes[] = $args['class'];
if ( $args['popup'] )   $classes[] = 'intake-popup-trigger';

$class_str = implode( ' ', $classes );
$target    = $args['target'] ? ' target="' . esc_attr( $args['target'] ) . '" rel="noopener"' : '';
$popup     = $args['popup']  ? ' data-target="#dipi-popup-container-' . esc_attr( $args['popup'] ) . '"' : '';

$arrow_color = ( $args['variant'] === 'light' || $args['variant'] === 'outline' ) ? '#05afb5' : 'white';
?>

<a href="<?php echo esc_url( $args['url'] ); ?>" class="<?php echo esc_attr( $class_str ); ?>"<?php echo $target . $popup; ?>>
    <span class="text"><?php echo esc_html( $args['text'] ); ?></span>
    <?php echo gd_arrow_svg( $arrow_color ); ?>
</a>
