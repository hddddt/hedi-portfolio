import { HeroSection } from './HeroSection.jsx';
import { ValueSection } from './ValueSection.jsx';
import { WorkTransitionSection } from './WorkTransitionSection.jsx';
import { SelectedWorkSection } from './SelectedWorkSection.jsx';
import { DesignApproachSection } from './DesignApproachSection.jsx';
import { ContactSection } from './ContactSection.jsx';

/**
 * Single-page portfolio body: identity → value → work bridge → cases → approach → contact.
 * Case detail panels follow in App (unchanged).
 */
export function PortfolioPage({ onOpenCase }) {
  return (
    <>
      <div className="section-card section-card--hero-identity">
        <HeroSection />
      </div>
      <div className="section-card">
        <ValueSection />
      </div>
      <div className="section-card">
        <WorkTransitionSection />
      </div>
      <div className="section-card">
        <SelectedWorkSection onOpenCase={onOpenCase} />
      </div>
      <div className="section-card">
        <DesignApproachSection />
      </div>
      <div className="section-card section-card--contact-end">
        <ContactSection />
      </div>
    </>
  );
}
