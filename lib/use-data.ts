"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";

// Loads a path whenever it changes. reload() fetches again after a save.
export function useData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    let active = true;
    api<T>(path)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { data, error, loading: !data && !error, reload };
}
