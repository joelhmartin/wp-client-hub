<?php
/**
 * Call-to-Action Banner Section
 *
 * Usage: gd_get_template_part( 'template-parts/sections/cta-banner', [
 *     'title'     => 'Ready for Your Best Smile?',
 *     'text'      => 'Schedule your appointment...',
 *     'btn_text'  => 'Schedule Now',
 *     'btn_popup' => '23364357',
 *     'btn2_text' => 'Call Us',
 *     'btn2_url'  => 'tel:...',
 * ] );
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args( $args ?? [], [
    'title'     => 'Ready for Your Best Smile?',
    'text'      => 'Schedule your appointment with Gunnerson Dental today and discover the difference personalized dental care makes.',
    'btn_text'  => 'Appointment Request',
    'btn_popup' => '23364357',
    'btn_url'   => '',
    'btn2_text' => 'Call (385) 438-3887',
    'btn2_url'  => 'tel:+13854383887',
] );
?>

<section class="section section--no-bottom">
    <div class="container">
        <div class="cta-banner fade-in-up">
            <h2><?php echo esc_html( $args['title'] ); ?></h2>
            <p><?php echo esc_html( $args['text'] ); ?></p>
            <div class="btn-row">
                <?php if ( $args['btn_popup'] ) : ?>
                    <div class="btn light intake-popup-trigger" data-target="#dipi-popup-container-<?php echo esc_attr( $args['btn_popup'] ); ?>">
                        <span class="text"><?php echo esc_html( $args['btn_text'] ); ?></span>
                        <?php echo gd_arrow_svg( '#05afb5' ); ?>
                    </div>
                <?php elseif ( $args['btn_url'] ) : ?>
                    <a href="<?php echo esc_url( $args['btn_url'] ); ?>" class="btn light">
                        <span class="text"><?php echo esc_html( $args['btn_text'] ); ?></span>
                        <?php echo gd_arrow_svg( '#05afb5' ); ?>
                    </a>
                <?php endif; ?>

                <?php if ( $args['btn2_url'] ) : ?>
                    <a href="<?php echo esc_url( $args['btn2_url'] ); ?>" class="btn dark">
                        <span class="text"><?php echo esc_html( $args['btn2_text'] ); ?></span>
                        <?php echo gd_arrow_svg(); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>
