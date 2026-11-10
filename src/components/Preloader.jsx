import React, { useEffect, useState } from 'react';
import { R2_BASE, HERO_POSTER, isLeanConnection } from '../data.js';

// REAL loading screen: the percentage follows what is actually loading (fonts, hero poster,
// hero video, page load). It never flashes (MIN_MS) and can never trap a visitor (MAX_MS).
const MIN_MS = 700;
const MAX_MS = 3500;
const WEIGHTS = { fonts: 25, poster: 25, video: 40, page: 10 };

// Skip the screen for reduced-motion visitors and when arriving from another page of this site
// (e.g. clicking Home on /projects/). A full reload or a fresh visit still shows it.
export function shouldSkipPreloader() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    const nav = performance.getEntriesByType('navigation')[0];
    const internal = !!document.referrer && document.referrer.startsWith(window.location.origin);
    return !!nav && nav.type === 'navigate' && internal;
  } catch {
    return false;
  }
}

export function Preloader({ getVideo, onDone }) {
  const [pct, setPct] = useState(0);
  const [leave, setLeave] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const done = { fonts: false, poster: false, video: false, page: false };
    const mark = key => () => {
      done[key] = true;
    };
    const cleanups = [];
    document.body.style.overflow = 'hidden';

    // 1. Fonts
    const fontsReady = document.fonts
      ? Promise.all([
          document.fonts.load("600 16px 'Space Grotesk'"),
          document.fonts.load("400 16px 'DM Sans'"),
        ])
      : Promise.resolve();
    fontsReady.then(mark('fonts'), mark('fonts'));

    // 2. Hero poster
    const img = new Image();
    img.onload = img.onerror = mark('poster');
    img.src = R2_BASE + HERO_POSTER;

    // 3. Hero video (skipped on Save-Data / 2G, where only the poster is shown)
    const video = isLeanConnection() ? null : getVideo();
    if (!video || video.readyState >= 3) {
      done.video = true;
    } else {
      const ready = mark('video');
      video.addEventListener('canplay', ready, { once: true });
      video.addEventListener('error', ready, { once: true });
      cleanups.push(() => {
        video.removeEventListener('canplay', ready);
        video.removeEventListener('error', ready);
      });
    }

    // 4. Whole page (CSS, JS, images)
    if (document.readyState === 'complete') done.page = true;
    else {
      const onLoad = mark('page');
      window.addEventListener('load', onLoad, { once: true });
      cleanups.push(() => window.removeEventListener('load', onLoad));
    }

    let raf;
    let shown = 0;
    let finished = false;
    const timers = [];
    const start = performance.now();
    const tick = now => {
      const elapsed = now - start;
      const loadedPct = Object.keys(done).reduce((sum, k) => sum + (done[k] ? WEIGHTS[k] : 0), 0);
      const timeCap = Math.min(100, (elapsed / MIN_MS) * 100);
      const goal = elapsed >= MAX_MS ? 100 : Math.min(loadedPct, timeCap);
      shown = Math.min(goal, shown + (goal - shown) * 0.18 + (goal > shown ? 0.25 : 0));
      const rounded = Math.min(100, Math.round(shown));
      setPct(rounded);
      if (rounded >= 100 && !finished) {
        finished = true;
        setLeave(true);
        document.body.style.overflow = '';
        timers.push(
          setTimeout(onDone, 450),
          setTimeout(() => setGone(true), 1100)
        );
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach(fn => fn());
      document.body.style.overflow = '';
    };
    // runs once on mount; onDone / getVideo are inline callbacks and must not restart the load tracking
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div className={'preloader' + (leave ? ' leave' : '')} aria-hidden="true">
      <div className="preloader-mark">
        MAXXY<span>.MOV</span>
      </div>
      <div className="preloader-bar">
        <i style={{ transform: 'scaleX(' + pct / 100 + ')' }} />
      </div>
      <div className="preloader-pct">{String(pct).padStart(2, '0')}%</div>
    </div>
  );
}
