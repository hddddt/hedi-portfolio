import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { lifePhotoMetadata } from '../../data/lifePhotoMetadata.js';
import { LIFE_ARCHIVE_COPY } from '../../data/lifeArchiveViews.js';
import { useArchiveTypewriter } from '../../hooks/useArchiveTypewriter.js';
import {
  clusterFieldMinHeight,
  clusterTargetLayout,
  getExplorationOptions,
  getLensFollowUp,
  getLensMainText,
  getSelectionOpeningText,
  matchForLens,
  rotationFromId,
  scaleFromId,
} from '../../utils/lifeArchiveInteraction.js';

import { GuideOrb } from '../home/GuideOrb.jsx';

function getPhoto(id) {
  return lifePhotoMetadata.find((p) => p.id === id) ?? null;
}

function measureCenter(el, fieldRect) {
  const r = el.getBoundingClientRect();
  return {
    x: r.left - fieldRect.left + r.width / 2,
    y: r.top - fieldRect.top + r.height / 2,
  };
}

function RedHatGuideFigure({
  thinking,
  speaking,
  hovered,
  emotionalTone,
  onHoverStart,
  onHoverEnd,
}) {
  return (
    <span
      className="life-archive-guide-blob-hitbox"
      aria-hidden="true"
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
    >
      <GuideOrb
        size={44}
        followCursor={false}
        blink
        thinking={Boolean(thinking)}
        speaking={Boolean(speaking)}
        hovered={Boolean(hovered)}
        emotionalTone={emotionalTone}
      />
    </span>
  );
}

function ArchiveGuidePresence({ thinking, speaking, hovered, emotionalTone, onHoverStart, onHoverEnd }) {
  return (
    <div className="life-archive-ink-guide__presence">
      <RedHatGuideFigure
        thinking={thinking}
        speaking={speaking}
        hovered={hovered}
        emotionalTone={emotionalTone}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />
      {thinking ? (
        <span className="life-archive-ink-guide__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : null}
    </div>
  );
}

export function LifeArchiveExperience() {
  const fieldRef = useRef(null);
  const scrollerRef = useRef(null);
  const clusterStageRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [lens, setLens] = useState(null);
  const [guideStyle, setGuideStyle] = useState({ mode: 'idle' });
  const [guideMoving, setGuideMoving] = useState(null);
  const [clusterAnim, setClusterAnim] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState([]);
  const [guideHovered, setGuideHovered] = useState(false);
  const browseHoverIdRef = useRef(null);
  const [scrollHintVisible, setScrollHintVisible] = useState(true);
  const prevGuideModeRef = useRef(guideStyle.mode);

  const selected = useMemo(() => (selectedId ? getPhoto(selectedId) : null), [selectedId]);

  const explorationOptions = useMemo(
    () => (selected ? getExplorationOptions(selected, lifePhotoMetadata) : []),
    [selected],
  );

  const matchedIds = useMemo(() => {
    if (!selected || !lens) return [];
    return matchForLens(lens, selected, lifePhotoMetadata);
  }, [selected, lens]);

  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds]);

  const mainText = useMemo(() => {
    if (!selected) return '';
    if (lens) return getLensMainText(lens, selected);
    return getSelectionOpeningText(selected, lifePhotoMetadata);
  }, [selected, lens]);

  const followUpText = useMemo(() => (lens ? getLensFollowUp(lens) : ''), [lens]);

  const thinkMs = 400;
  const { displayed, thinking, complete } = useArchiveTypewriter(mainText, Boolean(selectedId), {
    thinkMs,
  });
  const speaking = Boolean(selectedId) && !thinking && !complete && displayed.length > 0;

  const fieldMinH = useMemo(() => {
    if (!lens || !matchedIds.length) return null;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return clusterFieldMinHeight(matchedIds.length, vw);
  }, [lens, matchedIds.length]);

  const updateGuidePosition = useCallback(() => {
    const field = fieldRef.current;
    if (!field) return;
    const fieldRect = field.getBoundingClientRect();

    if (!selectedId) {
      const hoverId = browseHoverIdRef.current;
      if (hoverId) {
        const card = field.querySelector(`[data-intent-id="${hoverId}"]`);
        if (card) {
          const cardRect = card.getBoundingClientRect();
          setGuideStyle({
            mode: 'idle',
            anchor: 'card',
            left: cardRect.left - fieldRect.left + cardRect.width / 2,
            top: cardRect.bottom - fieldRect.top + 14,
          });
          return;
        }
      }
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const left = Math.max(16, Math.min(32, w * 0.03));
      setGuideStyle({ mode: 'idle', anchor: 'corner', left, bottom: 16 });
      return;
    }

    if (lens && clusterStageRef.current) {
      const cards = clusterStageRef.current.querySelectorAll('.life-archive-intent__cluster-card');
      let bottom = 0;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        bottom = Math.max(bottom, r.bottom - fieldRect.top);
      });
      if (bottom > 0) {
        setGuideStyle({
          mode: 'active',
          anchor: 'card',
          left: fieldRect.width / 2,
          top: bottom + 18,
        });
        return;
      }
    }

    const card = field.querySelector(`[data-intent-id="${selectedId}"]`);
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    setGuideStyle({
      mode: 'active',
      anchor: 'card',
      left: cardRect.left - fieldRect.left + cardRect.width / 2,
      top: cardRect.bottom - fieldRect.top + 14,
    });
  }, [selectedId, lens, clusterAnim]);

  const onBrowsePointerMove = useCallback(
    (e) => {
      if (selectedId || lens) return;
      const card = e.target.closest('.life-archive-intent__card');
      const id = card?.getAttribute('data-intent-id') ?? null;
      if (!id || browseHoverIdRef.current === id) return;
      browseHoverIdRef.current = id;
      requestAnimationFrame(updateGuidePosition);
    },
    [selectedId, lens, updateGuidePosition],
  );

  const onBrowsePointerLeave = useCallback(() => {
    if (!browseHoverIdRef.current) return;
    browseHoverIdRef.current = null;
    requestAnimationFrame(updateGuidePosition);
  }, [updateGuidePosition]);

  useEffect(() => {
    const prev = prevGuideModeRef.current;
    const next = guideStyle.mode;
    if (prev === next) return;
    if (prev === 'idle' && next === 'active') setGuideMoving('to-active');
    else if (prev === 'active' && next === 'idle') setGuideMoving('to-idle');
    prevGuideModeRef.current = next;
    const t = window.setTimeout(() => setGuideMoving(null), 700);
    return () => window.clearTimeout(t);
  }, [guideStyle.mode]);

  useEffect(() => {
    if (selectedId || lens) {
      browseHoverIdRef.current = null;
    }
  }, [selectedId, lens]);

  useLayoutEffect(() => {
    if (!lens || !fieldRef.current || !selectedId || matchedIds.length === 0) {
      setClusterAnim(null);
      return;
    }

    const field = fieldRef.current;
    const fieldRect = field.getBoundingClientRect();
    const centerX = fieldRect.width / 2;
    const centerY = fieldMinH ? fieldMinH * 0.42 : Math.min(fieldRect.height * 0.38, 240);

    const from = {};
    matchedIds.forEach((id) => {
      const clusterEl = clusterStageRef.current?.querySelector(`[data-cluster-id="${id}"]`);
      const rowEl = field.querySelector(`[data-intent-id="${id}"]`);
      const el = clusterEl || rowEl;
      if (!el) return;
      const c = measureCenter(el, fieldRect);
      const isSel = id === selectedId;
      from[id] = {
        x: c.x,
        y: c.y,
        rot: rotationFromId(id),
        z: isSel ? 50 : 40 + matchedIds.indexOf(id),
      };
    });

    const to = {};
    const viewportW = fieldRect.width;
    matchedIds.forEach((id) => {
      to[id] = clusterTargetLayout(id, selectedId, matchedIds, centerX, centerY, viewportW);
    });

    setClusterAnim({ items: from, phase: 'from' });

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setClusterAnim({ items: to, phase: 'to' });
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [lens, selectedId, matchedIds.join(','), fieldMinH]);

  useLayoutEffect(() => {
    updateGuidePosition();
    const field = fieldRef.current;
    const scroller = scrollerRef.current;
    if (!field) return undefined;

    const onHorizontalScroll = () => {
      if (!scroller || scroller.scrollLeft <= 8) return;
      setScrollHintVisible(false);
    };

    const ro = new ResizeObserver(updateGuidePosition);
    ro.observe(field);
    window.addEventListener('resize', updateGuidePosition);
    scroller?.addEventListener('scroll', updateGuidePosition, { passive: true });
    scroller?.addEventListener('scroll', onHorizontalScroll, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateGuidePosition);
      scroller?.removeEventListener('scroll', updateGuidePosition);
      scroller?.removeEventListener('scroll', onHorizontalScroll);
    };
  }, [updateGuidePosition]);

  useLayoutEffect(() => {
    if (!selectedId || lens || !scrollerRef.current) return undefined;
    const el = scrollerRef.current.querySelector(`[data-intent-id="${selectedId}"]`);
    const t = window.setTimeout(() => {
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      window.setTimeout(updateGuidePosition, 520);
    }, 60);
    return () => window.clearTimeout(t);
  }, [selectedId, lens, updateGuidePosition]);

  useEffect(() => {
    if (!lens) return undefined;
    const delay = 550 + matchedIds.length * 60 + 80;
    const t = window.setTimeout(updateGuidePosition, delay);
    return () => window.clearTimeout(t);
  }, [lens, clusterAnim?.phase, matchedIds, updateGuidePosition]);

  useEffect(() => {
    setShowOptions(false);
    setOptionsVisible([]);
    if (!complete || lens || !selectedId) return undefined;
    const count = explorationOptions.length;
    const t = window.setTimeout(() => {
      setShowOptions(true);
      for (let i = 0; i < count; i += 1) {
        window.setTimeout(() => {
          setOptionsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 200);
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [complete, lens, selectedId, mainText, explorationOptions.length]);

  useEffect(() => {
    setShowFollowUp(false);
    setShowExit(false);
    if (!complete || !lens) return undefined;
    const t1 = window.setTimeout(() => setShowFollowUp(true), 600);
    const t2 = window.setTimeout(() => setShowExit(true), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [complete, lens, mainText]);

  const resetAll = useCallback(() => {
    setSelectedId(null);
    setLens(null);
    setClusterAnim(null);
    setShowOptions(false);
    setShowFollowUp(false);
    setShowExit(false);
    setOptionsVisible([]);
    setScrollHintVisible(true);
    browseHoverIdRef.current = null;
  }, []);

  const onPickPhoto = useCallback((id) => {
    browseHoverIdRef.current = null;
    setSelectedId(id);
    setLens(null);
    setClusterAnim(null);
    setShowOptions(false);
    setShowFollowUp(false);
    setShowExit(false);
    setOptionsVisible([]);
  }, []);

  // Cluster navigation: keep the current lens + cluster state,
  // but re-center the cluster around a new selected photo.
  const onPickClusterPhoto = useCallback((id) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    setOptionsVisible(explorationOptions.map(() => false));
  }, [selectedId, explorationOptions.length]);

  const onSelectLens = useCallback((next) => {
    setLens(next);
    setShowOptions(false);
    setShowFollowUp(false);
    setShowExit(false);
    setOptionsVisible([]);
  }, []);

  const cycleLens = useCallback(() => {
    if (!explorationOptions.length) return;
    setLens((prev) => {
      const idx = explorationOptions.findIndex((o) => o.lens === prev);
      const next = explorationOptions[(idx + 1) % explorationOptions.length];
      return next.lens;
    });
    setShowFollowUp(false);
    setShowExit(false);
  }, [explorationOptions]);

  const onFieldPointerDown = useCallback(
    (e) => {
      if (!selectedId) return;
      const target = e.target;
      if (target.closest('.life-archive-intent__card')) return;
      if (target.closest('.life-archive-intent__cluster-card')) return;
      if (target.closest('.life-archive-ink-guide')) return;
      resetAll();
    },
    [selectedId, resetAll],
  );

  const showRow = !lens;

  return (
    <div className="life-archive-intent">
      <header className="life-archive-intent__header">
        <h2 id="life-archive-title" className="life-archive-intent__title">
          {LIFE_ARCHIVE_COPY.title}
        </h2>
        <p className="life-archive-intent__subtitle">{LIFE_ARCHIVE_COPY.subtitle}</p>
        <p className="life-archive-intent__instruction">Pick one. See where it connects.</p>
      </header>

      <div
        ref={fieldRef}
        className={[
          'life-archive-intent__field',
          selectedId ? (lens ? 'life-archive-intent__field--regroup' : 'life-archive-intent__field--selected') : 'life-archive-intent__field--idle',
          lens && matchedIds.length > 6 ? 'life-archive-intent__field--regroup-large' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={fieldMinH ? { minHeight: `${fieldMinH}px` } : undefined}
        onPointerDown={onFieldPointerDown}
      >
        <div className="life-archive-intent__scroller-wrap">
          <div className="life-archive-intent__edge life-archive-intent__edge--left" aria-hidden />
          <div className="life-archive-intent__edge life-archive-intent__edge--right" aria-hidden />

          <div
            ref={scrollerRef}
            className={`life-archive-intent__scroller${showRow ? '' : ' life-archive-intent__scroller--dimmed'}`}
            tabIndex={0}
            role="region"
            aria-label="Life archive — scroll horizontally to browse photographs"
            onPointerMove={onBrowsePointerMove}
            onPointerLeave={onBrowsePointerLeave}
          >
            <div className="life-archive-intent__row">
            {lifePhotoMetadata.map((photo, index) => {
              const isSel = photo.id === selectedId;
              const inMatched = matchedSet.has(photo.id);
              const hiddenInCluster = Boolean(lens && inMatched);

              let opacity = 1;
              let scale = scaleFromId(photo.id);
              let liftY = 0;

              if (selectedId && !lens) {
                opacity = isSel ? 1 : 0.15;
                if (isSel) {
                  scale *= 1.12;
                  liftY = -60;
                }
              } else if (lens) {
                if (hiddenInCluster) {
                  opacity = 0;
                } else {
                  opacity = 0.06;
                  scale *= 0.94;
                }
              }

              return (
                <button
                  key={photo.id}
                  type="button"
                  data-intent-id={photo.id}
                  className={[
                    'life-archive-intent__card',
                    isSel ? 'is-selected' : '',
                    hiddenInCluster ? 'is-cluster-source' : '',
                    lens && !inMatched ? 'is-faded' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    '--intent-rot': `${rotationFromId(photo.id)}deg`,
                    '--intent-scale': scale,
                    '--intent-opacity': opacity,
                    '--intent-lift': `${liftY}px`,
                    zIndex: isSel && !lens ? 50 : index + 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickPhoto(photo.id);
                  }}
                  aria-pressed={isSel}
                  aria-hidden={hiddenInCluster}
                  tabIndex={hiddenInCluster ? -1 : 0}
                  aria-label={photo.title || 'Archive photograph'}
                >
                  <img
                    src={photo.imageSrc}
                    alt=""
                    className="life-archive-intent__img"
                    loading={index < 12 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                  />
                  {!selectedId && !lens ? (
                    <span className="life-archive-intent__hover-cap" aria-hidden>
                      <span className="life-archive-intent__hover-title">{photo.title}</span>
                      <span className="life-archive-intent__hover-attn">{photo.attentionType}</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
            </div>
          </div>

          {!selectedId && !lens ? (
            <p
              className={`life-archive-intent__scroll-hint${scrollHintVisible ? ' is-visible' : ''}`}
              aria-hidden="true"
            >
              scroll to browse
            </p>
          ) : null}
        </div>

        {lens && clusterAnim ? (
          <div ref={clusterStageRef} className="life-archive-intent__cluster-stage">
            {matchedIds.map((id, i) => {
              const pos = clusterAnim.items[id];
              const photo = getPhoto(id);
              if (!pos || !photo) return null;
              const isCenter = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  data-cluster-id={id}
                  className={[
                    'life-archive-intent__cluster-card',
                    isCenter ? 'is-center' : '',
                  ].join(' ')}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    zIndex: pos.z ?? (isCenter ? 3 : 2),
                    '--cluster-rot': `${pos.rot ?? 0}deg`,
                    '--cluster-scale': pos.scale ?? 1,
                    '--transition-delay': `${i * 50}ms`,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickClusterPhoto(id);
                  }}
                  aria-label={photo.title || 'Archive photograph'}
                >
                  <img
                    src={photo.imageSrc}
                    alt=""
                    className="life-archive-intent__cluster-img"
                    draggable={false}
                  />
                  <span className="life-archive-intent__cluster-hover" aria-hidden="true">
                    <span className="life-archive-intent__cluster-hover-title">{photo.title}</span>
                    <span className="life-archive-intent__cluster-hover-attn">
                      {photo.attentionType}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          className={[
            'life-archive-ink-guide',
            `life-archive-ink-guide--${guideStyle.mode}`,
            guideStyle.mode === 'idle' && guideStyle.anchor === 'card' ? 'life-archive-ink-guide--follow' : '',
            guideMoving === 'to-active' ? 'is-moving-to-active' : '',
            guideMoving === 'to-idle' ? 'is-moving-to-idle' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            guideStyle.mode === 'idle' && guideStyle.anchor !== 'card'
              ? { left: guideStyle.left, bottom: guideStyle.bottom }
              : { left: guideStyle.left, top: guideStyle.top }
          }
          aria-live="polite"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="life-archive-ink-guide__mover">
            <ArchiveGuidePresence
              thinking={thinking && Boolean(selectedId)}
              speaking={speaking}
              hovered={guideHovered}
              emotionalTone={selected?.emotionalTone}
              onHoverStart={() => setGuideHovered(true)}
              onHoverEnd={() => setGuideHovered(false)}
            />

            {displayed ? <p className="life-archive-ink-guide__text">{displayed}</p> : null}

            {showFollowUp && followUpText ? (
              <p className="life-archive-ink-guide__follow">{followUpText}</p>
            ) : null}

            {showOptions && !lens ? (
              <>
                <div className="life-archive-ink-guide__options-sep" aria-hidden="true" />
                <div className="life-archive-ink-guide__options">
                  {explorationOptions.map((opt, i) => (
                    <button
                      key={opt.lens}
                      type="button"
                      className={`life-archive-ink-guide__option${optionsVisible[i] ? ' is-visible' : ''}`}
                      onClick={() => onSelectLens(opt.lens)}
                    >
                      <span className="life-archive-ink-guide__option-arrow" aria-hidden="true">
                        →
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {showExit && lens ? (
              <div className="life-archive-ink-guide__exit">
                <button type="button" className="life-archive-ink-guide__exit-link" onClick={resetAll}>
                  ← another photo
                </button>
                {explorationOptions.length > 1 ? (
                  <>
                    <span className="life-archive-ink-guide__exit-sep" aria-hidden>
                      ·
                    </span>
                    <button
                      type="button"
                      className="life-archive-ink-guide__exit-link"
                      onClick={cycleLens}
                    >
                      try the other lens
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
