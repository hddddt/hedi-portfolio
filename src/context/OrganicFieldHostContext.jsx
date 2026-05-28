import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const OrganicFieldHostContext = createContext(null);

export function OrganicFieldHostProvider({ children }) {
  const rootHostRef = useRef(null);
  const [rootHostReady, setRootHostReady] = useState(false);

  const setRootHost = useCallback((el) => {
    rootHostRef.current = el;
    setRootHostReady(!!el);
  }, []);

  const value = useMemo(
    () => ({
      rootHostRef,
      setRootHost,
      rootHostReady,
    }),
    [rootHostReady, setRootHost],
  );

  return (
    <OrganicFieldHostContext.Provider value={value}>{children}</OrganicFieldHostContext.Provider>
  );
}

export function useOrganicFieldHost() {
  const ctx = useContext(OrganicFieldHostContext);
  if (!ctx) {
    throw new Error('useOrganicFieldHost must be used within OrganicFieldHostProvider');
  }
  return ctx;
}
