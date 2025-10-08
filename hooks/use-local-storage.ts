"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Updater<T> = T | ((prev: T) => T);

const isBrowser = typeof window !== "undefined";

function serialize<T>(value: T) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("useLocalStorage: failed to serialize", error);
    return undefined;
  }
}

function deserialize<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn("useLocalStorage: failed to deserialize", error);
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initializer = useRef(initialValue);
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) return initialValue;
    return deserialize<T>(window.localStorage.getItem(key), initialValue);
  });

  useEffect(() => {
    if (!isBrowser) return;
    const initial = serialize(initializer.current);
    const existing = window.localStorage.getItem(key);
    if (existing === null && initial !== undefined) {
      window.localStorage.setItem(key, initial);
    }
  }, [key]);

  const update = useCallback(
    (value: Updater<T>) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        if (isBrowser) {
          const serialized = serialize(next);
          if (serialized !== undefined) {
            window.localStorage.setItem(key, serialized);
          }
        }
        return next;
      });
    },
    [key]
  );

  const reset = useCallback(() => {
    update(initializer.current);
  }, [update]);

  return useMemo(
    () => ({
      value: state,
      setValue: update,
      reset,
    }),
    [state, update, reset]
  );
}
