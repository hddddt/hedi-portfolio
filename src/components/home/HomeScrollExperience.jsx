import '../../styles/home-scroll.css';
import '../../styles/interaction-states.css';
import '../../styles/home-narrative.css';
import '../../styles/home-point-of-view.css';
import '../../styles/home-life-archive.css';
import '../../styles/project-access.css';
import '../../styles/portfolio-guide.css';
import '../../styles/guide-orb.css';
import { narrativeChapters } from '../../data/narrativeChapters.js';
import { homeScrollChapters } from '../../data/homeScrollChapters.js';
import { FieldNarrativeProvider } from '../../context/FieldNarrativeContext.jsx';
import { PovArchiveHandoffProvider } from '../../context/PovArchiveHandoffContext.jsx';
import { NarrativeScrollProvider } from '../../context/NarrativeScrollContext.jsx';
import { OrganicFieldHostProvider, useOrganicFieldHost } from '../../context/OrganicFieldHostContext.jsx';
import {
  OrbSceneChapterSync,
  OrbSceneContactSync,
  OrbSceneProvider,
  OrbSceneSemanticRoot,
} from '../../context/OrbSceneContext.jsx';
import { PerspectiveProvider } from '../../context/PerspectiveContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { ProjectAccessProvider } from '../../context/ProjectAccessContext.jsx';
import { AboutContactSection } from './AboutContactSection.jsx';
import { MeCurrentWorkSection } from './MeCurrentWorkSection.jsx';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { usePovArchiveHandoff } from '../../context/PovArchiveHandoffContext.jsx';
import { beyondWorkEntranceLayers } from '../../utils/povArchiveHandoff.js';
import { BeyondWorkCorridor } from './BeyondWorkCorridor.jsx';
import { MePathSection, MePathPortrait, MePathDivider } from './MePathSection.jsx';

function BeyondWorkAtmosphere() {
  const { handoff, reducedMotion } = usePovArchiveHandoff();
  const layers = useMemo(
    () => beyondWorkEntranceLayers(handoff, reducedMotion),
    [handoff, reducedMotion],
  );
  return <div className="home-beyond-work__atmosphere" aria-hidden="true" style={layers.atmosphere} />;
}
import { LifeArchiveSection } from '../LifeArchive/LifeArchiveSection.jsx';
import { ViewportOrganicField } from './OrganicField.jsx';
import { PortfolioShortcut } from './PortfolioGuide.jsx';
import { RevealObserver } from '../motion/RevealObserver.jsx';
import { ApproachSection } from './ApproachSection.jsx';
import { PovSourcesDock } from './PovSourcesDock.jsx';
import { CapabilityDialSection } from './CapabilityDialSection.jsx';
import { Header } from './Header.jsx';
import { NarrativeChapter } from './NarrativeChapter.jsx';
import { OpeningBridgeSection } from './OpeningBridgeSection.jsx';
import { ProjectPasswordModal } from './ProjectPasswordModal.jsx';
import { WorkNarrativeSection } from './WorkNarrativeSection.jsx';

function HomeScrollInner() {
  const capTrackRef = useRef(null);

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
        guideTargetId="capabilities"
        sectionClassName="cap-dial-chapter"
        chapterNum="02"
        chapterLabel="Capabilities"
        ambientKey="signal"
        ariaLabel="Capabilities"
        measureRef={capTrackRef}
      >
        <CapabilityDialSection trackRef={capTrackRef} />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-work-narrative"
        guideTargetId="selected-work"
        sectionClassName="work-narrative-chapter"
        chapterNum="03"
        chapterLabel="Work"
        ambientKey="work"
        ariaLabel="Work"
        measureSelector=".work-scroll"
      >
        <WorkNarrativeSection cases={homeScrollChapters} />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-approach"
        guideTargetId="point-of-view"
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
        guideTargetId="me"
        sectionClassName="home-life-archive"
        chapterNum="05"
        chapterLabel="Beyond the Work"
        ambientKey="archive"
        ariaLabel="Beyond the Work"
      >
        <div className="home-beyond-work" data-archive-handoff-root>
          <BeyondWorkAtmosphere />
          <div className="home-beyond-work__content">
            <section id="home-beyond-path" className="home-beyond-work__part home-beyond-work__part--path">
              <MePathSection />
              <MePathPortrait />
              <MePathDivider />
            </section>

            <BeyondWorkCorridor />

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
  const { activeId } = useNarrativeScroll();
  const { setRootHost } = useOrganicFieldHost();
  const { orbScene } = useOrbScene();
  const scrollRootRef = useRef(null);

  useLayoutEffect(() => {
    const root = scrollRootRef.current;
    if (!root || activeId === 'home-landing') return;
    delete root.dataset.openingBootActive;
  }, [activeId]);

  return (
    <div ref={scrollRootRef} className="home-scroll-root">
      <OrbSceneChapterSync activeId={activeId} />
      <OrbSceneContactSync />
      <OrbSceneSemanticRoot activeId={activeId} orbScene={orbScene} />
      <div
        ref={setRootHost}
        className="organic-field-host organic-field-host--viewport organic-field-host--legacy"
        data-orb-scene={orbScene}
        aria-hidden="true"
      />
      <RevealObserver rootRef={scrollRootRef} />
      <HomeScrollInner />
      <ViewportOrganicField />
      <PovSourcesDock />
      <PortfolioShortcut />
    </div>
  );
}

export function HomeScrollExperience() {
  return (
    <NarrativeScrollProvider chapters={narrativeChapters}>
      <OrbSceneProvider>
        <FieldNarrativeProvider>
          <PovArchiveHandoffProvider>
            <ProjectAccessProvider>
              <PerspectiveProvider>
                <OrganicFieldHostProvider>
                  <HomeScrollRootLayout />
                </OrganicFieldHostProvider>
              </PerspectiveProvider>
            </ProjectAccessProvider>
          </PovArchiveHandoffProvider>
        </FieldNarrativeProvider>
      </OrbSceneProvider>
    </NarrativeScrollProvider>
  );
}
