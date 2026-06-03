import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "article_send.current_user_id";

interface CurrentUserContextValue {
  currentUserId: number | null;
  setCurrentUserId: (id: number | null) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(
  undefined
);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  });

  const setCurrentUserId = useCallback((id: number | null) => {
    setCurrentUserIdState(id);
  }, []);

  useEffect(() => {
    if (currentUserId === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(currentUserId));
    }
  }, [currentUserId]);

  const value = useMemo(
    () => ({ currentUserId, setCurrentUserId }),
    [currentUserId, setCurrentUserId]
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return ctx;
}
