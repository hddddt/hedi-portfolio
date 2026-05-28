import '../../styles/home-scroll.css';
import '../../styles/home-narrative.css';
import '../../styles/home-point-of-view.css';
import '../../styles/home-life-archive.css';
import '../../styles/project-access.css';
import '../../styles/portfolio-guide.css';
import '../../styles/guide-orb.css';
import { narrativeChapters } from '../../data/narrativeChapters.js';
import { homeScrollChapters } from '../../data/homeScrollChapters.js';
import { FieldNarrativeProvider } from '../../context/FieldNarrativeContext.jsx';
import { NarrativeScrollProvider } from '../../context/NarrativeScrollContext.jsx';
import { OrganicFieldHostProvider, useOrganicFieldHost } from '../../context/OrganicFieldHostContext.jsx';
import { PerspectiveProvider } from '../../context/PerspectiveContext.jsx';
import { ProjectAccessProvider } from '../../context/ProjectAccessContext.jsx';
import { AboutContactSection } from './AboutContactSection.jsx';
import { MeCurrentWorkSection } from './MeCurrentWorkSection.jsx';
import { MePathSection } from './MePathSection.jsx';
import { LifeArchiveSection } from '../LifeArchive/LifeArchiveSection.jsx';
import { ViewportOrganicField } from './OrganicField.jsx';
import { PortfolioGuide } from './PortfolioGuide.jsx';
import { ApproachSection } from './ApproachSection.jsx';
import { PovSourcesDock } from './PovSourcesDock.jsx';
import { CapabilityDialSection } from './CapabilityDialSection.jsx';
import { Header } from './Header.jsx';
import { NarrativeChapter } from './NarrativeChapter.jsx';
import { OpeningBridgeSection } from './OpeningBridgeSection.jsx';
import { ProjectPasswordModal } from './ProjectPasswordModal.jsx';
import { WorkNarrativeSection } from './WorkNarrativeSection.jsx';

function HomeScrollInner() {
  return (
    <div className="home-scroll">
      <Header />
      <ProjectPasswordModal />
      <NarrativeChapter
        id="home-landing"
        sectionClassName="home-hero"
        chapterNum="01"
        chapterLabel="Position"
        ambientKey="warm"
        ariaLabel="Position"
        hideRibbon
      >
        <OpeningBridgeSection />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-capabilities"
        sectionClassName="cap-dial-chapter"
        chapterNum="02"
        chapterLabel="Capabilities"
        ambientKey="signal"
        ariaLabel="Capabilities"
      >
        <CapabilityDialSection />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-work-narrative"
        sectionClassName="work-narrative-chapter"
        chapterNum="03"
        chapterLabel="Work"
        ambientKey="work"
        ariaLabel="Work"
      >
        <WorkNarrativeSection cases={homeScrollChapters} />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-approach"
        sectionClassName="home-pov"
        chapterNum="04"
        chapterLabel="Point of View"
        ambientKey="depth"
        ariaLabel="Point of View"
      >
        <ApproachSection />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-life-archive"
        sectionClassName="home-life-archive"
        chapterNum="05"
        chapterLabel="Beyond the Work"
        ambientKey="archive"
        ariaLabel="Beyond the Work"
      >
        <div className="home-beyond-work">
          <div className="home-beyond-work__content">
            <section id="home-beyond-path" className="home-beyond-work__part home-beyond-work__part--path">
              <MePathSection />
              <figure className="home-me-path__portrait">
                <img
                  src="/images/case1/hedi.jpg"
                  alt="Hedi"
                  width={480}
                  height={640}
                  decoding="async"
                />
              </figure>
              <div className="home-me__path-divider" aria-hidden="true" />
            </section>

            <section
              id="home-beyond-archive"
              className="home-beyond-work__part home-beyond-work__part--archive"
            >
              <LifeArchiveSection />
            </section>

            <section id="home-beyond-resoa" className="home-beyond-work__part home-beyond-work__part--resoa">
              <MeCurrentWorkSection />
            </section>

            <div id="home-contact" className="home-life-archive__contact home-life-archive__contact--tail">
              <AboutContactSection />
            </div>
          </div>
        </div>
      </NarrativeChapter>
    </div>
  );
}

function HomeScrollRootLayout() {
  const { setRootHost } = useOrganicFieldHost();

  return (
    <div className="home-scroll-root">
      <div ref={setRootHost} className="organic-field-host organic-field-host--viewport" aria-hidden="true" />
      <HomeScrollInner />
      <ViewportOrganicField />
      <PovSourcesDock />
      <PortfolioGuide />
    </div>
  );
}

export function HomeScrollExperience() {
  return (
    <NarrativeScrollProvider chapters={narrativeChapters}>
      <FieldNarrativeProvider>
        <ProjectAccessProvider>
          <PerspectiveProvider>
            <OrganicFieldHostProvider>
              <HomeScrollRootLayout />
            </OrganicFieldHostProvider>
          </PerspectiveProvider>
        </ProjectAccessProvider>
      </FieldNarrativeProvider>
    </NarrativeScrollProvider>
  );
}
