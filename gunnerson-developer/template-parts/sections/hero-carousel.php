<?php
/**
 * Hero Carousel Section
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

$site_url = esc_url( home_url() );
$uploads  = content_url( '/uploads' );

$slides = [
    [
        'image'    => $uploads . '/2025/11/Artboard-2.jpg',
        'heading'  => 'YOUR <span class="text-image-wrapper"><img class="inline-text-image" width="100" src="' . $uploads . '/2025/12/Office-01.jpg" alt="" aria-hidden="true" /></span> NEW DENTAL HOME',
        'text'     => 'Because great smiles start with a personalized treatment plan.',
        'btn_text' => 'Appointment Request',
        'btn_popup'=> '23364357',
        'btn2_text'=> 'Explore Services',
        'btn2_url' => home_url( '/general-dentistry/' ),
    ],
    [
        'image'    => $uploads . '/2025/11/Artboard-1.jpg',
        'heading'  => 'SHARE IN <span class="text-image-wrapper"><img class="inline-text-image" width="100" src="' . $uploads . '/2025/12/Office-01.jpg" alt="" aria-hidden="true" /></span> THE SMILES',
        'text'     => 'Modern dentistry with a warm, personalized touch in Payson, Utah.',
        'btn_text' => 'Meet Our Team',
        'btn_url'  => home_url( '/about-us/' ),
        'btn2_text'=> 'Call Now',
        'btn2_url' => 'tel:+13854383887',
    ],
    [
        'image'    => $uploads . '/2025/11/Artboard-3.jpg',
        'heading'  => 'STUNNING SMILES, EXCEPTIONAL <span class="text-image-wrapper"><img class="inline-text-image" width="100" src="' . $uploads . '/2025/12/Office-01.jpg" alt="" aria-hidden="true" /></span> CARE',
        'text'     => 'From cleanings to cosmetic makeovers, we handle it all under one roof.',
        'btn_text' => 'Appointment Request',
        'btn_popup'=> '23364357',
        'btn2_text'=> 'Tour Our Office',
        'btn2_url' => home_url( '/tour-the-office/' ),
    ],
];
?>

<section class="hero">
    <div class="carousel-container">
        <?php foreach ( $slides as $i => $slide ) : ?>
        <div class="carousel-slide<?php echo $i === 0 ? ' active' : ''; ?>" style="background-image: url('<?php echo esc_url( $slide['image'] ); ?>')">
            <div class="slide-content">
                <h1><?php echo $slide['heading']; ?></h1>
                <p><?php echo esc_html( $slide['text'] ); ?></p>
                <div class="btn-row">
                    <?php if ( ! empty( $slide['btn_popup'] ) ) : ?>
                        <div class="btn intake-popup-trigger" data-target="#dipi-popup-container-<?php echo esc_attr( $slide['btn_popup'] ); ?>">
                            <span class="text"><?php echo esc_html( $slide['btn_text'] ); ?></span>
                            <?php echo gd_arrow_svg(); ?>
                        </div>
                    <?php elseif ( ! empty( $slide['btn_url'] ) ) : ?>
                        <a href="<?php echo esc_url( $slide['btn_url'] ); ?>" class="btn">
                            <span class="text"><?php echo esc_html( $slide['btn_text'] ); ?></span>
                            <?php echo gd_arrow_svg(); ?>
                        </a>
                    <?php endif; ?>

                    <?php if ( ! empty( $slide['btn2_url'] ) ) : ?>
                        <a href="<?php echo esc_url( $slide['btn2_url'] ); ?>" class="btn light">
                            <span class="text"><?php echo esc_html( $slide['btn2_text'] ); ?></span>
                            <?php echo gd_arrow_svg( '#05afb5' ); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>

        <!-- Carousel Dots -->
        <div class="carousel-dots">
            <?php for ( $i = 0; $i < count( $slides ); $i++ ) : ?>
                <button class="carousel-dot<?php echo $i === 0 ? ' active' : ''; ?>" aria-label="Slide <?php echo $i + 1; ?>"></button>
            <?php endfor; ?>
        </div>
    </div>
</section>
