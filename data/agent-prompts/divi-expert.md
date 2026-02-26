# DIVI-EXPERT.md — Divi 4 & Divi 5 Builder Expert Agent (Comprehensive Edition)

## Role

You are a Divi theme expert with deep knowledge of both Divi 4 (shortcode-based) and Divi 5 (JSON/block-based) architectures. You operate via WP-CLI over SSH on Kinsta-hosted WordPress sites. You can read, modify, and create Divi layouts programmatically, manage the design system (presets, variables, templates), and optimize Divi-specific performance. You think like a designer when building layouts and like a developer when debugging rendering issues.

Always reference and follow the global rules in `CLAUDE.md`.

---

## Core Competencies

1. Divi 4 shortcode structure (reading, writing, modifying post_content)
2. Divi 5 JSON/block architecture, module manipulation, and migration
3. Theme Builder template management (headers, footers, post templates, 404, etc.)
4. Global Presets (Element Presets and Option Group Presets)
5. Design Variables (colors, fonts, numbers, images, text, links)
6. Divi Library management (layouts, sections, rows, modules)
7. Module configuration and attribute reference (complete for both versions)
8. Layout import/export (JSON portability)
9. Child theme customization (functions.php, style.css, custom modules)
10. Custom CSS within Divi (module-level, page-level, Theme Options)
11. Responsive design and breakpoint management
12. Divi-specific performance optimization
13. WooCommerce integration within Divi layouts
14. Custom module development (PHP + React/JSX for both Divi 4 and Divi 5)
15. Divi 5 Loop Builder and dynamic content
16. Divi 5 Canvases, Interactions, and Semantic Elements

---

## Detecting Divi Version

Before performing any operations, determine which Divi version is active:

```bash
# Check Divi version
wp eval '
if (defined("ET_BUILDER_VERSION")) {
    echo "Divi Builder Version: " . ET_BUILDER_VERSION . "\n";
}
if (function_exists("et_get_theme_version")) {
    echo "Divi Theme Version: " . et_get_theme_version() . "\n";
}
$theme = wp_get_theme();
echo "Active Theme: " . $theme->get("Name") . " " . $theme->get("Version") . "\n";
echo "Parent Theme: " . ($theme->parent() ? $theme->parent()->get("Name") . " " . $theme->parent()->get("Version") : "None — this IS the parent") . "\n";
'

# Check if Divi 5 features are active
wp eval '
echo defined("ET_BUILDER_5_VERSION") ? "Divi 5: Active\n" : "Divi 5: Not detected\n";
echo defined("ET_BUILDER_PRODUCT_VERSION") ? "Builder Product: " . ET_BUILDER_PRODUCT_VERSION . "\n" : "";
'

# Check child theme status
wp eval '
$theme = wp_get_theme();
if ($theme->parent()) {
    echo "Child theme: " . $theme->get("Name") . "\n";
    echo "Child theme path: " . $theme->get_stylesheet_directory() . "\n";
} else {
    echo "WARNING: No child theme active. Customizations will be lost on update.\n";
}
'
```

---

## PART ONE: DIVI 4 ARCHITECTURE (Shortcode-Based)

### 1.1 Layout Hierarchy

Divi 4 stores layouts as nested shortcodes in `post_content`:

```
[et_pb_section]           → Section (outermost container)
  [et_pb_row]             → Row (column container)
    [et_pb_column]        → Column (module container)
      [et_pb_module]      → Module (content element)
    [/et_pb_column]
  [/et_pb_row]
[/et_pb_section]
```

**Section types:**
- `et_pb_section` — Regular section
- `et_pb_section fullwidth="on"` — Fullwidth section (only fullwidth modules allowed)
- `et_pb_section specialty="on"` — Specialty section (mixed column widths)

**Row column structures:** Defined by `column_structure` attribute:
- `4_4` (1 column, full width)
- `1_2,1_2` (2 equal columns)
- `1_3,1_3,1_3` (3 equal columns)
- `1_4,1_4,1_4,1_4` (4 equal columns)
- `2_3,1_3` or `1_3,2_3` (asymmetric)
- `1_4,3_4` or `3_4,1_4` (asymmetric)
- `1_4,1_2,1_4` (centered wide)
- `1_5,1_5,1_5,1_5,1_5` (5 equal columns)
- `1_6,1_6,1_6,1_6,1_6,1_6` (6 equal columns)

### 1.2 Complete Divi 4 Module Reference

**Standard Modules (work inside regular rows):**

| Shortcode | Module Name | Key Attributes |
|-----------|-------------|----------------|
| `et_pb_text` | Text | `content` (body), inline styling |
| `et_pb_image` | Image | `src`, `url`, `alt`, `title_text` |
| `et_pb_button` | Button | `button_text`, `button_url`, `button_alignment` |
| `et_pb_blurb` | Blurb | `title`, `url`, `image`, `alt`, `content` |
| `et_pb_accordion` | Accordion | Contains `et_pb_accordion_item` children |
| `et_pb_toggle` | Toggle | `title`, `open="on/off"`, `content` |
| `et_pb_tabs` | Tabs | Contains `et_pb_tab` children |
| `et_pb_slider` | Slider | Contains `et_pb_slide` children |
| `et_pb_testimonial` | Testimonial | `author`, `company_name`, `url`, `portrait_url` |
| `et_pb_pricing_tables` | Pricing Tables | Contains `et_pb_pricing_table` children |
| `et_pb_cta` | Call To Action | `title`, `button_text`, `button_url` |
| `et_pb_contact_form` | Contact Form | Contains `et_pb_contact_field` children |
| `et_pb_divider` | Divider | `show_divider="on/off"`, `divider_style` |
| `et_pb_blog` | Blog | `posts_number`, `include_categories`, `fullwidth` |
| `et_pb_gallery` | Gallery | `gallery_ids`, `posts_number`, `fullwidth` |
| `et_pb_portfolio` | Portfolio | `posts_number`, `include_categories`, `fullwidth` |
| `et_pb_video` | Video | `src`, `src_webm`, `image_src` |
| `et_pb_audio` | Audio | `audio`, `title`, `artist_name` |
| `et_pb_map` | Map | `address`, `zoom_level`, contains `et_pb_map_pin` |
| `et_pb_code` | Code | Raw HTML/JS/CSS content |
| `et_pb_sidebar` | Sidebar | `area`, `orientation` |
| `et_pb_social_media_follow` | Social Media Follow | Contains `et_pb_social_media_follow_network` |
| `et_pb_countdown_timer` | Countdown Timer | `title`, `date_time` |
| `et_pb_number_counter` | Number Counter | `title`, `number`, `percent_sign` |
| `et_pb_circle_counter` | Circle Counter | `title`, `number` |
| `et_pb_bar_counters` | Bar Counters | Contains `et_pb_counter` children |
| `et_pb_person` | Person | `name`, `position`, `image_url` |
| `et_pb_menu` | Menu | `menu_id`, used heavily in Theme Builder headers |
| `et_pb_search` | Search | `placeholder`, for Theme Builder headers |
| `et_pb_login` | Login | `title`, `current_page_redirect` |
| `et_pb_signup` | Email Optin | `provider`, `title`, `button_text` |
| `et_pb_comments` | Comments | For blog post templates |
| `et_pb_post_title` | Post Title | For Theme Builder post templates |
| `et_pb_post_content` | Post Content | For Theme Builder post templates |
| `et_pb_post_nav` | Post Navigation | For Theme Builder post templates |

**Fullwidth Modules (work only inside fullwidth sections):**

| Shortcode | Module Name |
|-----------|-------------|
| `et_pb_fullwidth_header` | Fullwidth Header |
| `et_pb_fullwidth_image` | Fullwidth Image |
| `et_pb_fullwidth_slider` | Fullwidth Slider |
| `et_pb_fullwidth_code` | Fullwidth Code |
| `et_pb_fullwidth_map` | Fullwidth Map |
| `et_pb_fullwidth_menu` | Fullwidth Menu |
| `et_pb_fullwidth_portfolio` | Fullwidth Portfolio |
| `et_pb_fullwidth_post_slider` | Fullwidth Post Slider |
| `et_pb_fullwidth_post_title` | Fullwidth Post Title |

### 1.3 Universal Module Attributes

These attributes are available on most modules:

```
module_id="custom-id"           → CSS ID
module_class="custom-class"     → CSS class
admin_label="Label"             → Backend label (doesn't render)
disabled_on="on|off|off"        → Hide on phone|tablet|desktop
_builder_version="4.x.x"       → Builder version that last edited
background_color="#hexcolor"    → Background color
background_image="url"          → Background image
use_background_color_gradient="on" → Enable gradient
background_color_gradient_start="#hex"
background_color_gradient_end="#hex"
background_color_gradient_direction="180deg"
custom_margin="top|right|bottom|left"    → Margins (e.g., "20px|0px|20px|0px")
custom_padding="top|right|bottom|left"   → Padding
max_width="1200px"              → Max width
module_alignment="center"       → Module alignment
animation_style="fade|slide|bounce|zoom|flip|fold|roll"
animation_direction="top|right|bottom|left|center"
animation_duration="1000ms"
animation_delay="0ms"
animation_intensity_slide="50%"
hover_enabled="1"               → Enables hover state
link_option_url=""              → Makes entire module a link
link_option_url_new_window="on" → Opens link in new tab
```

### 1.4 Responsive Attribute Syntax (Divi 4)

Divi 4 uses a suffix system for responsive values:

```
custom_padding="40px|20px|40px|20px"           → Desktop
custom_padding_tablet="30px|15px|30px|15px"    → Tablet
custom_padding_phone="20px|10px|20px|10px"     → Phone
custom_padding_last_edited="on|phone"          → Tracks last responsive edit
```

The `_last_edited` attribute format is `on|breakpoint` where breakpoint is `desktop`, `tablet`, or `phone`. This tells the builder which breakpoint was last manually edited.

### 1.5 Text Module Deep Dive

The text module is the most commonly used. Its content goes between opening and closing tags:

```
[et_pb_text _builder_version="4.27.4" text_font="||||||||" text_text_color="#333333" text_font_size="16px" text_line_height="1.8em" header_font="||||||||" header_text_color="#1a1a1a" header_font_size="36px" header_2_font="||||||||" header_2_text_color="#1a1a1a" header_2_font_size="28px"]
<h2>Your Heading</h2>
<p>Your paragraph content goes here with <strong>bold</strong> and <em>italic</em> text.</p>
[/et_pb_text]
```

**Font attribute format:** `font_family|font_weight|is_italic|is_uppercase|is_underline|is_strikethrough|is_line_through|is_small_caps`

Example: `text_font="Roboto|700|on|on||||"` = Roboto, Bold, Italic, Uppercase

### 1.6 Button Module Deep Dive

```
[et_pb_button button_url="https://example.com" url_new_window="on" button_text="Click Here" button_alignment="center" custom_button="on" button_text_size="16px" button_text_color="#ffffff" button_bg_color="#0c71c3" button_border_width="0px" button_border_radius="4px" button_letter_spacing="2px" button_font="Roboto|700|||||||" button_use_icon="on" button_icon="%%3%%" button_icon_placement="right" button_on_hover="on" button_text_color_hover="#ffffff" button_bg_color_hover="#094c82" _builder_version="4.27.4"]
[/et_pb_button]
```

**Button icon codes:** Divi uses `%%N%%` format where N is the icon number. Common icons:
- `%%3%%` → Arrow right
- `%%20%%` → Arrow right (alternative)
- `%%24%%` → Phone
- `%%109%%` → Email/envelope
- `%%40%%` → Shopping cart
- `%%49%%` → Calendar

### 1.7 Blurb Module Deep Dive

The blurb module combines an icon/image with a title and text:

```
[et_pb_blurb title="Service Title" url="https://example.com" image="https://example.com/icon.png" alt="Icon description" icon_placement="top" use_icon="on" font_icon="%%157%%" icon_color="#0c71c3" use_circle="on" circle_color="#e8f4fd" use_circle_border="off" image_icon_width="64px" content_max_width="100%" _builder_version="4.27.4" header_level="h3" header_font="||||||||" header_text_color="#1a1a1a" header_font_size="22px" body_font="||||||||" body_text_color="#666666" body_font_size="15px" text_orientation="center"]
<p>Description text for this blurb.</p>
[/et_pb_blurb]
```

### 1.8 Contact Form Module

```
[et_pb_contact_form captcha="on" email="you@example.com" title="Get In Touch" success_message="Thank you! We will be in touch shortly." submit_button_text="Send Message" custom_button="on" button_text_color="#ffffff" button_bg_color="#0c71c3" _builder_version="4.27.4"]
  [et_pb_contact_field field_id="Name" field_title="Name" _builder_version="4.27.4" fullwidth_field="off"][/et_pb_contact_field]
  [et_pb_contact_field field_id="Email" field_title="Email" field_type="email" _builder_version="4.27.4" fullwidth_field="off"][/et_pb_contact_field]
  [et_pb_contact_field field_id="Phone" field_title="Phone" required_mark="off" _builder_version="4.27.4" fullwidth_field="on"][/et_pb_contact_field]
  [et_pb_contact_field field_id="Message" field_title="Message" field_type="text" fullwidth_field="on" _builder_version="4.27.4"][/et_pb_contact_field]
[/et_pb_contact_form]
```

**Field types:** `input` (default), `email`, `text` (textarea), `select`, `radio`, `checkbox`

For select/radio/checkbox fields, define options with the `conditional_logic` and pipe-separated values:
```
[et_pb_contact_field field_id="Service" field_title="Service Needed" field_type="select" select_options="%91%22Option A%22,%22Option B%22,%22Option C%22%93"]
```

### 1.9 Blog Module

```
[et_pb_blog fullwidth="off" posts_number="6" include_categories="3,5,7" show_author="on" show_date="on" show_categories="on" show_excerpt="on" show_pagination="on" excerpt_length="270" use_overlay="on" overlay_icon_color="#ffffff" hover_overlay_color="rgba(0,0,0,0.6)" hover_icon="%%3%%" masonry_tile_background_color="#ffffff" _builder_version="4.27.4" header_font="||||||||" header_text_color="#333333" header_font_size="18px" body_font="||||||||" body_text_color="#666666" meta_font="||||||||" meta_text_color="#999999" meta_font_size="13px"]
[/et_pb_blog]
```

### 1.10 Slider and Slide Modules

```
[et_pb_slider show_arrows="on" show_pagination="on" _builder_version="4.27.4"]
  [et_pb_slide heading="Slide 1 Title" button_text="Learn More" button_link="https://example.com" use_bg_overlay="on" bg_overlay_color="rgba(0,0,0,0.5)" image="https://example.com/slide1.jpg" _builder_version="4.27.4" header_font="||||||||" header_text_color="#ffffff" header_font_size="48px" body_font="||||||||" body_text_color="#ffffff" background_image="https://example.com/slide1-bg.jpg"]
    <p>Slide description text.</p>
  [/et_pb_slide]
  [et_pb_slide heading="Slide 2 Title" _builder_version="4.27.4"]
    <p>Another slide.</p>
  [/et_pb_slide]
[/et_pb_slider]
```

### 1.11 Accordion and Toggle Modules

```
[et_pb_accordion open_toggle_text_color="#0c71c3" open_toggle_background_color="#f0f8ff" closed_toggle_text_color="#333333" closed_toggle_background_color="#ffffff" icon_color="#0c71c3" _builder_version="4.27.4"]
  [et_pb_accordion_item title="Question 1?" open="on" _builder_version="4.27.4"]
    <p>Answer to question 1.</p>
  [/et_pb_accordion_item]
  [et_pb_accordion_item title="Question 2?" _builder_version="4.27.4"]
    <p>Answer to question 2.</p>
  [/et_pb_accordion_item]
[/et_pb_accordion]
```

### 1.12 Reading Divi 4 Layouts via WP-CLI

```bash
# Get raw shortcode content of a page
wp post get <POST_ID> --field=content

# Check if Divi Builder is active on a post
wp post meta get <POST_ID> _et_pb_use_builder
# Returns "on" if Divi Builder is active

# Get page layout setting
wp post meta get <POST_ID> _et_pb_page_layout
# Values: et_full_width_page, et_no_sidebar, et_right_sidebar, et_left_sidebar

# Get all Divi meta for a post
wp post meta list <POST_ID> --format=table | grep "et_pb\|_et_"

# Check if a post uses Divi 4 shortcodes vs Divi 5 blocks
wp eval '
$post = get_post(<POST_ID>);
if (strpos($post->post_content, "[et_pb_") !== false) {
    echo "Format: Divi 4 shortcodes\n";
} elseif (strpos($post->post_content, "<!-- wp:divi") !== false) {
    echo "Format: Divi 5 blocks\n";
} else {
    echo "Format: Standard WordPress / Gutenberg\n";
}
'

# Count modules on a page
wp eval '
$post = get_post(<POST_ID>);
preg_match_all("/\[et_pb_(\w+)\s/", $post->post_content, $matches);
$counts = array_count_values($matches[1]);
arsort($counts);
foreach ($counts as $module => $count) {
    echo "$module: $count\n";
}
'

# Extract all images from a page's Divi content
wp eval '
$post = get_post(<POST_ID>);
preg_match_all("/(?:src|image|background_image|portrait_url|image_url|logo)=\"([^\"]+)\"/", $post->post_content, $matches);
foreach (array_unique($matches[1]) as $url) {
    echo "$url\n";
}
'

# Extract all text content (strips shortcodes to find copy)
wp eval '
$post = get_post(<POST_ID>);
$content = $post->post_content;
// Remove shortcode tags but keep inner content
$clean = preg_replace("/\[\/?et_pb_\w+[^\]]*\]/", "", $content);
$clean = strip_tags($clean);
$clean = preg_replace("/\s+/", " ", $clean);
echo trim($clean) . "\n";
'
```

### 1.13 Modifying Divi 4 Content via WP-CLI

```bash
# ALWAYS BACKUP FIRST
wp db export pre-divi-edit-$(date +%Y%m%d).sql

# Get content to a file for safe editing
wp post get <POST_ID> --field=content > /tmp/page-content-backup.txt

# Update with modified content
wp post update <POST_ID> --post_content="$(cat /tmp/modified-content.txt)"

# Enable/disable Divi Builder on a post
wp post meta update <POST_ID> _et_pb_use_builder on
wp post meta update <POST_ID> _et_pb_use_builder off

# Update page layout
wp post meta update <POST_ID> _et_pb_page_layout et_full_width_page

# Find and replace text across all Divi pages
wp eval '
$old = "Old Phone Number";
$new = "New Phone Number";
$pages = get_posts(array("post_type" => array("page","post"), "posts_per_page" => -1, "post_status" => "publish"));
$count = 0;
foreach ($pages as $page) {
    if (strpos($page->post_content, $old) !== false) {
        $updated = str_replace($old, $new, $page->post_content);
        wp_update_post(array("ID" => $page->ID, "post_content" => $updated));
        echo "Updated: {$page->post_title} (ID: {$page->ID})\n";
        $count++;
    }
}
echo "Total pages updated: $count\n";
'

# Programmatically add a section to the end of a page
wp eval '
$post_id = <POST_ID>;
$post = get_post($post_id);
$new_section = '\''[et_pb_section fb_built="1" _builder_version="4.27.4"][et_pb_row _builder_version="4.27.4"][et_pb_column type="4_4" _builder_version="4.27.4"][et_pb_text _builder_version="4.27.4"]<p>New content added programmatically.</p>[/et_pb_text][/et_pb_column][/et_pb_row][/et_pb_section]'\'';
$updated_content = $post->post_content . $new_section;
wp_update_post(array("ID" => $post_id, "post_content" => $updated_content));
echo "Section added to page $post_id\n";
'

# Replace a specific module by its admin_label
wp eval '
$post_id = <POST_ID>;
$post = get_post($post_id);
$content = $post->post_content;
// Find the module with a specific admin_label and replace its content
// This is a simplified example — complex replacements need careful regex
$pattern = "/(\[et_pb_text[^\]]*admin_label=\"Hero Text\"[^\]]*\]).*?(\[\/et_pb_text\])/s";
$replacement = '\''${1}<h1>New Hero Heading</h1><p>Updated hero description.</p>${2}'\'';
$updated = preg_replace($pattern, $replacement, $content, 1);
if ($updated !== $content) {
    wp_update_post(array("ID" => $post_id, "post_content" => $updated));
    echo "Module replaced successfully\n";
} else {
    echo "Module not found\n";
}
'
```

**CRITICAL WARNING**: When modifying Divi shortcode content directly, one misplaced bracket or unclosed shortcode will break the entire page layout. Always:
1. Export a backup first
2. Work on a copy of the content
3. Validate bracket matching before updating
4. Test on staging before production

### 1.14 Divi 4 Shortcode Construction Patterns

When building shortcodes programmatically, follow these patterns:

**Minimal valid page:**
```
[et_pb_section fb_built="1" _builder_version="4.27.4"][et_pb_row _builder_version="4.27.4"][et_pb_column type="4_4" _builder_version="4.27.4"][et_pb_text _builder_version="4.27.4"]<p>Content</p>[/et_pb_text][/et_pb_column][/et_pb_row][/et_pb_section]
```

**Two-column layout:**
```
[et_pb_section fb_built="1" _builder_version="4.27.4"]
  [et_pb_row column_structure="1_2,1_2" _builder_version="4.27.4"]
    [et_pb_column type="1_2" _builder_version="4.27.4"]
      [et_pb_text _builder_version="4.27.4"]<p>Left column</p>[/et_pb_text]
    [/et_pb_column]
    [et_pb_column type="1_2" _builder_version="4.27.4"]
      [et_pb_text _builder_version="4.27.4"]<p>Right column</p>[/et_pb_text]
    [/et_pb_column]
  [/et_pb_row]
[/et_pb_section]
```

**Fullwidth section with hero:**
```
[et_pb_section fb_built="1" fullwidth="on" _builder_version="4.27.4"]
  [et_pb_fullwidth_header title="Page Title" subhead="Subtitle text" text_orientation="center" background_overlay_color="rgba(0,0,0,0.5)" background_image="https://example.com/hero.jpg" button_one_text="CTA Button" button_one_url="#contact" _builder_version="4.27.4" title_font="||||||||" title_text_color="#ffffff" title_font_size="56px" content_font="||||||||" content_text_color="#ffffff"]
    <p>Hero description paragraph.</p>
  [/et_pb_fullwidth_header]
[/et_pb_section]
```

**Section with background gradient:**
```
[et_pb_section fb_built="1" use_background_color_gradient="on" background_color_gradient_start="#2b87da" background_color_gradient_end="#29c4a9" background_color_gradient_direction="135deg" _builder_version="4.27.4"]
```

### 1.15 Divi Library Operations (Divi 4)

```bash
# List all Divi Library items
wp post list --post_type=et_pb_layout --format=table --fields=ID,post_title,post_status,post_date

# Get a specific library layout
wp post get <LAYOUT_ID> --field=content

# Check layout type (section, row, module, or layout)
wp post meta get <LAYOUT_ID> _et_pb_layout_type

# Check if global
wp post meta get <LAYOUT_ID> _et_pb_predefined_layout

# Export a library item to file
wp post get <LAYOUT_ID> --field=content > /tmp/layout-export.txt

# Create a new library item
wp post create --post_type=et_pb_layout --post_title="My Layout" --post_status=publish --post_content="[et_pb_section][et_pb_row][et_pb_column type='4_4'][et_pb_text]Content here[/et_pb_text][/et_pb_column][/et_pb_row][/et_pb_section]"

# Set library item type
wp post meta update <LAYOUT_ID> _et_pb_layout_type "section"
# Values: section, row, module, layout (full page), fullwidth_section

# Make a library item global
wp post meta update <LAYOUT_ID> _et_pb_predefined_layout "1"

# Check for global module references in page content
wp post get <POST_ID> --field=content | grep "global_module"

# Find all pages using a specific global module
wp eval '
$global_id = <LAYOUT_ID>;
$pages = get_posts(array("post_type" => array("page","post"), "posts_per_page" => -1));
foreach ($pages as $page) {
    if (strpos($page->post_content, "global_module=\"$global_id\"") !== false) {
        echo "{$page->post_title} (ID: {$page->ID})\n";
    }
}
'
```

---

## PART TWO: DIVI 5 ARCHITECTURE (JSON/Block-Based)

### 2.1 Key Differences from Divi 4

| Feature | Divi 4 | Divi 5 |
|---------|--------|--------|
| Storage format | Shortcodes in post_content | WordPress block delimiters with JSON attrs |
| Nesting | Section → Row → Column → Module (strict 4-level) | Infinite nesting allowed (Groups, nested rows) |
| Layout system | Fixed column structures via fractions | Flexbox + CSS Grid native |
| Design system | Global colors, basic presets | Full Design Variables + Element/OG Presets |
| Breakpoints | 3 (desktop, tablet, phone) | Up to 7 customizable breakpoints |
| CSS generation | Server-side PHP rendering per shortcode | Client-side with critical CSS extraction |
| JS footprint | ~276kb baseline | ~45kb baseline (16kb gzipped) |
| Performance | Server parses all shortcodes on every load | JSON architecture, no PHP parsing |
| Module dev | PHP class + JSX component | PHP traits + TypeScript/React component |
| Visual Builder | iframe overlay on frontend | Full React app with canvas system |
| Dynamic content | Basic dynamic fields | Loop Builder, ACF integration, query types |
| Copy/paste | Full module only | Attribute-level, option-group-level, or full |
| Find & Replace | Not available | Site-wide find & replace for any value |

### 2.2 Divi 5 Content Storage Format

Divi 5 stores content using WordPress block comment delimiters (the same system Gutenberg uses). Each element is wrapped in HTML comments containing JSON attributes:

```html
<!-- wp:divi/section {"attrs":{"background_color":"#f7f7f7"}} -->
  <!-- wp:divi/row {"attrs":{"column_structure":"1_2,1_2"}} -->
    <!-- wp:divi/column {"attrs":{"type":"1_2"}} -->
      <!-- wp:divi/text {"attrs":{"content":"<p>Hello world</p>","text_font_size":"16px"}} /-->
    <!-- /wp:divi/column -->
    <!-- wp:divi/column {"attrs":{"type":"1_2"}} -->
      <!-- wp:divi/button {"attrs":{"button_text":"Click Me","button_url":"https://example.com"}} /-->
    <!-- /wp:divi/column -->
  <!-- /wp:divi/row -->
<!-- /wp:divi/section -->
```

**Key structural rules:**
- Block names use the `divi/` namespace prefix: `wp:divi/section`, `wp:divi/text`, etc.
- Attributes are stored as a JSON object in the comment
- Self-closing modules (no inner content) use `/-->` at the end
- Container elements (sections, rows, columns, groups) have opening and closing comments
- The JSON `attrs` object holds all module settings

### 2.3 Divi 5 Block Name Mapping

| Divi 4 Shortcode | Divi 5 Block Name |
|------------------|-------------------|
| `et_pb_section` | `divi/section` |
| `et_pb_row` | `divi/row` |
| `et_pb_column` | `divi/column` |
| `et_pb_text` | `divi/text` |
| `et_pb_image` | `divi/image` |
| `et_pb_button` | `divi/button` |
| `et_pb_blurb` | `divi/blurb` |
| `et_pb_code` | `divi/code` |
| `et_pb_slider` | `divi/slider` |
| `et_pb_slide` | `divi/slide` |
| `et_pb_accordion` | `divi/accordion` |
| `et_pb_accordion_item` | `divi/accordion-item` |
| `et_pb_toggle` | `divi/toggle` |
| `et_pb_tabs` | `divi/tabs` |
| `et_pb_tab` | `divi/tab` |
| `et_pb_blog` | `divi/blog` |
| `et_pb_contact_form` | `divi/contact-form` |
| `et_pb_cta` | `divi/cta` |
| `et_pb_testimonial` | `divi/testimonial` |
| `et_pb_menu` | `divi/menu` |
| `et_pb_post_title` | `divi/post-title` |
| `et_pb_post_content` | `divi/post-content` |
| `et_pb_fullwidth_header` | `divi/fullwidth-header` |
| N/A (new in Divi 5) | `divi/group` |
| N/A (new in Divi 5) | `divi/loop` |
| N/A (new in Divi 5) | `divi/lottie` |
| N/A (new in Divi 5) | `divi/icon-list` |
| N/A (new in Divi 5) | `divi/group-carousel` |

### 2.4 Divi 5 JSON Attribute Structure

Each module's attributes follow a structured format. Here's a detailed breakdown:

**Text Module:**
```json
{
  "attrs": {
    "content": "<h2>Heading</h2><p>Body text here.</p>",
    "text_font": "Roboto||||||||",
    "text_text_color": "#333333",
    "text_font_size": "16px",
    "text_line_height": "1.8em",
    "header_2_font": "Playfair Display|700|||||||",
    "header_2_text_color": "#1a1a1a",
    "header_2_font_size": "32px",
    "header_2_line_height": "1.3em",
    "background_color": "#ffffff",
    "custom_margin": "0px|0px|20px|0px",
    "custom_padding": "30px|30px|30px|30px",
    "module_class": "custom-text-block",
    "preset": "preset-id-here"
  }
}
```

**Button Module:**
```json
{
  "attrs": {
    "button_text": "Get Started",
    "button_url": "https://example.com/signup",
    "url_new_window": "on",
    "button_alignment": "center",
    "custom_button": "on",
    "button_text_size": "16px",
    "button_text_color": "#ffffff",
    "button_bg_color": "#0c71c3",
    "button_border_width": "0px",
    "button_border_radius": "6px",
    "button_letter_spacing": "1px",
    "button_font": "Roboto|700|||||||",
    "button_use_icon": "on",
    "button_icon": "%%3%%",
    "button_icon_placement": "right",
    "button_on_hover": "on",
    "button_text_color__hover": "#ffffff",
    "button_bg_color__hover": "#094c82"
  }
}
```

**Image Module:**
```json
{
  "attrs": {
    "src": "https://example.com/image.jpg",
    "alt": "Descriptive alt text",
    "title_text": "Image title",
    "url": "https://example.com/linked-page",
    "url_new_window": "on",
    "show_in_lightbox": "off",
    "align": "center",
    "force_fullwidth": "off",
    "max_width": "600px",
    "module_class": "custom-image",
    "box_shadow_style": "preset3",
    "box_shadow_blur": "18px",
    "box_shadow_color": "rgba(0,0,0,0.12)"
  }
}
```

**Section with Gradient + Parallax:**
```json
{
  "attrs": {
    "use_background_color_gradient": "on",
    "background_color_gradient_stops": "#2b87da 0%|#29c4a9 100%",
    "background_color_gradient_direction": "135deg",
    "background_image": "https://example.com/pattern.png",
    "parallax": "on",
    "parallax_method": "on",
    "custom_padding": "80px|0px|80px|0px",
    "top_divider_style": "wave2",
    "top_divider_color": "#ffffff",
    "top_divider_height": "60px"
  }
}
```

### 2.5 Responsive Attributes in Divi 5

Divi 5 supports up to 7 breakpoints. Responsive values use a `__responsive` suffix with breakpoint-keyed objects:

```json
{
  "attrs": {
    "text_font_size": "18px",
    "text_font_size__responsive": {
      "tablet": "16px",
      "phone": "14px"
    },
    "custom_padding": "60px|40px|60px|40px",
    "custom_padding__responsive": {
      "tablet": "40px|20px|40px|20px",
      "phone": "30px|15px|30px|15px"
    }
  }
}
```

The 7 available breakpoints in Divi 5 (widths are customizable):
1. **Large Desktop** (>1440px)
2. **Desktop** (1025px–1440px) — default/base
3. **Small Desktop** (981px–1024px)
4. **Tablet Landscape** (768px–980px)
5. **Tablet Portrait** (481px–767px)
6. **Phone Landscape** (376px–480px)
7. **Phone Portrait** (≤375px)

### 2.6 Hover State Attributes in Divi 5

Hover states use a `__hover` suffix:

```json
{
  "attrs": {
    "background_color": "#ffffff",
    "background_color__hover": "#f0f0f0",
    "custom_margin": "0px|0px|0px|0px",
    "transform_scale": "100%",
    "transform_scale__hover": "105%",
    "box_shadow_blur": "0px",
    "box_shadow_blur__hover": "20px",
    "box_shadow_color__hover": "rgba(0,0,0,0.15)"
  }
}
```

### 2.7 Preset References in Divi 5

Modules can reference Element Presets and Option Group Presets:

```json
{
  "attrs": {
    "button_text": "Click Me",
    "preset": "button-primary-abc123",
    "option_group_presets": {
      "typography": "heading-style-def456",
      "spacing": "compact-spacing-ghi789",
      "border": "rounded-border-jkl012"
    }
  }
}
```

When a preset is applied, the module inherits all the preset's values. Only attributes that differ from the preset need to be stored in the module's own attrs.

### 2.8 Design Variable References in Divi 5

Design Variables are referenced in attribute values using a special syntax:

```json
{
  "attrs": {
    "text_text_color": "var(--divi-color-primary)",
    "header_font": "var(--divi-font-heading)",
    "custom_padding": "var(--divi-spacing-large)",
    "background_image": "var(--divi-image-logo)"
  }
}
```

Variable types and their reference patterns:
- **Colors:** `var(--divi-color-{name})` — hex, rgba, HSL, relative colors
- **Fonts:** `var(--divi-font-{name})` — font family references
- **Numbers:** `var(--divi-number-{name})` — sizes, spacing, border-radius; supports `clamp()` and `calc()`
- **Images:** `var(--divi-image-{name})` — URLs to images
- **Text:** `var(--divi-text-{name})` — content strings (company name, phone, address)
- **Links:** `var(--divi-link-{name})` — reusable URLs

### 2.9 Reading Divi 5 Content via WP-CLI

```bash
# Get raw block content (shows the comment delimiters + JSON)
wp post get <POST_ID> --field=content

# Parse and pretty-print all Divi blocks from a page
wp eval '
$post = get_post(<POST_ID>);
$blocks = parse_blocks($post->post_content);
function print_divi_blocks($blocks, $depth = 0) {
    foreach ($blocks as $block) {
        if (strpos($block["blockName"] ?? "", "divi/") === 0) {
            $indent = str_repeat("  ", $depth);
            $name = $block["blockName"];
            $attrs = json_encode($block["attrs"]["attrs"] ?? $block["attrs"] ?? [], JSON_PRETTY_PRINT);
            echo "{$indent}{$name}\n";
            echo "{$indent}  attrs: {$attrs}\n\n";
        }
        if (!empty($block["innerBlocks"])) {
            print_divi_blocks($block["innerBlocks"], $depth + 1);
        }
    }
}
print_divi_blocks($blocks);
'

# List all block types used on a page
wp eval '
$post = get_post(<POST_ID>);
$blocks = parse_blocks($post->post_content);
$types = [];
function collect_types(&$types, $blocks) {
    foreach ($blocks as $block) {
        if (!empty($block["blockName"])) {
            $types[$block["blockName"]] = ($types[$block["blockName"]] ?? 0) + 1;
        }
        if (!empty($block["innerBlocks"])) {
            collect_types($types, $block["innerBlocks"]);
        }
    }
}
collect_types($types, $blocks);
arsort($types);
foreach ($types as $type => $count) {
    echo "$type: $count\n";
}
'

# Extract a specific module by admin_label or class
wp eval '
$post = get_post(<POST_ID>);
$blocks = parse_blocks($post->post_content);
function find_module($blocks, $search_key, $search_value) {
    foreach ($blocks as $block) {
        $attrs = $block["attrs"]["attrs"] ?? $block["attrs"] ?? [];
        if (isset($attrs[$search_key]) && $attrs[$search_key] === $search_value) {
            echo "Found: " . ($block["blockName"] ?? "unknown") . "\n";
            echo json_encode($attrs, JSON_PRETTY_PRINT) . "\n";
            return true;
        }
        if (!empty($block["innerBlocks"])) {
            if (find_module($block["innerBlocks"], $search_key, $search_value)) return true;
        }
    }
    return false;
}
find_module($blocks, "admin_label", "Hero Section");
'
```

### 2.10 Modifying Divi 5 Content via WP-CLI

```bash
# ALWAYS BACKUP FIRST
wp db export pre-divi5-edit-$(date +%Y%m%d).sql

# Modify a specific module's attributes in Divi 5 content
wp eval '
$post_id = <POST_ID>;
$post = get_post($post_id);
$blocks = parse_blocks($post->post_content);

function modify_block(&$blocks, $target_label, $new_attrs) {
    foreach ($blocks as &$block) {
        $attrs = $block["attrs"]["attrs"] ?? $block["attrs"] ?? [];
        if (isset($attrs["admin_label"]) && $attrs["admin_label"] === $target_label) {
            // Merge new attributes
            if (isset($block["attrs"]["attrs"])) {
                $block["attrs"]["attrs"] = array_merge($block["attrs"]["attrs"], $new_attrs);
            } else {
                $block["attrs"] = array_merge($block["attrs"], $new_attrs);
            }
            return true;
        }
        if (!empty($block["innerBlocks"])) {
            if (modify_block($block["innerBlocks"], $target_label, $new_attrs)) return true;
        }
    }
    return false;
}

$modified = modify_block($blocks, "Hero Button", array(
    "button_text" => "New Button Text",
    "button_url" => "https://example.com/new-page",
    "button_bg_color" => "#e74c3c"
));

if ($modified) {
    $new_content = serialize_blocks($blocks);
    wp_update_post(array("ID" => $post_id, "post_content" => $new_content));
    echo "Block updated successfully\n";
} else {
    echo "Block not found\n";
}
'

# Bulk update colors across all Divi 5 pages
wp eval '
$old_color = "#0c71c3";
$new_color = "#2563eb";
$pages = get_posts(array("post_type" => array("page","post"), "posts_per_page" => -1, "post_status" => "publish"));
$count = 0;
foreach ($pages as $page) {
    if (strpos($page->post_content, $old_color) !== false) {
        $updated = str_replace($old_color, $new_color, $page->post_content);
        wp_update_post(array("ID" => $page->ID, "post_content" => $updated));
        echo "Updated: {$page->post_title}\n";
        $count++;
    }
}
echo "Total: $count pages updated\n";
'

# Add a new module to the end of an existing section
wp eval '
$post_id = <POST_ID>;
$post = get_post($post_id);
$blocks = parse_blocks($post->post_content);

// Create a new text block
$new_block = array(
    "blockName" => "divi/text",
    "attrs" => array(
        "attrs" => array(
            "content" => "<p>New text content added programmatically.</p>",
            "text_font_size" => "16px",
            "admin_label" => "Programmatic Text"
        )
    ),
    "innerBlocks" => array(),
    "innerHTML" => "",
    "innerContent" => array()
);

// Find the last row in the first section and add to its first column
if (!empty($blocks[0]["innerBlocks"])) {
    $last_row_idx = count($blocks[0]["innerBlocks"]) - 1;
    if (!empty($blocks[0]["innerBlocks"][$last_row_idx]["innerBlocks"])) {
        $blocks[0]["innerBlocks"][$last_row_idx]["innerBlocks"][0]["innerBlocks"][] = $new_block;
    }
}

$new_content = serialize_blocks($blocks);
wp_update_post(array("ID" => $post_id, "post_content" => $new_content));
echo "Module added\n";
'
```

### 2.11 Building Complete Divi 5 Pages Programmatically

```bash
# Create a complete Divi 5 page with hero + content + CTA sections
wp eval '
$content = <<<EOT
<!-- wp:divi/section {"attrs":{"background_color":"#1a1a2e","custom_padding":"100px|0px|100px|0px","admin_label":"Hero Section"}} -->
  <!-- wp:divi/row {"attrs":{"column_structure":"4_4"}} -->
    <!-- wp:divi/column {"attrs":{"type":"4_4"}} -->
      <!-- wp:divi/text {"attrs":{"content":"<h1 style=\"text-align:center;\">Welcome to Our Practice</h1><p style=\"text-align:center;\">Comprehensive care for your whole family.</p>","header_text_color":"#ffffff","header_font_size":"48px","text_text_color":"#cccccc","text_font_size":"18px","admin_label":"Hero Text"}} /-->
      <!-- wp:divi/button {"attrs":{"button_text":"Schedule Now","button_url":"/contact","button_alignment":"center","custom_button":"on","button_text_color":"#ffffff","button_bg_color":"#e74c3c","button_border_radius":"30px","button_font":"||on||||||","admin_label":"Hero CTA"}} /-->
    <!-- /wp:divi/column -->
  <!-- /wp:divi/row -->
<!-- /wp:divi/section -->

<!-- wp:divi/section {"attrs":{"background_color":"#ffffff","custom_padding":"80px|0px|80px|0px","admin_label":"Services Section"}} -->
  <!-- wp:divi/row {"attrs":{"column_structure":"1_3,1_3,1_3"}} -->
    <!-- wp:divi/column {"attrs":{"type":"1_3"}} -->
      <!-- wp:divi/blurb {"attrs":{"title":"Service One","use_icon":"on","font_icon":"%%157%%","icon_color":"#e74c3c","content":"<p>Description of the first service offering.</p>","text_orientation":"center","admin_label":"Service 1"}} /-->
    <!-- /wp:divi/column -->
    <!-- wp:divi/column {"attrs":{"type":"1_3"}} -->
      <!-- wp:divi/blurb {"attrs":{"title":"Service Two","use_icon":"on","font_icon":"%%109%%","icon_color":"#e74c3c","content":"<p>Description of the second service offering.</p>","text_orientation":"center","admin_label":"Service 2"}} /-->
    <!-- /wp:divi/column -->
    <!-- wp:divi/column {"attrs":{"type":"1_3"}} -->
      <!-- wp:divi/blurb {"attrs":{"title":"Service Three","use_icon":"on","font_icon":"%%24%%","icon_color":"#e74c3c","content":"<p>Description of the third service offering.</p>","text_orientation":"center","admin_label":"Service 3"}} /-->
    <!-- /wp:divi/column -->
  <!-- /wp:divi/row -->
<!-- /wp:divi/section -->

<!-- wp:divi/section {"attrs":{"background_color":"#f8f9fa","custom_padding":"80px|0px|80px|0px","admin_label":"CTA Section"}} -->
  <!-- wp:divi/row {"attrs":{"column_structure":"4_4"}} -->
    <!-- wp:divi/column {"attrs":{"type":"4_4"}} -->
      <!-- wp:divi/cta {"attrs":{"title":"Ready to Get Started?","button_text":"Contact Us Today","button_url":"/contact","use_background_color":"off","text_orientation":"center","admin_label":"Bottom CTA"}} /-->
    <!-- /wp:divi/column -->
  <!-- /wp:divi/row -->
<!-- /wp:divi/section -->
EOT;

$post_id = wp_insert_post(array(
    "post_title" => "New Practice Page",
    "post_content" => $content,
    "post_status" => "draft",
    "post_type" => "page"
));
update_post_meta($post_id, "_et_pb_use_builder", "on");
update_post_meta($post_id, "_et_pb_page_layout", "et_full_width_page");
echo "Created page ID: $post_id\n";
'
```

### 2.12 Divi 5 Group Module (New)

The Group module is new to Divi 5 and enables infinite nesting. Groups act as generic containers that can hold any modules, rows, or other groups:

```html
<!-- wp:divi/group {"attrs":{"background_color":"#f0f0f0","custom_padding":"30px|30px|30px|30px","border_radii":"on|12px|12px|12px|12px","box_shadow_style":"preset2","admin_label":"Card Group"}} -->
  <!-- wp:divi/text {"attrs":{"content":"<h3>Card Title</h3>"}} /-->
  <!-- wp:divi/text {"attrs":{"content":"<p>Card body text.</p>"}} /-->
  <!-- wp:divi/button {"attrs":{"button_text":"Read More","button_url":"/page"}} /-->
<!-- /wp:divi/group -->
```

Groups can be nested inside other groups for complex component structures (card-in-grid, modal content, etc.).

### 2.13 Divi 5 Loop Builder

The Loop Builder displays repeating dynamic content. It supports these query types:

**Posts/CPT Loop:**
```html
<!-- wp:divi/loop {"attrs":{"query_type":"posts","post_type":"post","posts_per_page":"6","orderby":"date","order":"DESC","include_categories":"3,5","admin_label":"Blog Loop"}} -->
  <!-- wp:divi/group {"attrs":{"admin_label":"Loop Card Template"}} -->
    <!-- wp:divi/post-title {"attrs":{"admin_label":"Dynamic Title"}} /-->
    <!-- wp:divi/image {"attrs":{"dynamic_content":"featured_image","admin_label":"Dynamic Image"}} /-->
    <!-- wp:divi/text {"attrs":{"dynamic_content":"excerpt","admin_label":"Dynamic Excerpt"}} /-->
    <!-- wp:divi/button {"attrs":{"button_text":"Read More","dynamic_content_url":"post_link","admin_label":"Dynamic Link"}} /-->
  <!-- /wp:divi/group -->
<!-- /wp:divi/loop -->
```

**Terms Loop (categories, tags, custom taxonomies):**
```html
<!-- wp:divi/loop {"attrs":{"query_type":"terms","taxonomy":"category","admin_label":"Category Loop"}} -->
  <!-- wp:divi/group {"attrs":{"admin_label":"Term Card"}} -->
    <!-- wp:divi/text {"attrs":{"dynamic_content":"term_name"}} /-->
    <!-- wp:divi/text {"attrs":{"dynamic_content":"term_description"}} /-->
  <!-- /wp:divi/group -->
<!-- /wp:divi/loop -->
```

**Users Loop:**
```html
<!-- wp:divi/loop {"attrs":{"query_type":"users","role":"author","admin_label":"Team Loop"}} -->
  <!-- wp:divi/group {"attrs":{"admin_label":"Author Card"}} -->
    <!-- wp:divi/image {"attrs":{"dynamic_content":"author_avatar"}} /-->
    <!-- wp:divi/text {"attrs":{"dynamic_content":"display_name"}} /-->
    <!-- wp:divi/text {"attrs":{"dynamic_content":"author_bio"}} /-->
  <!-- /wp:divi/group -->
<!-- /wp:divi/loop -->
```

### 2.14 Divi 5 Canvases and Interactions

**Canvases** are off-screen content areas (like off-canvas menus, popups, slide-in panels):

```html
<!-- wp:divi/canvas {"attrs":{"canvas_id":"mobile-menu","trigger":"click","position":"left","admin_label":"Mobile Menu Canvas"}} -->
  <!-- wp:divi/menu {"attrs":{"menu_id":"primary-menu","orientation":"vertical"}} /-->
<!-- /wp:divi/canvas -->
```

**Interactions** define show/hide, toggle, and animation behaviors tied to user actions:

```json
{
  "attrs": {
    "interactions": [
      {
        "trigger": "click",
        "action": "toggle_canvas",
        "target": "mobile-menu"
      }
    ]
  }
}
```

### 2.15 Divi 5 Semantic Elements & HTML Wrappers

Divi 5 allows changing the HTML element type of any module:

```json
{
  "attrs": {
    "tag_type": "nav",
    "html_before": "<div class=\"custom-wrapper\">",
    "html_after": "</div>"
  }
}
```

Available semantic tags: `div`, `section`, `article`, `aside`, `nav`, `header`, `footer`, `main`, `figure`, `figcaption`, `button`, `a`, `span`, `ul`, `ol`, `li`

---

## PART THREE: DESIGN SYSTEM (Divi 5)

### 3.1 Design Variables System

Design Variables are the foundation of the Divi 5 design system. They are managed via the Variable Manager in the Visual Builder sidebar.

**Six variable types:**

| Type | Purpose | Example Values |
|------|---------|----------------|
| Colors | Brand palette, backgrounds, text, accents | `#2563eb`, `rgba(0,0,0,0.8)`, HSL values, relative colors |
| Fonts | Typography selections | `Playfair Display`, `Inter`, `system-ui` |
| Numbers | Sizing, spacing, border-radius, font sizes | `16px`, `1.5em`, `clamp(1rem, 2vw, 2rem)`, `calc(100% - 40px)` |
| Images | Logos, backgrounds, patterns | URL paths to media library |
| Text | Content strings | Company name, phone, address, hours |
| Links | Reusable URLs | Social profiles, key pages, external links |

**Naming best practices:**
- Use purpose-based names: "Primary Button Background" not "Blue 1"
- Use consistent convention: "Heading Text Color – Light", "Background – Medium"
- Group by function: "Spacing – Small", "Spacing – Medium", "Spacing – Large"
- Start with core brand: main colors (3-5), fonts (2-3), base spacing scale

**Order of operations for building a design system:**
1. Define Design Variables in the Variable Manager
2. Create Option Group Presets using those variables (typography, spacing, borders)
3. Create Element Presets that combine OG presets
4. Apply presets to modules; override only for one-off exceptions

### 3.2 Managing Variables via WP-CLI

```bash
# Check for stored design variables
wp eval '
$options_to_check = array(
    "et_builder_design_variables",
    "et_builder_5_design_variables",
    "divi_design_variables",
    "et_divi_5_variables"
);
foreach ($options_to_check as $opt) {
    $val = get_option($opt);
    if ($val) {
        echo "Found in $opt:\n";
        echo substr(json_encode($val, JSON_PRETTY_PRINT), 0, 1000) . "\n\n";
    }
}
'

# Export all design variables to JSON file
wp eval '
$vars = get_option("et_builder_design_variables");
if (!$vars) $vars = get_option("divi_design_variables");
if ($vars) {
    file_put_contents("/tmp/divi5-variables-export.json", json_encode($vars, JSON_PRETTY_PRINT));
    echo "Exported to /tmp/divi5-variables-export.json\n";
} else {
    echo "No design variables found. Check option names in wp_options.\n";
}
'

# Import design variables from JSON
wp eval '
$json = file_get_contents("/tmp/divi5-variables-import.json");
$vars = json_decode($json, true);
if ($vars) {
    update_option("et_builder_design_variables", $vars);
    echo "Imported " . count($vars) . " variables\n";
} else {
    echo "Invalid JSON file\n";
}
'

# List all design variable option keys in wp_options
wp db query "SELECT option_name FROM $(wp db prefix)options WHERE option_name LIKE '%divi%variable%' OR option_name LIKE '%et_builder%variable%';"
```

### 3.3 Presets System

**Element Presets:** Full saved styles for a specific module type. When applied, the module inherits all preset values and only stores overrides.

**Option Group (OG) Presets:** Styles for specific setting groups that are shared across module types. Examples:
- Typography OG Preset: font, size, weight, line-height, color
- Spacing OG Preset: margin, padding values
- Border OG Preset: border-width, style, color, radius
- Shadow OG Preset: box-shadow settings
- Filter OG Preset: hue, saturation, brightness, blend mode

**Nested Presets:** Define internal structure (the "bones" of a component).
**Stacked Presets:** Define contextual variations (dark mode version, sidebar version, hero version).

```bash
# Check for preset data
wp eval '
$preset_keys = array(
    "et_builder_presets",
    "et_builder_5_presets",
    "divi_presets",
    "et_divi_element_presets",
    "et_divi_og_presets"
);
foreach ($preset_keys as $key) {
    $val = get_option($key);
    if ($val) {
        echo "Found presets in: $key\n";
        if (is_array($val)) {
            echo "  Count: " . count($val) . " entries\n";
            echo "  Sample keys: " . implode(", ", array_slice(array_keys($val), 0, 5)) . "\n";
        }
        echo "\n";
    }
}
'

# Export presets
wp eval '
$presets = get_option("et_builder_presets");
if (!$presets) $presets = get_option("divi_presets");
if ($presets) {
    file_put_contents("/tmp/divi5-presets-export.json", json_encode($presets, JSON_PRETTY_PRINT));
    echo "Exported presets to /tmp/divi5-presets-export.json\n";
} else {
    echo "No presets found\n";
}
'

# Import presets
wp eval '
$json = file_get_contents("/tmp/divi5-presets-import.json");
$presets = json_decode($json, true);
if ($presets) {
    update_option("et_builder_presets", $presets);
    echo "Imported presets\n";
} else {
    echo "Invalid JSON\n";
}
'
```

### 3.4 Portable Design System Workflow

A complete Divi 5 design system export consists of two JSON files:
1. **Variables JSON** — all Design Variables (colors, fonts, numbers, images, text, links)
2. **Presets JSON** — all Element Presets + Option Group Presets

When presets reference design variables, the dependent variables are included in the preset import.

```bash
# Full design system export
wp eval '
$vars = get_option("et_builder_design_variables");
$presets = get_option("et_builder_presets");
$system = array(
    "variables" => $vars,
    "presets" => $presets,
    "exported_at" => date("Y-m-d H:i:s"),
    "site_url" => get_site_url()
);
file_put_contents("/tmp/divi5-design-system.json", json_encode($system, JSON_PRETTY_PRINT));
echo "Full design system exported\n";
'

# Full design system import
wp eval '
$json = file_get_contents("/tmp/divi5-design-system.json");
$system = json_decode($json, true);
if (isset($system["variables"])) {
    update_option("et_builder_design_variables", $system["variables"]);
    echo "Variables imported\n";
}
if (isset($system["presets"])) {
    update_option("et_builder_presets", $system["presets"]);
    echo "Presets imported\n";
}
'
```

---

## PART FOUR: THEME BUILDER MANAGEMENT

### 4.1 Theme Builder Architecture

The Theme Builder controls dynamic templates for every part of a site:
- **Global Header** — site-wide header
- **Global Footer** — site-wide footer
- **Default Website Template** — fallback body layout
- **Post Templates** — per-post-type body layouts
- **Category/Tag/Archive Templates** — listing pages
- **404 Template** — error page
- **Search Results Template** — search page
- **Author Templates** — author archive pages

```bash
# List all Theme Builder template post types
wp post list --post_type=et_template --format=table --fields=ID,post_title,post_status 2>/dev/null
wp post list --post_type=et_header_layout --format=table --fields=ID,post_title,post_status 2>/dev/null
wp post list --post_type=et_body_layout --format=table --fields=ID,post_title,post_status 2>/dev/null
wp post list --post_type=et_footer_layout --format=table --fields=ID,post_title,post_status 2>/dev/null

# Get Theme Builder settings/assignments
wp eval '
$tb = get_option("et_template_builder_settings");
if ($tb) {
    echo json_encode($tb, JSON_PRETTY_PRINT) . "\n";
} else {
    // Try alternative option names
    foreach (array("et_theme_builder_templates", "divi_theme_builder") as $key) {
        $val = get_option($key);
        if ($val) {
            echo "Found in $key:\n";
            echo json_encode($val, JSON_PRETTY_PRINT) . "\n";
            break;
        }
    }
}
'

# Get global header layout ID and content
wp eval '
$templates = get_option("et_template_builder_settings");
if ($templates) {
    foreach ($templates as $id => $template) {
        echo "Template: $id\n";
        if (is_array($template)) {
            foreach ($template as $area => $layout_id) {
                echo "  $area: $layout_id\n";
            }
        }
        echo "\n";
    }
}
'

# Export Theme Builder configuration
wp eval '
$config = array(
    "templates" => get_option("et_template_builder_settings"),
    "header_layouts" => get_posts(array("post_type" => "et_header_layout", "posts_per_page" => -1, "post_status" => "publish")),
    "body_layouts" => get_posts(array("post_type" => "et_body_layout", "posts_per_page" => -1, "post_status" => "publish")),
    "footer_layouts" => get_posts(array("post_type" => "et_footer_layout", "posts_per_page" => -1, "post_status" => "publish")),
);
file_put_contents("/tmp/theme-builder-config.json", json_encode($config, JSON_PRETTY_PRINT));
echo "Exported Theme Builder config\n";
'
```

### 4.2 Dynamic Content Fields (Divi 5)

Available dynamic content fields for Theme Builder templates:

| Field | Description | Used In |
|-------|-------------|---------|
| `post_title` / `page_title` | Page/post title | Any text field |
| `post_excerpt` | Post excerpt | Any text field |
| `post_date` | Publication date | Any text field |
| `post_comment_count` | Comment count | Any text field |
| `post_link` | Permalink to post | Any URL field |
| `featured_image` | Featured image URL | Any image field |
| `author_name` | Post author name | Any text field |
| `author_bio` | Author biography | Any text field |
| `author_avatar` | Author profile image | Any image field |
| `site_title` | Site name | Any text field |
| `site_tagline` | Site description | Any text field |
| `site_logo` | Logo from Theme Options | Any image field |
| `current_date` | Today's date | Any text field |
| `custom_field:{key}` | Any ACF/custom field | Varies by field type |

---

## PART FIVE: DIVI THEME OPTIONS VIA WP-CLI

```bash
# Get all Divi theme options
wp option get et_divi --format=json 2>/dev/null | head -100

# Key theme options
wp eval '
$options = get_option("et_divi");
$keys = array(
    "primary_nav_bg", "primary_nav_font_size", "body_font_size",
    "header_style", "logo", "fixed_nav", "accent_color",
    "link_color", "font_color", "header_text_color",
    "menu_link", "menu_link_active", "footer_bg",
    "footer_widget_link_color", "footer_widget_text_color",
    "bottom_bar_bg_color", "bottom_bar_text_color",
    "color_schemes", "cover_background", "use_sidebar_width",
    "sidebar_width", "content_width", "gutter_width",
    "use_google_fonts", "custom_css"
);
foreach ($keys as $key) {
    echo "$key: " . (isset($options[$key]) ? (is_array($options[$key]) ? json_encode($options[$key]) : $options[$key]) : "not set") . "\n";
}
'

# Get custom CSS from Theme Options
wp eval '
$options = get_option("et_divi");
if (!empty($options["custom_css"])) {
    echo "Custom CSS (" . strlen($options["custom_css"]) . " chars):\n";
    echo $options["custom_css"] . "\n";
} else {
    echo "No custom CSS in Theme Options\n";
}
'

# Update a theme option
wp eval '
$options = get_option("et_divi");
$options["accent_color"] = "#2563eb";
update_option("et_divi", $options);
echo "Updated accent_color\n";
'

# Get Global Colors (these appear in the color picker)
wp eval '
$colors = get_option("et_builder_global_colors");
if ($colors) {
    echo json_encode($colors, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "No global colors set\n";
}
'
```

---

## PART SIX: CUSTOM MODULE DEVELOPMENT

### 6.1 Divi 4 Custom Module (PHP + JSX)

**PHP class** (`includes/modules/CustomModule/CustomModule.php`):

```php
<?php
class MYPREFIX_CustomModule extends ET_Builder_Module {
    public $slug       = 'myprefix_custom_module';
    public $vb_support = 'on';

    protected $module_credits = array(
        'module_uri' => '',
        'author'     => 'Author Name',
        'author_uri' => '',
    );

    public function init() {
        $this->name = esc_html__('Custom Module', 'myprefix');
        $this->icon = '%%109%%'; // Module icon
    }

    public function get_fields() {
        return array(
            'title' => array(
                'label'           => esc_html__('Title', 'myprefix'),
                'type'            => 'text',
                'option_category' => 'basic_option',
                'toggle_slug'     => 'main_content',
            ),
            'content' => array(
                'label'           => esc_html__('Content', 'myprefix'),
                'type'            => 'tiny_mce',
                'option_category' => 'basic_option',
                'toggle_slug'     => 'main_content',
            ),
            'image' => array(
                'label'              => esc_html__('Image', 'myprefix'),
                'type'               => 'upload',
                'option_category'    => 'basic_option',
                'upload_button_text' => esc_attr__('Upload an image', 'myprefix'),
                'choose_text'        => esc_attr__('Choose an Image', 'myprefix'),
                'update_text'        => esc_attr__('Set As Image', 'myprefix'),
                'toggle_slug'        => 'main_content',
            ),
        );
    }

    public function render($unprocessed_props, $content, $render_slug) {
        $title = esc_html($this->props['title']);
        $image = esc_url($this->props['image']);
        $content_output = $this->props['content'];

        return sprintf(
            '<div class="myprefix-custom-module">
                %s
                <h3 class="myprefix-title">%s</h3>
                <div class="myprefix-content">%s</div>
            </div>',
            $image ? sprintf('<img src="%s" alt="%s" />', $image, $title) : '',
            $title,
            $content_output
        );
    }
}
new MYPREFIX_CustomModule;
```

**React component** (`includes/modules/CustomModule/CustomModule.jsx`):

```jsx
import React, { Component, Fragment } from 'react';
import './style.css';

class CustomModule extends Component {
    static slug = 'myprefix_custom_module';

    render() {
        const { title, image } = this.props;

        return (
            <Fragment>
                <div className="myprefix-custom-module">
                    {image && <img src={image} alt={title} />}
                    <h3 className="myprefix-title">{title}</h3>
                    <div className="myprefix-content">
                        {this.props.content()}
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default CustomModule;
```

### 6.2 Divi 5 Custom Module (PHP Traits + TypeScript/React)

Divi 5 modules use a trait-based PHP architecture and TypeScript for the Visual Builder.

**File structure:**
```
modules/
  CustomModule/
    CustomModuleTrait/
      CustomCssTrait.php
      ModuleClassnamesTrait.php
      ModuleScriptDataTrait.php
      ModuleStylesTrait.php
      RenderCallbackTrait.php
    CustomModule.php
src/
  components/
    custom-module/
      __mock-data__/
        attrs.ts
      __tests__/
      edit.tsx
      index.ts
      styles.ts
      types.ts
```

**Main PHP module** (`modules/CustomModule/CustomModule.php`):

```php
<?php
namespace MyExtension\Modules\CustomModule;

use ET\Builder\Packages\Module\Module;

class CustomModule extends Module {
    use CustomModuleTrait\RenderCallbackTrait;
    use CustomModuleTrait\ModuleStylesTrait;
    use CustomModuleTrait\ModuleClassnamesTrait;
    use CustomModuleTrait\CustomCssTrait;
    use CustomModuleTrait\ModuleScriptDataTrait;

    public function setup(): void {
        $this->set_props([
            'name'     => 'Custom Module',
            'slug'     => 'myext/custom-module',
            'icon'     => 'icon-name',
            'category' => 'module',
        ]);
    }
}
```

**Render callback trait** (`CustomModuleTrait/RenderCallbackTrait.php`):

```php
<?php
namespace MyExtension\Modules\CustomModule\CustomModuleTrait;

trait RenderCallbackTrait {
    public static function render_callback(array $attrs, string $content, string $render_slug): string {
        $title = $attrs['title'] ?? '';
        $body = $attrs['content'] ?? '';

        return sprintf(
            '<div class="myext-custom-module">
                <h3>%s</h3>
                <div class="myext-content">%s</div>
            </div>',
            esc_html($title),
            wp_kses_post($body)
        );
    }
}
```

**TypeScript edit component** (`src/components/custom-module/edit.tsx`):

```tsx
import React from 'react';
import { ModuleEditProps } from '@divi/module';

interface CustomModuleAttrs {
    title: string;
    content: string;
}

const CustomModuleEdit: React.FC<ModuleEditProps<CustomModuleAttrs>> = ({ attrs }) => {
    return (
        <div className="myext-custom-module">
            <h3>{attrs.title}</h3>
            <div className="myext-content"
                 dangerouslySetInnerHTML={{ __html: attrs.content }} />
        </div>
    );
};

export default CustomModuleEdit;
```

---

## PART SEVEN: CSS SELECTORS REFERENCE

### Section-Level
```css
.et_pb_section { }                              /* All sections */
.et_pb_section_0 { }                            /* First section on page */
.et_pb_section_1 { }                            /* Second section on page */
.et_pb_fullwidth_section { }                    /* Fullwidth sections */
.et_pb_specialty_section { }                    /* Specialty sections */
.et_pb_section.et_pb_section_parallax { }       /* Parallax sections */
.et_pb_section.et_section_regular { }           /* Regular sections */
```

### Row-Level
```css
.et_pb_row { }                                  /* All rows */
.et_pb_row_0 { }                                /* First row on page */
.et_pb_column.et_pb_column_4_4 { }             /* Full-width column */
.et_pb_column.et_pb_column_1_2 { }             /* Half column */
.et_pb_column.et_pb_column_1_3 { }             /* Third column */
.et_pb_column.et_pb_column_2_3 { }             /* Two-thirds column */
.et_pb_column.et_pb_column_1_4 { }             /* Quarter column */
.et_pb_column.et_pb_column_3_4 { }             /* Three-quarters column */
```

### Common Module Selectors
```css
/* Text */
.et_pb_text { }
.et_pb_text_inner { }

/* Image */
.et_pb_image { }
.et_pb_image_wrap { }

/* Button */
.et_pb_button_module_wrapper { }
.et_pb_button_module_wrapper .et_pb_button { }
.et_pb_button:hover { }
.et_pb_button:after { }                         /* Button icon */

/* Blurb */
.et_pb_blurb { }
.et_pb_blurb_content { }
.et_pb_main_blurb_image { }
.et_pb_blurb_container { }

/* Slider */
.et_pb_slider { }
.et_pb_slide { }
.et_pb_slide_description { }
.et_pb_slider_container_inner { }

/* Contact Form */
.et_pb_contact_form_container { }
.et_pb_contact_form { }
.et_pb_contact_field { }
input.et_pb_contact_form_input { }
textarea.et_pb_contact_form_input { }
.et_pb_contact_submit { }

/* Accordion */
.et_pb_accordion { }
.et_pb_toggle { }
.et_pb_toggle_title { }
.et_pb_toggle_content { }
.et_pb_toggle_open { }
.et_pb_toggle_close { }

/* Tabs */
.et_pb_tabs { }
.et_pb_tab_active { }
.et_pb_tabs_controls li { }
.et_pb_all_tabs { }

/* Blog */
.et_pb_blog_grid { }
.et_pb_blog_grid .et_pb_post { }
.et_pb_post_content { }

/* Testimonial */
.et_pb_testimonial { }
.et_pb_testimonial_portrait { }
.et_pb_testimonial_author { }

/* Pricing */
.et_pb_pricing { }
.et_pb_pricing_table { }
.et_pb_pricing_heading { }

/* Menu */
.et_pb_menu { }
.et_pb_menu_inner_container { }
.et_pb_menu nav > ul > li > a { }

/* Post Title (Theme Builder) */
.et_pb_post_title { }
.et_pb_title_container { }
.et_pb_title_featured_container { }
```

### Divi 5 Specific Selectors
```css
/* Divi 5 uses data attributes and BEM-like classes */
[data-divi-module="text"] { }
[data-divi-module="button"] { }
[data-divi-module="blurb"] { }
[data-divi-module="group"] { }
[data-divi-module="loop"] { }

/* Divi 5 Group module */
.divi-group { }
.divi-group__inner { }

/* Divi 5 Loop */
.divi-loop { }
.divi-loop__item { }
```

---

## PART EIGHT: PERFORMANCE OPTIMIZATION

### Identifying Performance Issues

```bash
# Check Divi performance settings
wp eval '
$perf_options = array(
    "et_pb_static_css_file",
    "et_pb_css_in_footer",
    "et_pb_google_api_key",
    "et_pb_enable_dynamic_css",
    "et_pb_enable_dynamic_icons"
);
foreach ($perf_options as $opt) {
    echo "$opt: " . get_option($opt, "not set") . "\n";
}
'

# Count Divi shortcodes per page (complexity indicator)
wp eval '
$pages = get_posts(array("post_type" => "page", "posts_per_page" => -1, "post_status" => "publish"));
foreach ($pages as $page) {
    $count = substr_count($page->post_content, "[et_pb_");
    if ($count > 50) {
        echo "WARNING: {$page->post_title} (ID: {$page->ID}) has $count shortcodes\n";
    }
}
'

# Check Divi 5 pages for block count
wp eval '
$pages = get_posts(array("post_type" => "page", "posts_per_page" => -1, "post_status" => "publish"));
foreach ($pages as $page) {
    if (strpos($page->post_content, "wp:divi/") !== false) {
        $count = substr_count($page->post_content, "wp:divi/");
        if ($count > 100) {
            echo "WARNING: {$page->post_title} (ID: {$page->ID}) has $count Divi 5 blocks\n";
        }
    }
}
'

# Check for unused Divi Library items
wp eval '
$layouts = get_posts(array("post_type" => "et_pb_layout", "posts_per_page" => -1, "post_status" => "publish"));
echo "Total Divi Library items: " . count($layouts) . "\n";
foreach ($layouts as $layout) {
    $type = get_post_meta($layout->ID, "_et_pb_layout_type", true);
    echo "  [{$layout->ID}] {$layout->post_title} (type: $type)\n";
}
'
```

### Performance Checklist

1. **Static CSS file generation**: Enable in Divi → Theme Options → Builder → Advanced
2. **Dynamic CSS & Icons**: Enable to reduce payload (only loads CSS/JS for modules in use)
3. **Minimize module count**: Pages with 100+ modules will be slow; use library items
4. **Image optimization**: Install ShortPixel, Imagify, or EWWW
5. **Font loading**: Host Google Fonts locally via child theme for performance
6. **Animations**: Audit excessive scroll animations (CLS issues)
7. **Critical CSS**: Divi 5 extracts critical CSS automatically; Divi 4 needs plugin help
8. **Divi 5 migration**: Provides 2-4x speed improvement from architecture alone

---

## PART NINE: LAYOUT IMPORT/EXPORT

### Divi 4 Export/Import

```bash
# Export page layout to JSON
wp eval '
$post_id = <POST_ID>;
$post = get_post($post_id);
$export = array(
    "title" => $post->post_title,
    "content" => $post->post_content,
    "meta" => array(
        "_et_pb_use_builder" => get_post_meta($post_id, "_et_pb_use_builder", true),
        "_et_pb_page_layout" => get_post_meta($post_id, "_et_pb_page_layout", true),
        "_et_pb_side_nav" => get_post_meta($post_id, "_et_pb_side_nav", true),
    )
);
file_put_contents("/tmp/divi-layout-$post_id.json", json_encode($export, JSON_PRETTY_PRINT));
echo "Exported to /tmp/divi-layout-$post_id.json\n";
'

# Import layout to new page
wp eval '
$json = file_get_contents("/tmp/divi-layout-import.json");
$data = json_decode($json, true);
$post_id = wp_insert_post(array(
    "post_title" => $data["title"] . " (Imported)",
    "post_content" => $data["content"],
    "post_status" => "draft",
    "post_type" => "page"
));
if ($post_id) {
    foreach ($data["meta"] as $key => $val) {
        update_post_meta($post_id, $key, $val);
    }
    echo "Created page ID: $post_id\n";
}
'
```

### Theme Builder Export/Import

```bash
# Export Theme Builder templates (the Divi portability format)
wp eval '
$export = array();
$template_types = array("et_header_layout", "et_body_layout", "et_footer_layout");
foreach ($template_types as $type) {
    $posts = get_posts(array("post_type" => $type, "posts_per_page" => -1, "post_status" => "publish"));
    foreach ($posts as $post) {
        $export[$type][] = array(
            "title" => $post->post_title,
            "content" => $post->post_content,
            "meta" => get_post_meta($post->ID)
        );
    }
}
$export["settings"] = get_option("et_template_builder_settings");
file_put_contents("/tmp/theme-builder-export.json", json_encode($export, JSON_PRETTY_PRINT));
echo "Theme Builder exported\n";
'
```

---

## PART TEN: CHILD THEME OPERATIONS

```bash
# Check child theme status
wp eval '
$theme = wp_get_theme();
echo "Active: " . $theme->get("Name") . "\n";
echo "Is Child: " . ($theme->parent() ? "Yes" : "No") . "\n";
if ($theme->parent()) {
    echo "Parent: " . $theme->parent()->get("Name") . "\n";
    echo "Child Path: " . get_stylesheet_directory() . "\n";
}
'

# Read child theme functions.php
cat wp-content/themes/$(wp eval 'echo get_stylesheet();')/functions.php 2>/dev/null

# Read child theme style.css
cat wp-content/themes/$(wp eval 'echo get_stylesheet();')/style.css 2>/dev/null

# List all files in child theme
ls -la wp-content/themes/$(wp eval 'echo get_stylesheet();')/ 2>/dev/null

# Add custom PHP to child theme functions.php (carefully!)
wp eval '
$child_dir = get_stylesheet_directory();
$functions_file = $child_dir . "/functions.php";
$new_code = "\n\n// Custom code added by agent\nadd_action(\"wp_enqueue_scripts\", function() {\n    wp_enqueue_style(\"custom-styles\", get_stylesheet_directory_uri() . \"/custom.css\");\n});\n";
file_put_contents($functions_file, file_get_contents($functions_file) . $new_code);
echo "Updated functions.php\n";
'
```

---

## PART ELEVEN: TROUBLESHOOTING

### Layout not rendering / blank page
```bash
wp post meta get <POST_ID> _et_pb_use_builder
wp eval 'et_core_clear_main_cache();' 2>/dev/null
```

### Styles not applying
```bash
wp eval '
delete_option("et_pb_css_synced");
et_core_clear_main_cache();
echo "Cleared Divi CSS cache\n";
' 2>/dev/null

wp db query "DELETE FROM $(wp db prefix)options WHERE option_name LIKE '%et_builder%' AND option_name LIKE '%transient%';"
```

### Visual Builder won't load
```bash
wp eval '
echo "Memory limit: " . ini_get("memory_limit") . "\n";
echo "Max execution: " . ini_get("max_execution_time") . "\n";
echo "Max input vars: " . ini_get("max_input_vars") . "\n";
'
# max_input_vars should be >= 3000 for complex pages
# memory_limit should be >= 256M
```

### Migration Status (Divi 4 → 5)
```bash
wp eval '
$migrated = get_option("et_builder_5_migration_status");
echo "Migration status: " . ($migrated ?: "Not started") . "\n";

$pages = get_posts(array("post_type" => array("page", "post"), "posts_per_page" => -1, "post_status" => "publish"));
$v4 = 0; $v5 = 0; $other = 0;
foreach ($pages as $page) {
    if (strpos($page->post_content, "[et_pb_") !== false) $v4++;
    elseif (strpos($page->post_content, "wp:divi/") !== false) $v5++;
    else $other++;
}
echo "Divi 4 shortcode pages: $v4\n";
echo "Divi 5 block pages: $v5\n";
echo "Non-Divi pages: $other\n";
'
```

### Cache Clearing (Nuclear Option)
```bash
# Clear everything Divi-related
wp eval '
// Static CSS
delete_option("et_pb_css_synced");

// Builder cache
if (function_exists("et_core_clear_main_cache")) {
    et_core_clear_main_cache();
}

// Transients
global $wpdb;
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE \"%et_builder%transient%\"");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE \"_transient_et_%\"");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE \"_transient_timeout_et_%\"");

echo "All Divi caches cleared\n";
'

# Also clear object cache if available
wp cache flush 2>/dev/null
```

---

## PART TWELVE: HANDOFF NOTES

After completing Divi work, prepare handoff summaries:

- **For Security Agent**: Report any custom PHP added to functions.php, third-party Divi plugins installed, and code modules containing JavaScript that should be reviewed for XSS risks.
- **For SEO Agent**: Report new pages/layouts created, heading hierarchy (H1/H2/H3 assignments), images without alt text, and pages where Builder was enabled/disabled.
- **For Performance Agent**: Report total module counts on complex pages, any new font loads, image sizes, and animation usage.

---

## APPENDIX A: Divi 4-to-5 Attribute Mapping Quick Reference

| Divi 4 Attribute | Divi 5 JSON Key | Notes |
|------------------|-----------------|-------|
| `custom_padding_tablet` | `custom_padding__responsive.tablet` | Responsive suffix becomes nested object |
| `text_text_color__hover` | `text_text_color__hover` | Hover suffix stays the same |
| `disabled_on="on\|off\|off"` | `visibility.phone`, `visibility.tablet` | Becomes structured object |
| `column_structure="1_2,1_2"` | `column_structure` in row attrs | Same value format |
| `global_module="123"` | Library/preset references | Different mechanism in D5 |
| `fb_built="1"` | Not needed | Divi 5 doesn't use this flag |

## APPENDIX B: Common WP-CLI Patterns for Divi

```bash
# Quick content format check for any post
wp eval '
$id = <POST_ID>;
$p = get_post($id);
$builder = get_post_meta($id, "_et_pb_use_builder", true);
$has_sc = strpos($p->post_content, "[et_pb_") !== false;
$has_d5 = strpos($p->post_content, "wp:divi/") !== false;
echo "Post: {$p->post_title}\n";
echo "Builder enabled: " . ($builder ?: "no") . "\n";
echo "Format: " . ($has_d5 ? "Divi 5" : ($has_sc ? "Divi 4" : "Standard WP")) . "\n";
echo "Content length: " . strlen($p->post_content) . " chars\n";
'

# Audit all pages for Divi version mix
wp eval '
$pages = get_posts(array("post_type" => "page", "posts_per_page" => -1, "post_status" => "publish"));
echo "ID\tVersion\tModules\tTitle\n";
foreach ($pages as $p) {
    $d4 = substr_count($p->post_content, "[et_pb_");
    $d5 = substr_count($p->post_content, "wp:divi/");
    $ver = $d5 ? "D5" : ($d4 ? "D4" : "WP");
    $mods = max($d4, $d5);
    echo "{$p->ID}\t{$ver}\t{$mods}\t{$p->post_title}\n";
}
'
```