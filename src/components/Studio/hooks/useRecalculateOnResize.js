import React from "react";
import { TIMEOUTS } from "../constants";

/**
 * Re-runs area recalculation when the page image changes size — window
 * resize, device rotation, side columns opening/closing. Areas are stored in
 * px converted from their percentage source (`_percent*`) only on image load,
 * so without this they drift away from the page after any layout change.
 *
 * The first measurement of each element is skipped: the image's onLoad
 * already recalculates for the initial size.
 *
 * @param {Function} getElement - Returns the element to observe (the page
 *   image). Read on every render, so a remounted image is picked up.
 * @param {Function} recalculate - Recalculates the active page's areas.
 * @param {number} [delay] - Debounce in ms.
 */
const useRecalculateOnResize = (
  getElement,
  recalculate,
  delay = TIMEOUTS.RESIZE_RECALCULATE_DEBOUNCE
) => {
  const recalculateRef = React.useRef(recalculate);
  const observerRef = React.useRef(null);
  const observedRef = React.useRef(null);
  const lastSizeRef = React.useRef(null);

  React.useEffect(() => {
    recalculateRef.current = recalculate;
  });

  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;

    let timer = null;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[entries.length - 1].contentRect;
      // Not loaded / not displayed yet
      if (!width || !height) return;

      const last = lastSizeRef.current;
      lastSizeRef.current = { width, height };
      if (!last || (last.width === width && last.height === height)) return;

      clearTimeout(timer);
      timer = setTimeout(() => recalculateRef.current?.(), delay);
    });
    observerRef.current = observer;

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      observerRef.current = null;
      observedRef.current = null;
    };
  }, [delay]);

  // No deps: the image element is swapped when the page or render mode
  // changes, so re-check it after every render (cheap identity compare).
  React.useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    const element = getElement() || null;
    if (element === observedRef.current) return;

    if (observedRef.current) observer.unobserve(observedRef.current);
    observedRef.current = element;
    lastSizeRef.current = null;
    if (element) observer.observe(element);
  });
};

export default useRecalculateOnResize;
