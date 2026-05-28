import { useCallback, useMemo, useState } from 'react';
import { getSignalIndex } from '../../utils/lifeArchiveIndex.js';
import {
  formatInterpretationClusterLine,
  getInterpretationPhotos,
  interpretLifeArchiveQuestion,
  LIFE_ARCHIVE_QUESTIONS,
} from './lifeArchiveInterpretation.js';

const PANEL_TITLE = 'Ask what I noticed';
const PANEL_DESCRIPTION =
  'Choose a question. The archive reads the metadata and returns a pattern, not a caption.';

export function LifeAIPanel() {
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [result, setResult] = useState(null);

  const onSelectQuestion = useCallback((questionId) => {
    setActiveQuestionId(questionId);
    setResult(interpretLifeArchiveQuestion(questionId));
  }, []);

  const relatedPhotos = useMemo(
    () => (result ? getInterpretationPhotos(result.photoIds) : []),
    [result],
  );

  const clusterLine = useMemo(
    () => (result ? formatInterpretationClusterLine(result.clusterIds) : ''),
    [result],
  );

  return (
    <aside className="life-ai-panel" aria-labelledby="life-ai-panel-title">
      <h3 id="life-ai-panel-title" className="life-ai-panel__title">
        {PANEL_TITLE}
      </h3>
      <p className="life-ai-panel__description">{PANEL_DESCRIPTION}</p>

      <div className="life-ai-panel__questions" role="group" aria-label="Archive questions">
        {LIFE_ARCHIVE_QUESTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`life-ai-panel__question${activeQuestionId === id ? ' is-active' : ''}`}
            onClick={() => onSelectQuestion(id)}
            aria-pressed={activeQuestionId === id}
          >
            {label}
          </button>
        ))}
      </div>

      {result && (
        <div className="life-ai-panel__result" aria-live="polite">
          <p className="life-ai-panel__interpretation">{result.interpretation}</p>

          {relatedPhotos.length > 0 && (
            <ul className="life-ai-panel__photos" aria-label="Related archive signals">
              {relatedPhotos.map((photo) => (
                <li key={photo.id}>
                  <a href={`#${photo.id}`} className="life-ai-panel__photo-link">
                    <img
                      src={photo.imageSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="life-ai-panel__photo-img"
                    />
                    <span className="life-ai-panel__photo-meta">
                      <span className="life-ai-panel__photo-index">{getSignalIndex(photo)}</span>
                      <span className="life-ai-panel__photo-title">{photo.title}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {clusterLine && <p className="life-ai-panel__cluster-line">{clusterLine}</p>}
        </div>
      )}
    </aside>
  );
}
