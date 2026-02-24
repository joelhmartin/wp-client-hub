<?php
/**
 * Team Member Grid Section
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$uploads = content_url( '/uploads' );

$team = [
    [
        'name'  => 'K. Cheyn Gunnerson, DMD',
        'title' => 'Founder & Lead Dentist',
        'image' => $uploads . '/2025/12/dr-gunnerson.jpg',
        'url'   => home_url( '/k-cheyn-gunnerson-dmd/' ),
    ],
    [
        'name'  => 'Jakob B. Bradford, DDS',
        'title' => 'Associate Dentist',
        'image' => $uploads . '/2025/12/dr-bradford.jpg',
        'url'   => home_url( '/jakob-b-bradford-dds/' ),
    ],
];
?>

<section class="section">
    <div class="container">
        <?php get_template_part( 'template-parts/components/section-heading', null, [
            'overline' => 'Our Doctors',
            'title'    => 'Meet the Team',
            'subtitle' => 'Our experienced dentists are dedicated to providing personalized, compassionate care for every patient.',
            'align'    => 'center',
        ] ); ?>

        <div class="grid grid--2 stagger-children" style="max-width: 800px; margin: 0 auto;">
            <?php foreach ( $team as $member ) : ?>
            <a href="<?php echo esc_url( $member['url'] ); ?>" class="team-card">
                <img
                    src="<?php echo esc_url( $member['image'] ); ?>"
                    alt="<?php echo esc_attr( $member['name'] ); ?>"
                    class="team-card__image"
                    loading="lazy"
                />
                <div class="team-card__body">
                    <h3 class="team-card__name"><?php echo esc_html( $member['name'] ); ?></h3>
                    <span class="team-card__title"><?php echo esc_html( $member['title'] ); ?></span>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
