<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Navigation Overlay (Mobile) -->
<div class="nav-overlay" id="navOverlay"></div>

<!-- ════════════ HEADER ════════════ -->
<header class="nav-wrapper" id="navWrapper">
    <div class="nav-container">
        <!-- Logo -->
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="logo" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> — Home">
            <img
                src="<?php echo esc_url( GD_URI . '/assets/images/logo.svg' ); ?>"
                alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"
                class="logo-img"
                width="180"
                height="40"
            />
        </a>

        <!-- Mobile Menu Toggle -->
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">
            <div class="menu-toggle-inner">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </button>

        <!-- Main Navigation -->
        <nav class="main-nav" id="mainNav" aria-label="Main navigation">
            <?php
            wp_nav_menu( [
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'nav-menu',
                'walker'         => new GD_Nav_Walker(),
                'fallback_cb'    => false,
            ] );
            ?>

            <a href="<?php echo esc_url( home_url( '/contact-us/' ) ); ?>" class="nav-cta">
                <span>Get In Touch</span>
                <?php echo gd_arrow_svg(); ?>
            </a>

            <a href="tel:+13854383887" class="nav-phone">
                <i class="fa-solid fa-phone"></i>
                (385) 438-3887
            </a>
        </nav>
    </div>
</header>

<!-- ════════════ MAIN CONTENT ════════════ -->
<div id="page" class="site">
    <main id="content" class="site-main">
