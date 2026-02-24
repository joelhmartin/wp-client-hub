<?php
/**
 * Section Heading Component
 *
 * Usage: gd_get_template_part( 'template-parts/components/section-heading', [
 *     'overline'  => 'Our Services',
 *     'title'     => 'What We Offer',
 *     'subtitle'  => 'Comprehensive dental care...',
 *     'align'     => 'center',  // 'left', 'center'
 *     'animate'   => true,      // GSAP char-reveal on title
 *     'dark'      => false,     // dark background variant
 * ] );
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args( $args ?? [], [
    'overline'  => '',
    'title'     => '',
    'subtitle'  => '',
    'align'     => 'left',
    'animate'   => true,
    'dark'      => false,
] );

$align_class = $args['align'] === 'center' ? ' text-center' : '';
$title_class = $args['animate'] ? ' char-reveal' : '';
$title_color = $args['dark'] ? ' style="color: var(--white);"' : '';
?>

<div class="section-header<?php echo $align_class; ?>">
    <?php if ( $args['overline'] ) : ?>
        <span class="overline"><?php echo esc_html( $args['overline'] ); ?></span>
    <?php endif; ?>

    <?php if ( $args['title'] ) : ?>
        <h2 class="<?php echo esc_attr( trim( $title_class ) ); ?>"<?php echo $title_color; ?>>
            <?php echo wp_kses_post( $args['title'] ); ?>
        </h2>
    <?php endif; ?>

    <?php if ( $args['subtitle'] ) : ?>
        <p><?php echo wp_kses_post( $args['subtitle'] ); ?></p>
    <?php endif; ?>
</div>
