import { cases, overviewIntro } from '../data/cases.js';
import { SectionHeader } from './SectionHeader.jsx';

const ink = 'rgba(14,13,10,.3)';
const inkSoft = 'rgba(14,13,10,.22)';
const inkHi = 'rgba(14,13,10,.42)';
const fill = 'rgba(250,248,243,.48)';
const accentF = 'rgba(65,107,53,.11)';
const accentS = 'rgba(65,107,53,.38)';
const txt = 'rgba(14,13,10,.54)';
const txtHi = 'rgba(14,13,10,.74)';
const sw = 0.75;
const swHi = 1.05;
/** Clearance so arrowheads sit in gaps, not inside nodes */
const AE = 3.6;

function Txt({ x, y, children, fill: f = txt, anchor = 'middle', className = '' }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      className={`overview-ev-sketch-txt${className ? ` ${className}` : ''}`}
      fill={f}
    >
      {children}
    </text>
  );
}

function ArrowHead({ id, fill: fh = ink }) {
  return (
    <marker id={id} markerWidth="4" markerHeight="4" refX="3.6" refY="2" orient="auto" markerUnits="userSpaceOnUse">
      <polygon points="0 0,4 2,0 4" fill={fh} />
    </marker>
  );
}

/** Case 01: linear continuation; circle = decision; stronger link after response. */
function SketchCase01({ caseId }) {
  const m = `${caseId}-m`;
  const my = 28;
  const r1 = { l: 6, r: 62 };
  const r2 = { l: 70, r: 140 };
  const c = { cx: 168, r: 15 };
  const r3 = { l: 192 };
  const cL = c.cx - c.r;
  const cR = c.cx + c.r;
  return (
    <svg viewBox="0 0 320 54" className="overview-ev-sketch-svg overview-ev-sketch-svg--c01" aria-hidden>
      <defs>
        <ArrowHead id={m} />
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="14" width="56" height="26" rx="4" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="34" y={my}>
          Request
        </Txt>
        <line x1={r1.r} y1={my} x2={r2.l - AE} y2={my} stroke={ink} strokeWidth={sw} markerEnd={`url(#${m})`} />
        <rect x="70" y="14" width="70" height="26" rx="4" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="105" y={my}>
          AI response
        </Txt>
        <path
          d={`M ${r2.r} ${my} L ${cL - AE} ${my}`}
          stroke={inkHi}
          strokeWidth={swHi}
          markerEnd={`url(#${m})`}
        />
        <circle cx={c.cx} cy={my} r={c.r} fill={accentF} stroke={accentS} strokeWidth={sw} />
        <Txt x="168" y={my} fill={txtHi}>
          Decision
        </Txt>
        <line x1={cR + AE} y1={my} x2={r3.l - AE} y2={my} stroke={ink} strokeWidth={sw} markerEnd={`url(#${m})`} />
        <rect x="192" y="14" width="122" height="26" rx="4" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="253" y={my}>
          Action
        </Txt>
      </g>
    </svg>
  );
}

/** Case 02: AI + human judgment → confirmed state; audit as one stacked record (no outer frame). */
function SketchCase02({ caseId }) {
  const m = `${caseId}-m`;
  return (
    <svg viewBox="0 0 328 90" className="overview-ev-sketch-svg overview-ev-sketch-svg--c02" aria-hidden>
      <defs>
        <ArrowHead id={m} />
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="10" width="90" height="24" rx="5" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="63" y="22">
          AI output
        </Txt>
        <rect x="220" y="10" width="90" height="24" rx="5" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="265" y="22">
          Human judgment
        </Txt>
        <path d="M 63 34 L 159 45" stroke={ink} strokeWidth={sw} fill="none" markerEnd={`url(#${m})`} />
        <path d="M 265 34 L 169 45" stroke={ink} strokeWidth={sw} fill="none" markerEnd={`url(#${m})`} />
        <rect x="110" y="46" width="108" height="28" rx="5" fill={accentF} stroke={accentS} strokeWidth={swHi} />
        <Txt x="164" y="60" fill={txtHi} className="overview-ev-sketch-txt--state">
          Confirmed
        </Txt>
        <rect x="110" y="74" width="108" height="12" rx="3" fill="rgba(250,248,243,.62)" stroke={accentS} strokeWidth={0.55} strokeOpacity="0.5" />
        <Txt x="164" y="80" fill={txt} className="overview-ev-sketch-txt--pill">
          Audit trail
        </Txt>
      </g>
    </svg>
  );
}

/** Case 03: solid execution spine; branch = alert → human gate; return merges before Resumes. */
function SketchCase03({ caseId }) {
  const m = `${caseId}-m`;
  const yM = 18;
  const resL = 236;
  return (
    <svg viewBox="0 0 340 78" className="overview-ev-sketch-svg overview-ev-sketch-svg--c03" aria-hidden>
      <defs>
        <ArrowHead id={m} />
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="88" height="22" rx="5" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="52" y={yM}>
          Agent execution
        </Txt>
        <line x1="96" y1={yM} x2="124" y2={yM} stroke={ink} strokeWidth={sw} />
        <line x1="214" y1={yM} x2={resL - AE} y2={yM} stroke={ink} strokeWidth={sw} markerEnd={`url(#${m})`} />
        <rect x="236" y="8" width="96" height="22" rx="5" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="284" y={yM}>
          Resumes
        </Txt>
        <line x1="124" y1={yM} x2="214" y2={yM} stroke={inkSoft} strokeWidth={0.55} strokeDasharray="2.5 4" opacity="0.65" />
        <line x1="132" y1={yM} x2="132" y2="31" stroke={ink} strokeWidth={sw} />
        <rect x="96" y="32" width="72" height="11" rx="6" fill="rgba(250,248,243,.42)" stroke={inkSoft} strokeWidth={0.65} />
        <Txt x="132" y="37.5" fill={txt}>
          Alert trigger
        </Txt>
        <line x1="132" y1="43" x2="132" y2="47.5" stroke={ink} strokeWidth={sw} />
        <circle cx="132" cy="62" r="14" fill={accentF} stroke={accentS} strokeWidth={swHi} />
        <text x="132" y="59" textAnchor="middle" fill={txtHi} className="overview-ev-sketch-txt overview-ev-sketch-txt--gate">
          <tspan x="132" dy="0">
            Human
          </tspan>
          <tspan x="132" dy="6">
            gate
          </tspan>
        </text>
        <path
          d="M 144 54 Q 182 34, 200 18"
          stroke={inkHi}
          strokeWidth={sw}
          fill="none"
          markerEnd={`url(#${m})`}
        />
      </g>
    </svg>
  );
}

/** Case 04: Interaction → context → presence anchor → re-entry; one dashed return only. */
function SketchCase04({ caseId }) {
  const m = `${caseId}-m`;
  return (
    <svg viewBox="0 0 328 68" className="overview-ev-sketch-svg overview-ev-sketch-svg--c04" aria-hidden>
      <defs>
        <ArrowHead id={m} />
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="30" width="62" height="20" rx="5" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="39" y="40">
          Interaction
        </Txt>
        <path d="M 70 38 Q 118 28, 132 20.5" stroke={ink} strokeWidth={sw} fill="none" markerEnd={`url(#${m})`} />
        <rect
          x="136"
          y="8"
          width="56"
          height="12"
          rx="6"
          fill="rgba(250,248,243,.32)"
          stroke={inkSoft}
          strokeWidth={0.5}
          className="overview-ev-sketch-context-pill"
        />
        <Txt x="164" y="14" fill={txt} className="overview-ev-sketch-txt--context">
          Context
        </Txt>
        <line x1="164" y1="20" x2="164" y2="23.5" stroke={inkSoft} strokeWidth={0.65} />
        <circle cx="164" cy="40" r="16" fill={accentF} stroke={accentS} strokeWidth={swHi} />
        <Txt x="164" y="40" fill={txtHi} className="overview-ev-sketch-txt--presence">
          Presence
        </Txt>
        <line x1={164 + 16 + AE * 0.25} y1="40" x2={262 - AE} y2="40" stroke={ink} strokeWidth={sw} markerEnd={`url(#${m})`} />
        <rect x="262" y="30" width="58" height="20" rx="5" fill={fill} stroke={inkSoft} strokeWidth={sw} />
        <Txt x="291" y="40">
          Re-entry
        </Txt>
        <path
          d="M 298 48 Q 164 56, 74 40"
          stroke={inkSoft}
          strokeWidth={0.7}
          strokeDasharray="3 3"
          fill="none"
          markerEnd={`url(#${m})`}
        />
      </g>
    </svg>
  );
}

export function OverviewSketch({ caseId }) {
  if (caseId === 'case01') return <SketchCase01 caseId={caseId} />;
  if (caseId === 'case02') return <SketchCase02 caseId={caseId} />;
  if (caseId === 'case03') return <SketchCase03 caseId={caseId} />;
  return <SketchCase04 caseId={caseId} />;
}

function OverviewEvidenceCard({ c, onOpenCase }) {
  const o = c.overview;
  return (
    <button type="button" className="overview-ev-card" onClick={() => onOpenCase(c.id)} aria-label={o.openAria}>
      <span className="overview-ev-card__num">{o.num}</span>
      <h3 className="overview-ev-card__title">{o.title}</h3>
      <p className="overview-ev-card__layer">{o.layer}</p>
      <div className="overview-ev-card__sketch">
        <OverviewSketch caseId={c.id} />
      </div>
      <div className="overview-ev-card__block">
        <span className="overview-ev-card__k">Tension</span>
        <p className="overview-ev-card__body">{o.tension}</p>
      </div>
      <div className="overview-ev-card__block">
        <span className="overview-ev-card__k">Signal</span>
        <p className="overview-ev-card__body overview-ev-card__body--signal">{o.signal}</p>
      </div>
      <span className="overview-ev-card__cta">Open case</span>
    </button>
  );
}

export default function CaseOverview({ onOpenCase }) {
  return (
    <section className="overview" id="overview">
      <SectionHeader
        kicker={overviewIntro.kicker}
        titleLines={overviewIntro.titleLines}
        sub={overviewIntro.sub}
      />
      <div className="overview-ev-grid reveal">
        {cases.map((c) => (
          <OverviewEvidenceCard key={c.id} c={c} onOpenCase={onOpenCase} />
        ))}
      </div>
    </section>
  );
}
