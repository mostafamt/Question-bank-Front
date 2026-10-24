import { useCallback, useEffect, useRef } from "react";

/** How long a finger must rest before it counts as a long-press */
export const LONG_PRESS_DELAY = 500;
/** Movement (px) that turns a press into a scroll and cancels it */
export const LONG_PRESS_MOVE_TOLERANCE = 10;
/** Android fires its own `contextmenu` after a long-press; ignore it */
const NATIVE_MENU_GRACE = 1000;

/**
 * Touch long-press → `onLongPress({ clientX, clientY, target })`.
 *
 * Touch only: mouse and pen keep using right-click. After a long-press the
 * tap that ends it is swallowed (otherwise lifting the finger would also
 * "click" the block underneath, e.g. play it), and the browser's own
 * long-press `contextmenu` (Android Chrome) is reported via
 * `isNativeMenuDuplicate` so the caller can ignore it.
 *
 * Returns capture-phase pointer handlers to spread on a container.
 *
 * @param {Object} params
 * @param {boolean} params.enabled
 * @param {Function} params.onLongPress
 */
const useLongPress = ({ enabled, onLongPress }) => {
  const pressRef = useRef(null); // { pointerId, x, y, target, timer }
  const firedAtRef = useRef(0);
  const swallowClickRef = useRef(false);
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onLongPressRef.current = onLongPress;
  });

  const cancel = useCallback(() => {
    if (pressRef.current) clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  useEffect(() => {
    if (!enabled) cancel();
  }, [enabled, cancel]);

  const onPointerDownCapture = useCallback(
    (event) => {
      // A new press: the click of an earlier long-press (if any) is gone
      // (e.g. the finger lifted onto the menu backdrop), don't eat this one
      swallowClickRef.current = false;
      if (!enabled || event.pointerType !== "touch") return;
      // A second finger (pinch) is not a long-press
      if (pressRef.current) {
        cancel();
        return;
      }
      const { pointerId, clientX, clientY, target } = event;
      const timer = setTimeout(() => {
        pressRef.current = null;
        firedAtRef.current = Date.now();
        swallowClickRef.current = true;
        onLongPressRef.current?.({ clientX, clientY, target });
      }, LONG_PRESS_DELAY);
      pressRef.current = { pointerId, x: clientX, y: clientY, timer };
    },
    [enabled, cancel]
  );

  const onPointerMoveCapture = useCallback(
    (event) => {
      const press = pressRef.current;
      if (!press || event.pointerId !== press.pointerId) return;
      const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
      if (moved > LONG_PRESS_MOVE_TOLERANCE) cancel();
    },
    [cancel]
  );

  const onPointerEndCapture = useCallback(
    (event) => {
      const press = pressRef.current;
      if (press && event.pointerId === press.pointerId) cancel();
    },
    [cancel]
  );

  const onClickCapture = useCallback((event) => {
    if (!swallowClickRef.current) return;
    swallowClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /** True for the browser's own contextmenu right after our long-press */
  const isNativeMenuDuplicate = useCallback(
    () => Date.now() - firedAtRef.current < NATIVE_MENU_GRACE,
    []
  );

  return {
    handlers: {
      onPointerDownCapture,
      onPointerMoveCapture,
      onPointerUpCapture: onPointerEndCapture,
      onPointerCancelCapture: onPointerEndCapture,
      onClickCapture,
    },
    isNativeMenuDuplicate,
  };
};

export default useLongPress;
