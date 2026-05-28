import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { GuideOrbWithHat } from './GuideOrb.jsx';
import '../../styles/portfolio-guide.css';

const SCROLL_SHOW_THRESHOLD = 1.2;
const TEASER_HIDE_SCROLL_RATIO = 1.02;
const TEASER_DISMISSED_KEY = 'guideTeaserDismissed';
const TEASER_OPENED_KEY = 'guideTeaserOpened';
const GUIDE_LOG_KEY = 'portfolioGuideQuestions';
const LANDING_TEASER_DELAY_MS = 1400;
const ENTRANCE_ANIM_MS = 1650;
const ORB_MOOD_CLICK_MS = 1400;

const PRESET_OPTIONS = [
  {
    id: 'q1',
    num: '01',
    question: 'Can she work where the AI brief is broken?',
    matchedPath: 'capabilities',
    guideMain: 'She works before the brief is clear.',
    guideSupport:
      'Where AI capability, workflow, ownership, and next steps are still undefined.',
  },
  {
    id: 'q2',
    num: '02',
    question: 'Where does she place the real design problem?',
    matchedPath: 'pointOfView',
    guideMain: 'She places the design problem before the interface.',
    guideSupport:
      'Where AI output becomes decision, responsibility, continuation, or completion.',
  },
  {
    id: 'q3',
    num: '03',
    question: 'What keeps shaping her eye?',
    matchedPath: 'beyond',
    guideMain: 'Her eye is shaped outside formal project work.',
    guideSupport:
      'Through visual fragments, everyday behavior, and product ideas that keep asking to be connected.',
  },
];

const ROUTE_CONFIG = {
  capabilities: {
    node1: {
      title: 'Capabilities',
      description: 'How she turns ambiguity into structure.',
      action: { type: 'section', id: 'home-capabilities' },
    },
    node2: {
      title: 'Case 03 · Supply Chain Agents',
      description: 'How she defines control in agentic workflows.',
      action: { type: 'case', id: 'case03' },
    },
  },
  pointOfView: {
    node1: {
      title: 'Point of View',
      description: 'How she defines the real design layer.',
      action: { type: 'section', id: 'home-approach' },
    },
    node2: {
      title: 'Case 02 · Contract Intelligence',
      description: 'How AI analysis becomes reviewable judgment.',
      action: { type: 'case', id: 'case02' },
    },
  },
  beyond: {
    node1: {
      title: 'Beyond the Work',
      description: 'The visual archive behind her way of seeing.',
      action: { type: 'section', id: 'home-life-archive' },
    },
    node2: {
      title: 'Resoa',
      description: 'Where pattern recognition becomes a product direction.',
      action: { type: 'section', id: 'home-beyond-resoa' },
    },
  },
  fallback: {
    node1: {
      title: 'Point of View',
      description: 'How she defines the real design layer.',
      action: { type: 'section', id: 'home-approach' },
    },
    node2: {
      title: 'Selected Work',
      description: 'The project evidence behind the judgment.',
      action: { type: 'section', id: 'home-work-narrative' },
    },
  },
};

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function openCaseFromGuide(caseId) {
  window.dispatchEvent(new CustomEvent('portfolio-guide-open-case', { detail: { caseId } }));
}

function splitGuideText(text) {
  const normalized = String(text ?? '').trim();
  if (!normalized) return { guideMain: '', guideSupport: '' };

  const emDash = normalized.indexOf(' — ');
  if (emDash !== -1) {
    const main = normalized.slice(0, emDash).trim();
    const support = normalized.slice(emDash + 3).trim();
    return {
      guideMain: /[.!?]$/.test(main) ? main : `${main}.`,
      guideSupport: support,
    };
  }

  const sentence = normalized.match(/^(.+?[.!?])\s+(.+)$/s);
  if (sentence) {
    return { guideMain: sentence[1].trim(), guideSupport: sentence[2].trim() };
  }

  return { guideMain: normalized, guideSupport: '' };
}

function detectRoute(input) {
  const text = String(input ?? '').toLowerCase();
  const contains = (terms) => terms.some((term) => text.includes(term));

  if (
    contains([
      'capability',
      'skill',
      'can she',
      'complex',
      'messy',
      'brief',
      'workflow',
      'handoff',
      'enterprise',
      'agent',
      'agentic',
      'execution',
      'control',
      'ai project',
    ])
  ) {
    return {
      matchedPath: 'capabilities',
      guideMain: 'She works before the brief is clear.',
      guideSupport:
        'Where AI capability, workflow, ownership, and next steps are still undefined.',
    };
  }
  if (
    contains([
      'think',
      'judgment',
      'point of view',
      'approach',
      'strategy',
      'ai strategy',
      'philosophy',
      'responsibility',
      'completion',
      'traceability',
      'trust',
      'principle',
      'problem',
      'interface',
    ])
  ) {
    return {
      matchedPath: 'pointOfView',
      guideText:
        'You are looking for how she thinks before the interface — where AI output becomes responsibility, decision, control, or continuity.',
    };
  }
  if (
    contains([
      'who',
      'person',
      'background',
      'eye',
      'taste',
      'inspiration',
      'archive',
      'resoa',
      'creator',
      'outside',
      'motivation',
    ])
  ) {
    return {
      matchedPath: 'beyond',
      guideMain: 'Her eye is shaped outside formal project work.',
      guideSupport:
        'Through visual fragments, everyday behavior, and product ideas that keep asking to be connected.',
    };
  }
  return {
    matchedPath: 'fallback',
    guideMain: 'Start with how she thinks.',
    guideSupport: 'Then inspect the proof in the work.',
  };
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
  const [result, setResult] = useState(null);
  const [orbSignalTick, setOrbSignalTick] = useState(0);
  const [orbMood, setOrbMood] = useState('neutral');
  const [entranceAnimate, setEntranceAnimate] = useState(false);
  const orbMoodTimerRef = useRef(0);

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
      setTimeout(() => setOrbSignalTick((n) => n + 1), 120);
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
    (input, matchedPath) => {
      const entry = {
        input,
        matchedPath,
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
    setResult(null);
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

  const runRouteResult = useCallback(
    ({ question, matchedPath, guideMain, guideSupport }) => {
      const route = ROUTE_CONFIG[matchedPath] ?? ROUTE_CONFIG.fallback;
      setResult({
        question,
        guideMain,
        guideSupport,
        matchedPath,
        route,
      });
      setView('result');
      pulseOrb('strong');
      flashOrbMood('warm');
      saveGuideLog(question, matchedPath);
    },
    [saveGuideLog, pulseOrb, flashOrbMood],
  );

  const handlePreset = (item) => {
    flashOrbMood('warm');
    runRouteResult({
      question: item.question,
      matchedPath: item.matchedPath,
      guideMain: item.guideMain,
      guideSupport: item.guideSupport,
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const question = customQuestion.trim();
    if (!question) return;
    pulseOrb('strong');
    flashOrbMood('warm');
    setReadingQuestion(true);
    window.setTimeout(() => {
      const routed = detectRoute(question);
      const guide =
        routed.guideMain != null
          ? { guideMain: routed.guideMain, guideSupport: routed.guideSupport ?? '' }
          : splitGuideText(routed.guideText);
      runRouteResult({
        question,
        matchedPath: routed.matchedPath,
        guideMain: guide.guideMain,
        guideSupport: guide.guideSupport,
      });
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

  /** Orb entrance — runs once whenever the guide first becomes visible (any chapter). */
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
                    <span>Start with what you want to know.</span>
                    <span>Pick an angle, or ask your own.</span>
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
                />
              </div>
            </header>

            {view === 'questions' ? (
              <ul className="portfolio-guide__cards" aria-label="Portfolio guide entry questions">
                {PRESET_OPTIONS.map((item) => (
                  <li key={item.id} className="portfolio-guide__card-item">
                    <button type="button" className="portfolio-guide__card" onClick={() => handlePreset(item)}>
                      <span className="portfolio-guide__card-kicker">{item.num}</span>
                      <span className="portfolio-guide__card-title">{item.question}</span>
                      <span className="portfolio-guide__card-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </li>
                ))}
                <li className="portfolio-guide__card-item">
                  <form className="portfolio-guide__input-card" onSubmit={handleCustomSubmit}>
                    <div className="portfolio-guide__input-row-label">
                      <span className="portfolio-guide__card-kicker">04</span>
                      <span className="portfolio-guide__card-title">Something else on your mind?</span>
                    </div>
                    <div className="portfolio-guide__input-row">
                      <span className="portfolio-guide__custom-arrow" aria-hidden="true">
                        →
                      </span>
                      <input
                        id="portfolio-guide-custom"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="portfolio-guide__custom-input"
                        placeholder="e.g. agentic workflows · AI strategy · who is she"
                      />
                      <button type="submit" className="portfolio-guide__custom-submit" aria-label="Submit question">
                        Go
                      </button>
                    </div>
                  </form>
                </li>
              </ul>
            ) : (
              <section className="portfolio-guide__result" aria-label="Guide result">
                <div className="portfolio-guide__result-context">
                  <button
                    type="button"
                    className="portfolio-guide__back"
                    onClick={() => {
                      setView('questions');
                      setResult(null);
                    }}
                  >
                    ← Back
                  </button>
                  <p className="portfolio-guide__result-label">You asked</p>
                  <p className="portfolio-guide__result-question">{result?.question}</p>
                </div>

                <div className="portfolio-guide__result-answer">
                  <p className="portfolio-guide__result-answer-label">Guide</p>
                  <p className="portfolio-guide__result-claim">{result?.guideMain}</p>
                  {result?.guideSupport ? (
                    <p className="portfolio-guide__result-support">{result.guideSupport}</p>
                  ) : null}
                </div>

                <div className="portfolio-guide__path-module">
                  <p className="portfolio-guide__path-module-head">
                    <span className="portfolio-guide__path-module-title">Recommended path</span>
                    <span className="portfolio-guide__path-module-meta">2 steps</span>
                  </p>
                  <ol className="portfolio-guide__path-track">
                    <li className="portfolio-guide__path-track-item">
                      <button
                        type="button"
                        className="portfolio-guide__path-node"
                        onClick={() => runDestination(result?.route?.node1?.action)}
                      >
                        <span className="portfolio-guide__path-step">01</span>
                        <span className="portfolio-guide__path-copy">
                          <span className="portfolio-guide__path-title">{result?.route?.node1?.title}</span>
                          <span className="portfolio-guide__path-desc">
                            {result?.route?.node1?.description}
                          </span>
                        </span>
                        <span className="portfolio-guide__path-open" aria-hidden="true">
                          ↗
                        </span>
                      </button>
                    </li>
                    <li className="portfolio-guide__path-track-item">
                      <button
                        type="button"
                        className="portfolio-guide__path-node"
                        onClick={() => runDestination(result?.route?.node2?.action)}
                      >
                        <span className="portfolio-guide__path-step">02</span>
                        <span className="portfolio-guide__path-copy">
                          <span className="portfolio-guide__path-title">{result?.route?.node2?.title}</span>
                          <span className="portfolio-guide__path-desc">
                            {result?.route?.node2?.description}
                          </span>
                        </span>
                        <span className="portfolio-guide__path-open" aria-hidden="true">
                          ↗
                        </span>
                      </button>
                    </li>
                  </ol>
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
            className={`portfolio-guide__trigger${entranceAnimate ? ' is-entrance-once' : ''}${greetingActive ? ' is-greeting' : ''}`}
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
