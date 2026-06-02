import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePovArchiveHandoff } from '../../context/PovArchiveHandoffContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { lifePhotoMetadata } from '../../data/lifePhotoMetadata.js';
import { LIFE_ARCHIVE_COPY } from '../../data/lifeArchiveViews.js';
import { rotationFromId, scaleFromId } from '../../utils/lifeArchiveInteraction.js';
import {
  archiveFragmentSettleStyle,
  archiveFragmentStyle,
  beyondWorkEntranceLayers,
} from '../../utils/povArchiveHandoff.js';
import { LifeArchiveConnectionView } from './LifeArchiveConnectionView.jsx';

import { GuideOrb } from '../home/GuideOrb.jsx';

const STAGGERED_CARD_COUNT = 5;

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

function ArchiveGuidePresence({ hovered, emotionalTone, onHoverStart, onHoverEnd }) {
  return (
    <div className="life-archive-ink-guide__presence">
      <RedHatGuideFigure
        thinking={false}
        speaking={false}
        hovered={hovered}
        emotionalTone={emotionalTone}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />
    </div>
  );
}

export function LifeArchiveExperience() {
  const { handoff, reducedMotion } = usePovArchiveHandoff();
  const { activeId } = useNarrativeScroll();
  const inArchiveChapter = activeId === 'home-life-archive';
  const revealProgress = inArchiveChapter ? 1 : handoff;
  const entrance = useMemo(
    () => beyondWorkEntranceLayers(revealProgress, reducedMotion),
    [revealProgress, reducedMotion],
  );
  const fieldRef = useRef(null);
  const scrollerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  /** @type {import('../../utils/lifeArchiveConnections.js').ConnectionLensKey} */
  const [connectionLens, setConnectionLens] = useState('category');
  const [guideStyle, setGuideStyle] = useState({ mode: 'idle' });
  const [guideHovered, setGuideHovered] = useState(false);
  const browseHoverIdRef = useRef(null);
  const [scrollHintVisible, setScrollHintVisible] = useState(true);

  const updateGuidePosition = useCallback(() => {
    const field = fieldRef.current;
    if (!field || selectedId) return;
    const fieldRect = field.getBoundingClientRect();

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
  }, [selectedId]);

  const onBrowsePointerMove = useCallback(
    (e) => {
      if (selectedId) return;
      const card = e.target.closest('.life-archive-intent__card');
      const id = card?.getAttribute('data-intent-id') ?? null;
      if (!id || browseHoverIdRef.current === id) return;
      browseHoverIdRef.current = id;
      requestAnimationFrame(updateGuidePosition);
    },
    [selectedId, updateGuidePosition],
  );

  const onBrowsePointerLeave = useCallback(() => {
    if (!browseHoverIdRef.current) return;
    browseHoverIdRef.current = null;
    requestAnimationFrame(updateGuidePosition);
  }, [updateGuidePosition]);

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

  const resetAll = useCallback(() => {
    setSelectedId(null);
    setConnectionLens('category');
    setScrollHintVisible(true);
    browseHoverIdRef.current = null;
  }, []);

  const onPickPhoto = useCallback((id) => {
    browseHoverIdRef.current = null;
    setSelectedId(id);
    setConnectionLens('category');
  }, []);

  const onSelectFragment = useCallback((id) => {
    setSelectedId(id);
    setConnectionLens('category');
  }, []);

  return (
    <div className="life-archive-intent">
      <header className="life-archive-intent__header">
        <h2
          id="life-archive-title"
          className="life-archive-intent__title"
          style={entrance.archiveTitle}
        >
          {LIFE_ARCHIVE_COPY.title}
        </h2>
        <p className="life-archive-intent__subtitle" style={entrance.archiveSubtitle}>
          {LIFE_ARCHIVE_COPY.subtitle}
        </p>
        {!selectedId ? (
          <p className="life-archive-intent__instruction" style={entrance.instruction}>
            Pick one. See where it connects.
          </p>
        ) : null}
      </header>

      <div
        ref={fieldRef}
        className={[
          'life-archive-intent__field',
          selectedId ? 'life-archive-intent__field--connection' : 'life-archive-intent__field--idle',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {selectedId ? (
          <LifeArchiveConnectionView
            selectedId={selectedId}
            activeLens={connectionLens}
            onLensChange={setConnectionLens}
            onSelectFragment={onSelectFragment}
            onBack={resetAll}
          />
        ) : (
          <>
            <div className="life-archive-intent__scroller-wrap" style={entrance.fieldWrap}>
              <div className="life-archive-intent__edge life-archive-intent__edge--left" aria-hidden />
              <div className="life-archive-intent__edge life-archive-intent__edge--right" aria-hidden />

              <div
                ref={scrollerRef}
                className="life-archive-intent__scroller"
                tabIndex={0}
                role="region"
                aria-label="Life archive — scroll horizontally to browse photographs"
                onPointerMove={onBrowsePointerMove}
                onPointerLeave={onBrowsePointerLeave}
              >
                <div className="life-archive-intent__row">
                  {lifePhotoMetadata.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      data-intent-id={photo.id}
                      className="life-archive-intent__card"
                      style={{
                        '--intent-rot': `${rotationFromId(photo.id)}deg`,
                        '--intent-scale': scaleFromId(photo.id),
                        zIndex: index + 1,
                        ...(index < STAGGERED_CARD_COUNT
                          ? archiveFragmentStyle(
                              revealProgress,
                              index,
                              STAGGERED_CARD_COUNT,
                              reducedMotion,
                            )
                          : archiveFragmentSettleStyle(
                              revealProgress,
                              index - STAGGERED_CARD_COUNT,
                              lifePhotoMetadata.length - STAGGERED_CARD_COUNT,
                              reducedMotion,
                            )),
                      }}
                      onClick={() => onPickPhoto(photo.id)}
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
                      <span className="life-archive-intent__hover-cap" aria-hidden>
                        <span className="life-archive-intent__hover-title">{photo.title}</span>
                        <span className="life-archive-intent__hover-attn">{photo.attentionType}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p
                className={`life-archive-intent__scroll-hint${scrollHintVisible ? ' is-visible' : ''}`}
                aria-hidden="true"
                style={entrance.scrollHint}
              >
                scroll to browse
              </p>
            </div>

            <div
              className={[
                'life-archive-ink-guide',
                'life-archive-ink-guide--idle',
                guideStyle.anchor === 'card' ? 'life-archive-ink-guide--follow' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                ...(guideStyle.anchor === 'card'
                  ? { left: guideStyle.left, top: guideStyle.top }
                  : { left: guideStyle.left, bottom: guideStyle.bottom }),
                ...entrance.guide,
              }}
              aria-hidden="true"
            >
              <ArchiveGuidePresence
                hovered={guideHovered}
                emotionalTone={undefined}
                onHoverStart={() => setGuideHovered(true)}
                onHoverEnd={() => setGuideHovered(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
