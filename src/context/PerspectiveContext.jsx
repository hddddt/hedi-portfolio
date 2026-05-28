import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const PerspectiveContext = createContext(null);

/** @typedef {'work' | 'thinking' | 'person' | null} PerspectiveKey */

export function PerspectiveProvider({ children }) {
  const [perspectiveKey, setPerspectiveKey] = useState(null);

  const clearPerspective = useCallback(() => setPerspectiveKey(null), []);

  const value = useMemo(
    () => ({
      perspectiveKey,
      setPerspectiveKey,
      clearPerspective,
    }),
    [perspectiveKey, clearPerspective],
  );

  return <PerspectiveContext.Provider value={value}>{children}</PerspectiveContext.Provider>;
}

export function usePerspective() {
  const ctx = useContext(PerspectiveContext);
  if (!ctx) {
    throw new Error('usePerspective must be used within PerspectiveProvider');
  }
  return ctx;
}
