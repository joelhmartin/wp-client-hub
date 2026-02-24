<?php
/**
 * Testimonials Section
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$testimonials = [
    [
        'text'   => 'The entire team at Gunnerson Dental is wonderful. They make you feel like family from the moment you walk in. Dr. Gunnerson is thorough and truly cares about his patients.',
        'author' => 'Sarah M.',
        'stars'  => 5,
    ],
    [
        'text'   => 'I used to be terrified of the dentist, but they made me feel completely at ease. The office is beautiful and modern. Best dental experience I\'ve ever had!',
        'author' => 'James T.',
        'stars'  => 5,
    ],
    [
        'text'   => 'From cleanings to my crown, every visit has been excellent. The staff is professional, friendly, and always on time. Highly recommend to anyone in the Payson area.',
        'author' => 'Michelle R.',
        'stars'  => 5,
    ],
];
?>

<section class="section section--white">
    <div class="container">
        <?php get_template_part( 'template-parts/components/section-heading', null, [
            'overline' => 'Patient Stories',
            'title'    => 'What Our Patients Say',
            'subtitle' => 'Real stories from real patients who love their Gunnerson Dental experience.',
            'align'    => 'center',
        ] ); ?>

        <div class="grid grid--3 stagger-children">
            <?php foreach ( $testimonials as $t ) : ?>
            <div class="testimonial-card fade-in-up">
                <div class="testimonial-card__stars">
                    <?php for ( $i = 0; $i < $t['stars']; $i++ ) : ?>
                        <i class="fa-solid fa-star"></i>
                    <?php endfor; ?>
                </div>
                <p class="testimonial-card__text">&ldquo;<?php echo esc_html( $t['text'] ); ?>&rdquo;</p>
                <span class="testimonial-card__author">&mdash; <?php echo esc_html( $t['author'] ); ?></span>
                <span class="testimonial-card__quote-icon">&ldquo;</span>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="text-center mt-4">
            <?php get_template_part( 'template-parts/components/button', null, [
                'text'    => 'Read More Reviews',
                'url'     => home_url( '/patient-testimonials/' ),
                'variant' => 'outline',
            ] ); ?>
        </div>
    </div>
</section>
