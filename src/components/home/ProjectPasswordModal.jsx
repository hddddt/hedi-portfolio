import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProjectAccess } from '../../context/ProjectAccessContext.jsx';

const EXPECTED =
  typeof import.meta.env.VITE_PROJECT_PASSWORD === 'string' &&
  import.meta.env.VITE_PROJECT_PASSWORD.length > 0
    ? import.meta.env.VITE_PROJECT_PASSWORD
    : 'Mega2026!';

function isValidPassword(input) {
  const typed = String(input ?? '').trim();
  const expected = String(EXPECTED ?? '').trim();
  if (!typed || !expected) return false;
  if (typed === expected) return true;

  // Backward-compatible: accept with/without trailing "!".
  const typedBase = typed.replace(/!+$/, '');
  const expectedBase = expected.replace(/!+$/, '');
  return typedBase.length > 0 && typedBase === expectedBase;
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.5 10.7A4 4 0 0 0 12 16a4 4 0 0 0 3.9-3.1M6.2 6.2C4.4 7.6 3 9.5 2 12s3.5 7 10 7c1.6 0 3-.3 4.2-.9M14 5.2A9.8 9.8 0 0 1 22 12c-.7 1.9-2 3.6-3.7 4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectPasswordModal() {
  const { modalOpen, closeModal, cancelAccess, persistUnlock } = useProjectAccess();
  const [value, setValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!modalOpen) {
      setValue('');
      setShowKey(false);
      setShake(false);
      return undefined;
    }
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e) => {
      if (e.key === 'Escape') cancelAccess();
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.dataset.projectAccessModal = 'open';
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener('keydown', onKey);
      delete document.documentElement.dataset.projectAccessModal;
    };
  }, [modalOpen, cancelAccess]);

  if (!modalOpen || typeof document === 'undefined') return null;

  const submit = (e) => {
    e.preventDefault();
    if (isValidPassword(value)) {
      persistUnlock();
      closeModal();
      return;
    }
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  };

  return createPortal(
    <div className="project-access-modal" role="presentation">
      <button
        type="button"
        className="project-access-modal__backdrop"
        aria-label="Close"
        onClick={cancelAccess}
      />
      <form
        className={`project-access-modal__panel${shake ? ' is-shake' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-access-title"
        onSubmit={submit}
      >
        <div className="project-access-modal__copy">
          <h2 id="project-access-title" className="project-access-modal__title">
            Give the key
          </h2>
          <p className="project-access-modal__lede">To view more detailed content.</p>
        </div>

        <div className="project-access-modal__row">
          <div className="project-access-modal__field">
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              className="project-access-modal__input"
              value={value}
              autoComplete="current-password"
              aria-label="Access key"
              onChange={(e) => {
                setValue(e.target.value);
                setShake(false);
              }}
            />
            <button
              type="button"
              className="project-access-modal__eye"
              aria-label={showKey ? 'Hide password' : 'Show password'}
              aria-pressed={showKey}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
          <button type="submit" className="project-access-modal__confirm" aria-label="Unlock">
            <CheckIcon />
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
