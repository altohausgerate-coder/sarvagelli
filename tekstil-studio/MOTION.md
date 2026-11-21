# Sarvagelli motion

## Baseline audit

Audited the 51 HTML pages and four CSS and four JS files under `tekstil-studio/` at commit `760e4fb`. All 51 pages loaded the classic shared site and interaction scripts. Only home and the project index loaded the newer scroll module. The other inline script markup was JSON-LD. No animation library was loaded.

| Effect | Status | Where in the baseline |
| --- | --- | --- |
| Page-load intro | Partial | `edition.css:279–285` set the hero entrance. Home's shared scroll CSS disabled the image and subtitle animation. |
| Hero scroll | Present on home | `scroll-motion.js:102–113` |
| Header hide/show and solid background | Partial | `scroll-motion.js:103–120`, `site.js:10–32`. Only managed pages hid on down-scroll. |
| Reveal on scroll | Partial | `scroll-motion.js:53–84` at 12%, `site.js:83–97` at 15% intersection on other routes. |
| Line-split heading reveal | Partial | `scroll-motion.js:35–51`. Two authored headings. |
| Image mask reveal | Partial | `scroll-motion.css:60–67`. Home and catalogue only. |
| Parallax | Partial | `scroll-motion.js:137–153`. One home photo. |
| Hover effects | Partial | `site.css:69,169,191`, `edition.css:308–310`. Inconsistent durations and treatment. |
| Product-list interaction | Partial | `site.js:101–133`, `edition.css:137–159`. Click-only single-panel preview. |
| Card stagger | Partial | `scroll-motion.js:58–81`, `site.js:91–95`, `interactions.css:321`. |
| Infinite scroll and Load more | Partial | `scroll-motion.js:233–310`. Project catalogue only. |
| Filter transition | Partial | `site.js:165–198`. Instant reset and separate CSS entry animation. |
| Timeline | Missing | `tarixce.html:32`, `edition.css:241–245`. Static years and dividers. |
| Smooth scrolling | Partial | `scroll-motion.js:206–224`. Mouse-wheel engine configurable but off. |
| Back to top and anchors | Partial | `scroll-motion.js:192–206`. Custom timing on two pages. |
| Page transitions | Partial | `site.css:220–222`. Cross-document support only, with inconsistent timings. |

### Baseline motion declarations and listeners

- `site.css:39,69,169,178,191,215–222,252,256–257` defines header and hover transitions, legacy reveal, entrance rise, root view transitions and the native-menu fallback.
- `edition.css:278–310` defines the hero image, title and subtitle keyframes; the sticky project stack, caption transition, collection reveal overrides and practice-image hover.
- `interactions.css:103,204–229` handles the side-panel menu, including opacity, shell edge, close synchronization, opening stagger, fallback left transitions and reduced motion. `interactions.css:318–322` defines viewer, editorial-intro and gallery-card entrance.
- `scroll-motion.css:43–74` defines header, block and line reveals, image clipping and scaling, project-caption and skeleton transitions.
- `site.js:13–30,35–80,83–97` has the old header observer, scroll-driven project animation with its own scroll/rAF handler, and legacy reveal observer. `site.js:127` animates the product preview. `site.js:135–159` listens to horizontal track scrolling to update its buttons.
- `scroll-motion.js:53–84,88–168,206–229,302–304` has the newer reveal observer, scroll-linked frame loop, wheel/scroll handlers and catalogue sentinel observer. `interactions.js:79–100` measures menu geometry in a resize rAF. That menu-specific path is independent of page scrolling.

## Final inventory

All 51 routes load `motion.css?v=3` and `motion.js?v=3` by relative URL. The global durations and easing curves are in the first CSS rule. Numeric thresholds, scroll constants and markup selectors are in `CONFIG` at the top of `motion.js`. Open any route with `?tune=1` for live adjustments and export.

| Effect | Selector / trigger | Duration, delay, easing |
| --- | --- | --- |
| Home header intro | `.studio-home .masthead`, page initialization | 400 ms, no delay, ease-out |
| Home image intro | `.portfolio-hero-media img`, page initialization | 1600 ms, no delay, ease-out |
| Home headline and subtitle | `.portfolio-title .motion-line`, `.portfolio-caption` | Headline 900 ms after 300 ms, 80 ms per line. Subtitle 700 ms after 700 ms. Ease-out. |
| Hero scrub | `.portfolio-entrance`, progress through hero height | Direct mapping. Scale 1–1.08, overlay 0–.45, copy fades and rises 20 px by 30%. |
| Header | `.masthead`, home solid after 80 px, down-scroll hide after 120 px, up-scroll show | Solid 300 ms ease-hover. Hide/show 400 ms ease-in-out. Modal and focused header controls override hiding. |
| Block and line reveals | `CONFIG.selectors.reveal`, h2/h3 and `data-reveal`, once per item at 12% from viewport bottom | Blocks 900 ms ease-out, 40 px. Lines 800 ms ease-out, 70 ms per line. |
| Image masks | `CONFIG.selectors.mask`, generated image wrappers, `data-img-reveal` | Clip 1100 ms ease-in-out. Scale 1.15 to 1 over 1400 ms ease-out. |
| Parallax and closing image | `data-parallax`, `.photo-directory` image and secondary home shots | Scroll-linked. 8% maximum offset at 768 px and above, lerp .12. Closing image also scales 1.15–1. |
| Project spreads | `.project-frame`, `.project-photos figure`, `.project-meta` | Paired secondary masks start 150 ms later. Meta enters at 70 ms intervals. Existing desktop full-bleed stacking uses the shared scroll frame. |
| Hover images, arrows and lines | Project/product/editorial cards and `.action`, mouse hover | Image 600 ms to 1.03. Arrow moves 3 px diagonally and line grows over 300 ms, both ease-hover. Touch captions remain visible. |
| Product directions preview | `.solution-list button`, pointer, focus, arrow keys or activation | Indicator 300 ms ease-out. Copy and image fade 400 ms ease-hover in a shared grid cell. |
| Editorial and gallery rows | `data-stagger-group` and `data-reveal-group`, each row on entry | 90 ms per item in DOM order. Row position tolerance ±4 px. |
| Footer | `CONFIG.selectors.footer`, once on entry | 800 ms ease-out. Columns 80 ms apart. |
| Anchor and back to top | Same-page hash links, with dedicated native skip-link focus | 1200 ms easeInOutCubic. Keyboard and touch can interrupt. |
| Page navigation | Same-origin cross-document View Transition | 450 ms ease-hover. Unsupported browsers fade from a visible page over 300 ms. Open modal navigation can bypass the snapshot. |
| Pagination | Project and product grids, sentinel 800 px ahead or “Daha çox” | Batches of 12, placeholder shimmer 1400 ms linear, polite status and visible disabled button at end. All catalogue links exist in the HTML. |
| Filters | Project query/category/location and product type | Grid fades out in 200 ms ease-hover. Matching cards fade in in 400 ms ease-out with 60 ms step. |
| Timeline and counters | `.timeline`, `.timeline li`, optional `[data-count]` | Vertical line scrubbed with the scroll. Years reveal as text with 900 ms ease-out horizontal line. Optional counts use 1200 ms easeInOutCubic. |
| Smooth wheel | Conventional discrete wheel deltas only | Lerp .1 with a 1100 ms cap. Continuous or horizontal wheel, touch and keyboard retain native behavior. |
| Contact label and focus | Form fields, focus or filled state | 200 ms ease-hover label transform, existing focus ring. |

### Overrides and data coverage

- Use `data-reveal`, `data-reveal="lines"`, optional authored `data-line` spans, `data-img-reveal`, `data-parallax="0.08"`, `data-stagger-group` or a containing `data-no-motion` to override auto-selection.
- Reduced-motion mode leaves content visible with no page, reveal, mask or scroll animation. The native skip link still focuses the main region. Without JavaScript all static project and product links are shown.
- The product catalogue has ten items, so its initial batch already exhausts the list. The existing project index has 29 projects. The home portfolio has existing paired frames for Marriott and Sea Breeze and one existing frame per project for the Ritz-Carlton, Knightsbridge and Port Baku Walk. The detail pages animate their available photos. The About page contains no sourced project totals. The optional counter does not treat 1979 as a count.
- The menu code and its open/switch/close tokens are preserved in `interactions.js` and the menu section of `interactions.css`. The project dialog's independent entrance and the no-script native-menu styles remain separate.
- A browser wheel event does not report whether it originated from a trackpad. Discrete wheel recognition is heuristic. Continuous and fractional deltas skip the inertial controller. This can vary with individual hardware and driver settings.
- Reference-site timing measurement was optional. The implemented timing values use the supplied defaults.

## Verification

Desktop Lighthouse on the local copy with Chrome, using the same relative subdirectory paths as GitHub Pages:

| Page | Performance | Accessibility | CLS |
| --- | ---: | ---: | ---: |
| Home | 95 | 100 | 0.0044 |
| Project catalogue | 98 | 100 | 0.00065 |
| Marriott Hotel Boulevard project | 98 | 100 | 0.00021 |

The automated browser check exercised the home intro, scroll-linked hero and header, keyboard product preview, drawer open/switch/Escape, catalogue pagination and filtering, product type filter, tuning, timeline year, detail masks, contact labels, reduced motion and JavaScript-disabled catalogue. No page errors were reported.

The 390 × 844 Chrome scroll run with 4× CPU slowdown covered 5,141 px at 48.3 fps on average. Median frame interval was 16.7 ms and p95 was 33.4 ms. The run reported no tasks of 50 ms or more. The steady 60 fps goal was outside the measured result. On touch layouts, the project sequence shows the same full-bleed frames with one-time masks and visible captions, with the continuous desktop overlap and parallax disabled.
