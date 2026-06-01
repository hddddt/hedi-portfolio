import { useCallback, useEffect, useRef, useState } from 'react';
import { SCROLL_HOME_PROTOTYPE } from './config/scrollHomeMode.js';
import { CapabilityBlurTunePage } from './pages/CapabilityBlurTunePage.jsx';
import { HomeScrollExperience } from './components/home/HomeScrollExperience.jsx';
import { PortfolioPage } from './components/portfolio/PortfolioPage.jsx';
import { Nav } from './components/portfolio/Nav.jsx';
import CaseDetail from './components/CaseDetail.jsx';
import { CaseBar } from './components/CaseBar.jsx';
import { cases } from './data/cases.js';
import { navLinks } from './data/portfolio.js';

function isCapBlurTuneDev() {
  if (!import.meta.env.DEV) return false;
  const { pathname, hash, search } = window.location;
  return (
    pathname === '/dev/cap-blur' ||
    hash === '#/dev/cap-blur' ||
    new URLSearchParams(search).get('dev') === 'cap-blur'
  );
}

export default function App() {
  const progressRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const [openCaseId, setOpenCaseId] = useState(null);
  const [navHidden, setNavHidden] = useState(false);
  const [capBlurTuneDev, setCapBlurTuneDev] = useState(isCapBlurTuneDev);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const sync = () => setCapBlurTuneDev(isCapBlurTuneDev());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  useEffect(() => {
    if (SCROLL_HOME_PROTOTYPE) {
      document.documentElement.classList.add('home-scroll-page');
      return () => document.documentElement.classList.remove('home-scroll-page');
    }
    return undefined;
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setNavHidden(false);
  }, [openCaseId]);

  useEffect(() => {
    const progress = progressRef.current;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const prev = lastScrollYRef.current;
        const dy = y - prev;
        lastScrollYRef.current = y;

        const h = document.documentElement;
        const denom = h.scrollHeight - h.clientHeight;
        const scrolled = denom > 0 ? y / denom : 0;
        if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`;

        if (SCROLL_HOME_PROTOTYPE) return;

        const showNavTop = 56;
        if (y < showNavTop) setNavHidden(false);
        else if (dy > 8) setNavHidden(true);
        else if (dy < -8) setNavHidden(false);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [openCaseId]);

  useEffect(() => {
    let alive = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0, rootMargin: '80px 0px 80px 0px' },
    );
    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach((el) => io.observe(el));
    requestAnimationFrame(() => {
      if (!alive) return;
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      });
    });
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [openCaseId, SCROLL_HOME_PROTOTYPE]);

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
    setTimeout(() => document.getElementById('selected-work')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, []);

  useEffect(() => {
    if (openCaseId || SCROLL_HOME_PROTOTYPE) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCase();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openCaseId, closeCase]);

  if (import.meta.env.DEV && capBlurTuneDev) {
    return <CapabilityBlurTunePage />;
  }

  if (SCROLL_HOME_PROTOTYPE) {
    return (
      <>
        <div className="progress" ref={progressRef} />
        <main id="top" className="home-scroll-main">
          <HomeScrollExperience />
        </main>
      </>
    );
  }

  return (
    <>
      <div className="progress" ref={progressRef} />
      {!openCaseId && <Nav hidden={navHidden} links={navLinks} />}

      {openCaseId && (
        <CaseBar cases={cases} activeCaseId={openCaseId} onSelectCase={switchCase} onOverview={closeCase} />
      )}

      <main id="top" className={`app-main-shell${openCaseId ? ' app-main-shell--case-open' : ''}`}>
        <PortfolioPage onOpenCase={openCase} />
        {cases.map((c) => (
          <div key={c.id} className="section-card section-card--case">
            <CaseDetail data={c} isOpen={openCaseId === c.id} />
          </div>
        ))}
      </main>
    </>
  );
}
