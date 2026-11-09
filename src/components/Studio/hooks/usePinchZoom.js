import React from "react";
import { PINCH_ZOOM } from "../constants";

const distance = (touches) =>
  Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Two-finger pinch zoom for the page.
 *
 * While pinching, the page container is scaled with a CSS transform around
 * the fingers' midpoint (cheap, and the blocks inside follow). On release the
 * transform is dropped and the real zoom (`imageScaleFactor`) is committed —
 * Studio recalculates the blocks on zoom change — and the scroll position is
 * adjusted so the pinched point stays under the fingers.
 *
 * One-finger touches are left alone (scrolling, tapping blocks); the browser's
 * own page zoom is blocked inside the editor only.
 *
 * @param {Object} params
 * @param {React.RefObject<HTMLElement>} params.scrollRef - Scrolling editor element
 * @param {React.RefObject<HTMLElement>} params.contentRef - Page container to scale
 * @param {number} params.scale - Current imageScaleFactor
 * @param {Function} params.setScale - imageScaleFactor setter
 * @param {Function} [params.onZoomed] - Called once the new zoom is in the
 *   DOM (e.g. recalculate block positions right away instead of waiting for
 *   the resize observer's debounce)
 * @param {number} [params.min]
 * @param {number} [params.max]
 */
const usePinchZoom = ({
  scrollRef,
  contentRef,
  scale,
  setScale,
  onZoomed,
  min = PINCH_ZOOM.MIN,
  max = PINCH_ZOOM.MAX,
}) => {
  const scaleRef = React.useRef(scale);
  const setScaleRef = React.useRef(setScale);
  const onZoomedRef = React.useRef(onZoomed);
  // Scroll position to restore once the committed zoom has rendered
  const pendingScrollRef = React.useRef(null);

  React.useEffect(() => {
    scaleRef.current = scale;
    setScaleRef.current = setScale;
    onZoomedRef.current = onZoomed;
  });

  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return undefined;

    let gesture = null;
    // The element currently carrying the preview transform
    let transformed = null;

    const resetTransform = () => {
      if (!transformed) return;
      transformed.style.transform = "";
      transformed.style.transformOrigin = "";
      transformed.style.willChange = "";
      transformed = null;
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 2) return;
      const content = contentRef.current;
      if (!content) return;
      event.preventDefault();
      pendingScrollRef.current = null;

      const [a, b] = event.touches;
      const midX = (a.clientX + b.clientX) / 2;
      const midY = (a.clientY + b.clientY) / 2;
      const contentRect = content.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();

      gesture = {
        startDistance: distance(event.touches) || 1,
        startScale: scaleRef.current,
        ratio: 1,
        // Midpoint inside the page container (transform origin)
        originX: midX - contentRect.left,
        originY: midY - contentRect.top,
        // Page container's position in the scroller's content
        contentX: contentRect.left - scrollerRect.left + scroller.scrollLeft,
        contentY: contentRect.top - scrollerRect.top + scroller.scrollTop,
        // Midpoint inside the scroller's visible area
        viewX: midX - scrollerRect.left,
        viewY: midY - scrollerRect.top,
      };
      transformed = content;
      content.style.transformOrigin = `${gesture.originX}px ${gesture.originY}px`;
      content.style.willChange = "transform";
    };

    const onTouchMove = (event) => {
      if (!gesture || event.touches.length !== 2) return;
      event.preventDefault();
      const target = clamp(
        (gesture.startScale * distance(event.touches)) / gesture.startDistance,
        min,
        max
      );
      gesture.ratio = target / gesture.startScale;
      if (transformed) {
        transformed.style.transform = `scale(${gesture.ratio})`;
      }
    };

    const onTouchEnd = (event) => {
      if (!gesture || event.touches.length >= 2) return;
      const { ratio, startScale } = gesture;
      const finished = gesture;
      gesture = null;
      resetTransform();
      if (Math.abs(ratio - 1) < 0.01) return;

      // Keep the pinched point under the fingers (applied after render)
      pendingScrollRef.current = {
        left: finished.contentX + finished.originX * ratio - finished.viewX,
        top: finished.contentY + finished.originY * ratio - finished.viewY,
      };
      setScaleRef.current(Math.round(startScale * ratio * 100) / 100);
    };

    // iOS Safari: stop its own page zoom gesture inside the editor
    const preventGesture = (event) => event.preventDefault();

    scroller.addEventListener("touchstart", onTouchStart, { passive: false });
    scroller.addEventListener("touchmove", onTouchMove, { passive: false });
    scroller.addEventListener("touchend", onTouchEnd);
    scroller.addEventListener("touchcancel", onTouchEnd);
    scroller.addEventListener("gesturestart", preventGesture);

    return () => {
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchEnd);
      scroller.removeEventListener("gesturestart", preventGesture);
      resetTransform();
    };
  }, [scrollRef, contentRef, min, max]);

  // Runs after the new zoom is in the DOM (the image width is a % of scale),
  // so the scroller can already scroll that far.
  React.useLayoutEffect(() => {
    const pending = pendingScrollRef.current;
    const scroller = scrollRef.current;
    if (!pending || !scroller) return;
    pendingScrollRef.current = null;
    scroller.scrollLeft = pending.left;
    scroller.scrollTop = pending.top;
    onZoomedRef.current?.();
  }, [scale, scrollRef]);
};

export default usePinchZoom;
