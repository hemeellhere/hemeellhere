import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Play } from 'lucide-react';
import {
  R2_BASE,
  HERO_POSTER,
  HERO_VIDEO,
  isLeanConnection,
  PORTRAIT_URL,
  proofStats,
  visibleProjects,
  ratioOf,
  services,
  process,
} from './data.js';
import { useMagnetic } from './hooks.js';
import { Video } from './components/Video.jsx';
import {
  Reveal,
  Marquee,
  Shiny,
  spotlightMove,
  Chars,
  MaskLines,
  StarBorderContent,
  StarBorderGlow,
  ImageTrail,
} from './components/Effects.jsx';
import ContactForm from './ContactForm.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';
import { SiteNav } from './components/SiteNav.jsx';
import { Preloader, shouldSkipPreloader } from './components/Preloader.jsx';

// Home-page bento shows up to four featured projects; the full list lives on /projects/.
const featured = visibleProjects.filter(p => p.featured).slice(0, 4);
const hasMoreWork = visibleProjects.length > featured.length;

// Bento rows: every tile is 16:9 or 9:16, and the tiles in a row share one height (see .bento-row in styles.css).
const ratioClass = p => (ratioOf(p) === '9:16' ? 'r-916' : 'r-169');
const bentoRows = featured.length <= 3 ? [featured] : [featured.slice(0, 2), featured.slice(2)];

// Hero readout follows the showreel playhead as a HH:MM:SS:FF timecode. Writes to the DOM directly
// so the 25fps updates never re-render the page.
const TC_FPS = 25;
const pad = n => String(n).padStart(2, '0');
function Timecode({ getVideo }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    let last = '';
    const tick = () => {
      const v = getVideo();
      if (v && !v.paused && ref.current) {
        const t = v.currentTime;
        const next =
          pad(Math.floor(t / 3600)) +
          ':' +
          pad(Math.floor(t / 60) % 60) +
          ':' +
          pad(Math.floor(t) % 60) +
          ':' +
          pad(Math.floor((t % 1) * TC_FPS));
        if (next !== last) {
          last = next;
          ref.current.textContent = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getVideo]);
  return <span ref={ref}>00:00:00:00</span>;
}

function App() {
  const dotRef = useRef(null);
  const [cursorLabel, setCursorLabel] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [skipPre] = useState(() => shouldSkipPreloader());
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroCtaRef = useMagnetic(16);
  const ctaBtnRef = useMagnetic(12);
  const getHeroVideo = useCallback(() => heroRef.current?.querySelector('.hero-video video'), []);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let raf;
    const f = e => {
      const x = e.clientX,
        y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const d = dotRef.current;
        if (!d) return;
        d.style.setProperty('--mx', x + 'px');
        d.style.setProperty('--my', y + 'px');
      });
    };
    window.addEventListener('pointermove', f, { passive: true });
    return () => {
      window.removeEventListener('pointermove', f);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    const els = document.querySelectorAll('.shiny-text,.spin-mark,.star-border-glow,.marquee>div');
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      es =>
        es.forEach(e => {
          if (e.isIntersecting) e.target.removeAttribute('data-offscreen');
          else e.target.setAttribute('data-offscreen', '');
        }),
      { rootMargin: '80px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!skipPre) return; // otherwise the Preloader calls setLoaded when everything is really loaded
    let r2;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setLoaded(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [skipPre]);
  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--py', Math.round(window.scrollY * 0.25) + 'px');
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="site">
      {!skipPre && <Preloader getVideo={getHeroVideo} onDone={() => setLoaded(true)} />}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div ref={dotRef} className={'cursor-dot' + (cursorLabel ? ' has-label' : '')}>
        {cursorLabel && <span className="cursor-label">{cursorLabel}</span>}
      </div>
      <SiteNav loaded={loaded} />
      <main id="main-content">
        <section id="top" ref={heroRef} className={'hero' + (loaded ? ' loaded' : '')}>
          <div className="hero-video" ref={heroVideoRef}>
            {isLeanConnection() ? (
              <img
                src={R2_BASE + HERO_POSTER}
                alt=""
                width="1280"
                height="720"
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <Video src={R2_BASE + HERO_VIDEO} poster={R2_BASE + HERO_POSTER} autoPlay />
            )}
            <div className="hero-vignette" />
          </div>
          <ImageTrail sectionRef={heroRef} />
          <div className="hero-content">
            <p className="eyebrow">
              <Shiny>INDEPENDENT VIDEO EDITOR</Shiny> <span>///</span> <Shiny>MAXXY.MOV</Shiny>
            </p>
            <h1>
              <MaskLines
                gate={loaded}
                lines={[
                  'I EDIT FOR THE',
                  <React.Fragment key="l2">
                    <em>SECOND</em> AFTER
                  </React.Fragment>,
                  'THE HOOK.',
                ]}
              />
            </h1>
            <div className="hero-bottom">
              <p>Short-form editing built around hooks, pacing and retention.</p>
              <a href="#work" ref={heroCtaRef} className="round-cta star-border magnetic">
                <StarBorderGlow />
                <StarBorderContent>
                  <Chars text="SEE THE WORK" /> <ArrowDown size={17} />
                </StarBorderContent>
              </a>
            </div>
          </div>
          <div className="hero-meta">
            <Timecode getVideo={getHeroVideo} />
            <span>PLAYBACK / 01</span>
          </div>
        </section>
        <Marquee>CUT THE DEAD AIR&nbsp;&nbsp; BUILD THE MOMENT&nbsp;&nbsp; KEEP THEM WATCHING</Marquee>
        <section id="about" className="section about" aria-labelledby="about-title">
          <div className="section-head">
            <span>
              <Shiny>01 / THE EDITOR BEHIND IT</Shiny>
            </span>
            <span className="spin-mark">✦</span>
          </div>
          <div className="about-grid">
            <Reveal className="portrait">
              <div className="portrait-inner">
                <img
                  className="portrait-image"
                  src={PORTRAIT_URL}
                  alt="Maxxy, video editor"
                  width="768"
                  height="1376"
                  loading="lazy"
                  decoding="async"
                />
                <div className="portrait-label">MAXXY / EDITOR</div>
                <div className="portrait-foot">CRAFT OVER NOISE</div>
              </div>
            </Reveal>
            <Reveal className="about-copy">
              <h2 id="about-title">
                <MaskLines
                  lines={[
                    'I like finding the',
                    <React.Fragment key="l2">
                      <em>moment worth keeping.</em>
                    </React.Fragment>,
                  ]}
                />
              </h2>
              <p>I’m Maxxy — a freelance video editor focused on short-form content.</p>
              <p>
                Most of my work starts with footage that is technically fine but doesn’t have a clear reason
                to keep watching. That’s where I come in.
              </p>
              <p>
                I cut the pauses. Restructure the hook. Tighten the pacing. Build the sound. Add motion where
                it actually helps. Then I keep trimming until every second earns its place.
              </p>
              <p>
                I work mainly with creators, podcasters and brands who want their content to feel sharper
                without losing their voice.
              </p>
              <p className="strong">
                I’m not trying to make every video look “edited.”
                <br />
                I’m trying to make the next second feel worth watching.
              </p>
            </Reveal>
          </div>
        </section>
        <section id="services" className="section services" aria-labelledby="services-title">
          <h2 id="services-title" className="sr-only">
            What I do
          </h2>
          <div className="section-head">
            <span>
              <Shiny>02 / WHAT I DO</Shiny>
            </span>
            <span className="spin-mark">✦</span>
          </div>
          <div className="services-list">
            {services.map(([n, t, h, d]) => (
              <Reveal key={n}>
                <article className="service spotlight" onMouseMove={spotlightMove}>
                  <span className="spotlight-glow" aria-hidden="true" />
                  <span className="service-num">{n}</span>
                  <div>
                    <p className="service-label">{t}</p>
                    <h3>{h}</h3>
                    <p>{d}</p>
                  </div>
                  <ArrowUpRight className="service-arrow" />
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <Marquee>HOOK FIRST&nbsp;&nbsp; PACING MATTERS&nbsp;&nbsp; SOUND SELLS THE MOMENT</Marquee>
        <section id="work" className="section work" aria-labelledby="work-title">
          <div className="section-head">
            <span>
              <Shiny>03 / SELECTED WORK</Shiny>
            </span>
            <span>
              {String(featured.length).padStart(2, '0')} {featured.length === 1 ? 'PROJECT' : 'PROJECTS'}
            </span>
          </div>
          <div className="work-intro">
            <h2 id="work-title">
              <MaskLines
                lines={[
                  'Good edits are felt',
                  <React.Fragment key="l2">
                    <em>before they're noticed.</em>
                  </React.Fragment>,
                ]}
              />
            </h2>
            <p>Hover, focus or tap a project to preview the motion.</p>
          </div>
          <div className="bento">
            {bentoRows.map((row, ri) => (
              <div
                key={ri}
                className="bento-row"
                style={{
                  '--sum': row.reduce((t, p) => t + (ratioOf(p) === '9:16' ? 9 / 16 : 16 / 9), 0),
                  '--n': row.length,
                }}
              >
                {row.map(p => (
                  <Reveal key={p.id} className={'bento-tile ' + ratioClass(p)}>
                    <article className="project">
                      <div className="project-media">
                        <Video
                          src={p.video ? R2_BASE + p.video : ''}
                          poster={p.poster ? R2_BASE + p.poster : ''}
                          hover
                          controls
                          label={'Preview: ' + p.title}
                          onHoverIn={p.video ? () => setCursorLabel('PLAY') : undefined}
                          onHoverOut={p.video ? () => setCursorLabel('') : undefined}
                        />
                        <span className="project-index">{p.accent}</span>
                        <span className="project-tag">{p.tag}</span>
                        {p.video && (
                          <span className="project-play">
                            <Play size={16} fill="currentColor" />
                          </span>
                        )}
                      </div>
                      <div className="project-info">
                        <div>
                          <span>{p.type}</span>
                          <h3>{p.title}</h3>
                        </div>
                        <p>{p.desc}</p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            ))}
          </div>
          {hasMoreWork && (
            <div className="work-more">
              <a className="work-more-link" href="/projects/" data-goatcounter-click="view-all-projects">
                View all projects <ArrowUpRight size={16} />
              </a>
            </div>
          )}
        </section>
        <section id="process" className="section process" aria-labelledby="process-title">
          <div className="section-head">
            <span>
              <Shiny>04 / THE PROCESS</Shiny>
            </span>
            <span>THE MAXXY CUT</span>
          </div>
          <div className="process-title">
            <h2 id="process-title">
              <MaskLines
                lines={[
                  'THE',
                  <React.Fragment key="l2">
                    <em>MAXXY CUT</em>
                  </React.Fragment>,
                ]}
              />
            </h2>
            <p>
              A simple editing system built around one question: <strong>what makes someone stay?</strong>
            </p>
          </div>
          <div className="process-list">
            {process.map(([n, t, h, d]) => (
              <Reveal key={n}>
                <article className="process-row">
                  <span>{n}</span>
                  <div>
                    <p className="process-label">{t}</p>
                    <h3>{h}</h3>
                    <p>{d}</p>
                  </div>
                  <span className="timeline" aria-hidden="true">
                    —|—|—▶—|—
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="proof" aria-labelledby="proof-title">
          <h2 id="proof-title" className="sr-only">
            Proof
          </h2>
          <div className="proof-top">
            <span>
              <Shiny>05 / PROOF</Shiny>
            </span>
            <span>REAL RESULTS</span>
          </div>
          <Reveal className="stats proof-metrics">
            {proofStats.map(([n, t, sub]) => (
              <div key={t}>
                <strong>{n}</strong>
                <span>
                  {t}
                  <br />
                  <small>{sub}</small>
                </span>
              </div>
            ))}
          </Reveal>
        </section>
        <section className="section tools" aria-labelledby="tools-title">
          <h2 id="tools-title" className="sr-only">
            Tools
          </h2>
          <div className="section-head">
            <span>
              <Shiny>06 / TOOLS</Shiny>
            </span>
            <span>THE TIMELINE</span>
          </div>
          <div className="tool-row">
            {['PREMIERE PRO', 'AFTER EFFECTS', 'DAVINCI RESOLVE', 'BLENDER', 'PHOTOSHOP'].map(x => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </section>
        <section id="contact" className="cta" aria-labelledby="cta-title">
          <div className="cta-mark spin-mark">✦</div>
          <p>GOT FOOTAGE?</p>
          <h2 id="cta-title">
            <MaskLines
              lines={[
                "LET'S MAKE IT",
                <React.Fragment key="l2">
                  <em>WORTH WATCHING.</em>
                </React.Fragment>,
              ]}
            />
          </h2>
          <ContactForm
            buttonRef={ctaBtnRef}
            buttonContent={
              <>
                <StarBorderGlow />
                <StarBorderContent>
                  <Chars text="SEND MESSAGE" /> <ArrowUpRight />
                </StarBorderContent>
              </>
            }
          />
          <small>
            Prefer email?{' '}
            <a href="mailto:hello@hemeellhere.com" data-goatcounter-click="email-click-cta">
              hello@hemeellhere.com
            </a>{' '}
            · usually reply within 24–48 hours
          </small>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
