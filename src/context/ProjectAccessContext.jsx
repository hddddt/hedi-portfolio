import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'portfolio_project_unlock_v2';

const ProjectAccessContext = createContext(null);

/** Client-side gate for portfolio case details — use server auth for confidential work. */
export function ProjectAccessProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCaseId, setPendingCaseId] = useState(null);

  const persistUnlock = useCallback(() => {
    setUnlocked(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore quota / private mode */
    }
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
