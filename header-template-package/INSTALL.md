# Custom PHP Header Template — Installation Guide

> A fully custom, native PHP navigation header designed to replace the default Divi Theme Builder header. Features transparent-to-white scroll effect, dual-logo swap, multi-level dropdown menus, mobile slide-out drawer, and a "Book Now" CTA button.

---

## File Manifest

```
header-template-package/
├── INSTALL.md                          ← You are here
├── template-parts/
│   └── custom-nav.php                  ← The header HTML template
├── header.php                          ← Divi child theme header override
├── header.css                          ← All header/nav styles
├── header.js                           ← Scroll effects, mobile menu, dropdowns
├── css-variables.css                   ← Required CSS custom properties (:root)
└── functions-snippet.php               ← PHP to add to your functions.php
```

---

## Prerequisites

- WordPress with **Divi** parent theme active
- A **Divi child theme** (the files go into your child theme directory)
- Two logo files uploaded to your Media Library:
  - A **white/light** version (for transparent header state)
  - A **dark/black** version (for scrolled white header state)

---

## Installation Steps

### Step 1 — Upload Files to Child Theme

Upload the following files to your child theme directory via SFTP, SSH, or WP File Manager:

| File | Destination |
|------|-------------|
| `template-parts/custom-nav.php` | `wp-content/themes/{your-child}/template-parts/custom-nav.php` |
| `header.php` | `wp-content/themes/{your-child}/header.php` |
| `header.css` | `wp-content/themes/{your-child}/header.css` |
| `header.js` | `wp-content/themes/{your-child}/header.js` |

> **Note:** Create the `template-parts/` directory inside your child theme if it doesn't exist.

### Step 2 — Add CSS Variables

The header styles depend on CSS custom properties. You have two options:

**Option A — Divi Theme Options (Recommended)**

Go to **Divi → Theme Options → General → Custom CSS** and paste the contents of `css-variables.css` at the **top**:

```css
:root {
  --nav-height: 70px;
  --dark: #153b37;
  --dark-mid: #1a4a45;
  --dark-transparent: rgba(21, 59, 55, 0.6);
  --mid: #2a635c;
  --light: #3e857c;
  --lightest: #4a9e94;
  --accent: #e8a087;
  --accent-light: #f2c4b3;
  --accent-glow: rgba(232, 160, 135, 0.4);
  --white: #ffffff;
  --off-white: #f8fafa;
  --gray-light: #e8eeee;
  --text-dark: #1a2e2b;
  --text-muted-dark: #4a5f5c;
  --text-light: #d4e5e2;
  --text-muted-light: rgba(212, 229, 226, 0.6);
}
```

**Option B — Child Theme style.css**

Add the same `:root` block to the top of your child theme's `style.css` (after the theme comment header).

### Step 3 — Add PHP to functions.php

Open your child theme's `functions.php` and add the following snippet (from `functions-snippet.php`). Place it **after** any existing enqueue functions:

```php
// ========== Custom Native PHP Header ==========

// Enqueue custom header navigation CSS and JS
function tmj_enqueue_header_assets() {
    wp_enqueue_style(
        'tmj-header',
        get_stylesheet_directory_uri() . '/header.css',
        array(),
        filemtime( get_stylesheet_directory() . '/header.css' )
    );

    wp_enqueue_script(
        'tmj-header',
        get_stylesheet_directory_uri() . '/header.js',
        array(),
        filemtime( get_stylesheet_directory() . '/header.js' ),
        true  // Load in footer
    );
}
add_action( 'wp_enqueue_scripts', 'tmj_enqueue_header_assets', 30 );

// Inject custom navigation header via wp_body_open hook
function tmj_inject_custom_nav() {
    get_template_part( 'template-parts/custom-nav' );
}
add_action( 'wp_body_open', 'tmj_inject_custom_nav', 1 );
```

### Step 4 — Update Logo URLs

Open `template-parts/custom-nav.php` and replace the two `<img src="...">` URLs with your own logo files:

```php
<!-- Line ~15-16: Replace these URLs -->
<img src="YOUR_WHITE_LOGO_URL_HERE" alt="..." class="logo-img logo-img--white" />
<img src="YOUR_DARK_LOGO_URL_HERE"  alt="..." class="logo-img logo-img--black" />
```

### Step 5 — Update Navigation Links

Edit `template-parts/custom-nav.php` to match your site's page structure. The navigation is hardcoded HTML (not WordPress menus) for full layout control. Update:

- Top-level menu items and their `href` values
- Dropdown items and nested sub-dropdowns
- The CTA button URL (currently `/request-an-appointment/`)

### Step 6 — Hide Default Divi Header

The `header.css` file includes this rule at the bottom which hides Divi's built-in header:

```css
#main-header,
#top-header,
.et_pb_section.et_pb_section_0_tb_header,
.et_pb_section.et_pb_section_1_tb_header {
  display: none !important;
}
```

If your Divi Theme Builder header uses different class names, inspect and update these selectors.

### Step 7 — Clear Caches & Test

1. Clear any page/object caches (hosting, plugin, CDN)
2. Visit your site and verify:
   - Header is transparent on page load, turns white on scroll
   - White logo shows on transparent, dark logo shows on white
   - Desktop dropdowns appear on hover
   - Mobile hamburger menu opens slide-out drawer
   - Dropdown toggles work on mobile (tap to expand)
   - "Book Now" CTA button is visible
   - WP Admin bar offset works when logged in

---

## Architecture Notes

### Why `wp_body_open` Instead of Direct header.php Override?

Divi's Theme Builder intercepts `header.php` output. If you have *any* Divi Theme Builder header template assigned (even "Default"), it takes precedence over the child theme's `header.php`.

By using the `wp_body_open` action hook (priority 1), the custom nav injects immediately after `<body>` opens — **before** Divi's Theme Builder renders. The CSS then hides Divi's default `#main-header` element. This approach:

- Works regardless of Divi Theme Builder configuration
- Doesn't break Divi's internal layout expectations
- Allows the rest of Divi's `header.php` (meta, scripts, `#page-container`) to function normally

### Scroll Behavior

`header.js` adds/removes a `.scrolled` class on `.nav-wrapper` when the user scrolls past 50px. This triggers:
- Background: transparent → white with blur
- Logo swap: white version hidden, dark version shown
- Link colors: light → dark
- Box shadow appears

### Mobile Behavior (≤1100px)

- Hamburger button appears, main nav becomes a fixed right-side drawer
- Dropdowns switch from hover-to-reveal to tap-to-toggle
- Dark overlay appears behind the drawer
- Body scroll is locked when menu is open
- ESC key closes the menu

### CSS Variable Dependencies

The header CSS references these custom properties — all must be defined:

| Variable | Default | Usage |
|----------|---------|-------|
| `--nav-height` | `70px` | Container height, mobile drawer top padding |
| `--dark` | `#153b37` | Scrolled dropdown bg, mobile nav bg, CTA text |
| `--dark-transparent` | `rgba(21,59,55,.6)` | Desktop dropdown background |
| `--light` | `#3e857c` | Scrolled hover state |
| `--accent` | `#e8a087` | Hover color, active indicator, CTA bg |
| `--accent-light` | `#f2c4b3` | CTA hover sweep, dropdown hover text |
| `--white` | `#ffffff` | Hamburger bar color |
| `--text-light` | `#d4e5e2` | Nav link color (transparent state) |
| `--text-muted-dark` | `#4a5f5c` | Nav link color (scrolled state) |

### WP Admin Bar Compatibility

The CSS includes offsets for WordPress's admin bar:
- Desktop: `top: 32px` when `.admin-bar` is present
- Mobile (≤782px): `top: 46px`
- Mobile drawer padding adjusts accordingly

---

## Customization Tips

### Changing the Scroll Threshold
In `header.js`, modify the `50` in this line:
```js
if (window.scrollY > 50) {
```

### Changing the Mobile Breakpoint
Search for `1100` in both `header.css` and `header.js` and change to your desired breakpoint.

### Adding Active Page Highlighting
Add the class `active` to the current page's `<li>` element in `custom-nav.php` to show a diamond indicator under the active item. You can automate this with PHP:
```php
<li class="<?php echo is_page('about') ? 'active' : ''; ?> has-dropdown">
```

### Converting to WordPress Menus
If you prefer dynamic WordPress menus instead of hardcoded links, replace the `<ul class="nav-menu">` block in `custom-nav.php` with:
```php
<?php wp_nav_menu(array(
    'theme_location' => 'primary-menu',
    'container'      => false,
    'menu_class'     => 'nav-menu',
    'walker'         => new Custom_Nav_Walker(), // You'd need to create this
)); ?>
```
Note: You'll need a custom Walker class to output the correct dropdown markup and SVG arrows.
