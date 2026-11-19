"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("ap:inactivity-changed", onStoreChange);
  window.addEventListener("ap:local-storage-changed", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("ap:inactivity-changed", onStoreChange);
    window.removeEventListener("ap:local-storage-changed", onStoreChange);
  };
}

export function useLocalStorageSnapshot(key: string) {
  const subscribe = useCallback((onStoreChange: () => void) => subscribeToStorage(onStoreChange), []);
  const getSnapshot = useCallback(() => window.localStorage.getItem(key), [key]);
  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
