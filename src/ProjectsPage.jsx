import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Video } from './components/Video.jsx';
import { Reveal } from './components/Effects.jsx';
import { SiteFooter } from './components/SiteFooter.jsx';
import { SiteNav } from './components/SiteNav.jsx';
import { visibleProjects as projects, categories, ratioOf, R2_BASE } from './data.js';
import { trackEvent } from './analytics.js';

const ALL = 'All';
const ratioClass = p => (ratioOf(p) === '9:16' ? 'r-916' : 'r-169');
const slug = s =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function ProjectsPage() {
  const [active, setActive] = useState(ALL);
  // Only show categories that actually have projects
  const filters = [ALL, ...categories.filter(c => projects.some(p => p.category === c))];
  const count = c => (c === ALL ? projects.length : projects.filter(p => p.category === c).length);
  const shown = active === ALL ? projects : projects.filter(p => p.category === active);

  const choose = c => {
    setActive(c);
    trackEvent('library-filter-' + slug(c), 'Library filter: ' + c);
  };

  return (
    <div className="site lib-page" id="top">
      <a className="skip-link" href="#library">
        Skip to projects
      </a>
      <SiteNav base="/" />

      <main id="library" className="lib-main">
        <h1 className="lib-title">
          The full <em>library.</em>
        </h1>
        <p className="lib-lead">
          Every type of edit in one place: short-form, podcast clips, motion and brand work. Hover, focus or
          tap a project to preview it.
        </p>

        {filters.length > 2 && (
          <div className="lib-filters" role="group" aria-label="Filter projects by type">
            {filters.map(c => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={active === c}
                onClick={() => choose(c)}
              >
                {c}
                <small>{count(c)}</small>
              </button>
            ))}
          </div>
        )}
        <p className="sr-only" role="status" aria-live="polite">
          Showing {shown.length} {shown.length === 1 ? 'project' : 'projects'}
          {active === ALL ? '' : ' in ' + active}
        </p>

        <div className="lib-grid">
          {shown.map(p => (
            <Reveal key={p.id} className={'lib-card ' + ratioClass(p)}>
              <article className="project">
                <div className={'project-media ' + ratioClass(p)}>
                  <Video
                    src={p.video ? R2_BASE + p.video : ''}
                    poster={p.poster ? R2_BASE + p.poster : ''}
                    hover
                    controls
                    label={'Preview: ' + p.title}
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
                    <h2>{p.title}</h2>
                  </div>
                  <p>{p.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </main>

      <SiteFooter base="/" />
    </div>
  );
}

export default ProjectsPage;
