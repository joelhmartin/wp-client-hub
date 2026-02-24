<?php
/**
 * Breadcrumbs Section
 *
 * @package GunnersonDeveloper
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_front_page() ) : ?>
<div class="breadcrumbs-bar">
    <div class="container">
        <?php echo gd_breadcrumbs(); ?>
    </div>
</div>
<?php endif; ?>
