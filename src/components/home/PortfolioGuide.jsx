import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useShortcutHandleIdlePeek } from '../../hooks/useShortcutHandleIdlePeek.js';
import { usePortfolioShortcutSurface } from '../../hooks/usePortfolioShortcutSurface.js';
import { useScrollActivityPause } from '../../hooks/useScrollActivityPause.js';
import { useShortcutProximity } from '../../hooks/useShortcutProximity.js';
import { createPortal } from 'react-dom';
import { getPortfolioGuidePortalNode } from '../../utils/portfolioGuidePortal.js';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { PortfolioGuideOrbSync } from './PortfolioGuideOrbSync.jsx';
import {
  getGuideFlow,
  getFlowPresentation,
  getGuideQuestionForEntry,
} from '../../data/portfolioGuideFlows.js';
import {
  GUIDE_RESULT_SECTIONS,
  SHORTCUT_ASK_CHIPS,
  SHORTCUT_CHIP_QUERIES,
  SHORTCUT_DIRECT_CASES,
  SHORTCUT_ENTRY,
  SHORTCUT_ROUTES,
  SHORTCUT_SECTIONS,
  matchShortcutRoute,
} from '../../data/portfolioGuideSystem.js';
import { ShortcutRoutePanel } from './ShortcutRoutePanel.jsx';
import {
  getFreeGuideAnswer,
  matchExplicitPresetFlowId,
} from '../../utils/getFreeGuideAnswer.js';
import {
  actionToTargetId,
  activateGuideTarget,
  clearPreviewTarget,
  previewTarget,
  scrollToGuideAction,
} from '../../utils/portfolioGuideTarget.js';
import { ShortcutMarkerArt } from './ShortcutMarker.jsx';
import { useGuidePathsReveal } from '../../hooks/useGuidePathsReveal.js';
import {
  animateGuideHomeEnter,
  animateGuideRouteExpand,
} from '../../utils/portfolioGuideMotion.js';
import '../../styles/portfolio-guide.css';
import '../../styles/portfolio-shortcut-marker.css';
import { useMobileHomeMode } from '../../utils/mobileHomeMode.js';
import { MobilePortfolioShortcut } from './MobilePortfolioShortcut.jsx';

gsap.registerPlugin(useGSAP);

const GUIDE_LOG_KEY = 'portfolioGuideQuestions';
const ORB_MOOD_CLICK_MS = 1400;
const PANEL_CLOSE_MS = 520;
const PANEL_PULL_MS = 480;
const GUIDE_PROCESSING_MS = 520;
const PANEL_ENTER_MS = 880;
const ROUTE_EXPAND_MS = 300;
const PEEK_COOLDOWN_MS = 3200;

/**
 * @param {{
 *   answer: import('../../utils/getFreeGuideAnswer.js').FreeGuideAnswer,
 *   onEvidencePointerEnter: (action: { type: string, id: string }) => void,
 *   onEvidencePointerLeave: (action: { type: string, id: string }) => void,
 *   onEvidenceClick: (event: React.MouseEvent, action: { type: string, id: string }) => void,
 * }} props
 */
function GuideFollowUpAnswer({
  answer,
  onEvidencePointerEnter,
  onEvidencePointerLeave,
  onEvidenceClick,
  pathsRevealing = false,
}) {
  const followUpRef = useGuidePathsReveal(pathsRevealing, {
    itemSelector: '.portfolio-guide__followup-links li',
  });

  return (
    <div ref={followUpRef} className="portfolio-guide__followup-answer" aria-live="polite">
      <p className="portfolio-guide__result-block-label">{GUIDE_RESULT_SECTIONS.followUp}</p>
      <p className="portfolio-guide__followup-title">{answer.title}</p>
      <p className="portfolio-guide__followup-short">{answer.shortAnswer}</p>
      {answer.points?.length ? (
        <>
          <p className="portfolio-guide__followup-where-label">{GUIDE_RESULT_SECTIONS.whyHediFits}</p>
          <ul className="portfolio-guide__followup-points">
            {answer.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </>
      ) : null}
      {answer.whereToLook?.length ? (
        <div className="portfolio-guide__followup-where">
          <p className="portfolio-guide__followup-where-label">{GUIDE_RESULT_SECTIONS.whereToLook}</p>
          <ul className="portfolio-guide__followup-links">
            {answer.whereToLook.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="portfolio-guide__followup-link"
                  onPointerEnter={() => onEvidencePointerEnter(item.action)}
                  onPointerLeave={() => onEvidencePointerLeave(item.action)}
                  onClick={(event) => onEvidenceClick(event, item.action)}
                >
                  <span className="portfolio-guide__followup-link-label">{item.label}</span>
                  <span className="portfolio-guide__followup-link-desc">{item.description}</span>
                  <span className="portfolio-guide__followup-link-open" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {answer.closingLine ? (
        <p className="portfolio-guide__followup-closing">{answer.closingLine}</p>
      ) : null}
    </div>
  );
}

function GuideAskResult({
  question,
  matchedRoute,
  matchReason,
  evidence,
  onBack,
  onRouteSelect,
  onEvidencePointerEnter,
  onEvidencePointerLeave,
  onEvidenceClick,
}) {
  return (
    <section className="portfolio-guide__ask-result" aria-label="Ask result">
      <nav className="portfolio-guide__route-panel-nav" aria-label="Back">
        <button type="button" className="portfolio-guide__back portfolio-guide__back--nav" onClick={onBack}>
          ← Back
        </button>
      </nav>

      <p className="portfolio-guide__ask-result-query">{question}</p>

      {matchedRoute ? (
        <div className="portfolio-guide__ask-result-route">
          <p className="portfolio-guide__block-label portfolio-guide__block-label--secondary">
            {SHORTCUT_SECTIONS.bestMatchingRoute}
          </p>
          <button
            type="button"
            className="portfolio-guide__route-row portfolio-guide__route-row--featured"
            onClick={() => onRouteSelect(matchedRoute.id)}
          >
            <span className="portfolio-guide__route-row-index">{matchedRoute.index}</span>
            <span className="portfolio-guide__route-row-copy">
              <span className="portfolio-guide__route-row-title">{matchedRoute.title}</span>
              <span className="portfolio-guide__route-row-signal">{matchedRoute.signal}</span>
            </span>
            <span className="portfolio-guide__route-row-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        </div>
      ) : null}

      {matchReason ? (
        <p className="portfolio-guide__ask-result-reason">
          <span className="portfolio-guide__ask-result-reason-label">{SHORTCUT_SECTIONS.matchReason}</span>
          {matchReason}
        </p>
      ) : null}

      {evidence?.length ? (
        <div className="portfolio-guide__ask-result-evidence">
          <p className="portfolio-guide__block-label portfolio-guide__block-label--secondary">
            {SHORTCUT_SECTIONS.relevantEvidence}
          </p>
          <ul className="portfolio-guide__route-evidence-list">
            {evidence.map((item, i) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="portfolio-guide__route-evidence-link"
                  onPointerEnter={() => onEvidencePointerEnter(item.action)}
                  onPointerLeave={() => onEvidencePointerLeave(item.action)}
                  onClick={(event) => onEvidenceClick(event, item.action)}
                >
                  <span className="portfolio-guide__route-evidence-copy">
                    <span className="portfolio-guide__route-evidence-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="portfolio-guide__route-evidence-text">
                      <span className="portfolio-guide__route-evidence-label">{item.label}</span>
                      <span className="portfolio-guide__route-evidence-signal">{item.description}</span>
                    </span>
                  </span>
                  <span className="portfolio-guide__route-evidence-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

const GUIDE_TRIGGER_MODE =
  typeof import.meta.env.VITE_GUIDE_TRIGGER_MODE === 'string'
    ? import.meta.env.VITE_GUIDE_TRIGGER_MODE.toLowerCase()
    : 'normal';

export function PortfolioGuide() {
  const isMobileHome = useMobileHomeMode();
  const { activeId } = useNarrativeScroll();
  const { setGuideOpen } = useOrbScene();

  useLayoutEffect(() => {
    getPortfolioGuidePortalNode();
  }, []);

  const isOpeningChapter =
    activeId === 'home-landing' || activeId === 'home-capabilities';
  const isFullMode = false;
  const triggerSubtle = GUIDE_TRIGGER_MODE === 'subtle';
  const source =
    activeId === 'home-life-archive' ? 'section-guide' : 'landing-guide';

  useEffect(() => {
    if (activeId === 'home-life-archive') setGuideOpen(false);
  }, [activeId, setGuideOpen]);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const moduleRef = useRef(null);
  const panelBodyRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hintSuppressed, setHintSuppressed] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [pulling, setPulling] = useState(false);
  const pullTimerRef = useRef(0);
  const [view, setView] = useState('home');
  const [routeExpandId, setRouteExpandId] = useState(null);
  const [angleResultId, setAngleResultId] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [resultFlowId, setResultFlowId] = useState(null);
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState(null);
  const [followUpReading, setFollowUpReading] = useState(false);
  const [orbSignalTick, setOrbSignalTick] = useState(0);
  const [orbMood, setOrbMood] = useState('neutral');
  const [panelEntering, setPanelEntering] = useState(false);
  const [resultProcessing, setResultProcessing] = useState(false);
  const [pathsRevealing, setPathsRevealing] = useState(false);
  const [followUpPathsRevealing, setFollowUpPathsRevealing] = useState(false);
  const [askResult, setAskResult] = useState(null);
  const pathModuleRef = useGuidePathsReveal(pathsRevealing, {
    itemSelector: '.portfolio-guide__path-track-item',
    headSelector: '.portfolio-guide__path-module-head',
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const panelEnterTimerRef = useRef(0);
  const pathsRevealTimerRef = useRef(0);
  const processingTimerRef = useRef(0);
  const routeExpandTimerRef = useRef(0);
  const orbMoodTimerRef = useRef(0);
  const previewTargetIdRef = useRef(null);
  const peekCooldownTimerRef = useRef(0);
  const [peekCooldown, setPeekCooldown] = useState(false);

  useLayoutEffect(() => {
    if (open || closing) getPortfolioGuidePortalNode();
  }, [open, closing]);

  const resultFlow = useMemo(
    () => (resultFlowId ? getGuideFlow(resultFlowId, displayQuestion) : null),
    [resultFlowId, displayQuestion],
  );

  const resultPresentation = useMemo(
    () => (resultFlow ? getFlowPresentation(resultFlow) : null),
    [resultFlow],
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

  const clearTrackedPreview = useCallback(() => {
    if (previewTargetIdRef.current) {
      clearPreviewTarget(previewTargetIdRef.current);
      previewTargetIdRef.current = null;
    }
  }, []);

  const bumpPeekCooldown = useCallback(() => {
    setPeekCooldown(true);
    window.clearTimeout(peekCooldownTimerRef.current);
    peekCooldownTimerRef.current = window.setTimeout(() => setPeekCooldown(false), PEEK_COOLDOWN_MS);
  }, []);

  const closePanel = useCallback(() => {
    if (!open) return;
    setHovered(false);
    setPressed(false);
    setHintSuppressed(true);
    bumpPeekCooldown();
    clearTrackedPreview();
    resetOrbMood();
    setPanelEntering(false);
    setResultProcessing(false);
    setFollowUpReading(false);
    setPathsRevealing(false);
    setFollowUpPathsRevealing(false);
    window.clearTimeout(panelEnterTimerRef.current);
    window.clearTimeout(pathsRevealTimerRef.current);
    window.clearTimeout(processingTimerRef.current);
    window.clearTimeout(routeExpandTimerRef.current);
    setRouteExpandId(null);
    setPulling(true);
    window.clearTimeout(pullTimerRef.current);
    pullTimerRef.current = window.setTimeout(() => setPulling(false), PANEL_PULL_MS);
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      if (!isFullMode) {
        triggerRef.current?.blur();
        const stillOverHandle = triggerRef.current?.matches(':hover');
        if (stillOverHandle) {
          setHovered(true);
        } else {
          setHintSuppressed(false);
        }
      }
    }, PANEL_CLOSE_MS);
  }, [open, isFullMode, resetOrbMood, clearTrackedPreview, bumpPeekCooldown]);

  const clearFollowUpState = useCallback(() => {
    setFollowUpInput('');
    setFollowUpAnswer(null);
    setFollowUpReading(false);
  }, []);

  const openPanel = useCallback(() => {
    bumpPeekCooldown();
    setClosing(false);
    setPulling(true);
    window.clearTimeout(pullTimerRef.current);
    pullTimerRef.current = window.setTimeout(() => setPulling(false), PANEL_PULL_MS);
    setOpen(true);
    setView('home');
    setRouteExpandId(null);
    window.clearTimeout(routeExpandTimerRef.current);
    setAngleResultId(null);
    setResultFlowId(null);
    setDisplayQuestion('');
    setResultProcessing(false);
    setPathsRevealing(false);
    setFollowUpPathsRevealing(false);
    clearFollowUpState();
    setPanelEntering(false);
    window.clearTimeout(panelEnterTimerRef.current);
    pulseOrb();
    flashOrbMood('warm');
    window.requestAnimationFrame(() => {
      setPanelEntering(true);
      panelEnterTimerRef.current = window.setTimeout(() => {
        setPanelEntering(false);
      }, PANEL_ENTER_MS);
      panelRef.current?.querySelector('.portfolio-guide__angle-card')?.focus();
    });
  }, [pulseOrb, flashOrbMood, clearFollowUpState, bumpPeekCooldown]);

  const togglePanel = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (open) closePanel();
      else openPanel();
    },
    [open, closePanel, openPanel],
  );

  const handleEvidencePointerEnter = useCallback((action) => {
    const targetId = actionToTargetId(action);
    if (!targetId) return;
    if (previewTargetIdRef.current && previewTargetIdRef.current !== targetId) {
      clearPreviewTarget(previewTargetIdRef.current);
    }
    previewTargetIdRef.current = targetId;
    previewTarget(targetId);
  }, []);

  const handleEvidencePointerLeave = useCallback((action) => {
    const targetId = actionToTargetId(action);
    if (!targetId) return;
    clearPreviewTarget(targetId);
    if (previewTargetIdRef.current === targetId) {
      previewTargetIdRef.current = null;
    }
  }, []);

  const handleEvidenceClick = useCallback(
    (event, action) => {
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
      flashOrbMood('warm');
      const targetId = actionToTargetId(action);
      if (!targetId) return;
      clearPreviewTarget(targetId);
      if (previewTargetIdRef.current === targetId) {
        previewTargetIdRef.current = null;
      }
      scrollToGuideAction(action);
      if (targetId && !targetId.startsWith('case-')) {
        activateGuideTarget(targetId);
      }
      closePanel();
    },
    [flashOrbMood, closePanel],
  );

  const triggerPathsReveal = useCallback((forFollowUp = false) => {
    window.clearTimeout(pathsRevealTimerRef.current);
    if (forFollowUp) {
      setFollowUpPathsRevealing(false);
      window.requestAnimationFrame(() => {
        setFollowUpPathsRevealing(true);
        pathsRevealTimerRef.current = window.setTimeout(() => {
          setFollowUpPathsRevealing(false);
        }, 900);
      });
      return;
    }
    window.requestAnimationFrame(() => {
      setPathsRevealing(true);
      pathsRevealTimerRef.current = window.setTimeout(() => {
        setPathsRevealing(false);
      }, 900);
    });
  }, []);

  const showFlowResult = useCallback(
    (flowId, question) => {
      const flow = getGuideFlow(flowId, question);
      if (!flow) return;
      setFollowUpReading(false);
      setResultProcessing(true);
      setPathsRevealing(false);
      pulseOrb('strong');
      flashOrbMood('warm');
      window.clearTimeout(processingTimerRef.current);
      processingTimerRef.current = window.setTimeout(() => {
        try {
          setResultFlowId(flow.id);
          setDisplayQuestion(flow.question);
          clearFollowUpState();
          setView('flow');
          setAngleResultId(null);
          saveGuideLog(flow.question, flow.id);
          window.requestAnimationFrame(() => {
            panelBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            triggerPathsReveal(false);
          });
        } finally {
          setResultProcessing(false);
        }
      }, GUIDE_PROCESSING_MS);
    },
    [saveGuideLog, pulseOrb, flashOrbMood, clearFollowUpState, triggerPathsReveal],
  );

  const showAngleResult = useCallback(
    (angleId) => {
      pulseOrb();
      flashOrbMood('warm');
      setAngleResultId(angleId);
      setResultFlowId(null);
      clearFollowUpState();
      setResultProcessing(false);
      window.clearTimeout(routeExpandTimerRef.current);
      const enterAngle = () => {
        setView('angle');
        setRouteExpandId(null);
        window.requestAnimationFrame(() => {
          panelBodyRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        });
      };
      if (reducedMotion) {
        enterAngle();
        return;
      }
      setRouteExpandId(angleId);
      routeExpandTimerRef.current = window.setTimeout(enterAngle, ROUTE_EXPAND_MS);
    },
    [pulseOrb, flashOrbMood, clearFollowUpState, reducedMotion],
  );

  const returnHome = useCallback(() => {
    window.clearTimeout(routeExpandTimerRef.current);
    setRouteExpandId(null);
    setView('home');
    setAngleResultId(null);
    setResultFlowId(null);
    setDisplayQuestion('');
    setAskResult(null);
    clearFollowUpState();
    window.requestAnimationFrame(() => {
      panelBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [clearFollowUpState]);

  const scrollPanelToFollowUp = useCallback(() => {
    const body = panelBodyRef.current;
    const answer = body?.querySelector('.portfolio-guide__followup-answer');
    if (!body || !answer) return;
    const top = answer.offsetTop - body.offsetTop - 8;
    body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  const runFreeQuestionAnswer = useCallback(
    (question) => {
      pulseOrb();
      flashOrbMood('warm');
      setResultProcessing(false);
      setFollowUpAnswer(null);
      setFollowUpPathsRevealing(false);
      setFollowUpReading(true);
      window.clearTimeout(processingTimerRef.current);
      processingTimerRef.current = window.setTimeout(() => {
        try {
          const answer = getFreeGuideAnswer(question, resultFlowId);
          setFollowUpAnswer(answer);
          saveGuideLog(question, 'free');
          window.requestAnimationFrame(() => {
            scrollPanelToFollowUp();
            if (answer.whereToLook?.length) {
              triggerPathsReveal(true);
            }
          });
        } catch (err) {
          if (typeof console !== 'undefined') {
            console.error('[PortfolioGuide] free answer failed', err);
          }
          setFollowUpAnswer({
            title: 'Could not load an answer',
            shortAnswer: 'Please try again in a moment.',
            points: [],
            whereToLook: [],
          });
        } finally {
          setFollowUpReading(false);
        }
      }, GUIDE_PROCESSING_MS);
    },
    [resultFlowId, pulseOrb, flashOrbMood, saveGuideLog, scrollPanelToFollowUp, triggerPathsReveal],
  );

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    const question = followUpInput.trim();
    if (!question) return;

    const presetFlowId = matchExplicitPresetFlowId(question);
    if (presetFlowId) {
      showFlowResult(presetFlowId, getGuideQuestionForEntry(presetFlowId));
      return;
    }

    runFreeQuestionAnswer(question);
  };

  const runAskRouting = useCallback(
    (question) => {
      pulseOrb();
      flashOrbMood('warm');
      setResultProcessing(false);
      setFollowUpAnswer(null);
      setFollowUpReading(true);
      window.clearTimeout(processingTimerRef.current);
      processingTimerRef.current = window.setTimeout(() => {
        try {
          const matchedRoute = matchShortcutRoute(question);
          const answer = getFreeGuideAnswer(question, resultFlowId);
          setAskResult({
            question,
            matchedRoute,
            matchReason: answer.shortAnswer,
            evidence: (answer.whereToLook ?? []).slice(0, 3),
          });
          setView('ask');
          setAngleResultId(null);
          setResultFlowId(null);
          saveGuideLog(question, matchedRoute?.id ?? 'ask');
          window.requestAnimationFrame(() => {
            panelBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          });
        } catch (err) {
          if (typeof console !== 'undefined') {
            console.error('[PortfolioGuide] ask routing failed', err);
          }
          setAskResult({
            question,
            matchedRoute: null,
            matchReason: 'Try a focused question about workflow, traceability, control, or a specific case.',
            evidence: [],
          });
          setView('ask');
        } finally {
          setFollowUpReading(false);
        }
      }, GUIDE_PROCESSING_MS);
    },
    [resultFlowId, pulseOrb, flashOrbMood, saveGuideLog],
  );

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const question = customQuestion.trim();
    if (!question) return;

    const presetFlowId = matchExplicitPresetFlowId(question);
    if (presetFlowId) {
      showFlowResult(presetFlowId, getGuideQuestionForEntry(presetFlowId));
      setCustomQuestion('');
      return;
    }

    runAskRouting(question);
    setCustomQuestion('');
  };

  const handleAskChip = (chip) => {
    const query = SHORTCUT_CHIP_QUERIES[chip] ?? chip;
    runAskRouting(query);
  };

  useEffect(
    () => () => {
      window.clearTimeout(orbMoodTimerRef.current);
      window.clearTimeout(panelEnterTimerRef.current);
      window.clearTimeout(pathsRevealTimerRef.current);
      window.clearTimeout(processingTimerRef.current);
      window.clearTimeout(pullTimerRef.current);
      window.clearTimeout(peekCooldownTimerRef.current);
    },
    [],
  );

  const surfaceBg = usePortfolioShortcutSurface(activeId);
  const scrollActive = useScrollActivityPause(420);
  const proximityNear = useShortcutProximity({
    enabled: !open,
  });

  useGSAP(
    () => {
      if (!panelEntering) return undefined;
      const module = moduleRef.current;
      if (!module) return undefined;
      return animateGuideHomeEnter(module);
    },
    { scope: moduleRef, dependencies: [panelEntering], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (!routeExpandId) return undefined;
      const module = moduleRef.current;
      if (!module) return undefined;
      return animateGuideRouteExpand(module, routeExpandId);
    },
    { scope: moduleRef, dependencies: [routeExpandId], revertOnUpdate: true },
  );

  const idlePeek = useShortcutHandleIdlePeek({
    enabled: !isFullMode,
    paused:
      open ||
      closing ||
      pulling ||
      hovered ||
      pressed ||
      scrollActive ||
      peekCooldown ||
      panelEntering,
    boost: isOpeningChapter,
  });

  const markerState = open
    ? 'open'
    : closing
      ? 'closing'
      : pulling
        ? 'opening'
        : hovered
          ? 'hover'
          : idlePeek
            ? 'peeking'
            : proximityNear
              ? 'proximity'
              : 'idle';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => () => clearTrackedPreview(), [clearTrackedPreview]);

  /* Panel lock — class only (no overflow:hidden; preserves Cap sticky + field). */
  const scrollLockYRef = useRef(0);
  useEffect(() => {
    const locked = open || closing;
    const html = document.documentElement;
    if (!locked) {
      html.classList.remove('portfolio-guide-panel-open');
      const y = scrollLockYRef.current;
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - y) > 2) {
          window.scrollTo(0, y);
        }
      });
      return undefined;
    }
    scrollLockYRef.current = window.scrollY;
    html.classList.add('portfolio-guide-panel-open');
    return () => html.classList.remove('portfolio-guide-panel-open');
  }, [open, closing]);

  useEffect(() => {
    if (!open || closing) return undefined;

    const applyPanelScroll = (deltaY) => {
      const body = panelBodyRef.current;
      if (!body) return;
      const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight);
      body.scrollTop = Math.max(0, Math.min(maxScroll, body.scrollTop + deltaY));
    };

    const onWheel = (e) => {
      const body = panelBodyRef.current;
      const drawer = panelRef.current;
      if (!body || !drawer) {
        e.preventDefault();
        return;
      }

      if (body.contains(e.target)) {
        const maxScroll = body.scrollHeight - body.clientHeight;
        const goingUp = e.deltaY < 0;
        const goingDown = e.deltaY > 0;
        if ((goingUp && body.scrollTop <= 0) || (goingDown && body.scrollTop >= maxScroll - 1)) {
          e.preventDefault();
        }
        return;
      }

      if (drawer.contains(e.target) || rootRef.current?.contains(e.target)) {
        applyPanelScroll(e.deltaY);
        e.preventDefault();
      }
    };

    const onTouchMove = (e) => {
      if (panelBodyRef.current?.contains(e.target)) return;
      e.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
    };
  }, [open, closing]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (triggerRef.current?.contains(e.target)) return;
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

  const whereToLook = resultPresentation?.whereToLook ?? [];

  const shell = (
    <div
      ref={rootRef}
        className={[
        'portfolio-guide',
        'portfolio-guide--seam-marker',
        'is-visible',
        open ? 'is-open' : '',
        closing ? 'is-closing' : '',
        pulling ? 'is-pulling' : '',
        isFullMode ? 'is-full-mode' : '',
        triggerSubtle ? 'is-trigger-subtle' : '',
        hovered ? 'is-handle-hovered' : '',
        surfaceBg === 'light' ? 'is-light-backdrop' : '',
        isOpeningChapter ? 'is-opening-chapter' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <PortfolioGuideOrbSync open={open} />
      {open && !isFullMode ? (
        <div
          className={`portfolio-guide__backdrop${open && !closing ? ' is-active' : ''}`}
          onClick={closePanel}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={`portfolio-guide__drawer-seam${open && !closing ? ' is-visible' : ''}${pulling ? ' is-pulling' : ''}`}
        aria-hidden="true"
      />
      <aside
        className={`portfolio-guide__drawer${open || closing ? ' is-mounted' : ''}`}
        aria-hidden={!open && !closing}
      >
        <div
          ref={panelRef}
          className={panelClass}
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio Shortcut"
        >
          <div
            ref={moduleRef}
            className={[
              'portfolio-guide__module',
              view === 'flow' ? 'portfolio-guide__module--result' : '',
              view === 'angle' ? 'portfolio-guide__module--angle' : '',
              routeExpandId ? 'portfolio-guide__module--route-expanding' : '',
              resultProcessing || followUpReading ? 'is-processing' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {(resultProcessing || followUpReading) && (
              <div className="portfolio-guide__processing" aria-live="polite" aria-busy="true">
                <span className="portfolio-guide__processing-scan" aria-hidden="true" />
                <span className="portfolio-guide__processing-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="portfolio-guide__processing-label">
                  {resultProcessing ? 'Finding evidence' : 'Routing'}
                </span>
              </div>
            )}
            <header className="portfolio-guide__head portfolio-guide__enter-stage portfolio-guide__enter-stage--title">
              <div className="portfolio-guide__head-copy">
                <h2 className="portfolio-guide__headline">{SHORTCUT_ENTRY.label}</h2>
                {view === 'home' ? (
                  <p className="portfolio-guide__tagline">{SHORTCUT_ENTRY.tagline}</p>
                ) : null}
              </div>
            </header>

            <div
              ref={panelBodyRef}
              className={`portfolio-guide__panel-body${
                resultProcessing || followUpReading ? ' is-processing' : ''
              }`}
            >
            {view === 'home' || routeExpandId ? (
              <>
                <section
                  className="portfolio-guide__routes portfolio-guide__enter-stage portfolio-guide__enter-stage--paths"
                  role="group"
                  aria-label={SHORTCUT_SECTIONS.guidedRoutes}
                >
                  <p className="portfolio-guide__block-label portfolio-guide__block-label--primary">
                    {SHORTCUT_SECTIONS.guidedRoutes}
                  </p>
                  <ul className="portfolio-guide__route-row-list">
                    {SHORTCUT_ROUTES.map((route) => (
                      <li key={route.id} className="portfolio-guide__route-row-item">
                        <button
                          type="button"
                          className={[
                            'portfolio-guide__route-row',
                            routeExpandId === route.id ? 'portfolio-guide__route-row--confirmed' : '',
                            routeExpandId && routeExpandId !== route.id
                              ? 'portfolio-guide__route-row--receded'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          data-route-id={route.id}
                          onClick={() => showAngleResult(route.id)}
                          disabled={followUpReading || resultProcessing || Boolean(routeExpandId)}
                        >
                          <span className="portfolio-guide__route-row-index">{route.index}</span>
                          <span className="portfolio-guide__route-row-copy">
                            <span className="portfolio-guide__route-row-title">{route.title}</span>
                            <span className="portfolio-guide__route-row-signal">{route.signal}</span>
                          </span>
                          <span className="portfolio-guide__route-row-arrow" aria-hidden="true">
                            ↗
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                <section
                  className="portfolio-guide__ask-block portfolio-guide__enter-stage portfolio-guide__enter-stage--ask"
                  aria-label={SHORTCUT_SECTIONS.askAboutWork}
                >
                  <p className="portfolio-guide__block-label portfolio-guide__block-label--secondary">
                    {SHORTCUT_SECTIONS.askAboutWork}
                  </p>
                  <p className="portfolio-guide__ask-helper">{SHORTCUT_ENTRY.askHelper}</p>
                  <form className="portfolio-guide__search-form portfolio-guide__search-form--inline" onSubmit={handleCustomSubmit}>
                    <input
                      id="portfolio-shortcut-search"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="portfolio-guide__search-field"
                      placeholder={SHORTCUT_ENTRY.freeInputPlaceholder}
                      aria-label={SHORTCUT_ENTRY.freeInputPlaceholder}
                      disabled={followUpReading || resultProcessing || Boolean(routeExpandId)}
                    />
                    <button
                      type="submit"
                      className="portfolio-guide__search-submit portfolio-guide__search-submit--ask"
                      aria-label={SHORTCUT_ENTRY.submitLabel}
                      disabled={followUpReading || resultProcessing || Boolean(routeExpandId)}
                    >
                      <span className="portfolio-guide__search-submit-label">{SHORTCUT_ENTRY.submitLabel}</span>
                    </button>
                  </form>
                  <div className="portfolio-guide__ask-chips" role="group" aria-label="Suggested questions">
                    {SHORTCUT_ASK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="portfolio-guide__ask-chip"
                        onClick={() => handleAskChip(chip)}
                        disabled={followUpReading || resultProcessing || Boolean(routeExpandId)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </section>

                <section
                  className="portfolio-guide__direct-cases portfolio-guide__enter-stage portfolio-guide__enter-stage--cases"
                  aria-label={SHORTCUT_SECTIONS.directCases}
                >
                  <p className="portfolio-guide__block-label portfolio-guide__block-label--tertiary">
                    {SHORTCUT_SECTIONS.directCases}
                  </p>
                  <p className="portfolio-guide__case-strip">
                    {SHORTCUT_DIRECT_CASES.map((item, i) => (
                      <span key={item.id} className="portfolio-guide__case-strip-item">
                        {i > 0 ? (
                          <span className="portfolio-guide__case-strip-sep" aria-hidden="true">
                            {' · '}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className="portfolio-guide__case-strip-link"
                          onPointerEnter={() => handleEvidencePointerEnter(item.action)}
                          onPointerLeave={() => handleEvidencePointerLeave(item.action)}
                          onClick={(event) => handleEvidenceClick(event, item.action)}
                          disabled={followUpReading || resultProcessing || Boolean(routeExpandId)}
                        >
                          {item.label}
                        </button>
                      </span>
                    ))}
                  </p>
                </section>
              </>
            ) : null}

            {view === 'angle' && angleResultId ? (
              <ShortcutRoutePanel
                key={angleResultId}
                routeId={angleResultId}
                onBack={returnHome}
                onRouteSelect={showAngleResult}
                onEvidencePointerEnter={handleEvidencePointerEnter}
                onEvidencePointerLeave={handleEvidencePointerLeave}
                onEvidenceClick={handleEvidenceClick}
              />
            ) : null}

            {view === 'ask' && askResult ? (
              <GuideAskResult
                question={askResult.question}
                matchedRoute={askResult.matchedRoute}
                matchReason={askResult.matchReason}
                evidence={askResult.evidence}
                onBack={returnHome}
                onRouteSelect={showAngleResult}
                onEvidencePointerEnter={handleEvidencePointerEnter}
                onEvidencePointerLeave={handleEvidencePointerLeave}
                onEvidenceClick={handleEvidenceClick}
              />
            ) : null}

            {view === 'angle' && followUpAnswer ? (
              <GuideFollowUpAnswer
                answer={followUpAnswer}
                pathsRevealing={followUpPathsRevealing}
                onEvidencePointerEnter={handleEvidencePointerEnter}
                onEvidencePointerLeave={handleEvidencePointerLeave}
                onEvidenceClick={handleEvidenceClick}
              />
            ) : null}

            {view === 'flow' ? (
              <section
                className="portfolio-guide__result"
                aria-label="Search result"
              >
                <div className="portfolio-guide__result-nav">
                  <button
                    type="button"
                    className="portfolio-guide__back portfolio-guide__back--nav"
                    onClick={returnHome}
                  >
                    ← Back
                  </button>
                </div>
                <div className="portfolio-guide__result-context">
                  <p className="portfolio-guide__result-label">{GUIDE_RESULT_SECTIONS.youAsked}</p>
                  <p className="portfolio-guide__result-question">{resultFlow?.question}</p>
                </div>

                <div className="portfolio-guide__result-card">
                  <p className="portfolio-guide__result-answer-label">{GUIDE_RESULT_SECTIONS.takeaway}</p>
                  <div className="portfolio-guide__read">
                    {(resultPresentation?.readParagraphs?.length
                      ? resultPresentation.readParagraphs
                      : [resultFlow?.guideTitle].filter(Boolean)
                    ).map((line) => (
                      <p key={line.slice(0, 48)}>{line}</p>
                    ))}
                  </div>
                  {resultPresentation?.understandParagraphs?.length ? (
                    <div className="portfolio-guide__understand">
                      {resultPresentation.understandParagraphs.map((line) => (
                        <p key={line.slice(0, 48)}>{line}</p>
                      ))}
                    </div>
                  ) : null}
                  {resultFlow?.focus ? (
                    <div className="portfolio-guide__focus">
                      <p className="portfolio-guide__layer-label portfolio-guide__layer-label--focus">
                        {GUIDE_RESULT_SECTIONS.focus}
                      </p>
                      <p className="portfolio-guide__focus-line">{resultFlow.focus}</p>
                    </div>
                  ) : null}

                  {resultPresentation?.framingBlocks?.length ? (
                    <div className="portfolio-guide__framing" aria-label="Work map">
                      {resultPresentation.framingBlocks.map((block) => (
                        <div key={block.step} className="portfolio-guide__framing-row">
                          <span className="portfolio-guide__framing-step">{block.step}</span>
                          <span className="portfolio-guide__framing-copy">
                            <span className="portfolio-guide__framing-title">{block.title}</span>
                            <span className="portfolio-guide__framing-line">{block.line}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {resultPresentation?.problemBlocks?.length ? (
                    <div className="portfolio-guide__problem-grid" aria-label="AI problem spaces">
                      {resultPresentation.problemBlocks.map((block) => (
                        <article key={block.step} className="portfolio-guide__problem-card">
                          <span className="portfolio-guide__problem-step">{block.step}</span>
                          <h4 className="portfolio-guide__problem-title">{block.title}</h4>
                          <p className="portfolio-guide__problem-question">{block.question}</p>
                          <p className="portfolio-guide__problem-tags">{block.tags.join(' · ')}</p>
                        </article>
                      ))}
                    </div>
                  ) : null}

                  {resultPresentation?.keyPoints?.length ? (
                    <ol className="portfolio-guide__key-points" aria-label="Key points">
                      {resultPresentation.keyPoints.map((point) => (
                        <li key={point.step} className="portfolio-guide__key-point">
                          <span className="portfolio-guide__key-point-step">{point.step}</span>
                          <span className="portfolio-guide__key-point-body">
                            <span className="portfolio-guide__key-point-title">{point.title}</span>
                            <span className="portfolio-guide__key-point-line">{point.line}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>

                {whereToLook.length ? (
                  <div
                    ref={pathModuleRef}
                    className={[
                      'portfolio-guide__path-module',
                      'portfolio-guide__path-module--nav',
                      resultPresentation?.framingBlocks?.length || resultPresentation?.problemBlocks?.length
                        ? 'portfolio-guide__path-module--after-framing'
                        : 'portfolio-guide__path-module--compact',
                      resultPresentation?.hasReadUnderstand ? 'portfolio-guide__path-module--after-read' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <p className="portfolio-guide__path-module-head">
                      <span className="portfolio-guide__path-module-title">
                        {resultPresentation?.evidenceLabel ?? GUIDE_RESULT_SECTIONS.relatedPaths}
                      </span>
                    </p>
                    <ol className="portfolio-guide__path-track">
                      {whereToLook.map((item) => (
                        <li key={`${item.step}-${item.label}`} className="portfolio-guide__path-track-item">
                          <button
                            type="button"
                            className="portfolio-guide__path-node portfolio-guide__evidence-row"
                            onPointerEnter={() => handleEvidencePointerEnter(item.action)}
                            onPointerLeave={() => handleEvidencePointerLeave(item.action)}
                            onClick={(event) => handleEvidenceClick(event, item.action)}
                          >
                            <span className="portfolio-guide__path-step">{item.step}</span>
                            <span className="portfolio-guide__path-copy">
                              <span className="portfolio-guide__path-title">{item.label}</span>
                              <span className="portfolio-guide__path-desc">{item.description}</span>
                            </span>
                            <span className="portfolio-guide__path-open" aria-hidden="true">
                              Jump ↗
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {followUpAnswer ? (
                  <GuideFollowUpAnswer
                    answer={followUpAnswer}
                    pathsRevealing={followUpPathsRevealing}
                    onEvidencePointerEnter={handleEvidencePointerEnter}
                    onEvidencePointerLeave={handleEvidencePointerLeave}
                    onEvidenceClick={handleEvidenceClick}
                  />
                ) : null}
              </section>
            ) : null}

            </div>

            {view === 'flow' ? (
              <footer className="portfolio-guide__panel-footer portfolio-guide__enter-stage portfolio-guide__enter-stage--refine">
                <form
                  className="portfolio-guide__search-form portfolio-guide__search-form--compact portfolio-guide__search-form--secondary portfolio-guide__query-console"
                  onSubmit={handleFollowUpSubmit}
                >
                  <input
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    className="portfolio-guide__search-field"
                    placeholder={SHORTCUT_ENTRY.freeInputPlaceholder}
                    aria-label={SHORTCUT_ENTRY.freeInputPlaceholder}
                    disabled={followUpReading}
                  />
                  <button
                    type="submit"
                    className="portfolio-guide__search-submit portfolio-guide__search-submit--ask"
                    aria-label={SHORTCUT_ENTRY.submitLabel}
                    disabled={followUpReading}
                  >
                    <span className="portfolio-guide__search-submit-label">{SHORTCUT_ENTRY.submitLabel}</span>
                  </button>
                </form>
              </footer>
            ) : null}
          </div>
        </div>
      </aside>

      {!isFullMode ? (
        <button
          ref={triggerRef}
          type="button"
          className={[
            'portfolio-guide__companion',
            'ai-marker',
            `is-state-${markerState}`,
            open ? 'is-docked is-open' : '',
            hovered ? 'is-awake' : '',
            pressed ? 'is-pressed' : '',
            pulling ? 'is-pulling' : '',
            idlePeek && !open && !hovered ? 'is-idle-peek' : '',
            proximityNear && !hovered && !open ? 'is-state-proximity' : '',
            hintSuppressed ? 'is-hint-suppressed' : '',
            reducedMotion ? 'is-reduced-motion' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          data-bg={surfaceBg}
          data-state={markerState}
          aria-label={open ? 'Close Portfolio Shortcut' : 'Open Portfolio Shortcut'}
          aria-expanded={open}
          onClick={togglePanel}
          onPointerEnter={() => {
            if (!hintSuppressed) setHovered(true);
          }}
          onPointerLeave={() => {
            setHintSuppressed(false);
            setHovered(false);
            setPressed(false);
          }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onFocus={() => {
            if (!hintSuppressed) setHovered(true);
          }}
          onBlur={() => {
            setHovered(false);
            setPressed(false);
          }}
        >
          <span className="portfolio-guide__companion-hint" aria-hidden="true">
            {SHORTCUT_ENTRY.label}
          </span>
          <span className="portfolio-guide__companion-plinth" aria-hidden="true" />
          <span className="portfolio-guide__companion-art" aria-hidden="true">
            <ShortcutMarkerArt />
          </span>
        </button>
      ) : null}
    </div>
  );

  if (isMobileHome) {
    return <MobilePortfolioShortcut />;
  }

  if (typeof document !== 'undefined') {
    return createPortal(shell, getPortfolioGuidePortalNode());
  }
  return shell;
}

/** User-facing name — same component, routing layer terminology. */
export const PortfolioShortcut = PortfolioGuide;
