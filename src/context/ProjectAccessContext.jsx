import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ProjectAccessContext = createContext(null);
/** Legacy key — cleared on load so old sessions do not skip the gate */
const PROJECT_UNLOCKED_KEY = 'portfolioProjectUnlocked';

/** Client-side gate for portfolio case details — use server auth for confidential work. */
export function ProjectAccessProvider({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCaseId, setPendingCaseId] = useState(null);

  useEffect(() => {
    try {
      sessionStorage.removeItem(PROJECT_UNLOCKED_KEY);
      localStorage.removeItem(PROJECT_UNLOCKED_KEY);
    } catch {
      // Ignore storage failures (private mode / disabled storage).
    }
  }, []);

  const persistUnlock = useCallback(() => {
    setUnlocked(true);
  }, []);

  const requestAccess = useCallback(
    (caseId) => {
      if (unlocked) return true;
      if (caseId) setPendingCaseId(caseId);
      setModalOpen(true);
      return false;
    },
    [unlocked],
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  const cancelAccess = useCallback(() => {
    setModalOpen(false);
    setPendingCaseId(null);
  }, []);

  const clearPendingCase = useCallback(() => setPendingCaseId(null), []);

  const value = useMemo(
    () => ({
      unlocked,
      modalOpen,
      pendingCaseId,
      requestAccess,
      persistUnlock,
      closeModal,
      cancelAccess,
      clearPendingCase,
      setModalOpen,
    }),
    [
      unlocked,
      modalOpen,
      pendingCaseId,
      requestAccess,
      persistUnlock,
      closeModal,
      cancelAccess,
      clearPendingCase,
    ],
  );

  return (
    <ProjectAccessContext.Provider value={value}>{children}</ProjectAccessContext.Provider>
  );
}

export function useProjectAccess() {
  const ctx = useContext(ProjectAccessContext);
  if (!ctx) {
    throw new Error('useProjectAccess must be used within ProjectAccessProvider');
  }
  return ctx;
}
