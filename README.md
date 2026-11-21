# Sarvagelli website

Open `index.html` in a modern browser, keeping the assets folder next to it. All video, images and fonts are local. Alternatively run `npm run dev`, then open http://127.0.0.1:8766/ on this computer.

The site is a local review version, not a deployment to sarvagelli.com. It combines the requested Silent Gliss typography/navigation and Alya editorial layout with Sarvagelli content. Main navigation links lead to sections; product/service cards open detailed views.

Includes a direct muted looping hero video, responsive navigation, product filters, search, detail dialogs, catalogue request, measurement guide download, WhatsApp draft form, cookie preferences, and verified Instagram/YouTube/LinkedIn links.

The WhatsApp form opens a draft; the visitor sends it. EN links to the existing Sarvagelli English website. Product specifications, catalogue PDFs and actual named client projects can be added when supplied; no unverified client portfolio or technical certifications are asserted.

Reference font assets are included for review. Confirm the applicable webfont rights before production hosting. Images come from Sarvagelli's existing site. Sources are recorded in evidence/sources.md.

## Scroll motion in `tekstil-studio`

The studio pages share a scroll and animation system. Add `?tune=1` to any studio page to adjust the effects and copy the settings. The defaults live at the top of `tekstil-studio/motion.css` and `tekstil-studio/motion.js`. See `tekstil-studio/MOTION.md` for the audit and effect inventory.

- `data-reveal` fades and lifts a block into view once.
- `data-reveal="lines"` reveals a heading in lines. Mark intentional breaks with `data-line` spans to control the sequence.
- `data-stagger-group` staggers marked elements in the same gallery row.
- `data-img-reveal` goes on an image wrapper with reserved dimensions or an aspect ratio.
- `data-parallax` goes on a container with a direct child image. The effect runs at the configured desktop breakpoint. Add `data-no-motion` to a section to opt it out.

