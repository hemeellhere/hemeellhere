# MAXXY.MOV — React portfolio

A dark, editorial, mobile-first one-page portfolio for a short-form video editor. Static React + Vite site, plus one small PHP endpoint (`public/api/contact.php`) that emails new leads. No database, no auth.

## Run

```bash
npm install
npm run dev
```

## Build & preview

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Deploy

Static output lands in `dist/`. Deploy that folder to any static host:

- **Vercel** — `vercel.json` in the repo root already sets security headers and long-lived caching for hashed assets.
- **Netlify / Cloudflare Pages** — `public/_headers` (copied into `dist/_headers` on build) does the same job for those platforms.
- **Hostinger (current host)** — see "Hostinger deploy" below. `vercel.json` and `_headers` are ignored there; `public/.htaccess` does the job.
- Any other static host (S3+CloudFront, GitHub Pages, Nginx, etc.) — copy `dist/` up and apply the same header rules from `vercel.json` / `_headers` at the edge/server config.

## Replace assets

The site intentionally ships with no fake client footage, fake stats, or fake photos.

1. Keep the source showreel at `public/hero/showreel.mp4`. The site uses the derived, silent `public/hero/showreel-preview.mp4` for the muted hero background and `public/posters/hero.webp` as its poster; regenerate those derivatives when the source changes. Set `R2_BASE` in `src/main.jsx` if serving media from Cloudflare R2 or another CDN instead of `public/`.
2. Add project preview MP4s + posters and fill the `video` / `poster` fields in the `projects` array in `src/main.jsx`.
3. The About section currently uses the supplied portrait derivative at `public/assets/about/hemeel.webp`; replace it only if you want a different approved portrait.
4. The proof section intentionally uses non-numeric capability points until verified client or channel results are available.
5. Change the email/social URLs in `src/main.jsx`.
6. `public/assets/trail/hook.webp` and `cut.webp` are real optimized (WebP, ~4–9 KB) cursor-trail images. Add `pace.webp`, `grade.webp`, `sfx.webp`, `ship.webp` the same way — the trail gracefully falls back to a text chip for any file that's missing, so nothing breaks if you don't.

## What changed in this pass (production audit)

This project is a static marketing site with **no backend, database, auth, or API** — so those parts of a typical production audit don't apply here. What was actually inspected and fixed:

**Bugs**
- Removed two unused `lucide-react` icon imports (`Volume2`, `MousePointer2`) — dead code shipped to every visitor for nothing.
- `Video` component had no failure path: a broken/missing video URL rendered a blank black box forever. It now falls back to the existing styled placeholder on `onError`.
- The cursor-trail images (`hook.jpg`, `cut.jpg`, …) were referenced from a path that never existed in the project (`/assets/trail/*.jpg`), so the trail always showed text chips. Two of the six are now wired to real, optimized images (see below); the rest still gracefully fall back.
- `vite.config.js` was missing entirely — the build worked only by Vite's implicit defaults. Added an explicit config (stable hashed asset names for cache-busting, `es2018` target, no source maps in production).

**Security**
- External footer links (`target="_blank"`) had no `rel="noopener noreferrer"` — classic reverse-tabnabbing exposure (the opened page could access `window.opener`). Fixed on all three.
- No security headers anywhere. Added a real `Content-Security-Policy` (script-src limited to `'self'`, no third-party script origins), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS — shipped as both `vercel.json` and Netlify/Cloudflare-style `_headers` so it works wherever you deploy.
- Pinned all dependency versions instead of `"latest"` — `"latest"` in `package.json` means every fresh `npm install` can silently pull a different, untested dependency tree in production. Reproducible builds now.
- No error boundary existed — a single render-time exception (e.g. a bad prop from a future edit) would white-screen the entire site with no recovery. Added a minimal `ErrorBoundary` around the app.

**Performance**
- Trail images: replaced the never-loaded JPGs with **actual WebP exports** sized for their real render footprint (104×76 CSS px, 2× export) — 1.7 MB → 4 KB and 5.6 MB → 9 KB.
- `assetsInlineLimit` + hashed, immutable-cacheable filenames configured in `vite.config.js` so repeat visits reuse the CDN cache instead of re-downloading JS/CSS.
- Production build has no source maps (smaller deploy, doesn't leak source structure).
- Verified bundle size after build: **~53 KB gzip JS, ~5 KB gzip CSS** for the whole site — lean for a media-heavy portfolio.

**Reliability / accessibility**
- Mobile menu button now announces state correctly to screen readers (`aria-expanded`, `aria-controls`, `aria-label` that reflects open/closed) instead of a static "Menu" label.
- Decorative icons (`Menu`/`X`) marked `aria-hidden` so screen readers don't announce redundant icon names next to the labelled button.
- Added `<noscript>` fallback with a direct contact email, since this is a client-rendered SPA with no SSR.

**SEO / production hygiene**
- Added `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml`, a canonical URL tag, and Twitter card meta — previously missing entirely (browser tab showed a generic icon, no crawl directives existed).
- Added `public/og-cover.jpg` (real, on-brand 1200×630 image, not a fake screenshot) wired to `og:image`/`twitter:image` — before this, sharing the link on X/LinkedIn/Slack/iMessage or having it appear in a Google result would show **no preview image at all**.
- Added `application/ld+json` structured data (`ProfessionalService` schema: name, description, email, service types, `sameAs` social links) so search engines can identify this as a business entity rather than just parsing prose.
- Added explicit `<meta name="robots" content="index, follow, max-image-preview:large">`.
- **Known gap you should close**: the `sameAs` URLs for YouTube and LinkedIn in the JSON-LD (and the matching footer links in `src/main.jsx`) still point at the generic homepages (`youtube.com/`, `linkedin.com/`), not your actual profile URLs — carried over from the original file. Swap those in both places; generic homepage links don't help Google associate the accounts with you, and visitors land on the wrong page.
- **Structural limitation, not a bug**: this is a client-rendered SPA with no server-side rendering or prerendering. Googlebot generally renders JS fine for a page this size, but social-media link-unfurlers (X, LinkedIn, iMessage, Slack) and some crawlers do **not** execute JavaScript — which is exactly why the static `<meta>` tags in `index.html` (title, description, og:image) matter so much here: they're what those bots actually see. If you want guaranteed rendering for every crawler, the next step up is prerendering (e.g. `vite-plugin-ssg` or a Cloudflare Worker/Vercel Edge prerender) — a real architecture change, not a config tweak, so it's not done here.

**Tooling**
- Added ESLint (`eslint-plugin-react` + `react-hooks`) and a `lint` script — there was no static analysis in the project before this pass. Two rules (`react/no-unescaped-entities`, `react/jsx-no-comment-textnodes`) are intentionally disabled: they flagged literal apostrophes and a `///` divider glyph in visible copy, which is correct, renders fine, and isn't a real defect — not worth rewording real marketing copy to satisfy a style rule. One `react-hooks/exhaustive-deps` warning in the preloader is silenced with an inline comment explaining why (it's a mount-once effect; adding the callback to deps would restart the loading animation on every render).

## Verified

- `npm run lint` — passes, zero errors/warnings.
- `npm run build` — passes (`vite build`, ~2.5s).
- `npm run preview` — smoke-tested locally: root document and the new WebP trail assets both return `200`.

## Known limitations / what's still on you

- There's genuinely no backend in this repo, so items like database indexing, connection pooling, rate limiting, and auth hardening from a generic "production audit" checklist don't apply — if you add an API later (contact form, CMS, analytics ingestion), that surface needs its own review.
- The supplied showreel is now used for the hero and first featured project through a derived 1280×720 silent preview plus poster. The second and third project slots still need approved project clips and accurate metadata — see "Replace assets."
- CSP is same-origin-only for scripts; if you add any third-party script (analytics, chat widget, forms), you'll need to add its origin to `script-src` in both `vercel.json` and `public/_headers`, or it will be silently blocked.
- No automated test suite exists (no Jest/Playwright); for a single static marketing page, manual QA + Lighthouse is proportionate. Add tests if the app grows interactive server-backed features.


## Hostinger deploy (current host)

1. `npm ci && npm run build`
2. In hPanel > File Manager, open `public_html` and upload **the contents of `dist/`** (not the `dist` folder itself). Make sure the hidden `.htaccess` and the `api/` folder come along. Enable "show hidden files" if you can't see it.
3. In hPanel > Email, make sure the mailbox `hello@hemeellhere.com` exists (the form sends from and to this address; change `LEAD_TO` / `LEAD_FROM` at the top of `public/api/contact.php` if you use another).
4. In hPanel > Advanced > PHP Configuration, check PHP is 7.4+ and the `mbstring` extension is on (it is by default).
5. Send yourself a test message from the live form. The email arrives with the subject "New lead: <name> - <need>" and Reply-To set to the visitor, so hitting Reply answers them.

If you put Cloudflare in front of Hostinger, remove the HTTPS redirect block in `.htaccess` (Cloudflare's "Always use HTTPS" does it) to avoid redirect loops.

Tip for a phone alert: in the Gmail app, create a filter for subject `New lead` > "Never send to spam" + "Mark as important", then set notifications to "High priority only".

### Testing the form locally
```
LEAD_DEV=1 php -S localhost:8000 -t public   # terminal 1 (no email is sent, the message is logged)
npm run dev                                   # terminal 2 (Vite proxies /api to PHP)
```

### Things to edit before launch
- `proofStats` in `src/main.jsx`: your real client / years / project numbers.
- `projects` in `src/main.jsx`: projects 02 and 03 show a "coming soon" card until you add `video:'/hero/<file>.mp4'`.

## Project structure
```
src/main.jsx            entry: mounts <App/> inside the error boundary
src/App.jsx             page layout and sections
src/data.js             all editable content: projects (+ categories), services, process, proof stats, asset paths
src/ProjectsPage.jsx    the /projects/ library page (entry: src/projects.jsx, HTML: projects/index.html)
src/hooks.js            useMagnetic
src/components/SiteNav.jsx     the one header used on every page (has Home)
src/components/Preloader.jsx   real loading screen (tracks fonts, hero poster, hero video, page load)
src/components/         Video, ErrorBoundary, Effects (Reveal, Chars, MaskLines, ImageTrail, ...)
src/ContactForm.jsx     lead form (posts to public/api/contact.php)
public/api/contact.php  emails the "New lead" notification
public/.htaccess        Hostinger: redirects, security headers, caching
```
Run `npm run format` before committing; `npm run lint` and `npm run build` must pass.

## Analytics (GoatCounter)
Cookie-free, no personal data, no consent banner needed. It is **off until you set a code**:
1. Create a free site at goatcounter.com. If your dashboard is `https://maxxy.goatcounter.com`, your code is `maxxy`.
2. Put it in `GOATCOUNTER_CODE` in `src/data.js`, then `npm run build` and re-upload.

`count.js` is hosted from this site (`src/vendor`, ISC licence), so the CSP only needs to allow `*.goatcounter.com` for the data request. Tracked events (in the dashboard, switch the table to show events): `nav-start-project`, `lead-form-started`, `lead-form-sent`, `email-click-cta`, `email-click-footer`, `instagram-click`. Visitors with Do Not Track on are not counted, and your own visits from localhost are ignored.

## Projects: bento + library
- Add or edit projects in `projects` in `src/data.js`. Items with `featured: true` (first four) show in the home-page bento in order; every item shows on `/projects/` and is filterable by its `category`.
- **Publish mode (`SHOW_PLACEHOLDERS` in `src/data.js`, default `false`):** projects without a `video` are hidden from both grids, so the live site only ever shows finished work. The "View all projects" button and the library filter chips appear automatically once there is more to show. Set it to `true` locally to preview the "clip coming soon" cards while you fill the library.
- **Adding a clip:** drop the file in `public/hero/`, set `video: '/hero/<file>.mp4'` (and ideally `poster: '/posters/<file>.webp'`) on the project, and it appears on the next build. Keep clips short, silent, H.264, 1280px on the long edge.
- **Launch checklist for `/projects/`:** it ships as `noindex`. Once there are several real clips, change the robots meta in `projects/index.html` to `index, follow, max-image-preview:large` and add `https://hemeellhere.com/projects/` to `public/sitemap.xml`.

## Rules for the grids and the loader
- **Only two ratios exist in every project grid: 16:9 and 9:16.** Set `ratio: '16:9'` or `ratio: '9:16'` on each project in `src/data.js` (anything else falls back to 16:9). In the home bento, every tile keeps its exact ratio and the tiles in a row share one height. The About portrait photo is not a grid and keeps its own shape.
- **Loading screen:** the percentage follows real loading (fonts, hero poster, hero video, page). It shows for at least 0.7 s and never longer than 3.5 s (`MIN_MS` / `MAX_MS` at the top of `Preloader.jsx`). It is skipped for reduced-motion visitors and when someone arrives from another page of the site (for example Home from /projects/).
- **Header:** edit `SiteNav.jsx` once and it changes on every page. It blends with the page (`mix-blend-mode: difference`), so instead of a backdrop it slides away while you scroll down and returns on the first scroll up (or when it receives keyboard focus).
- **Hero timecode:** the `00:00:00:00` readout under the hero follows the showreel playhead (HH:MM:SS:FF at 25 fps, `TC_FPS` in `App.jsx`).
