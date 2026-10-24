import { renderHook } from "@testing-library/react";
import usePinchZoom from "../usePinchZoom";

const touch = (x, y) => ({ clientX: x, clientY: y });

const fire = (target, type, touches) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { value: touches });
  target.dispatchEvent(event);
  return event;
};

const setup = (scale = 1) => {
  const scroller = document.createElement("div");
  const content = document.createElement("div");
  scroller.appendChild(content);
  document.body.appendChild(scroller);
  const rect = { left: 0, top: 0, right: 400, bottom: 600, width: 400, height: 600 };
  scroller.getBoundingClientRect = () => rect;
  content.getBoundingClientRect = () => rect;

  const setScale = jest.fn();
  renderHook(() =>
    usePinchZoom({
      scrollRef: { current: scroller },
      contentRef: { current: content },
      scale,
      setScale,
    })
  );
  return { scroller, content, setScale };
};

describe("usePinchZoom", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("previews with a transform, then commits the new scale on release", () => {
    const { scroller, content, setScale } = setup(1);

    const start = fire(scroller, "touchstart", [touch(100, 100), touch(200, 100)]);
    expect(start.defaultPrevented).toBe(true);
    expect(content.style.transformOrigin).toBe("150px 100px");

    fire(scroller, "touchmove", [touch(50, 100), touch(250, 100)]);
    expect(content.style.transform).toBe("scale(2)");
    expect(setScale).not.toHaveBeenCalled();

    fire(scroller, "touchend", [touch(50, 100)]);
    expect(setScale).toHaveBeenCalledWith(2);
    expect(content.style.transform).toBe("");
  });

  it("clamps to the zoom limits", () => {
    const { scroller, setScale } = setup(1);
    fire(scroller, "touchstart", [touch(100, 100), touch(110, 100)]);
    fire(scroller, "touchmove", [touch(0, 100), touch(400, 100)]); // 40x
    fire(scroller, "touchend", []);
    expect(setScale).toHaveBeenCalledWith(3);

    fire(scroller, "touchstart", [touch(0, 100), touch(400, 100)]);
    fire(scroller, "touchmove", [touch(199, 100), touch(201, 100)]); // 1/200
    fire(scroller, "touchend", []);
    expect(setScale).toHaveBeenLastCalledWith(0.5);
  });

  it("ignores one-finger touches and tiny pinches", () => {
    const { scroller, content, setScale } = setup(1);
    const single = fire(scroller, "touchstart", [touch(100, 100)]);
    expect(single.defaultPrevented).toBe(false);
    fire(scroller, "touchmove", [touch(100, 300)]);
    fire(scroller, "touchend", []);

    fire(scroller, "touchstart", [touch(100, 100), touch(200, 100)]);
    fire(scroller, "touchmove", [touch(100, 100), touch(200.5, 100)]);
    fire(scroller, "touchend", []);

    expect(setScale).not.toHaveBeenCalled();
    expect(content.style.transform).toBe("");
  });
});
