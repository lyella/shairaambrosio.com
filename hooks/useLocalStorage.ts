import { useCallback, useState, useSyncExternalStore } from "react";

// Persisted string state backed by localStorage.
//
// The stored value is read through useSyncExternalStore: localStorage is an
// external store, and reading it during the server render is impossible anyway.
// That keeps render pure, removes the extra mount render the old version caused,
// and lets every component reading the same key stay in sync — including across
// tabs, which the previous implementation could not do.
//
// The `set` returned here writes both the external store and a local state value so
// an update repaints immediately even when another store instance is mounted.
const listeners = new Map<string, Set<() => void>>();

const emit = (key: string) => {
  listeners.get(key)?.forEach((listener) => listener());
};

const subscribeToKey = (key: string) => {
  const add = (listener: () => void) => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(listener);

    // Keep tabs in sync. `storage` fires only in other documents, which is exactly
    // the case the in-memory listeners cannot cover.
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      set!.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return add;
};

const readStored = <T extends string>(key: string, fallback: T): T => {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
};

export const useLocalStorage = <T extends string>(key: string, defaultValue: T) => {
  const [override, setOverride] = useState<T | null>(null);

  const stored = useSyncExternalStore(
    subscribeToKey(key),
    () => readStored(key, defaultValue),
    () => defaultValue,
  );

  const setStoredVal = useCallback(
    (next: T) => {
      setOverride(next);
      try {
        localStorage.setItem(key, next);
      } catch (err) {
        console.error(err);
      }
      emit(key);
    },
    [key],
  );

  return [override ?? stored, setStoredVal] as const;
};
