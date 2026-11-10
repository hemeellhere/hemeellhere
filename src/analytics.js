// Privacy-friendly analytics via GoatCounter (no cookies, no personal data).
// count.js is ISC-licensed and served from this site (src/vendor), so the CSP keeps script-src 'self'.
// Turn it on by setting GOATCOUNTER_CODE in src/data.js. Empty = analytics fully off.
import countUrl from './vendor/goatcounter-count.js?url';
import { GOATCOUNTER_CODE } from './data.js';

export function initAnalytics() {
  if (!GOATCOUNTER_CODE) return;
  if (navigator.doNotTrack === '1') return; // respect Do Not Track
  const s = document.createElement('script');
  s.async = true;
  s.src = countUrl;
  s.dataset.goatcounter = 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count';
  document.head.appendChild(s);
}

// Custom events, e.g. trackEvent('lead-form-sent', 'Lead form sent')
export function trackEvent(name, title) {
  const gc = window.goatcounter;
  if (gc && typeof gc.count === 'function') gc.count({ path: name, title: title || name, event: true });
}
