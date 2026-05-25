import '../../styles/home-scroll.css';
import '../../styles/home-narrative.css';
import { narrativeChapters } from '../../data/narrativeChapters.js';
import { homeScrollChapters } from '../../data/homeScrollChapters.js';
import { NarrativeScrollProvider } from '../../context/NarrativeScrollContext.jsx';
import { AboutContactSection } from './AboutContactSection.jsx';
import { AmbientBackdrop } from './AmbientBackdrop.jsx';
import { ApproachSection } from './ApproachSection.jsx';
import { CapabilityDialSection } from './CapabilityDialSection.jsx';
import { ChapterRail } from './ChapterRail.jsx';
import { Header } from './Header.jsx';
import { NarrativeChapter } from './NarrativeChapter.jsx';
import { OpeningBridgeSection } from './OpeningBridgeSection.jsx';
import { WorkNarrativeSection } from './WorkNarrativeSection.jsx';

function HomeScrollInner() {
  return (
    <div className="home-scroll">
      <AmbientBackdrop />
      <ChapterRail />
      <Header />
      <NarrativeChapter
        id="home-landing"
        sectionClassName="home-hero"
        chapterNum="01"
        chapterLabel="Recognition"
        ambientKey="warm"
        ariaLabel="Product recognition"
        hideRibbon
      >
        <OpeningBridgeSection />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-capabilities"
        sectionClassName="cap-dial-chapter"
        chapterNum="02"
        chapterLabel="Behavior"
        ambientKey="signal"
        ariaLabel="Product behavior"
      >
        <CapabilityDialSection />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-work-narrative"
        sectionClassName="work-narrative-chapter"
        chapterNum="03"
        chapterLabel="Proof"
        ambientKey="work"
        ariaLabel="Product proof"
      >
        <WorkNarrativeSection cases={homeScrollChapters} />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-approach"
        sectionClassName="home-approach"
        chapterNum="04"
        chapterLabel="Memory"
        ambientKey="depth"
        ariaLabel="Product memory"
      >
        <ApproachSection />
      </NarrativeChapter>
      <NarrativeChapter
        id="home-contact"
        sectionClassName="home-about"
        chapterNum="05"
        chapterLabel="Action"
        ambientKey="contact"
        ariaLabel="Product action"
      >
        <AboutContactSection />
      </NarrativeChapter>
    </div>
  );
}

export function HomeScrollExperience() {
  return (
    <NarrativeScrollProvider chapters={narrativeChapters}>
      <HomeScrollInner />
    </NarrativeScrollProvider>
  );
}
