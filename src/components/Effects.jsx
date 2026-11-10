import React, { useEffect, useRef, useState } from 'react';
import { trailItems } from '../data.js';

export function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={'reveal ' + className}>
      {children}
    </div>
  );
}
// React Bits — Backgrounds/DotGrid, adapted: a lightweight CSS dot grid whose
// accent layer is masked to a soft circle that tracks the pointer (no canvas/WebGL).
export function DotGrid() {
  return <span className="dot-grid" aria-hidden="true" />;
}
export function dotGridMove(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
  el.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
}
export function Marquee({ children }) {
  return (
    <div className="marquee" aria-hidden="true">
      <div>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i}>
            {children} <b>✦</b>
          </span>
        ))}
      </div>
    </div>
  );
}
// React Bits — Text Animations/ShinyText, adapted: a gradient sweep clipped to the
// text using currentColor, so it drops into any element without fighting existing colours.
export function Shiny({ children, className = '' }) {
  return <span className={'shiny-text ' + className}>{children}</span>;
}
// React Bits — Components/SpotlightCard, adapted: cursor-tracked radial glow via
// CSS custom properties, no extra deps.
export function spotlightMove(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--sx', e.clientX - r.left + 'px');
  el.style.setProperty('--sy', e.clientY - r.top + 'px');
}
export function Chars({ text }) {
  return (
    <>
      <span className="chars-line" aria-hidden="true">
        {text.split('').map((c, i) => (
          <span className="hc" key={i} style={{ '--i': i }}>
            <span className="hc-a">{c === ' ' ? '\u00A0' : c}</span>
            <span className="hc-b">{c === ' ' ? '\u00A0' : c}</span>
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
export function MaskLines({ lines, gate = 'io' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (gate !== 'io') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [gate]);
  const active = gate === 'io' ? inView : gate;
  return (
    <span ref={ref} className={'mask-block' + (active ? ' in' : '')}>
      {lines.map((l, i) => (
        <span className="mask-line" key={i} style={{ '--i': i }}>
          <span className="mask-inner">{l}</span>
        </span>
      ))}
    </span>
  );
}
// React Bits — Animations/StarBorder, adapted: two blurred radial-gradient
// blobs orbit behind the button edge on a CSS keyframe loop; real content sits
// in a z-indexed inner span so it's unaffected. Fades out on hover so the
// existing solid hover-fill still reads as the primary feedback state.
export function StarBorderContent({ children }) {
  return <span className="star-border-content">{children}</span>;
}
export function StarBorderGlow() {
  return (
    <>
      <span className="star-border-glow star-border-glow--a" aria-hidden="true" />
      <span className="star-border-glow star-border-glow--b" aria-hidden="true" />
    </>
  );
}
export function ImageTrail({ sectionRef, items = trailItems, threshold = 90, max = 6, life = 900 }) {
  const [trail, setTrail] = useState([]);
  const lastPos = useRef(null);
  const idxRef = useRef(0);
  const idRef = useRef(0);
  useEffect(() => {
    items.forEach(it => {
      if (!it.src) return;
      const img = new Image();
      img.src = it.src;
    });
  }, [items]);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const move = e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left,
        y = e.clientY - r.top;
      const last = lastPos.current;
      if (last && Math.hypot(x - last.x, y - last.y) < threshold) return;
      lastPos.current = { x, y };
      const id = idRef.current++;
      const item = items[idxRef.current % items.length];
      idxRef.current++;
      setTrail(t => {
        const next = [...t, { id, x, y, label: item.label, src: item.src, broken: false }];
        return next.length > max ? next.slice(next.length - max) : next;
      });
      setTimeout(() => setTrail(t => t.filter(it => it.id !== id)), life);
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, [sectionRef, items, threshold, max, life]);
  const onErr = id => setTrail(t => t.map(it => (it.id === id ? { ...it, broken: true } : it)));
  return (
    <div className="image-trail" aria-hidden="true">
      {trail.map(it => (
        <span
          key={it.id}
          className={'image-trail-item' + (it.src && !it.broken ? '' : ' no-image')}
          style={{ left: it.x + 'px', top: it.y + 'px' }}
        >
          {it.src && !it.broken && <img src={it.src} alt="" decoding="async" onError={() => onErr(it.id)} />}
          <b>{it.label}</b>
        </span>
      ))}
    </div>
  );
}
