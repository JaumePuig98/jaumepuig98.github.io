# Jaume Puig: Personal Webpage & Digital Business Card

Source for Jaume Puig's personal site: a dark, sharp-edged, technical portfolio plus an unlisted digital business card.

**Live Page:** [https://jaumepuig98.github.io/](https://jaumepuig98.github.io/)

---

## Structure

1. **`index.html`**: Main site, hero, overview, featured research, contact.
2. **`research.html`**: Full research project grid with filters and detailed per-project descriptions.
3. **`experience.html`**: Full professional experience, education, and publication history.
4. **`contact-me.html`**: Digital business card for sharing directly (vCard download included). Intentionally excluded from navigation, sitemap, and search indexing.
5. **`404.html`**: Not-found page.

## Design system

* Dark-first palette, sharp corners, hairline borders. See CSS custom properties at the top of `assets/css/main.css`.
* Fonts: Space Grotesk (headings), Plus Jakarta Sans (body), IBM Plex Mono (technical labels/data).
* Font Awesome for icons, Google Fonts for typography.

## Technologies

* HTML5, CSS3 (custom properties, Grid/Flexbox), vanilla JavaScript (ES6+).
* Google Analytics, gated behind a cookie-consent banner.
* GitHub Pages for hosting.

## Build step: minified assets

Every page loads the **minified** CSS/JS (`assets/css/main.min.css`, `assets/js/main.min.js`, etc.) in production, not the readable source files. Always edit the source files (`main.css`, `main.js`, `bcard-style.css`, `script.js`, `contact-config.js`, `contact-photo.js`) and then regenerate their `.min.` counterparts before committing, or the live site won't reflect your change:

```
npm install terser clean-css-cli   # one-time, into a scratch folder
npx cleancss -O2 --format keep-breaks -o assets/css/main.min.css assets/css/main.css
npx cleancss -O2 --format keep-breaks -o assets/css/bcard-style.min.css assets/css/bcard-style.css
npx terser assets/js/main.js -c -m -o assets/js/main.min.js
npx terser assets/js/script.js -c -m -o assets/js/script.min.js
npx terser assets/js/contact-config.js -c -m -o assets/js/contact-config.min.js
npx terser assets/js/contact-photo.js -c -m -o assets/js/contact-photo.min.js
```

---

## Copyright & License

Copyright © 2026 Jaume Puig. All Rights Reserved.

Content (text, images) is proprietary. The underlying code is public for transparency; if reusing significant portions, please link back to this repository or [https://jaumepuig98.github.io/](https://jaumepuig98.github.io/).
