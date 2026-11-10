import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Chars } from './Effects.jsx';

// The one site header, used on every page.
// `base` is '' on the home page (in-page anchors) and '/' on other pages (links back to home sections).
export function SiteNav({ base = '', loaded = true }) {
  const [menu, setMenu] = useState(false);
  const menuBtnRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const handleKey = e => {
      if (e.key === 'Escape') {
        setMenu(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menu]);

  // The header blends with the page (mix-blend-mode: difference) so it has no backdrop; hide it
  // while reading downwards and bring it back on the first upward scroll so it never sits on copy.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < 120) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        lastY = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const close = () => setMenu(false);
  const onHome = base === '';

  return (
    <header className={'nav' + (loaded ? ' loaded' : '') + (hidden && !menu ? ' nav-hidden' : '')}>
      <a className="brand" href={base + '#top'}>
        MAXXY<span>.MOV</span>
      </a>
      <nav id="primary-nav" aria-label="Main navigation" className={menu ? 'open' : ''}>
        <a href={onHome ? '#top' : '/'} aria-current={onHome ? 'page' : undefined} onClick={close}>
          <Chars text="Home" />
        </a>
        <a href={base + '#work'} onClick={close}>
          <Chars text="Work" />
        </a>
        <a href={base + '#process'} onClick={close}>
          <Chars text="Process" />
        </a>
        <a href={base + '#about'} onClick={close}>
          <Chars text="About" />
        </a>
        <a
          className="nav-cta"
          href={base + '#contact'}
          data-goatcounter-click="nav-start-project"
          onClick={close}
        >
          <Chars text="Start a project" /> <ArrowUpRight size={15} />
        </a>
      </nav>
      <button
        ref={menuBtnRef}
        className="menu"
        onClick={() => setMenu(!menu)}
        aria-label={menu ? 'Close menu' : 'Open menu'}
        aria-expanded={menu}
        aria-controls="primary-nav"
      >
        {menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
    </header>
  );
}
