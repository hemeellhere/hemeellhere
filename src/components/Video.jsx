import React, { useEffect, useRef, useState } from 'react';
import { DotGrid, dotGridMove } from './Effects.jsx';

const videoInstances = new Set();
function pauseOtherVideos(current) {
  videoInstances.forEach(video => {
    if (video !== current) video.pause();
  });
}
export function Video({
  src,
  poster,
  className = '',
  hover = false,
  autoPlay = false,
  controls = false,
  label,
  onHoverIn,
  onHoverOut,
}) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [broken, setBroken] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const activeRef = useRef(false);
  const deliberateRef = useRef(false);
  useEffect(() => {
    setBroken(false);
    setAutoplayBlocked(false);
    setActive(false);
    activeRef.current = false;
    deliberateRef.current = false;
  }, [src]);
  useEffect(() => {
    const v = ref.current;
    if (!src || broken || !v) return;
    videoInstances.add(v);
    const onPlay = () => {
      pauseOtherVideos(v);
      if (hover && !activeRef.current) deliberateRef.current = true;
    };
    v.addEventListener('play', onPlay);
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            v.pause();
            activeRef.current = false;
            deliberateRef.current = false;
            setActive(false);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(v);
    }
    return () => {
      v.removeEventListener('play', onPlay);
      videoInstances.delete(v);
      observer && observer.disconnect();
    };
  }, [src, broken, hover]);
  useEffect(() => {
    const v = ref.current;
    if (!src || broken || !v) return;
    if (!active || reducedMotion.current || !hover) return;
    v.muted = true;
    v.playsInline = true;
    pauseOtherVideos(v);
    v.play().catch(() => setAutoplayBlocked(true));
  }, [active, src, broken, hover]);
  useEffect(() => {
    const v = ref.current;
    if (!src || broken || !v || !autoPlay || reducedMotion.current) return;
    v.muted = true;
    v.playsInline = true;
    const play = () => {
      pauseOtherVideos(v);
      v.play().catch(() => setAutoplayBlocked(true));
    };
    if (v.readyState >= 2) play();
    else v.addEventListener('canplay', play, { once: true });
    return () => v.removeEventListener('canplay', play);
  }, [src, broken, autoPlay]);
  const enter = () => {
    if (hover && !reducedMotion.current) {
      deliberateRef.current = false;
      activeRef.current = true;
      setActive(true);
    }
    onHoverIn && onHoverIn();
  };
  const leave = () => {
    activeRef.current = false;
    if (hover && !deliberateRef.current) {
      setActive(false);
      ref.current && ref.current.pause();
    }
    onHoverOut && onHoverOut();
  };
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const wasPreviewing = activeRef.current;
    deliberateRef.current = true;
    activeRef.current = false;
    setActive(false);
    if (v.paused) {
      pauseOtherVideos(v);
      v.play().catch(() => setAutoplayBlocked(true));
    } else if (!wasPreviewing) v.pause();
  };
  const keyDown = e => {
    if ((e.key === 'Enter' || e.key === ' ') && src && !broken) {
      e.preventDefault();
      toggle();
    }
  };
  if (!src || broken)
    return (
      <div
        className={'video-placeholder' + (broken ? ' video-error' : '') + ' ' + className}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onMouseMove={dotGridMove}
      >
        <DotGrid />
        <div className="scanlines" />
        <span>{broken ? 'VIDEO UNAVAILABLE' : 'CLIP COMING SOON'}</span>
        <small>{broken ? 'PLEASE TRY AGAIN LATER' : 'NEW CUT IN THE EDIT BAY'}</small>
        <i>{hover ? 'IN PROGRESS' : 'SHOWREEL'}</i>
      </div>
    );
  return (
    <React.Fragment>
      <video
        ref={ref}
        className={className}
        src={src}
        poster={poster || undefined}
        muted
        loop
        playsInline
        autoPlay={autoPlay && !reducedMotion.current}
        controls={controls || autoplayBlocked || (autoPlay && reducedMotion.current)}
        preload={autoPlay ? 'metadata' : 'none'}
        tabIndex={hover || controls ? 0 : undefined}
        aria-label={label || (hover ? 'Project video preview' : 'Showreel video')}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onClick={hover ? toggle : undefined}
        onKeyDown={keyDown}
        onError={() => setBroken(true)}
      />
      {autoplayBlocked && (
        <button type="button" className="video-fallback-action" onClick={toggle}>
          {hover ? 'PLAY VIDEO' : 'PLAY SHOWREEL'}
        </button>
      )}
    </React.Fragment>
  );
}
