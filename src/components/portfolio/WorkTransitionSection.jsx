import { SectionLabel } from './SectionLabel.jsx';
import { workTransition } from '../../data/portfolio.js';

export function WorkTransitionSection() {
  const { motion, guidingQuestions } = workTransition;

  return (
    <section
      className="portfolio-section portfolio-section--transition work-transition"
      id="work-transition"
      aria-labelledby="work-transition-title"
    >
      <div className="work-transition__inner">
        <header className="work-transition__head reveal">
          <SectionLabel>{workTransition.sectionLabel}</SectionLabel>
          <h2 className="work-transition__title" id="work-transition-title">
            {workTransition.title}
          </h2>
          <p className="work-transition__intro">{workTransition.intro}</p>
        </header>

        <div className="work-transition__narrative" aria-label="Guiding questions and case echoes">
          <div className="work-transition__spine" aria-hidden="true" />
          <ol className="work-transition__steps">
            {guidingQuestions.map((item) => (
              <li key={item.id} className="work-transition__step reveal">
                <span className="work-transition__node" aria-hidden="true" />
                <div className="work-transition__step-body">
                  <p className="work-transition__question">{item.question}</p>
                  <p className="work-transition__echo">
                    <span className="work-transition__echo-num">{item.caseNum}</span>
                    <span className="work-transition__echo-title">{item.caseTitle}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <aside className="work-transition__motion" aria-label={motion.srLabel}>
        <div className="work-transition__motion-head">
          <SectionLabel>{motion.kicker}</SectionLabel>
          <p className="work-transition__motion-note">{motion.note}</p>
        </div>
        <p className="sr-only">
          {guidingQuestions.map((item) => `${item.caseNum}: ${item.caseTitle}`).join('. ')}.
        </p>
        <div className="work-transition__motion-stage reveal" aria-hidden="true">
          <div className="work-transition__native-scene">
            <div className="work-transition__native-field" aria-hidden="true">
              <span className="work-transition__native-line work-transition__native-line--rail" />
              <span className="work-transition__native-line work-transition__native-line--horiz" />
              {guidingQuestions.map((item, index) => (
                <span
                  key={item.id}
                  className="work-transition__native-node"
                  data-wt-node={index + 1}
                  aria-hidden="true"
                />
              ))}
            </div>
            <ol className="work-transition__native-stack">
              {guidingQuestions.map((item) => (
                <li key={item.id} className="work-transition__native-fragment">
                  <div className="work-transition__native-fragment__tilt">
                    <span className="work-transition__native-fragment__edge" aria-hidden="true" />
                    <div className="work-transition__native-fragment__body">
                      <span className="work-transition__native-fragment__num">{item.caseNum}</span>
                      <span className="work-transition__native-fragment__title">{item.caseTitle}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </section>
  );
}
