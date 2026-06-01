import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { GuideOrbWithHat } from './GuideOrb.jsx';
import {
  getGuideFlow,
  getGuideQuestionForEntry,
  GUIDE_CUSTOM_INPUT_PLACEHOLDER,
  GUIDE_ENTRY_QUESTIONS,
} from '../../data/portfolioGuideFlows.js';
import { matchGuideFlowIntent } from '../../utils/portfolioGuideIntent.js';
import '../../styles/portfolio-guide.css';

const SCROLL_SHOW_THRESHOLD = 1.2;
const TEASER_HIDE_SCROLL_RATIO = 1.02;
const TEASER_DISMISSED_KEY = 'guideTeaserDismissed';
const TEASER_OPENED_KEY = 'guideTeaserOpened';
const GUIDE_LOG_KEY = 'portfolioGuideQuestions';
const LANDING_TEASER_DELAY_MS = 1400;
const ENTRANCE_ANIM_MS = 1650;
const ORB_MOOD_CLICK_MS = 1400;

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function openCaseFromGuide(caseId) {
  window.dispatchEvent(new CustomEvent('portfolio-guide-open-case', { detail: { caseId } }));
}

function openPovSourcesFromGuide() {
  scrollToId('home-approach');
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('portfolio-guide-open-sources'));
  }, 480);
}

export function PortfolioGuide() {
  const { activeId } = useNarrativeScroll();
  const isLanding = activeId === 'home-landing';
  const isSectionGuide = activeId === 'home-life-archive';
  const isFullMode = false;
  const source = isSectionGuide ? 'section-guide' : 'landing-guide';

  if (isSectionGuide) {
    return null;
  }

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const resultScrollRef = useRef(null);
  const teaserTimerRef = useRef(null);
  const entrancePlayedRef = useRef(false);

  const [scrollVisible, setScrollVisible] = useState(false);
  const [teaserInViewportZone, setTeaserInViewportZone] = useState(true);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [teaserOpened, setTeaserOpened] = useState(false);
  const [view, setView] = useState('questions');
  const [customQuestion, setCustomQuestion] = useState('');
  const [readingQuestion, setReadingQuestion] = useState(false);
  const [resultFlowId, setResultFlowId] = useState(null);
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [orbSignalTick, setOrbSignalTick] = useState(0);
  const [orbMood, setOrbMood] = useState('neutral');
  const [entranceAnimate, setEntranceAnimate] = useState(false);
  const orbMoodTimerRef = useRef(0);

  const resultFlow = useMemo(
    () => (resultFlowId ? getGuideFlow(resultFlowId, displayQuestion) : null),
    [resultFlowId, displayQuestion],
  );

  const panelClass = useMemo(
    () =>
      ['portfolio-guide__panel', open && !closing ? 'is-open' : '', closing ? 'is-closing' : '']
        .filter(Boolean)
        .join(' '),
    [open, closing],
  );

  const pulseOrb = useCallback((strength = 'normal') => {
    setOrbSignalTick((n) => n + 1);
    if (strength === 'strong') {
      window.setTimeout(() => setOrbSignalTick((n) => n + 1), 120);
    }
  }, []);

  const flashOrbMood = useCallback((nextMood = 'warm') => {
    setOrbMood(nextMood);
    window.clearTimeout(orbMoodTimerRef.current);
    orbMoodTimerRef.current = window.setTimeout(() => setOrbMood('neutral'), ORB_MOOD_CLICK_MS);
  }, []);

  const resetOrbMood = useCallback(() => {
    window.clearTimeout(orbMoodTimerRef.current);
    setOrbMood('neutral');
  }, []);

  const saveGuideLog = useCallback(
    (input, flowId) => {
      const entry = {
        input,
        flowId,
        source,
        timestamp: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem(GUIDE_LOG_KEY) || '[]');
        localStorage.setItem(GUIDE_LOG_KEY, JSON.stringify([...existing, entry]));
      } catch {
        // noop
      }
    },
    [source],
  );

  const closePanel = useCallback(() => {
    if (!open) return;
    resetOrbMood();
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      if (!isFullMode) {
        triggerRef.current?.focus();
      }
    }, 180);
  }, [open, isFullMode, resetOrbMood]);

  const openPanel = useCallback(() => {
    setClosing(false);
    setOpen(true);
    setTeaserVisible(false);
    setTeaserOpened(true);
    try {
      sessionStorage.setItem(TEASER_OPENED_KEY, 'true');
    } catch {
      // noop
    }
    setView('questions');
    setResultFlowId(null);
    setDisplayQuestion('');
    pulseOrb();
    flashOrbMood('warm');
    window.requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    });
  }, [pulseOrb, flashOrbMood]);

  const togglePanel = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (open) closePanel();
      else openPanel();
    },
    [open, closePanel, openPanel],
  );

  const runDestination = useCallback(
    (action) => {
      if (!action) return;
      flashOrbMood('warm');
      if (action.type === 'section') {
        scrollToId(action.id);
      } else if (action.type === 'case') {
        const ok = scrollToId('home-work-narrative');
        if (ok) {
          window.setTimeout(() => openCaseFromGuide(action.id), 420);
        } else {
          openCaseFromGuide(action.id);
        }
      }
      closePanel();
    },
    [closePanel, flashOrbMood],
  );

  const showFlowResult = useCallback(
    (flowId, question) => {
      const flow = getGuideFlow(flowId, question);
      if (!flow) return;
      setResultFlowId(flow.id);
      setDisplayQuestion(flow.question);
      setView('result');
      pulseOrb('strong');
      flashOrbMood('warm');
      saveGuideLog(flow.question, flow.id);
      window.requestAnimationFrame(() => {
        resultScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [saveGuideLog, pulseOrb, flashOrbMood],
  );

  const handleEntryQuestion = (entry) => {
    flashOrbMood('warm');
    showFlowResult(entry.flowId, getGuideQuestionForEntry(entry.flowId));
  };

  const handleFollowUp = (followUp) => {
    flashOrbMood('warm');
    showFlowResult(followUp.flowId, followUp.label);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const question = customQuestion.trim();
    if (!question) return;
    pulseOrb('strong');
    flashOrbMood('warm');
    setReadingQuestion(true);
    window.setTimeout(() => {
      const { flowId, question: matchedQuestion } = matchGuideFlowIntent(question);
      showFlowResult(flowId, matchedQuestion);
      setReadingQuestion(false);
    }, 300);
  };

  const dismissTeaser = () => {
    setTeaserDismissed(true);
    setTeaserVisible(false);
    try {
      sessionStorage.setItem(TEASER_DISMISSED_KEY, 'true');
    } catch {
      // noop
    }
  };

  useEffect(
    () => () => {
      window.clearTimeout(orbMoodTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const onScroll = () => {
      setScrollVisible(window.scrollY > window.innerHeight * SCROLL_SHOW_THRESHOLD);
      setTeaserInViewportZone(window.scrollY < window.innerHeight * TEASER_HIDE_SCROLL_RATIO);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      setTeaserDismissed(sessionStorage.getItem(TEASER_DISMISSED_KEY) === 'true');
      setTeaserOpened(sessionStorage.getItem(TEASER_OPENED_KEY) === 'true');
    } catch {
      setTeaserDismissed(false);
      setTeaserOpened(false);
    }
  }, []);

  useEffect(() => {
    if (teaserDismissed || teaserOpened || !isLanding || isFullMode) {
      setTeaserVisible(false);
      if (teaserTimerRef.current) window.clearTimeout(teaserTimerRef.current);
      return;
    }
    teaserTimerRef.current = window.setTimeout(() => {
      setTeaserVisible(true);
    }, LANDING_TEASER_DELAY_MS);
    return () => {
      if (teaserTimerRef.current) window.clearTimeout(teaserTimerRef.current);
    };
  }, [isLanding, teaserDismissed, teaserOpened, isFullMode]);

  const shouldShowRoot = scrollVisible || teaserVisible || isLanding || open;
  const greetingActive = isLanding && !open && (entranceAnimate || teaserVisible) && teaserInViewportZone;

  useEffect(() => {
    if (!shouldShowRoot || entrancePlayedRef.current) return undefined;
    entrancePlayedRef.current = true;
    setEntranceAnimate(true);
    const t = window.setTimeout(() => setEntranceAnimate(false), ENTRANCE_ANIM_MS);
    return () => window.clearTimeout(t);
  }, [shouldShowRoot]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      closePanel();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closePanel]);

  const evidenceCount = resultFlow?.evidence?.length ?? 0;

  return (
    <div
      ref={rootRef}
      className={`portfolio-guide${shouldShowRoot ? ' is-visible' : ''}${open ? ' is-open' : ''}${entranceAnimate ? ' is-entering' : ''}${isFullMode ? ' is-full-mode' : ''}`}
    >
      {open && !isFullMode ? <div className="portfolio-guide__backdrop" onClick={closePanel} aria-hidden="true" /> : null}

      {teaserVisible && teaserInViewportZone && !open && !isFullMode ? (
        <div className="portfolio-guide__teaser" role="status" aria-live="polite">
          <button
            type="button"
            className="portfolio-guide__teaser-close"
            onClick={dismissTeaser}
            aria-label="Dismiss guide teaser"
          >
            ×
          </button>
          <p className="portfolio-guide__teaser-line">Hi.</p>
          <p className="portfolio-guide__teaser-line">Need a faster way in?</p>
          <button type="button" className="portfolio-guide__teaser-cta" onClick={openPanel}>
            Open guide →
          </button>
        </div>
      ) : null}

      <div className="portfolio-guide__panel-wrap">
        <div ref={panelRef} className={panelClass} role="dialog" aria-label="Portfolio guide" aria-hidden={!open}>
          <div
            className={`portfolio-guide__module${view === 'result' ? ' portfolio-guide__module--result' : ''}`}
          >
            <header className="portfolio-guide__head">
              <div className="portfolio-guide__head-copy">
                <p className="portfolio-guide__section-label">05 · Portfolio Guide</p>
                {view === 'questions' ? (
                  <h3 className="portfolio-guide__headline">
                    <span>Start with what you need to decide.</span>
                    <span>Pick a lens, or ask your own.</span>
                  </h3>
                ) : null}
              </div>
              <div
                className={`portfolio-guide__orb-inline${view === 'result' ? ' portfolio-guide__orb-inline--pulse' : ''}`}
                aria-hidden="true"
              >
                <GuideOrbWithHat
                  size={26}
                  bright
                  followCursor={false}
                  blink={orbSignalTick % 2 === 1}
                  alive
                  mood={orbMood}
                  scrollReactive
                  thinking={readingQuestion}
                />
              </div>
            </header>

            {view === 'questions' ? (
              <ul className="portfolio-guide__cards" aria-label="Portfolio guide entry questions">
                {GUIDE_ENTRY_QUESTIONS.map((item) => (
                  <li key={item.id} className="portfolio-guide__card-item">
                    <button type="button" className="portfolio-guide__card" onClick={() => handleEntryQuestion(item)}>
                      <span className="portfolio-guide__card-kicker">{item.num}</span>
                      <span className="portfolio-guide__card-title">{getGuideQuestionForEntry(item.flowId)}</span>
                      <span className="portfolio-guide__card-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </li>
                ))}
                <li className="portfolio-guide__card-item portfolio-guide__card-item--input">
                  <form className="portfolio-guide__input-card" onSubmit={handleCustomSubmit}>
                    <div className="portfolio-guide__input-row">
                      <span className="portfolio-guide__custom-arrow" aria-hidden="true">
                        →
                      </span>
                      <input
                        id="portfolio-guide-custom"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="portfolio-guide__custom-input"
                        placeholder={GUIDE_CUSTOM_INPUT_PLACEHOLDER}
                        aria-label="Ask your own evaluation question"
                      />
                      <button type="submit" className="portfolio-guide__custom-submit" aria-label="Submit question">
                        Go
                      </button>
                    </div>
                  </form>
                </li>
              </ul>
            ) : (
              <section
                ref={resultScrollRef}
                className="portfolio-guide__result"
                aria-label="Guide evaluation"
              >
                <div className="portfolio-guide__result-context">
                  <button
                    type="button"
                    className="portfolio-guide__back"
                    onClick={() => {
                      setView('questions');
                      setResultFlowId(null);
                      setDisplayQuestion('');
                    }}
                  >
                    ← Back
                  </button>
                  <p className="portfolio-guide__result-label">You asked</p>
                  <p className="portfolio-guide__result-question">{resultFlow?.question}</p>
                </div>

                <div className="portfolio-guide__result-answer">
                  <p className="portfolio-guide__result-answer-label">Guide</p>
                  <p className="portfolio-guide__result-claim">{resultFlow?.guideTitle}</p>
                  {resultFlow?.guideSubline ? (
                    <p className="portfolio-guide__result-support">{resultFlow.guideSubline}</p>
                  ) : null}
                </div>

                {resultFlow?.why?.length ? (
                  <div className="portfolio-guide__result-block">
                    <p className="portfolio-guide__result-block-label">Why this matters</p>
                    <div className="portfolio-guide__result-copy">
                      {resultFlow.why.map((paragraph) => (
                        <p key={paragraph} className="portfolio-guide__result-paragraph">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {resultFlow?.how?.length ? (
                  <div className="portfolio-guide__result-block">
                    <p className="portfolio-guide__result-block-label">How she works</p>
                    {resultFlow.howIntro ? (
                      <p className="portfolio-guide__result-paragraph">{resultFlow.howIntro}</p>
                    ) : null}
                    <ul className="portfolio-guide__result-list">
                      {resultFlow.how.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {resultFlow?.evidence?.length ? (
                  <div className="portfolio-guide__path-module">
                    <p className="portfolio-guide__path-module-head">
                      <span className="portfolio-guide__path-module-title">Evidence to look at</span>
                      <span className="portfolio-guide__path-module-meta">
                        {evidenceCount} {evidenceCount === 1 ? 'step' : 'steps'}
                      </span>
                    </p>
                    <ol className="portfolio-guide__path-track">
                      {resultFlow.evidence.map((item) => (
                        <li key={`${item.step}-${item.label}`} className="portfolio-guide__path-track-item">
                          <button
                            type="button"
                            className="portfolio-guide__path-node"
                            onClick={() => runDestination(item.action)}
                          >
                            <span className="portfolio-guide__path-step">{item.step}</span>
                            <span className="portfolio-guide__path-copy">
                              <span className="portfolio-guide__path-title">{item.label}</span>
                              <span className="portfolio-guide__path-desc">{item.description}</span>
                            </span>
                            <span className="portfolio-guide__path-open" aria-hidden="true">
                              ↗
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {resultFlow?.followUps?.length ? (
                  <div className="portfolio-guide__followups">
                    <p className="portfolio-guide__result-block-label">Ask next</p>
                    <div className="portfolio-guide__followup-chips" role="group" aria-label="Follow-up questions">
                      {resultFlow.followUps.map((item) => (
                        <button
                          key={item.flowId}
                          type="button"
                          className="portfolio-guide__followup-chip"
                          onClick={() => handleFollowUp(item)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="portfolio-guide__sources">
                  <p className="portfolio-guide__result-block-label">Sources</p>
                  {resultFlow?.sources?.length ? (
                    <ul className="portfolio-guide__sources-list">
                      {resultFlow.sources.map((sourceItem) => (
                        <li key={sourceItem.id}>{sourceItem.citation}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="portfolio-guide__result-paragraph portfolio-guide__result-paragraph--muted">
                      Framework references live in Point of View.
                    </p>
                  )}
                  <button type="button" className="portfolio-guide__sources-btn" onClick={openPovSourcesFromGuide}>
                    View sources in Point of View →
                  </button>
                </div>
              </section>
            )}

            {readingQuestion ? (
              <p className="portfolio-guide__reading" aria-live="polite">
                Reading question...
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {!open && !isFullMode ? (
        <div className="portfolio-guide__trigger-wrap">
          <button
            ref={triggerRef}
            type="button"
            className={`portfolio-guide__trigger${entranceAnimate ? ' is-entrance-once' : ''}`}
            aria-label="Open portfolio guide"
            aria-expanded={open}
            onClick={togglePanel}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
          >
            <GuideOrbWithHat
              size={46}
              bright={hovered}
              followCursor
              blink={orbSignalTick % 2 === 1}
              alive
              mood={orbMood}
              scrollReactive
              greeting={greetingActive}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
