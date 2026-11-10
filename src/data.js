// GoatCounter site code: if your dashboard is https://maxxy.goatcounter.com, the code is 'maxxy'. Empty = no analytics.
export const GOATCOUNTER_CODE = 'hemeellhere';
export const R2_BASE = ''; // Set to your Cloudflare R2 public base URL when ready.
export const trailItems = [
  { label: 'HOOK', src: R2_BASE + '/assets/trail/hook.webp' },
  { label: 'CUT', src: R2_BASE + '/assets/trail/cut.webp' },
]; // Falls back to the tag chip if a file is missing.
export const HERO_POSTER = '/posters/hero.webp';
export const HERO_VIDEO = '/hero/showreel-hero.mp4';
// Skip the autoplaying hero video on Save-Data or 2G connections and show the poster instead
export const isLeanConnection = () => {
  const c = typeof navigator !== 'undefined' && navigator.connection;
  return !!c && (!!c.saveData || /(^|-)2g$/.test(c.effectiveType || ''));
};
export const PORTRAIT_URL = '/assets/about/hemeel.webp';
// TODO(Maxxy): replace with your real numbers before launch. Format: [value, label, sub-label]
export const proofStats = [
  ['25+', 'CLIENTS WORKED WITH', 'CREATORS, PODCASTERS + BRANDS'],
  ['5', 'YEARS OF EXPERIENCE', 'EDITING WITH PURPOSE'],
  ['40+', 'PROJECTS COMPLETED', 'BUILT TO BE WATCHED'],
];

// Project categories for the /projects/ library filter. Every project's `category` must be one of these.
export const categories = [
  'Shorts / Reels',
  'Podcast clips',
  'Motion + polish',
  'Brand / social',
  'Event / speaker',
];

// ONLY TWO RATIOS ARE ALLOWED IN EVERY GRID: ratio '16:9' (landscape) or '9:16' (vertical). Anything else falls back to 16:9.
// ALL projects live here. `featured: true` ones (max 4) appear in the home-page bento grid, in this order;
// everything shows in the /projects/ library. Empty `video` = "clip coming soon" placeholder card.
// TODO(Maxxy): replace the placeholders. Drop the file in public/hero/ and set video:'/hero/<file>.mp4'
// (optionally poster:'/posters/<file>.webp'). Keep `accent` as a unique two-digit number.
export const projects = [
  {
    id: 1,
    title: 'Speaker Showreel',
    tag: 'SHOWREEL',
    type: 'Event / Speaker Edit',
    ratio: '16:9',
    category: 'Event / speaker',
    featured: true,
    desc: 'A 25-second montage of keynote moments, on-stage visuals and speaker-led storytelling.',
    video: '/hero/showreel-preview.mp4',
    poster: '/posters/hero.webp',
    accent: '01',
  },
  {
    id: 2,
    title: 'No Dead Air',
    tag: 'RHYTHM + SOUND',
    type: 'Creator Short',
    ratio: '9:16',
    category: 'Shorts / Reels',
    featured: true,
    desc: 'Cut setup, pauses and repetition. Added restrained captions, sound design and pattern interrupts without drowning the speaker.',
    video: '',
    poster: '',
    accent: '02',
  },
  {
    id: 3,
    title: 'Make It Feel Expensive',
    tag: 'TYPE + MOTION',
    type: 'Brand / Social',
    ratio: '16:9',
    category: 'Brand / social',
    featured: true,
    desc: 'Used typography, sound and motion to give straightforward footage a stronger visual rhythm.',
    video: '',
    poster: '',
    accent: '03',
  },
  {
    id: 4,
    title: 'Podcast Clip',
    tag: 'PODCAST',
    type: 'Podcast Clip',
    ratio: '9:16',
    category: 'Podcast clips',
    featured: true,
    desc: 'A new podcast clip is on the way.',
    video: '',
    poster: '',
    accent: '04',
  },
  {
    id: 5,
    title: 'Podcast Clip',
    tag: 'PODCAST',
    type: 'Podcast Clip',
    ratio: '9:16',
    category: 'Podcast clips',
    desc: 'A new cut is on the way.',
    video: '',
    poster: '',
    accent: '05',
  },
  {
    id: 6,
    title: 'Reel',
    tag: 'REEL',
    type: 'Instagram Reel',
    ratio: '9:16',
    category: 'Shorts / Reels',
    desc: 'A new cut is on the way.',
    video: '',
    poster: '',
    accent: '06',
  },
  {
    id: 7,
    title: 'Motion Piece',
    tag: 'MOTION',
    type: 'Motion + Polish',
    ratio: '16:9',
    category: 'Motion + polish',
    desc: 'A new cut is on the way.',
    video: '',
    poster: '',
    accent: '07',
  },
  {
    id: 8,
    title: 'Brand Teaser',
    tag: 'BRAND',
    type: 'Brand / Social',
    ratio: '16:9',
    category: 'Brand / social',
    desc: 'A new cut is on the way.',
    video: '',
    poster: '',
    accent: '08',
  },
];
export const services = [
  [
    '01',
    'SHORTS / REELS',
    'Make the scroll stop.',
    'Raw footage turned into tighter, hook-first short-form edits with pacing, captions, sound design and motion.',
  ],
  [
    '02',
    'PODCAST REPURPOSING',
    'One recording. Multiple reasons to watch.',
    'I pull the strongest moments from long-form conversations and turn them into a batch of platform-ready clips.',
  ],
  [
    '03',
    'MOTION + POLISH',
    'Make good footage feel expensive.',
    'Motion graphics, typography, colour and sound design that support the story instead of screaming “editing.”',
  ],
];
export const process = [
  [
    '01',
    'WATCH',
    'Find the moment.',
    'I go through the footage before touching the timeline. I’m looking for the sentence, reaction or moment that can carry the edit.',
  ],
  [
    '02',
    'CUT',
    'Remove everything fighting it.',
    'I build the structure around that moment and remove anything slowing it down.',
  ],
  [
    '03',
    'PUNCH',
    'Build the hook, rhythm and payoff.',
    'Sound design, captions and motion come in only where they improve the experience.',
  ],
  [
    '04',
    'DELIVER',
    'Polish, revise and ship.',
    'You get a clean final, fast revisions and files ready for the platform they are going on.',
  ],
];

// The grids only ever use these two ratios. Any other value is treated as 16:9.
export const ratioOf = p => (p.ratio === '9:16' ? '9:16' : '16:9');

// Publish mode: projects without a `video` are hidden from both grids so visitors never see a wall
// of "clip coming soon" tiles. Flip to true while filling the library to preview the placeholder cards.
export const SHOW_PLACEHOLDERS = false;
export const visibleProjects = projects.filter(p => SHOW_PLACEHOLDERS || p.video);
