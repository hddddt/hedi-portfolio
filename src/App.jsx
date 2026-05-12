import { useCallback, useEffect, useRef, useState } from 'react';
import Landing from './components/Landing.jsx';
import CaseOverview from './components/CaseOverview.jsx';
import CaseDetail from './components/CaseDetail.jsx';
import { SectionHeader } from './components/SectionHeader.jsx';
import { cases, questionsBlock } from './data/cases.js';

export default function App() {
  const progressRef = useRef(null);
  const [openCaseId, setOpenCaseId] = useState(null);

  useEffect(() => {
    const progress = progressRef.current;
    const updateProgress = () => {
      const h = document.documentElement;
      const denom = h.scrollHeight - h.clientHeight;
      const scrolled = denom > 0 ? h.scrollTop / denom : 0;
      if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [openCaseId]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [openCaseId]);

  const openCase = useCallback((id) => {
    setOpenCaseId(id);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }, []);

  const switchCase = useCallback((id) => {
    setOpenCaseId(id);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  }, []);

  const closeCase = useCallback(() => {
    setOpenCaseId(null);
    setTimeout(() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, []);

  return (
    <>
      <div className="progress" ref={progressRef} />
      <header className="nav">
        <span className="nav-logo">AI Systems Portfolio</span>
        <div className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#questions">AI Questions</a>
        </div>
      </header>

      <main id="top">
        <Landing />
        <CaseOverview onOpenCase={openCase} />
        {cases.map((c) => (
          <CaseDetail
            key={c.id}
            data={c}
            isOpen={openCaseId === c.id}
            onClose={closeCase}
            onSwitch={switchCase}
          />
        ))}
        <section className="overview" id="questions" style={{ paddingTop: 30 }}>
          <SectionHeader
            kicker={questionsBlock.kicker}
            titleLines={questionsBlock.titleLines}
            sub={questionsBlock.sub}
            kickerClassName="section-kicker"
            headClassName="ov-head"
          />
        </section>
      </main>
    </>
  );
}
