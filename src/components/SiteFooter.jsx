import React from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { Chars } from './Effects.jsx';

// `base` is '' on the home page (in-page anchors) and '/' on other pages (links back to the home sections).
export function SiteFooter({ base = '' }) {
  return (
    <footer>
      <div>
        <a className="brand" href={base + '#top'}>
          MAXXY<span>.MOV</span>
        </a>
        <p>
          Independent video editor.
          <br />
          Built for the second after the hook.
        </p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <a href={base + '#work'}>
          <Chars text="Work" />
        </a>
        <a href={base + '#process'}>
          <Chars text="Process" />
        </a>
        <a
          href="https://www.instagram.com/hemeell_here/"
          target="_blank"
          rel="noopener noreferrer"
          data-goatcounter-click="instagram-click"
        >
          <Chars text="Instagram" /> <ArrowUpRight size={14} />
        </a>
        <a href="mailto:hello@hemeellhere.com" data-goatcounter-click="email-click-footer">
          <Chars text="Email" /> <Mail size={14} />
        </a>
      </nav>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MAXXY.MOV</span>
        <span>MADE TO BE WATCHED</span>
      </div>
    </footer>
  );
}
