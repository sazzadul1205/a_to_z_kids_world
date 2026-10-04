import { useCallback, useEffect, useState } from "react";

// Small async-data hook used everywhere the app reads from the API.
//
// The fetch is started through a resolved promise so no setState ever runs
// synchronously inside the effect body, and every result is guarded by an
// `active` flag plus an AbortSignal so a fast filter change cannot land a
// stale response.
//
// Callers must memoise `fetcher` (useCallback) — it is the only effect
// dependency, so a new identity means a new request.
export function useResource(fetcher) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [nonce, setNonce] = useState(0);
  const [trackedFetcher, setTrackedFetcher] = useState(fetcher);

  // A new fetcher identity means a different resource, so the previous result
  // must not stay on screen as if it belonged to the new one. Adjusting state
  // during render (rather than in the effect) keeps the stale value from ever
  // being committed, without a sync setState inside the effect body.
  if (trackedFetcher !== fetcher) {
    setTrackedFetcher(fetcher);
    setState({ status: "loading", data: null, error: null });
  }

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    Promise.resolve()
      .then(() => fetcher({ signal: controller.signal }))
      .then(
        (data) => {
          if (active) setState({ status: "ready", data, error: null });
        },
        (error) => {
          if (!active || error?.name === "AbortError") return;
          setState((current) => ({ status: "error", data: current.data, error }));
        },
      );

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetcher, nonce]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, status: "loading", error: null }));
    setNonce((value) => value + 1);
  }, []);

  return { ...state, reload };
}