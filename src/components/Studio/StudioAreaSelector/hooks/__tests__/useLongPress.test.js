import { act, renderHook } from "@testing-library/react";
import useLongPress, {
  LONG_PRESS_DELAY,
  LONG_PRESS_MOVE_TOLERANCE,
} from "../useLongPress";

const pointer = (overrides = {}) => ({
  pointerType: "touch",
  pointerId: 1,
  clientX: 100,
  clientY: 100,
  target: "block",
  ...overrides,
});

const clickEvent = () => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
});

const setup = (enabled = true) => {
  const onLongPress = jest.fn();
  const view = renderHook(
    ({ enabled: on }) => useLongPress({ enabled: on, onLongPress }),
    { initialProps: { enabled } }
  );
  return { onLongPress, view, h: () => view.result.current.handlers };
};

describe("useLongPress", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("fires after the delay with the press position and swallows the next click", () => {
    const { onLongPress, h, view } = setup();
    h().onPointerDownCapture(pointer());
    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY - 1));
    expect(onLongPress).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onLongPress).toHaveBeenCalledWith({
      clientX: 100,
      clientY: 100,
      target: "block",
    });
    expect(view.result.current.isNativeMenuDuplicate()).toBe(true);

    h().onPointerUpCapture(pointer());
    const click = clickEvent();
    h().onClickCapture(click);
    expect(click.stopPropagation).toHaveBeenCalled();
    const nextClick = clickEvent();
    h().onClickCapture(nextClick);
    expect(nextClick.stopPropagation).not.toHaveBeenCalled();
  });

  it("is cancelled by lifting early, moving (scroll) or a second finger", () => {
    const { onLongPress, h } = setup();
    h().onPointerDownCapture(pointer());
    h().onPointerUpCapture(pointer());

    h().onPointerDownCapture(pointer());
    h().onPointerMoveCapture(
      pointer({ clientY: 100 + LONG_PRESS_MOVE_TOLERANCE + 1 })
    );

    h().onPointerDownCapture(pointer());
    h().onPointerDownCapture(pointer({ pointerId: 2 }));

    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY * 2));
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("tolerates small finger jitter", () => {
    const { onLongPress, h } = setup();
    h().onPointerDownCapture(pointer());
    h().onPointerMoveCapture(pointer({ clientX: 104, clientY: 103 }));
    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY));
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("ignores mouse and pen, and does nothing while disabled", () => {
    const { onLongPress, h, view } = setup();
    h().onPointerDownCapture(pointer({ pointerType: "mouse" }));
    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY));

    view.rerender({ enabled: false });
    h().onPointerDownCapture(pointer());
    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY));

    expect(onLongPress).not.toHaveBeenCalled();
    const click = clickEvent();
    h().onClickCapture(click);
    expect(click.stopPropagation).not.toHaveBeenCalled();
  });

  it("does not eat the click of a later tap if the long-press had no click", () => {
    const { h } = setup();
    h().onPointerDownCapture(pointer());
    act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY));
    // finger lifted on the menu backdrop: no click reached the page
    h().onPointerDownCapture(pointer({ pointerId: 3 }));
    h().onPointerUpCapture(pointer({ pointerId: 3 }));
    const click = clickEvent();
    h().onClickCapture(click);
    expect(click.stopPropagation).not.toHaveBeenCalled();
  });
});
