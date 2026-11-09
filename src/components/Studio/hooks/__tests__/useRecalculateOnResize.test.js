import { renderHook } from "@testing-library/react";
import useRecalculateOnResize from "../useRecalculateOnResize";

let observers = [];

class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.observed = new Set();
    observers.push(this);
  }
  observe(el) {
    this.observed.add(el);
  }
  unobserve(el) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  resize(width, height) {
    this.callback([{ contentRect: { width, height } }]);
  }
}

describe("useRecalculateOnResize", () => {
  const DELAY = 150;

  beforeEach(() => {
    observers = [];
    global.ResizeObserver = MockResizeObserver;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete global.ResizeObserver;
  });

  it("skips the initial size and recalculates (debounced) on a real resize", () => {
    const el = {};
    const recalculate = jest.fn();
    renderHook(() => useRecalculateOnResize(() => el, recalculate, DELAY));
    const observer = observers[0];
    expect(observer.observed.has(el)).toBe(true);

    observer.resize(0, 0); // not loaded yet
    observer.resize(800, 1100); // initial size: onLoad handles it
    jest.advanceTimersByTime(DELAY);
    expect(recalculate).not.toHaveBeenCalled();

    observer.resize(800, 1100); // unchanged
    jest.advanceTimersByTime(DELAY);
    expect(recalculate).not.toHaveBeenCalled();

    observer.resize(500, 690);
    observer.resize(360, 497);
    jest.advanceTimersByTime(DELAY - 1);
    expect(recalculate).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(recalculate).toHaveBeenCalledTimes(1);
  });

  it("calls the latest recalculate and follows a swapped element", () => {
    let el = { id: 1 };
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ cb }) => useRecalculateOnResize(() => el, cb, DELAY),
      { initialProps: { cb: first } }
    );
    const observer = observers[0];

    el = { id: 2 };
    rerender({ cb: second });
    expect(observer.observed.has(el)).toBe(true);
    expect(observer.observed.size).toBe(1);

    observer.resize(800, 1100);
    observer.resize(400, 550);
    jest.advanceTimersByTime(DELAY);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("disconnects and cancels a pending recalculation on unmount", () => {
    const recalculate = jest.fn();
    const { unmount } = renderHook(() =>
      useRecalculateOnResize(() => ({}), recalculate, DELAY)
    );
    const observer = observers[0];
    observer.resize(800, 1100);
    observer.resize(400, 550);
    unmount();
    jest.advanceTimersByTime(DELAY);
    expect(recalculate).not.toHaveBeenCalled();
    expect(observer.observed.size).toBe(0);
  });
});
