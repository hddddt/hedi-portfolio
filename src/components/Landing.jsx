import { useEffect, useRef } from 'react';

/** Rows 2 & 4 (indices 1,3) leftmost; rows 1,3,5 (0,2,4) start to their right. Whole block centered in canvas. */
const FONT_SIZE = 96;
const ROW_HEIGHT = 86;
const CANVAS_PAD_Y = 14;

const FONT_FAMILY =
  '"DM Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const HEADLINE_ROWS = [
  { text: 'The gap', color: '#1a1a1a', weight: 600 },
  { text: 'is not', color: '#1a1a1a', weight: 300 },
  { text: 'capability.', color: '#a8a8a8', weight: 600 },
  { text: 'It is', color: '#1a1a1a', weight: 300 },
  { text: 'completion.', color: '#1a1a1a', weight: 600 },
];

const DISPLAY_H = HEADLINE_ROWS.length * ROW_HEIGHT + CANVAS_PAD_Y * 2;

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

function syncCanvasSize(canvas) {
  const ow = canvas.offsetWidth;
  const oh = canvas.offsetHeight;
  if (canvas.width !== ow || canvas.height !== oh) {
    canvas.width = ow;
    canvas.height = oh;
  }
}

function drawFiveRows(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (w < 8) return;

  ctx.font = `600 ${FONT_SIZE}px ${FONT_FAMILY}`;
  const trackAGap = ctx.measureText('T').width + 10;

  const xTrackB = 0;
  const xTrackA = trackAGap;

  const widths = HEADLINE_ROWS.map((row) => {
    ctx.font = `${row.weight} ${FONT_SIZE}px ${FONT_FAMILY}`;
    return ctx.measureText(row.text).width;
  });

  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < HEADLINE_ROWS.length; i++) {
    const xLocal = i % 2 === 0 ? xTrackA : xTrackB;
    const right = xLocal + widths[i];
    minX = Math.min(minX, xLocal);
    maxX = Math.max(maxX, right);
  }
  const blockWidth = maxX - minX;
  const offsetX = (w - blockWidth) / 2 - minX;

  const y0 = CANVAS_PAD_Y + ROW_HEIGHT / 2;

  for (let i = 0; i < HEADLINE_ROWS.length; i++) {
    const row = HEADLINE_ROWS[i];
    const y = y0 + i * ROW_HEIGHT;
    const xLocal = i % 2 === 0 ? xTrackA : xTrackB;
    const x = offsetX + xLocal;

    ctx.font = `${row.weight} ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = row.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.text, x, y);
  }
}

function LandingCanvasHeadline() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let disposed = false;

    function paint() {
      if (disposed) return;
      syncCanvasSize(canvas);
      drawFiveRows(ctx);
    }

    const ro = new ResizeObserver(() => {
      paint();
    });
    ro.observe(wrap);

    function afterFonts() {
      if (disposed) return;
      paint();
    }

    if (document.fonts?.ready) {
      void document.fonts.ready.then(afterFonts);
    } else {
      afterFonts();
    }

    return () => {
      disposed = true;
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: DISPLAY_H,
        overflow: 'hidden',
        margin: 'clamp(4px, 1vw, 12px) 0 clamp(10px, 1.5vw, 18px)',
        background: 'transparent',
      }}
    >
      <h1 style={srOnly}>The gap is not capability. It is completion.</h1>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: 'block',
          width: '100%',
          height: DISPLAY_H,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function Landing() {
  return (
    <section className="landing" aria-label="Portfolio landing">
      <header className="hero-copy reveal">
        <LandingCanvasHeadline />
        <p
          className="hero-sub"
          style={{
            textAlign: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          I design enterprise AI systems by defining how autonomy, human judgment, workflow execution, and accountability work together.
        </p>
      </header>
      <a className="scroll-cue" href="#selected-work">
        <span className="line" />
        <span>View selected work</span>
      </a>
    </section>
  );
}
