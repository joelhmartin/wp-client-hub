<?php
/**
 * Service Cards Grid Section
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$uploads = content_url( '/uploads' );

$services = [
    [
        'title' => 'General Dentistry',
        'text'  => 'Comprehensive cleanings, exams, and preventive care to keep your smile healthy.',
        'image' => $uploads . '/2026/01/3-44f01b2c-89a6-424c-8039-54f58fc8ca14-1000x672.jpg',
        'url'   => home_url( '/general-dentistry/' ),
    ],
    [
        'title' => 'Cosmetic Dentistry',
        'text'  => 'Veneers, whitening, bonding, and smile makeovers for the smile you\'ve always wanted.',
        'image' => $uploads . '/2026/01/Older-Couple-2.webp',
        'url'   => home_url( '/cosmetic-dentistry/' ),
    ],
    [
        'title' => 'Restorative Dentistry',
        'text'  => 'Crowns, bridges, fillings, and dentures to restore function and beauty.',
        'image' => $uploads . '/2025/12/Office-01.jpg',
        'url'   => home_url( '/restorative-dentistry/' ),
    ],
    [
        'title' => 'Dental Implants',
        'text'  => 'Permanent tooth replacement with state-of-the-art implant technology.',
        'image' => $uploads . '/2025/11/Artboard-2.jpg',
        'url'   => home_url( '/dental-implants/' ),
    ],
    [
        'title' => 'Clear Aligners',
        'text'  => 'Straighten your teeth discreetly with modern clear aligner technology.',
        'image' => $uploads . '/2025/11/Artboard-1.jpg',
        'url'   => home_url( '/clear-aligners/' ),
    ],
    [
        'title' => 'Oral Surgery',
        'text'  => 'Expert extractions, bone grafts, and surgical procedures with comfort in mind.',
        'image' => $uploads . '/2025/11/Artboard-3.jpg',
        'url'   => home_url( '/oral-surgery/' ),
    ],
];
?>

<section class="section section--off-white">
    <div class="container">
        <?php get_template_part( 'template-parts/components/section-heading', null, [
            'overline' => 'Our Services',
            'title'    => 'Comprehensive Dental Care',
            'subtitle' => 'From routine cleanings to advanced procedures, we provide everything your smile needs under one roof.',
            'align'    => 'center',
        ] ); ?>

        <div class="grid grid--3 stagger-children">
            <?php foreach ( $services as $service ) : ?>
            <a href="<?php echo esc_url( $service['url'] ); ?>" class="service-card">
                <img
                    src="<?php echo esc_url( $service['image'] ); ?>"
                    alt="<?php echo esc_attr( $service['title'] ); ?>"
                    class="service-card__image"
                    loading="lazy"
                />
                <div class="service-card__body">
                    <h3 class="service-card__title"><?php echo esc_html( $service['title'] ); ?></h3>
                    <p class="service-card__text"><?php echo esc_html( $service['text'] ); ?></p>
                    <span class="service-card__link">
                        Learn More
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
