import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { PortfolioGuideOrbSync } from './PortfolioGuideOrbSync.jsx';
import { GuideOrbWithHat } from './GuideOrb.jsx';
import {
  getGuideFlow,
  getFlowPresentation,
  getGuideQuestionForEntry,
  GUIDE_CUSTOM_INPUT_PLACEHOLDER,
  GUIDE_ENTRY_QUESTIONS,
} from '../../data/portfolioGuideFlows.js';
import { GUIDE_ENTRY, GUIDE_RESULT_SECTIONS } from '../../data/portfolioGuideSystem.js';
import {
  getFreeGuideAnswer,
  matchExplicitPresetFlowId,
} from '../../utils/getFreeGuideAnswer.js';
import {
  actionToTargetId,
  activateGuideTarget,
  clearPreviewTarget,
  previewTarget,
  scrollToGuideTarget,
} from '../../utils/portfolioGuideTarget.js';
import '../../styles/portfolio-guide.css';

const SCROLL_SHOW_THRESHOLD = 1.2;
const TEASER_HIDE_SCROLL_RATIO = 1.02;
const TEASER_DISMISSED_KEY = 'guideTeaserDismissed';
const TEASER_OPENED_KEY = 'guideTeaserOpened';
const GUIDE_LOG_KEY = 'portfolioGuideQuestions';
const LANDING_TEASER_DELAY_MS = 1400;
const ENTRANCE_ANIM_MS = 1650;
const ORB_MOOD_CLICK_MS = 1400;

/**
 * @param {{
 *   answer: import('../../utils/getFreeGuideAnswer.js').FreeGuideAnswer,
 *   onEvidencePointerEnter: (action: { type: string, id: string }) => void,
 *   onEvidencePointerLeave: (action: { type: string, id: string }) => void,
 *   onEvidenceClick: (event: React.MouseEvent, action: { type: string, id: string }) => void,
 * }} props
 */
function GuideFollowUpAnswer({ answer, onEvidencePointerEnter, onEvidencePointerLeave, onEvidenceClick }) {
  return (
    <div className="portfolio-guide__followup-answer" aria-live="polite">
      <p className="portfolio-guide__result-block-label">{GUIDE_RESULT_SECTIONS.followUp}</p>
      <p className="portfolio-guide__followup-title">{answer.title}</p>
      <p className="portfolio-guide__followup-short">{answer.shortAnswer}</p>
      {answer.points?.length ? (
        <ul className="portfolio-guide__followup-points">
          {answer.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
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

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function openPovSourcesFromGuide() {
  scrollToId('point-of-view');
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('portfolio-guide-open-sources'));
  }, 480);
}

const GUIDE_TRIGGER_MODE =
  typeof import.meta.env.VITE_GUIDE_TRIGGER_MODE === 'string'
    ? import.meta.env.VITE_GUIDE_TRIGGER_MODE.toLowerCase()
    : 'normal';

export function PortfolioGuide() {
  const { activeId } = useNarrativeScroll();
  const { setGuideOpen } = useOrbScene();
  const isLanding = activeId === 'home-landing';
  const isSectionGuide = activeId === 'home-life-archive';
  const isFullMode = false;
  const triggerHidden = GUIDE_TRIGGER_MODE === 'hidden';
  const triggerSubtle = GUIDE_TRIGGER_MODE === 'subtle';
  const source = isSectionGuide ? 'section-guide' : 'landing-guide';

  useEffect(() => {
    if (isSectionGuide) setGuideOpen(false);
  }, [isSectionGuide, setGuideOpen]);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelBodyRef = useRef(null);
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
  const [resultFlowId, setResultFlowId] = useState(null);
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState(null);
  const [followUpReading, setFollowUpReading] = useState(false);
  const [orbSignalTick, setOrbSignalTick] = useState(0);
  const [orbMood, setOrbMood] = useState('neutral');
  const [entranceAnimate, setEntranceAnimate] = useState(false);
  const orbMoodTimerRef = useRef(0);
  const previewTargetIdRef = useRef(null);

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

  const closePanel = useCallback(() => {
    if (!open) return;
    clearTrackedPreview();
    resetOrbMood();
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      if (!isFullMode) {
        triggerRef.current?.focus();
      }
    }, 180);
  }, [open, isFullMode, resetOrbMood, clearTrackedPreview]);

  const clearFollowUpState = useCallback(() => {
    setFollowUpInput('');
    setFollowUpAnswer(null);
    setFollowUpReading(false);
  }, []);

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
    clearFollowUpState();
    pulseOrb();
    flashOrbMood('warm');
    window.requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    });
  }, [pulseOrb, flashOrbMood, clearFollowUpState]);

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
      scrollToGuideTarget(targetId);
      if (!targetId.startsWith('case-')) {
        activateGuideTarget(targetId);
      }
    },
    [flashOrbMood],
  );

  const showFlowResult = useCallback(
    (flowId, question) => {
      const flow = getGuideFlow(flowId, question);
      if (!flow) return;
      setResultFlowId(flow.id);
      setDisplayQuestion(flow.question);
      clearFollowUpState();
      setView('result');
      pulseOrb('strong');
      flashOrbMood('warm');
      saveGuideLog(flow.question, flow.id);
      window.requestAnimationFrame(() => {
        panelBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [saveGuideLog, pulseOrb, flashOrbMood, clearFollowUpState],
  );

  const handleEntryQuestion = (entry) => {
    flashOrbMood('warm');
    showFlowResult(entry.flowId, getGuideQuestionForEntry(entry.flowId));
  };

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
      setFollowUpReading(true);
      window.setTimeout(() => {
        setFollowUpAnswer(getFreeGuideAnswer(question, resultFlowId));
        setFollowUpReading(false);
        saveGuideLog(question, 'free');
        window.requestAnimationFrame(scrollPanelToFollowUp);
      }, 280);
    },
    [resultFlowId, pulseOrb, flashOrbMood, saveGuideLog, scrollPanelToFollowUp],
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

    runFreeQuestionAnswer(question);
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

  useEffect(() => () => clearTrackedPreview(), [clearTrackedPreview]);

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

  const whereToLook = resultPresentation?.whereToLook ?? [];

  if (isSectionGuide) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={`portfolio-guide${shouldShowRoot ? ' is-visible' : ''}${open ? ' is-open' : ''}${entranceAnimate ? ' is-entering' : ''}${isFullMode ? ' is-full-mode' : ''}${triggerSubtle ? ' is-trigger-subtle' : ''}`}
    >
      <PortfolioGuideOrbSync open={open} />
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
                <p className="portfolio-guide__section-label">{GUIDE_ENTRY.label}</p>
                {view === 'questions' ? (
                  <h3 className="portfolio-guide__headline">
                    <span>{GUIDE_ENTRY.title}</span>
                    <span>{GUIDE_ENTRY.subtitle}</span>
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
                  thinking={followUpReading}
                />
              </div>
            </header>

            <div ref={panelBodyRef} className="portfolio-guide__panel-body">
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
              </ul>
            ) : null}

            {view === 'questions' && followUpAnswer ? (
              <GuideFollowUpAnswer
                answer={followUpAnswer}
                onEvidencePointerEnter={handleEvidencePointerEnter}
                onEvidencePointerLeave={handleEvidencePointerLeave}
                onEvidenceClick={handleEvidenceClick}
              />
            ) : null}

            {view === 'result' ? (
              <section
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
                      clearFollowUpState();
                    }}
                  >
                    ← Back
                  </button>
                  <p className="portfolio-guide__result-label">{GUIDE_RESULT_SECTIONS.youAsked}</p>
                  <p className="portfolio-guide__result-question">{resultFlow?.question}</p>
                </div>

                <div className="portfolio-guide__result-card">
                  {resultPresentation?.hasReadUnderstand ? (
                    <>
                      <p className="portfolio-guide__layer-label">{GUIDE_RESULT_SECTIONS.read}</p>
                      <div className="portfolio-guide__read">
                        {resultPresentation.readParagraphs.map((para) => (
                          <p key={para.slice(0, 48)}>{para}</p>
                        ))}
                      </div>
                      <p className="portfolio-guide__layer-label portfolio-guide__layer-label--understand">
                        {GUIDE_RESULT_SECTIONS.understand}
                      </p>
                      <div className="portfolio-guide__understand">
                        {resultPresentation.understandParagraphs.map((para) => (
                          <p key={para.slice(0, 48)}>{para}</p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="portfolio-guide__result-answer-label">{GUIDE_RESULT_SECTIONS.guide}</p>
                      <p className="portfolio-guide__result-claim">{resultFlow?.guideTitle}</p>
                      {resultFlow?.guideSubline ? (
                        <p className="portfolio-guide__result-support">{resultFlow.guideSubline}</p>
                      ) : null}
                    </>
                  )}

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
                    className={`portfolio-guide__path-module portfolio-guide__path-module--nav${resultPresentation?.framingBlocks?.length || resultPresentation?.problemBlocks?.length ? ' portfolio-guide__path-module--after-framing' : ' portfolio-guide__path-module--compact'}${resultPresentation?.hasReadUnderstand ? ' portfolio-guide__path-module--after-read' : ''}`}
                  >
                    <p className="portfolio-guide__path-module-head">
                      <span className="portfolio-guide__path-module-title">
                        {resultPresentation?.evidenceLabel ?? GUIDE_RESULT_SECTIONS.evidence}
                      </span>
                    </p>
                    <ol className="portfolio-guide__path-track">
                      {whereToLook.map((item) => (
                        <li key={`${item.step}-${item.label}`} className="portfolio-guide__path-track-item">
                          <button
                            type="button"
                            className="portfolio-guide__path-node"
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
                              ↗
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
                    onEvidencePointerEnter={handleEvidencePointerEnter}
                    onEvidencePointerLeave={handleEvidencePointerLeave}
                    onEvidenceClick={handleEvidenceClick}
                  />
                ) : null}

                <div className="portfolio-guide__sources portfolio-guide__sources--compact">
                  <button type="button" className="portfolio-guide__sources-btn" onClick={openPovSourcesFromGuide}>
                    {GUIDE_RESULT_SECTIONS.sources}
                    {resultFlow?.sources?.length ? ` · ${resultFlow.sources.length}` : ''} →
                  </button>
                </div>
              </section>
            ) : null}

            {followUpReading ? (
              <p className="portfolio-guide__reading" aria-live="polite">
                Reading question...
              </p>
            ) : null}
            </div>

            <footer className="portfolio-guide__panel-footer">
              {view === 'questions' ? (
                <div className="portfolio-guide__free-ask">
                  <p className="portfolio-guide__free-ask-label">{GUIDE_ENTRY.freeInputLabel}</p>
                  <p className="portfolio-guide__angle-helper">{GUIDE_ENTRY.freeInputHelper}</p>
                  <form className="portfolio-guide__free-ask-form" onSubmit={handleCustomSubmit}>
                    <input
                      id="portfolio-guide-custom"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="portfolio-guide__free-ask-field"
                      placeholder={GUIDE_CUSTOM_INPUT_PLACEHOLDER}
                      aria-label="Ask your own evaluation question"
                      disabled={followUpReading}
                    />
                    <button
                      type="submit"
                      className="portfolio-guide__free-ask-submit"
                      aria-label="Submit question"
                      disabled={followUpReading}
                    >
                      Go
                    </button>
                  </form>
                </div>
              ) : (
                <div className="portfolio-guide__angle-input portfolio-guide__angle-input--footer">
                  <p className="portfolio-guide__result-block-label">
                    {GUIDE_RESULT_SECTIONS.askFromAngle}
                  </p>
                  <p className="portfolio-guide__angle-helper">{GUIDE_RESULT_SECTIONS.askFromAngleHelper}</p>
                  <form className="portfolio-guide__angle-form" onSubmit={handleFollowUpSubmit}>
                    <input
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      className="portfolio-guide__angle-field"
                      placeholder={GUIDE_ENTRY.freeInputPlaceholder}
                      aria-label="Ask a follow-up question"
                      disabled={followUpReading}
                    />
                    <button
                      type="submit"
                      className="portfolio-guide__angle-submit"
                      aria-label="Submit follow-up question"
                      disabled={followUpReading}
                    >
                      Go
                    </button>
                  </form>
                </div>
              )}
            </footer>
          </div>
        </div>
      </div>

      {!open && !isFullMode && !triggerHidden ? (
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
